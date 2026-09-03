import express from 'express';
import { chat, interpolate } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/chat', chat);
router.post('/interpolate', interpolate);
export default router;