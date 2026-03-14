const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');
// const { validateOfferRequest } = require('../validators/offerValidator');

// @route   POST /api/offers
// @desc    Submit a loan offer
// @access  Private (Lender)
router.post('/', protect, authorize('lender'), offerController.createOffer);

// @route   GET /api/offers/my
// @desc    Get the logged-in lender's offers
// @access  Private (Lender)
router.get('/my', protect, authorize('lender'), offerController.getMyOffers);

// @route   POST /api/offers/:id/accept
// @desc    Accept a specific loan offer
// @access  Private (Borrower)
router.post('/:id/accept', protect, authorize('borrower'), offerController.acceptOffer);

// @route   POST /api/offers/:id/reject
// @desc    Reject a specific loan offer
// @access  Private (Borrower)
router.post('/:id/reject', protect, authorize('borrower'), offerController.rejectOffer);

// @route   POST /api/offers/:id/counter
// @desc    Send a counter-offer back to a lender
// @access  Private (Borrower)
router.post('/:id/counter', protect, authorize('borrower'), offerController.counterOffer);

module.exports = router;
