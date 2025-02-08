const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createCheckoutSession,
 
} = require("../controller/stripeController");

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

router.get("/success", (req, res) => {
  res.redirect(
    `${process.env.CLIENT_URL}/payment/success?session_id=${req.query.session_id}`
  );
});

router.get("/cancel", (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
});

module.exports = router;
