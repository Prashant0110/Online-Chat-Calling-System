// callController.js
const expressAsyncHandler = require("express-async-handler");

const initiateCall = expressAsyncHandler(async (req, res) => {
  // For testing, simply return a success message.
  res.status(200).json({ message: "Call initiated successfully" });
});

module.exports = { initiateCall };
