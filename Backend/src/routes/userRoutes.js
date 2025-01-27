const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");

const router = express.Router();

console.log("Register User Handler:", registerUser);
console.log("Login User Handler:", loginUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
