import Stripe from 'stripe';
import User from '../models/User.js';
import { sendReceiptEmail } from '../services/emailService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createCheckoutSession(req, res, next) {
  try {
    if (!stripe) return res.status(501).json({ message: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to backend/.env.' });
    
    const { interval, redeemPoints } = req.body;
    const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return res.status(500).json({ message: 'Missing STRIPE_PRICE_MONTHLY/YEARLY in .env' });

    // Fetch the user
    const user = await User.findById(req.user._id);
    let discountCoupon = null;

    // --- Reward Points Logic ---
    if (redeemPoints && redeemPoints > 0) {
      // 1000 points = $100 = 10,000 cents. So 1 point = 10 cents.
      const discountCents = redeemPoints * 10;

      if (user.loyaltyPoints < redeemPoints) {
        return res.status(400).json({ message: 'Not enough loyalty points.' });
      }

      // Create a one-time Stripe coupon for the discount
      discountCoupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: 'usd',
        duration: 'once',
      });

      // Deduct the points immediately so they can't use them twice
      user.loyaltyPoints -= redeemPoints;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.user.email,
      // If a coupon exists, Stripe applies the discount
      discounts: discountCoupon ? [{ coupon: discountCoupon.id }] : undefined,
      success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
      metadata: { userId: req.user._id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) { next(err); }
}

export async function handleWebhook(req, res) {
  if (!stripe) return res.status(501).end();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    const session = event.data.object;
    const userId = session.metadata && session.metadata.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.plan = 'premium';
        // Award 200 points for successfully renewing
        user.loyaltyPoints += 200;
        await user.save();
        sendReceiptEmail(user, session.amount_total ? session.amount_total / 100 : 7, 'Premium').catch(() => {});
      }
    }
  }
  res.json({ received: true });
}