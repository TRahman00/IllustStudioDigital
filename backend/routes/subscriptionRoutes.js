import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

// webhook route lives in server.js (needs raw body)
const router = express.Router();
router.post('/checkout', protect, createCheckoutSession);
export default router;