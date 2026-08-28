import Stripe from 'stripe';
import User from '../models/User.js';
import { sendReceiptEmail } from '../services/emailService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createCheckoutSession(req, res, next) {
  try {
    if (!stripe) return res.status(501).json({ message: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to backend/.env.' });
    const { interval } = req.body;
    const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return res.status(500).json({ message: 'Missing STRIPE_PRICE_MONTHLY/YEARLY in .env' });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?upgraded=1`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`,
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
        const currentPts = user.points || user.loyaltyPoints || 0;
        const newPts = currentPts + 200;

        user.plan = 'premium';
        user.points = newPts;
        user.loyaltyPoints = newPts;
        await user.save();
        
        sendReceiptEmail(user, session.amount_total ? session.amount_total / 100 : 7, 'Premium').catch(() => {});
      }
    }
  }
  res.json({ received: true });
}

// ================= PAYPAL CONTROLLERS =================

export async function createPaypalPayment(req, res, next) {
  try {
    const redirectUrl = `${req.protocol}://${req.get('host')}/api/pricing/paypal/success?userId=${req.user._id}`;
    res.json({ url: redirectUrl });
  } catch (err) { next(err); }
}

export async function handlePaypalSuccess(req, res, next) {
  try {
    const userId = req.query.userId || (req.user && req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const currentPts = user.points || user.loyaltyPoints || 0;
        const newPts = currentPts + 200;

        user.plan = 'premium';
        user.points = newPts;
        user.loyaltyPoints = newPts;
        await user.save();

        if (typeof sendReceiptEmail === 'function') {
          sendReceiptEmail(user, 7, 'Premium (PayPal)').catch(() => {});
        }
      }
    }
    
    res.redirect(`${clientUrl}/dashboard?subscription=success`);
  } catch (err) {
    next(err);
  }
}