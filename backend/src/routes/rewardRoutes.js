import express from 'express';
import { earnPointsOnRenewal, calculateDiscount } from '../controllers/rewardController.js';

const router = express.Router();

router.post('/earn', earnPointsOnRenewal);
router.post('/calculate-discount', calculateDiscount);

export default router;