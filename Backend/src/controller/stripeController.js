const expressAsyncHandler = require("express-async-handler");
const stripe = require("stripe")(
  "sk_test_51QSHuhHCVBXe7H0jV7kWKJIzz7UIHXMlsrU9OYbYNmPWmufjlJcEMew7fL6PtBhbMX5RDAdY0HaGMxpzbdv7pn6s00oiSWfS1v"
);

// Create a Checkout Session
const createCheckoutSession = expressAsyncHandler(async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Account",
            },
            unit_amount: 1000, // $10.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Webhook to handle Stripe events
const bodyParser = require("body-parser");

const handleStripeWebhook = expressAsyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_m0avefdGpCgJu1RIUKX5ZhSZPhQvQNeY"
    );

    // Handle the event (e.g., checkout.session.completed)
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // Handle successful checkout session here (e.g., update user status)
        console.log("Checkout session completed:", session);
        break;
      // Add more cases for other event types if needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
