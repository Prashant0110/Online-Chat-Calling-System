const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createCheckoutSession,
  handleStripeWebhook,
} = require("../controller/stripeController");

const router = express.Router();

// Ensure the user is authenticated before creating a checkout session
router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

// Route for Stripe webhook to handle payment success
router.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;
