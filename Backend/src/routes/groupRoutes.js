const express = require("express");
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroup,
} = require("../controller/groupController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.post("/creategroup", isAuthenticated, createGroup);
router.get("/getgroup/", isAuthenticated, getGroup);
router.post("/join/:id", isAuthenticated, joinGroup);
router.post("/leave/:id", isAuthenticated, leaveGroup);

module.exports = router;
