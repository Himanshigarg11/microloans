const Profile = require('../models/Profile');
const { getOrCreateLoanScore } = require('./loanScoreService');

const getProfileByUserId = async (userId) => {
  let profile = await Profile.findOne({ userId }).populate('userId', 'name email role');

  if (!profile) {
    profile = await Profile.create({ userId });
    profile = await Profile.findById(profile._id).populate('userId', 'name email role');
  }

  const loanScore = await getOrCreateLoanScore(userId);
  const profileObj = profile.toObject();

  return {
    ...profileObj,
    loanScore: loanScore.currentScore,
    scoreUsed: loanScore.scoreUsed
  };
};

const updateProfile = async (userId, profileData) => {
  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: profileData },
    { new: true, upsert: true, runValidators: true }
  ).populate('userId', 'name email role');

  const loanScore = await getOrCreateLoanScore(userId);
  const profileObj = profile.toObject();

  return {
    ...profileObj,
    loanScore: loanScore.currentScore,
    scoreUsed: loanScore.scoreUsed
  };
};

module.exports = {
  getProfileByUserId,
  updateProfile,
};
