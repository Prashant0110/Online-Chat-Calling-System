const isPremiumUser = (req, res, next) => {
  if (req.user && req.user.premiumUser) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Premium users only.");
  }
};

module.exports = isPremiumUser;
