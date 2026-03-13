const express = require('express');
const router = express.Router();
const repaymentController = require('../controllers/repaymentController');
const { protect } = require('../middleware/authMiddleware');
// const { validateRepaymentRequest } = require('../validators/repaymentValidator');

// @route   POST /api/repayments
// @desc    Record a new loan repayment
// @access  Private (verified borrower of the loan in RepaymentService)
router.post('/', protect, repaymentController.createRepayment);

module.exports = router;
