import express from 'express';
import { getRecentWorks, updateProfile } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/recent-works', getRecentWorks);
router.put('/profile', updateProfile);
export default router;