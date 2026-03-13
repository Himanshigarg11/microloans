const LoanService = require('../services/loanService');
const LoanLifecycleService = require('../services/loanLifecycleService');

/**
 * Controller for creating a new loan request.
 */
const createLoan = async (req, res) => {
  try {
    const { amount, purpose, repaymentPeriod, collateralDescription, loanScoreRequired, requestedInterestRate } = req.body;
    
    // Use req.user.id from protect middleware instead of body
    const borrowerId = req.user.id;
    
    const newLoan = await LoanService.createLoan({
      borrowerId,
      amount,
      purpose,
      repaymentPeriod,
      collateralDescription,
      loanScoreRequired,
      requestedInterestRate
    });

    res.status(201).json({
      success: true,
      message: 'Loan request created successfully',
      data: newLoan
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loan request',
      error: error.message
    });
  }
};

/**
 * Controller for fetching all active community loans.
 */
const getLoans = async (req, res) => {
  try {
    // Extract filter query parameters
    const { status, minAmount, maxAmount, repaymentPeriod, loanScoreRequired, borrowerId, maxInterestRate, page = 1, limit = 10 } = req.query;
    
    const queryParams = {};
    if (status) queryParams.status = status;
    if (minAmount) queryParams.minAmount = Number(minAmount);
    if (maxAmount) queryParams.maxAmount = Number(maxAmount);
    if (repaymentPeriod) queryParams.repaymentPeriod = Number(repaymentPeriod);
    if (loanScoreRequired) queryParams.loanScoreRequired = Number(loanScoreRequired);
    if (borrowerId) queryParams.borrowerId = borrowerId;
    if (maxInterestRate !== undefined) queryParams.maxInterestRate = Number(maxInterestRate);

    // Convert pagination params to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await LoanService.getLoans(queryParams, pageNum, limitNum);

    res.status(200).json({
      success: true,
      count: result.loans.length,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: result.loans
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans',
      error: error.message
    });
  }
};

/**
 * Controller for fetching details of a specific loan.
 */
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const loan = await LoanService.getLoanById(id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan details',
      error: error.message
    });
  }
};

/**
 * Controller for opening a loan for offers.
 */
const openLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await LoanLifecycleService.openLoanForOffers(id);
    res.status(200).json({
      success: true,
      message: 'Loan is now open for offers',
      data: loan
    });
  } catch (error) {
    console.error('Error opening loan:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to open loan for offers'
    });
  }
};

/**
 * Controller for marking a loan as funded.
 */
const fundLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await LoanLifecycleService.markLoanFunded(id);
    res.status(200).json({
      success: true,
      message: 'Loan marked as funded',
      data: loan
    });
  } catch (error) {
    console.error('Error funding loan:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark loan as funded'
    });
  }
};

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  openLoan,
  fundLoan
};
