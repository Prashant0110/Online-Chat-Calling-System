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
const { initiateCall } = require("../controller/callController");
const router = express.Router();

// Chat Message Routes
router.post("/sendchat", isAuthenticated, sendChat);
router.get("/getchat/:groupId", isAuthenticated, getChat);

// Calling Feature Routes
router.post(
  "/call",
  isAuthenticated,
  isPremiumUser,
  checkCallingAccess,
  initiateCall
);

module.exports = router;
