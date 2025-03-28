const User = require("../models/UserModel");

const checkCallingAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.hasPaidForCalling) {
      return res
        .status(403)
        .json({ message: "Payment required for calling features" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking payment status" });
  }
};

const isPremiumUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isPremium)
      return res.status(403).json({ message: "Premium access required" });
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking premium status" });
  }
};

module.exports = { checkCallingAccess, isPremiumUser };
