const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");
const User = require("../models/UserModel");
const Message = require("../models/ChatModel");
const mongoose = require("mongoose");

// Chat-specific functions
const sendChat = expressAsyncHandler(async (req, res) => {
  try {
    const { content, groupId } = req.body;

    if (!content || !groupId) {
      return res
        .status(400)
        .json({ message: "Content and groupId are required." });
    }

    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });

    const populatedMessage = await Message.findById(message._id).populate(
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
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);
    const messages = await Message.find({ group: groupId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = { sendChat, getChat };
