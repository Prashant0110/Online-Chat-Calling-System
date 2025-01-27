const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const {
  isPremiumUser,
  checkCallingAccess,
} = require("../middleware/isPremiumUser");
const {
  sendChat,
  getChat,
  // initiateCall,
} = require("../controller/chatController");
const router = express.Router();

// Chat Message Routes
router.post("/sendchat", isAuthenticated, sendChat);
router.get("/getchat/:groupId", isAuthenticated, getChat);

// Calling Feature Routes
router.post(
  "/call",
  isAuthenticated, // First check authentication
  isPremiumUser, // Then check premium status
  checkCallingAccess // Then verify payment for calling
  // initiateCall // Finally initiate Stripe payment if needed
);

module.exports = router;
