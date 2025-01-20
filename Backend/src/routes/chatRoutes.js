const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const isPremiumUser = require("../middleware/isPremiumUser");
const {
  sendChat,
  getChat,
  checkCallingAccess,
  initiateCall,
} = require("../controller/chatController");

const router = express.Router();

router.post("/sendchat", isAuthenticated, sendChat);
router.get("/getchat/:groupId", isAuthenticated, getChat);
router.post(
  "/call",
  isAuthenticated,
  isPremiumUser,
  checkCallingAccess,
  initiateCall
);

module.exports = router;
