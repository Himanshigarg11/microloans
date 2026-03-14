const OfferService = require('../services/offerService');

/**
 * Controller for a lender submitting an offer.
 */
const createOffer = async (req, res) => {
  try {
    const { loanId, interestRate, repaymentPeriod } = req.body;
    const lenderId = req.user.id;
    
    const newOffer = await OfferService.createOffer({
      loanId,
      lenderId,
      interestRate,
      repaymentPeriod
    });

    res.status(201).json({
      success: true,
      message: 'Loan offer submitted successfully',
      data: newOffer
    });
  } catch (error) {
    console.error('Error submitting offer:', error);
    res.status(400).json({ // Using 400 because it might be a business rule error (e.g., loan not accepting offers)
      success: false,
      message: error.message || 'Failed to submit offer'
    });
  }
};

/**
 * Controller for fetching all offers for a specific loan.
 */
const getOffersForLoan = async (req, res) => {
  try {
    const loanId = req.params.loanId || req.params.id;

    const offers = await OfferService.getOffersForLoan(loanId);

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers',
      error: error.message
    });
  }
};

/**
 * Controller for a borrower accepting a specific offer.
 */
const acceptOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const borrowerId = req.user.id;
    
    // Service handles updating loan status and rejecting other offers
    const acceptedOffer = await OfferService.acceptOffer(offerId, borrowerId);

    res.status(200).json({
      success: true,
      message: 'Offer accepted safely',
      data: acceptedOffer
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to accept offer'
    });
  }
};

/**
 * Controller for explicitly rejecting an offer.
 */
const rejectOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const borrowerId = req.user.id;

    const rejected = await OfferService.rejectOffer(offerId, borrowerId);

    res.status(200).json({
      success: true,
      message: 'Offer rejected',
      data: rejected
    });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject offer'
    });
  }
};

/**
 * Controller for sending a counter-offer.
 */
const counterOffer = async (req, res) => {
  try {
    const { id: offerId } = req.params;
    const borrowerId = req.user.id;
    const { interestRate, message } = req.body;

    const counter = await OfferService.counterOffer(offerId, borrowerId, {
      interestRate,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Counter-offer created',
      data: counter
    });
  } catch (error) {
    console.error('Error creating counter-offer:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create counter-offer'
    });
  }
};

/**
 * Controller for fetching the logged-in lender's offers.
 */
const getMyOffers = async (req, res) => {
  try {
    const lenderId = req.user.id;
    const LoanOffer = require('../models/LoanOffer');
    
    const offers = await LoanOffer.find({ lenderId })
      .populate('loanId', 'amount purpose status repaymentPeriod')
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    console.error('Error fetching my offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your investments',
      error: error.message
    });
  }
};

module.exports = {
  createOffer,
  getOffersForLoan,
  acceptOffer,
  getMyOffers,
  rejectOffer,
  counterOffer
};
