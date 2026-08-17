import Stripe from 'stripe';
import User from '../models/User.js';
import { sendReceiptEmail } from '../services/emailService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan} Subscription` },
          unit_amount: plan === 'pro' ? 2000 : 1000,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:1600'}/success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:1600'}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  res.json({ received: true });
};