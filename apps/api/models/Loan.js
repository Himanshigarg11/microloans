const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model will exist
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Loan amount must be greater than zero']
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  repaymentPeriod: {
    type: Number, // In months
    required: true,
    min: [1, 'Repayment period must be at least 1 month']
  },
  collateralDescription: {
    type: String,
    trim: true,
    default: ''
  },
  loanScoreRequired: {
    type: Number,
    min: 0,
    default: 0
  },
  requestedInterestRate: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    enum: [
      'pending',          // Application submitted, pending review/scoring
      'open_for_offers',  // Approved and listed on marketplace
      'offer_selected',   // Borrower accepted an offer, pending origination
      'funded',           // Originated and active
      'repayment',        // Currently in repayment phase
      'completed',        // Fully paid off
      'expired',          // Failed to get funded in time
      'rejected'          // Application rejected
    ],
    default: 'pending'
  },
  interestRate: {
    type: Number,
    default: null
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

// Update the updatedAt timestamp before saving
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
