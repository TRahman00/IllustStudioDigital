import express from 'express';
import { connectDrive, driveCallback, uploadToDrive } from '../controllers/driveController.js';

const router = express.Router();

router.get('/auth', connectDrive);
router.get('/oauth/callback', driveCallback);
router.post('/upload', uploadToDrive);

export default router;