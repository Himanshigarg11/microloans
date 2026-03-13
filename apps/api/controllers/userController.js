const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    const { role, loanPurposeHistory, income, investmentCapacity, riskPreference } = req.body;

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
        // Recalculate loan score if income changes
        const calculatedIncome = Number(user.income) || 0;
        const calculatedAssets = Number(user.assets) || 0;
        user.loanScore = Math.floor((calculatedIncome + calculatedAssets) / 10);
      }
      user.borrowerProfileComplete = true;
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
