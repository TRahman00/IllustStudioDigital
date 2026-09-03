import express from 'express';
import { register, login, me, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/password', protect, changePassword);

export default router;