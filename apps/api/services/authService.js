const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT for user
const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    borrowerProfileComplete: user.borrowerProfileComplete,
    lenderProfileComplete: user.lenderProfileComplete,
    loanScore: user.loanScore
  }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d',
  });
};

const registerUser = async (userData) => {
  const { name, email, password, role, income, occupation, assets, financialStability } = userData;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  // Calculate Loan Score: (income + assets) / 10
  const calculatedIncome = Number(income) || 0;
  const calculatedAssets = Number(assets) || 0;
  let loanScore = 0;
  if (calculatedIncome > 0 || calculatedAssets > 0) {
    loanScore = Math.floor((calculatedIncome + calculatedAssets) / 10);
  }

  // Determine which profile is complete based on initial role selection
  const borrowerProfileComplete = role === 'borrower' ? true : false;
  const lenderProfileComplete = role === 'lender' ? true : false;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    income: calculatedIncome,
    occupation,
    assets: calculatedAssets,
    financialStability,
    loanScore,
    borrowerProfileComplete,
    lenderProfileComplete
  });

  if (user) {
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
    return {
      ...userPayload,
      token: generateToken(user),
      user: userPayload,
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
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
    return {
      ...userPayload,
      token: generateToken(user),
      user: userPayload,
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

module.exports = {
  registerUser,
  loginUser,
};
