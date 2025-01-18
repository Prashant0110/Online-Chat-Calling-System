const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const isAuthenticated = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token); // Log the token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded:", decoded); // Log the decoded token

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("JWT Error:", error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

module.exports = isAuthenticated;
