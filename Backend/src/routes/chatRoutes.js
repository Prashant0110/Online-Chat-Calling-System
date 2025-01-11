const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const { sendChat, getChat } = require("../controller/chatController");

const router = express.Router();

router.post("/sendchat", isAuthenticated, sendChat);
router.get("/getchat/:groupId", isAuthenticated, getChat);

module.exports = router;
