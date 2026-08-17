import express from 'express';
import { 
  getReviewPanelUsers, 
  verifyArtist, 
  suspendUser, 
  deleteUser 
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', getReviewPanelUsers);
router.put('/users/:id/verify', verifyArtist);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

export default router;