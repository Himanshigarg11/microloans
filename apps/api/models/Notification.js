const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'loan_created',
      'offer_submitted',
      'offer_countered',
      'offer_accepted',
      'loan_funded',
      'repayment_made'
    ],
    required: true
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    default: null
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanOffer',
    default: null
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

