const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createCheckoutSession,
  handleStripeWebhook,
} = require("../controller/groupController");

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;
