const RepaymentService = require('../services/repaymentService');

/**
 * Controller for recording a loan repayment.
 */
const createRepayment = async (req, res) => {
  try {
    const { loanId, amountPaid, remainingBalance, paymentDate } = req.body;
    const borrowerId = req.user?._id?.toString?.() || req.user?.id;
    
    const newRepayment = await RepaymentService.createRepayment({
      loanId,
      amountPaid,
      remainingBalance,
      paymentDate,
      borrowerId
    });

    res.status(201).json({
      success: true,
      message: 'Repayment recorded successfully',
      data: newRepayment
    });
  } catch (error) {
    console.error('Error recording repayment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to record repayment'
    });
  }
};

/**
 * Controller for fetching repayment history for a specific loan.
 */
const getRepaymentsForLoan = async (req, res) => {
  try {
    // Note: This might be called from /api/loans/:loanId/repayments
    // The param name depends on how the router is configured. 
    // Usually it's req.params.loanId or req.params.id
    const loanId = req.params.loanId || req.params.id;

    const repayments = await RepaymentService.getRepaymentsForLoan(loanId);

    res.status(200).json({
      success: true,
      count: repayments.length,
      data: repayments
    });
  } catch (error) {
    console.error('Error fetching repayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repayments',
      error: error.message
    });
  }
};

module.exports = {
  createRepayment,
  getRepaymentsForLoan
};
