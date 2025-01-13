const express = require("express");

const {
  createPaymentIntent,
  handleStripeWebhook,
} = require("../controller/stripeController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

// Route for creating a payment intent (requires authentication)
router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);

// Route for Stripe webhook to handle payment success
router.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;
