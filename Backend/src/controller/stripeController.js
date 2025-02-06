const expressAsyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/UserModel");

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
              name: "Premium Calling Access",
              description: "Unlimited voice and video calling features",
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        userId: req.user._id.toString(),
        email: req.user.email,
      },
      client_reference_id: req.user._id.toString(),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
});

const handleStripeWebhook = expressAsyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Check if the payment was successful
      if (session.payment_status === "paid") {
        const userId = session.client_reference_id;

        if (userId) {
          // Find the user and update the `isPremium` field
          const user = await User.findById(userId);
          if (user) {
            user.isPremium = true; // Update isPremium to true
            await user.save(); // Save the updated user object
            console.log(`User ${userId} upgraded to premium.`);
          } else {
            console.log(`User with ID ${userId} not found.`);
          }
        }
      }
    }

    // Acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = { createCheckoutSession, handleStripeWebhook };
