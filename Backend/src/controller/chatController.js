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
    const groupId = req.params.groupId;

    // Log groupId to verify if it's correct
    console.log("GroupId:", groupId);

    // Ensure groupId is an ObjectId
    const groupObjectId = new mongoose.Types.ObjectId(groupId);
    console.log("Group ObjectId:", groupObjectId);

    // Query to find messages by groupId
    const messages = await Chat.find({ group: groupObjectId })
      .populate("sender", "username email")
      .populate("group", "name description");

    // Log the fetched messages for debugging
    console.log("Messages:", messages);

    // Return the response with the messages
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = { sendChat, getChat };
