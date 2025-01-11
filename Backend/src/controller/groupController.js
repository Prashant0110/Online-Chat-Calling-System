const expressAsyncHandler = require("express-async-handler");
const Group = require("../models/GroupMode");
const User = require("../models/UserModel");

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

    const GroupDetails = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(201).json(GroupDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getGroup = expressAsyncHandler(async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email");
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const joinGroup = expressAsyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }
    group.members.push(req.user._id);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const leaveGroup = expressAsyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }
    group.members = group.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );
    console.log(group.members);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { createGroup, getGroup, joinGroup, leaveGroup };
