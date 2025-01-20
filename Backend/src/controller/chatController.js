const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");
const User = require("../models/UserModel");
const Message = require("../models/ChatModel"); // Ensure this is correct
const mongoose = require("mongoose");
const stripe = require("stripe")(
  "sk_test_51QSHuhHCVBXe7H0jV7kWKJIzz7UIHXMlsrU9OYbYNmPWmufjlJcEMew7fL6PtBhbMX5RDAdY0HaGMxpzbdv7pn6s00oiSWfS1v"
); // Your Stripe secret key

const sendChat = expressAsyncHandler(async (req, res) => {
  try {
    const { content, groupId } = req.body;

    // Validate input
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

    console.log("Message created:", message);

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res.status(500).json({ message: error.message });
  }
});

const getChat = expressAsyncHandler(async (req, res) => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.groupId); // Convert to ObjectId
    console.log("Fetching chats for group ID:", groupId);

    // Query for messages associated with the specified group ID
    const messages = await Message.find({ group: groupId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    console.log("Messages found:", messages);

    if (messages.length === 0) {
      console.log(`No messages found for group ID: ${groupId}`);
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(400).json({ message: error.message });
  }
});

const checkCallingAccess = expressAsyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.hasPaidForCalling) {
      return res
        .status(403)
        .json({ message: "Access denied. Please pay for calling features." });
    }

    next();
  } catch (error) {
    console.error("Error checking calling access:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

const initiateCall = expressAsyncHandler(async (req, res) => {
  const { groupId } = req.body;

  // Create a payment intent or session for Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Premium Call Access",
          },
          unit_amount: 1000, // $10.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success", // Redirect after payment
    cancel_url: "http://localhost:3000/cancel", // Redirect if payment fails
  });

  res.status(200).json({ sessionId: session.id });
});

module.exports = { sendChat, getChat, checkCallingAccess, initiateCall };
