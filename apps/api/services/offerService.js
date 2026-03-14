const LoanOffer = require('../models/LoanOffer');
const Loan = require('../models/Loan');
const NotificationService = require('./notificationService');

class OfferService {
  /**
   * Submits a new loan offer from a lender.
   * 
   * @param {Object} offerData - Data for the loan offer.
   * @returns {Promise<Object>} The created offer document.
   */
  static async createOffer(offerData) {
    try {
      // Verify loan exists and is open for offers
      const loan = await Loan.findById(offerData.loanId);
      if (!loan) throw new Error('Loan not found');
      if (loan.status !== 'open_for_offers') {
        throw new Error('Loan is not currently accepting offers');
      }

      const offer = new LoanOffer(offerData);
      const savedOffer = await offer.save();

      // Notify borrower that a new offer has been submitted
      try {
        await NotificationService.createAndEmit(loan.borrowerId, 'offer_submitted', {
          loanId: loan._id,
          offerId: savedOffer._id,
          message: 'A new lender has submitted an offer on your loan.',
          metadata: {
            interestRate: savedOffer.interestRate,
            repaymentPeriod: savedOffer.repaymentPeriod
          }
        });
      } catch (e) {
        console.error('Failed to emit offer_submitted notification', e);
      }

      return savedOffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all offers for a specific loan.
   * 
   * @param {string} loanId - The ID of the loan.
   * @returns {Promise<Array>} A list of offer documents.
   */
  static async getOffersForLoan(loanId) {
    try {
      const offers = await LoanOffer.find({ loanId })
        .sort({ createdAt: -1 })
        // .populate('lenderId', 'name rating') // Populate lender info if needed
        .exec();
        
      return offers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accepts an offer. This should also mark the loan as 'offer_selected' 
   * and potentially reject all other pending offers for this loan.
   * 
   * @param {string} offerId - The ID of the offer to accept.
   * @param {string} borrowerId - The ID of the borrower (for authorization).
   * @returns {Promise<Object>} The accepted offer document.
   */
  static async acceptOffer(offerId, borrowerId) {
    // We would use a MongoDB transaction in production here
    try {
      const offer = await LoanOffer.findById(offerId).populate('loanId');
      
      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'pending') throw new Error('Offer is not pending');
      
      const loan = offer.loanId;
      
      // Authorization check (in reality, compare with borrowerId)
      if (loan.borrowerId.toString() !== borrowerId.toString()) {
        throw new Error('Not authorized to accept an offer for this loan');
      }

      if (loan.status !== 'open_for_offers') {
        throw new Error('Loan is no longer accepting offers');
      }

      // Mark this offer as accepted
      offer.status = 'accepted';
      const acceptedOffer = await offer.save();

      // Mark all other offers for this loan as rejected
      await LoanOffer.updateMany(
        { loanId: loan._id, _id: { $ne: offerId }, status: 'pending' },
        { status: 'rejected' }
      );

      // Update the loan status and apply the accepted terms
      loan.status = 'offer_selected';
      loan.interestRate = offer.interestRate;
      loan.repaymentPeriod = offer.repaymentPeriod; // In case the lender proposed a different term
      loan.selectedLenderId = offer.lenderId;
      await loan.save();

      // Notify selected lender
      try {
        await NotificationService.createAndEmit(offer.lenderId, 'offer_accepted', {
          loanId: loan._id,
          offerId: offer._id,
          message: 'Your offer has been accepted by the borrower.',
          metadata: {
            amount: loan.amount,
            interestRate: offer.interestRate
          }
        });

        // Notify other lenders that their offers were not selected
        const otherOffers = await LoanOffer.find({
          loanId: loan._id,
          _id: { $ne: offerId }
        }).lean().exec();

        const notifiedLenders = new Set();
        for (const other of otherOffers) {
          if (!other.lenderId || notifiedLenders.has(String(other.lenderId))) continue;
          notifiedLenders.add(String(other.lenderId));
          await NotificationService.createAndEmit(other.lenderId, 'offer_accepted', {
            loanId: loan._id,
            offerId: offer._id,
            message: 'Another lender’s offer was accepted for a loan you bid on.',
            metadata: {
              amount: loan.amount
            }
          });
        }
      } catch (e) {
        console.error('Failed to emit offer_accepted notifications', e);
      }

      return acceptedOffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rejects an offer explicitly by the borrower.
   */
  static async rejectOffer(offerId, borrowerId) {
    const offer = await LoanOffer.findById(offerId).populate('loanId');
    if (!offer) throw new Error('Offer not found');

    const loan = offer.loanId;
    if (loan.borrowerId.toString() !== borrowerId.toString()) {
      throw new Error('Not authorized to reject this offer');
    }

    if (offer.status !== 'pending') {
      throw new Error('Only pending offers can be rejected');
    }

    offer.status = 'rejected';
    await offer.save();

    try {
      await NotificationService.createAndEmit(offer.lenderId, 'offer_countered', {
        loanId: loan._id,
        offerId: offer._id,
        message: 'Your offer was rejected by the borrower.',
        metadata: { status: 'rejected' }
      });
    } catch (e) {
      console.error('Failed to emit offer rejection notification', e);
    }

    return offer;
  }

  /**
   * Creates a counter-offer from the borrower to the lender.
   */
  static async counterOffer(offerId, borrowerId, { interestRate, message }) {
    const baseOffer = await LoanOffer.findById(offerId).populate('loanId');
    if (!baseOffer) throw new Error('Offer not found');

    const loan = baseOffer.loanId;
    if (loan.borrowerId.toString() !== borrowerId.toString()) {
      throw new Error('Not authorized to counter this offer');
    }

    if (baseOffer.status !== 'pending') {
      throw new Error('Only pending offers can be countered');
    }

    baseOffer.status = 'countered';
    await baseOffer.save();

    const counter = new LoanOffer({
      loanId: loan._id,
      lenderId: baseOffer.lenderId,
      interestRate,
      repaymentPeriod: baseOffer.repaymentPeriod,
      status: 'pending',
      parentOfferId: baseOffer._id,
      message: message || ''
    });

    const savedCounter = await counter.save();

    try {
      await NotificationService.createAndEmit(baseOffer.lenderId, 'offer_countered', {
        loanId: loan._id,
        offerId: savedCounter._id,
        message: 'The borrower has sent you a counter-offer.',
        metadata: { interestRate }
      });
    } catch (e) {
      console.error('Failed to emit offer_countered notification', e);
    }

    return savedCounter;
  }
}

module.exports = OfferService;
