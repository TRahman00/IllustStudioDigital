import express from 'express';
import { createCheckoutSession, createPaypalPayment, handlePaypalSuccess } from '../controllers/pricingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stripe Checkout
router.post('/checkout', protect, createCheckoutSession);

// PayPal Routes
router.post('/paypal/checkout', protect, createPaypalPayment);
router.get('/paypal/success', handlePaypalSuccess);

export default router;