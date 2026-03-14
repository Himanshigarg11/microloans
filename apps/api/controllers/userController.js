const User = require('../models/User');
const jwt = require('jsonwebtoken');
const LoanScoreService = require('../services/loanScoreService');

// Generate JWT for user (copied from authService for role updates)
const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Not authorized to change role for this user' });
    }

    if (!role || (role !== 'borrower' && role !== 'lender')) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    const userPayload = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      loanScore: user.loanScore,
      borrowerProfileComplete: user.borrowerProfileComplete,
      lenderProfileComplete: user.lenderProfileComplete,
    };
    res.status(200).json({
      ...userPayload,
      token: generateToken(user),
      user: userPayload,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit onboarding data for a specific role
// @route   PUT /api/users/:id/onboarding
// @access  Private
const saveOnboardingProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      role,
      loanPurposeHistory,
      income,
      investmentCapacity,
      riskPreference,
      assets,
      propertyValue,
      gold,
      existingLoans,
      employmentType
    } = req.body;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role === 'borrower') {
      if (loanPurposeHistory) user.loanPurposeHistory = loanPurposeHistory;
      if (typeof income === 'number') {
        user.income = income;
      }
      if (typeof assets === 'number') {
        user.assets = assets;
      }
      if (typeof propertyValue === 'number') {
        user.propertyValue = propertyValue;
      }
      if (typeof gold === 'number') {
        user.gold = gold;
      }
      if (typeof existingLoans === 'number') {
        user.existingLoans = existingLoans;
      }
      if (employmentType) {
        user.employmentType = employmentType;
      }

      // Recalculate loan score from financial profile
      const incomeValue = Number(user.income) || 0;
      const assetsValue = Number(user.assets) || 0;
      const propertyValueValue = Number(user.propertyValue) || 0;
      const goldValue = Number(user.gold) || 0;
      const existingLoansValue = Number(user.existingLoans) || 0;

      let score = 300;

      score += Math.min(400, incomeValue / 100);
      score += Math.min(200, assetsValue / 1000);
      score += Math.min(150, propertyValueValue / 100000);
      score += Math.min(100, goldValue / 50000);

      if (user.employmentType === 'salaried') score += 50;
      else if (user.employmentType === 'government') score += 80;
      else if (user.employmentType === 'self_employed') score += 30;
      else if (user.employmentType === 'unemployed') score -= 80;

      score -= existingLoansValue * 20;

      if (score < 0) score = 0;

      user.loanScore = Math.floor(score);
      user.borrowerProfileComplete = true;

      try {
        const loanScore = await LoanScoreService.getOrCreateLoanScore(user._id);
        loanScore.currentScore = user.loanScore;
        if (!loanScore.scoreUsed) loanScore.scoreUsed = 0;
        await loanScore.save();
      } catch (e) {
        console.error('Failed to sync LoanScore with borrower profile', e);
      }
    } else if (role === 'lender') {
      if (investmentCapacity) user.investmentCapacity = investmentCapacity;
      if (riskPreference) user.riskPreference = riskPreference;
      user.lenderProfileComplete = true;
    } else {
      return res.status(400).json({ message: 'Invalid role for onboarding' });
    }

    await user.save();

    const userPayload = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      loanScore: user.loanScore,
      borrowerProfileComplete: user.borrowerProfileComplete,
      lenderProfileComplete: user.lenderProfileComplete,
    };
    res.status(200).json({
      ...userPayload,
      token: generateToken({ ...user._doc, role: req.user.role }),
      user: userPayload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateRole,
  saveOnboardingProfile
};
