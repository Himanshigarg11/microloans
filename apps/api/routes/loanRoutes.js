const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');
// const { validateLoanRequest } = require('../validators/loanValidator');

// @route   POST /api/loans
// @desc    Create a new loan request
// @access  Private (Borrower)
// router.post('/', validateLoanRequest, protect, authorize('borrower'), loanController.createLoan); // Can uncomment when validator exists/is imported
router.post('/', protect, authorize('borrower'), loanController.createLoan);

// @route   GET /api/loans
// @desc    Get all community loans (typically open_for_offers)
// @access  Private (Borrowers/Lenders)
router.get('/', protect, loanController.getLoans);

// @route   GET /api/loans/:id
// @desc    Get details of a specific loan
// @access  Public or Private
router.get('/:id', loanController.getLoanById);

// @route   GET /api/loans/:loanId/offers
// @desc    Get all offers for a specific loan
// @access  Public or Private (Borrower/Investors)
const offerController = require('../controllers/offerController');
router.get('/:id/offers', offerController.getOffersForLoan);

// @route   GET /api/loans/:id/repayments
// @desc    Get repayment history for a specific loan
// @access  Public or Private (Borrower/Investors)
const repaymentController = require('../controllers/repaymentController');
router.get('/:id/repayments', repaymentController.getRepaymentsForLoan);

// @route   GET /api/loans/:id/messages
// @desc    Get all messages for a specific loan's chat thread
// @access  Private (Borrower or Lender involved in loan)
const messageController = require('../controllers/messageController');
router.get('/:id/messages', messageController.getMessagesForLoan);

// @route   PATCH /api/loans/:id/open
// @desc    Open a loan for offers
// @access  Private (System/Admin)
router.patch('/:id/open', protect, loanController.openLoan);

// @route   PATCH /api/loans/:id/fund
// @desc    Mark a loan as funded
// @access  Private (System/Admin)
router.patch('/:id/fund', protect, loanController.fundLoan);

module.exports = router;
