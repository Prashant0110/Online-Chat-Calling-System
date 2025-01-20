const stripe = require("stripe")(
  "sk_test_51QSHuhHCVBXe7H0jV7kWKJIzz7UIHXMlsrU9OYbYNmPWmufjlJcEMew7fL6PtBhbMX5RDAdY0HaGMxpzbdv7pn6s00oiSWfS1v"
); // Your Stripe secret key
const expressAsyncHandler = require("express-async-handler");

const createPaymentIntent = expressAsyncHandler(async (req, res) => {
  try {
    const amountInCents = Number(req.body.amount) * 100; // Convert to cents

    // Create a Payment Intent on Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: { userId: req.user._id },
    });

    // Return the client secret to the frontend for payment confirmation
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle Stripe webhook to listen for payment success
const handleStripeWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Construct the event from the Stripe webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    // Handle the payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object; // Contains `payment_intent`
      const userId = paymentIntent.metadata.userId;

      await User.updateOne(
        { _id: userId },
        { premiumUser: true, hasPaidForCalling: true }
      );

      console.log(`Payment succeeded for user ${userId}`);
    }

    // Return a success response to Stripe
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook error: ${error.message}`);
  }
};

module.exports = { createPaymentIntent, handleStripeWebhook };
