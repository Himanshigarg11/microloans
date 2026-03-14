const LoanService = require('../services/loanService');
const LoanLifecycleService = require('../services/loanLifecycleService');
const NotificationService = require('../services/notificationService');
const { getOrCreateLoanScore } = require('../services/loanScoreService');
const { generateRiskInsightSummary } = require('../../../packages/ai');

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
    // Extract filter query parameters, supporting both old and new names
    const {
      status,
      minAmount,
      maxAmount,
      repaymentPeriod,
      duration,
      loanScoreRequired,
      minScore,
      borrowerId,
      maxInterestRate,
      maxInterest,
      page = 1,
      limit = 10
    } = req.query;
    
    const queryParams = {};
    if (status) queryParams.status = status;
    if (minAmount) queryParams.minAmount = Number(minAmount);
    if (maxAmount) queryParams.maxAmount = Number(maxAmount);

    const resolvedRepayment = duration || repaymentPeriod;
    if (resolvedRepayment) queryParams.repaymentPeriod = Number(resolvedRepayment);

    const resolvedScore = minScore || loanScoreRequired;
    if (resolvedScore) queryParams.loanScoreRequired = Number(resolvedScore);

    if (borrowerId) queryParams.borrowerId = borrowerId;

    const resolvedMaxInterest = maxInterest ?? maxInterestRate;
    if (resolvedMaxInterest !== undefined && resolvedMaxInterest !== '') {
      queryParams.maxInterestRate = Number(resolvedMaxInterest);
    }

    // Prevent self-lending: when a lender browses marketplace, exclude own loans
    if (!borrowerId && req.user && req.user.role === 'lender') {
      queryParams.excludeBorrowerId = req.user._id.toString();
    }

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

    let ai = null;
    try {
      const loanScoreDoc = await getOrCreateLoanScore(loan.borrowerId?._id || loan.borrowerId);
      const loanScoreValue = loanScoreDoc.currentScore;

      const riskSummary = await generateRiskInsightSummary({
        loanScore: loanScoreValue,
        amount: loan.amount,
        termMonths: loan.repaymentPeriod,
        purpose: loan.purpose || ''
      });

      let riskLevel = 'medium';
      let defaultProbability = 0.15;
      let recommendedInterestRate = 0.12;

      if (loanScoreValue >= 800) {
        riskLevel = 'low';
        defaultProbability = 0.03;
        recommendedInterestRate = 0.08;
      } else if (loanScoreValue >= 650) {
        riskLevel = 'medium';
        defaultProbability = 0.10;
        recommendedInterestRate = 0.11;
      } else {
        riskLevel = 'high';
        defaultProbability = 0.25;
        recommendedInterestRate = 0.16;
      }

      ai = {
        riskLevel,
        defaultProbability,
        recommendedInterestRate,
        riskSummary
      };
    } catch (e) {
      console.error('AI analysis failed for loan', id, e);
    }

    res.status(200).json({
      success: true,
      data: loan,
      ai
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

    try {
      // Notify borrower and selected lender that the loan is funded
      await NotificationService.createAndEmit(loan.borrowerId, 'loan_funded', {
        loanId: loan._id,
        message: 'Your loan has been funded and is now active.'
      });

      if (loan.selectedLenderId) {
        await NotificationService.createAndEmit(loan.selectedLenderId, 'loan_funded', {
          loanId: loan._id,
          message: 'A loan you funded is now active and in repayment.'
        });
      }
    } catch (e) {
      console.error('Failed to emit loan_funded notifications', e);
    }
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
