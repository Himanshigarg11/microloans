const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');

class RepaymentService {
  /**
   * Records a new repayment for a loan.
   * 
   * @param {Object} repaymentData - Data for the repayment.
   * @returns {Promise<Object>} The created repayment document.
   */
  static async createRepayment(repaymentData) {
    try {
      const { loanId, amountPaid, borrowerId } = repaymentData;

      const loan = await Loan.findById(loanId);
      if (!loan) throw new Error('Loan not found');
      if (loan.status !== 'funded' && loan.status !== 'repayment') {
        throw new Error('Loan is not currently in repayment phase');
      }
      if (borrowerId && loan.borrowerId.toString() !== borrowerId.toString()) {
        throw new Error('Not authorized to record repayment for this loan');
      }

      // In a real application, calculate actual remaining balance by fetching 
      // previous payments, calculating interest, etc.
      // For this implementation, we will assume remainingBalance is calculated
      // by a client or handled as a naive subtraction for now if none provided
      let remainingBalance = repaymentData.remainingBalance;
      
      if (remainingBalance === undefined) {
        // Naive calculation: subtract from loan amount (ignores interest for simplicity)
        const pastRepayments = await Repayment.find({ loanId });
        const totalPaidSoFar = pastRepayments.reduce((sum, r) => sum + r.amountPaid, 0);
        remainingBalance = loan.amount - totalPaidSoFar - amountPaid;
        if (remainingBalance < 0) remainingBalance = 0;
      }

      const repayment = new Repayment({
        loanId,
        amountPaid,
        remainingBalance,
        paymentDate: repaymentData.paymentDate || new Date()
      });

      const savedRepayment = await repayment.save();

      // Update loan status if this is the first payment or final payment
      let shouldUpdateLoan = false;
      if (loan.status === 'funded') {
        loan.status = 'repayment';
        shouldUpdateLoan = true;
      }
      if (remainingBalance === 0) {
        loan.status = 'completed';
        shouldUpdateLoan = true;
      }

      if (shouldUpdateLoan) {
        await loan.save();
      }

      return savedRepayment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all repayments for a specific loan.
   * 
   * @param {string} loanId - The ID of the loan.
   * @returns {Promise<Array>} A list of repayment documents.
   */
  static async getRepaymentsForLoan(loanId) {
    try {
      const repayments = await Repayment.find({ loanId })
        .sort({ paymentDate: -1 }) // Newest first
        .exec();
        
      return repayments;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RepaymentService;
