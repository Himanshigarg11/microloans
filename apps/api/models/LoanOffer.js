const mongoose = require('mongoose');

const loanOfferSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  lenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model will exist
    required: true
  },
  interestRate: {
    type: Number, // Stored as decimal (e.g., 0.05 for 5%)
    required: true,
    min: [0, 'Interest rate cannot be negative']
  },
  repaymentPeriod: {
    type: Number, // In months, allows lenders to propose a different term
    required: true,
    min: [1, 'Repayment period must be at least 1 month']
  },
  status: {
    type: String,
    enum: [
      'pending',  // Offer submitted, awaiting borrower decision
      'accepted',
      'rejected',
      'countered'  // Borrower sent counter-offer
    ],
    default: 'pending'
  },
  parentOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanOffer',
    default: null
  },
  message: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate offers from the same lender on the same loan (optional business rule)
// loanOfferSchema.index({ loanId: 1, lenderId: 1 }, { unique: true });

loanOfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LoanOffer = mongoose.model('LoanOffer', loanOfferSchema);

module.exports = LoanOffer;
