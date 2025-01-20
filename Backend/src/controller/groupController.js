const expressAsyncHandler = require("express-async-handler");
const Group = require("../models/GroupModel");
const User = require("../models/UserModel");

// Create a new group
const createGroup = expressAsyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    const groupDetails = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(201).json(groupDetails);
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Get all groups and include membership status for the current user
const getGroup = expressAsyncHandler(async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email");

    const userId = req.user._id.toString();
    const groupsWithMembershipStatus = groups.map((group) => ({
      ...group.toObject(),
      isJoined: group.members.some(
        (member) => member._id.toString() === userId
      ),
    }));

    res.json(groupsWithMembershipStatus);
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Join a group
const joinGroup = expressAsyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      group.members.some(
        (member) => member.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    group.members.push(req.user._id);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Leave a group
const leaveGroup = expressAsyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.members.some(
        (member) => member.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});
module.exports = { createGroup, getGroup, joinGroup, leaveGroup };
