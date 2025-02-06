const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createCheckoutSession,
  handleStripeWebhook,
} = require("../controller/stripeController");

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

router.post("/webhook", handleStripeWebhook);

router.get("/success", (req, res) => {
  const sessionId = req.query.session_id;
  res.redirect(
    `${process.env.CLIENT_URL}/payment/success?session_id=${sessionId}`
  );
});

router.get("/cancel", (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
});

module.exports = router;
