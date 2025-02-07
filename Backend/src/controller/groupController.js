const expressAsyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const Group = require("../models/GroupModel");

// Create Group
const createGroup = expressAsyncHandler(async (req, res) => {
  const { name, description, members } = req.body;

  const group = await Group.create({
    name,
    description,
    members,
  });

  res.status(201).json(group);
});

// Get Group
const getGroup = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

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
  createGroup,
  getGroup,
  getGroups,
  joinGroup,
  leaveGroup,
};
