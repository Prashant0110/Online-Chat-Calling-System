const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/UserModel");

const createCheckoutSession = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isPremium) {
      return res.status(400).json({ error: "User already has premium access" });
    }

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
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      client_reference_id: req.user._id.toString(),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
};

const handleStripeWebhook = async (req, res) => {
  console.log("Received webhook request:", req.body); 
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout session completed:", session);

    // Add your logic to handle successful payment here
    if (session.payment_status === "paid") {
      try {
        const user = await User.findById(session.client_reference_id);
        if (user) {
          await User.findByIdAndUpdate(session.client_reference_id, {
            isPremium: true,
            hasPaidForCalling: true,
          });
        } else {
          console.error(
            "User not found for client_reference_id:",
            session.client_reference_id
          );
        }
      } catch (error) {
        console.error(`Error updating user: ${error.message}`);
      }
    }
  }

  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };
