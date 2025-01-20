const User = require("../models/UserModel");

const isPremiumUser = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.hasPaidForCalling) {
    return res
      .status(403)
      .json({ message: "Access denied. Please pay for calling features." });
  }
  next();
};

module.exports = isPremiumUser;
