import Stripe from 'stripe';
import User from '../models/User.js';
import { sendReceiptEmail } from '../services/emailService.js';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  // Validates if key exists and is NOT a dummy/demo placeholder key
  if (!key || key.includes('demo') || key.includes('Mock') || key.includes('123456789')) {
    return null;
  }
  return new Stripe(key);
};

export async function createCheckoutSession(req, res, next) {
  try {
    const { interval, redeemPoints } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // --- Reward Points Logic ---
    if (redeemPoints && redeemPoints > 0) {
      if ((user.loyaltyPoints || 0) < redeemPoints) {
        return res.status(400).json({ message: 'Not enough loyalty points.' });
      }
      user.loyaltyPoints -= redeemPoints;
      await user.save();
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const stripe = getStripe();

    // --- Mock / Fallback Upgrade Flow (For Live Demo) ---
    if (!stripe) {
      user.plan = 'premium';
      user.loyaltyPoints = (user.loyaltyPoints || 0) + 200; // Award 200 bonus points
      await user.save();

      // Send receipt email without crashing if SMTP fails
      sendReceiptEmail(user, 7, 'Premium').catch(() => {});

      // Direct redirection to dashboard with success status
      return res.json({ url: `${baseUrl}/dashboard?upgraded=1` });
    }

    // --- Real Stripe Flow (Runs only if a real API Key is placed) ---
    const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return res.status(500).json({ message: 'Missing STRIPE_PRICE_MONTHLY/YEARLY in .env' });

    let discountCoupon = null;
    if (redeemPoints && redeemPoints > 0) {
      discountCoupon = await stripe.coupons.create({
        amount_off: redeemPoints * 10,
        currency: 'usd',
        duration: 'once',
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      discounts: discountCoupon ? [{ coupon: discountCoupon.id }] : undefined,
      success_url: `${baseUrl}/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: { 
        userId: user._id.toString(),
        redeemedPoints: redeemPoints ? redeemPoints.toString() : '0'
      },
    });

    res.json({ url: session.url });
  } catch (err) { 
    next(err); 
  }
}

export async function handleWebhook(req, res) {
  const stripe = getStripe();
  if (!stripe) return res.json({ received: true });

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
        user.loyaltyPoints = (user.loyaltyPoints || 0) + 200;
        await user.save();

        const amountPaid = session.amount_total ? session.amount_total / 100 : 7;
        sendReceiptEmail(user, amountPaid, 'Premium').catch(() => {});
      }
    }
  }

  res.json({ received: true });
}