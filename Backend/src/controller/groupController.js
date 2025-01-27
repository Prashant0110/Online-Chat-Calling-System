require("dotenv").config();
const expressAsyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/UserModel");
const Group = require("../models/GroupModel");

// Create Checkout Session
const createCheckoutSession = expressAsyncHandler(async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Premium Account" },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle Stripe Webhook
const handleStripeWebhook = expressAsyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update user's premium status
      await User.findByIdAndUpdate(
        session.client_reference_id, // Make sure to send user ID in checkout session
        { hasPaidForCalling: true },
        { new: true }
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Create Group
const createGroup = expressAsyncHandler(async (req, res) => {
  const { name, description, members } = req.body; // Assuming these fields are sent in the request body

  const group = await Group.create({
    name,
    description,
    members, // This could be an array of user IDs
  });

  res.status(201).json(group);
});

// Get Group
const getGroup = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // Assuming the group ID is passed as a URL parameter

  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  res.status(200).json(group);
});

// Get Groups
const getGroups = expressAsyncHandler(async (req, res) => {
  const groups = await Group.find(); // Fetch all groups
  res.status(200).json(groups);
});

// Join Group
const joinGroup = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // Group ID from the URL
  const userId = req.user._id; // User ID from the authenticated user

  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // Check if the user is already a member
  if (group.members.includes(userId)) {
    return res
      .status(400)
      .json({ message: "User is already a member of this group" });
  }

  // Add user to the group members
  group.members.push(userId);
  await group.save();

  res.status(200).json({ message: "User added to group", group });
});

// Leave Group
const leaveGroup = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // Group ID from the URL
  const userId = req.user._id; // User ID from the authenticated user

  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // Check if the user is a member
  if (!group.members.includes(userId)) {
    return res
      .status(400)
      .json({ message: "User is not a member of this group" });
  }

  // Remove user from the group members
  group.members = group.members.filter(
    (member) => member.toString() !== userId.toString()
  );
  await group.save();

  res.status(200).json({ message: "User removed from group", group });
});

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  createGroup,
  getGroup,
  getGroups,
  joinGroup,
  leaveGroup,
};
