const mongoose = require("mongoose");
const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");

const sendChat = expressAsyncHandler(async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = await Chat.create({
      sender: req.user._id,
      content,
      group: groupId,
    });
    const populatedMessage = await Chat.findById(message._id).populate(
      "sender",
      "username email"
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getChat = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Chat.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.Message });
  }
});
module.exports = { sendChat, getChat };
