const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

console.log("Register User Handler:", registerUser);
console.log("Login User Handler:", loginUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await req.user.populate("groups");
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium,
      hasPaidForCalling: user.hasPaidForCalling,
      groups: user.groups,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

module.exports = router;
