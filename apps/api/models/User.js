const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['borrower', 'lender'],
    required: true,
  },
  // Financial Data required for Loan Score
  income: {
    type: Number,
    required: false, // Initially false, required before borrowing
  },
  occupation: {
    type: String,
    required: false,
  },
  assets: {
    type: Number,
    required: false,
  },
  financialStability: {
    type: String, // e.g., 'high', 'medium', 'low'
    required: false,
  },
  loanScore: {
    type: Number,
    required: false,
  },
  // Onboarding Data
  borrowerProfileComplete: {
    type: Boolean,
    default: false,
  },
  lenderProfileComplete: {
    type: Boolean,
    default: false,
  },
  loanPurposeHistory: {
    type: String,
    required: false,
  },
  investmentCapacity: {
    type: Number,
    required: false,
  },
  riskPreference: {
    type: String,
    required: false,
  },
  creditScore: {
    type: Number,
    required: false,
  },
  incomeRange: {
    type: String,
    required: false,
  },
  employmentType: {
    type: String,
    required: false,
  },
  loanHistorySummary: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
