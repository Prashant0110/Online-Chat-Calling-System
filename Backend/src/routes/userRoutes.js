const express = require("express");
const { registerUser, LoginUser } = require("../controller/userController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", isAuthenticated, LoginUser);

module.exports = router;
