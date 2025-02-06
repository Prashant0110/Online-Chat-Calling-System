const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/ChatModel");
const mongoose = require("mongoose");

// Send chat message
const sendChat = expressAsyncHandler(async (req, res) => {
  try {
    const { content, groupId } = req.body;

    if (!content || !groupId) {
      return res
        .status(400)
        .json({ message: "Content and groupId are required." });
    }

    // Ensure the groupId is a valid ObjectId
    const group = new mongoose.Types.ObjectId(groupId);

    // Create a new message and associate it with the group
    const message = await Message.create({
      sender: req.user._id,
      content,
      group,
    });

    // Populate the sender's details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username email") // Assuming 'sender' is a reference to the User model
      .exec();

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all chat messages for a specific group
const getChat = expressAsyncHandler(async (req, res) => {
  try {
    const groupId = req.params.groupId;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required." });
    }

    // Find all messages for the group
    const messages = await Message.find({ group: groupId })
      .populate("sender", "username email") // Assuming 'sender' is a reference to the User model
      .sort({ createdAt: 1 }); // Sort messages by creation time (ascending)

    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this group." });
    }

    res.json(messages);
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = { sendChat, getChat };
