const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (user, plan) => {
  const priceId = plan === 'premium_yearly' 
    ? process.env.STRIPE_YEARLY_PRICE_ID 
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
    metadata: { userId: user._id.toString(), plan }
  });

  return session;
};

exports.handleWebhook = (req) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  return event;
};