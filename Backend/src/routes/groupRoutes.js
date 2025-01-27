const express = require("express");
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroup,
  getGroups,
} = require("../controller/groupController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

// Log the handlers
console.log("Create Group Handler:", createGroup);
console.log("Get Group Handler:", getGroup);
console.log("Get Groups Handler:", getGroups);

router.post("/creategroup", isAuthenticated, createGroup);
router.get("/getgroup/:id", isAuthenticated, getGroup);
router.get("/getgroups", isAuthenticated, getGroups);
router.post("/join/:id", isAuthenticated, joinGroup);
router.post("/leave/:id", isAuthenticated, leaveGroup);

module.exports = router;
