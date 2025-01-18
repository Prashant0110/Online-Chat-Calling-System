const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", isAuthenticated, loginUser);

module.exports = router;
