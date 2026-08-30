import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/checkout', protect, createCheckoutSession); // <--- Protects it so only logged-in users can subscribe
export default router;