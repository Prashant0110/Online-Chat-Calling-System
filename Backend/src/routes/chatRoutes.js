const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const isPremiumUser = require("../middleware/isPremiumUser");
const {
  sendChat,
  getChat,
  checkCallingAccess,
} = require("../controller/chatController");

const router = express.Router();

router.post("/sendchat", isAuthenticated, sendChat);
router.get("/getchat/:groupId", isAuthenticated, getChat);
router.post(
  "/call",
  isAuthenticated,
  isPremiumUser,
  checkCallingAccess,
  (req, res) => {
    res.status(200).json({ message: "Call initiated" });
  }
);

module.exports = router;
