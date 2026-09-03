import express from 'express';
import { connectDrive, driveCallback, uploadToDrive, getDriveFiles, downloadFile } from '../controllers/driveController.js';

const router = express.Router();

router.get('/auth', connectDrive);
router.get('/oauth/callback', driveCallback);
router.post('/upload', uploadToDrive);

// --- NEW: Routes for fetching and downloading files ---
router.get('/files', getDriveFiles);
router.get('/download/:fileId', downloadFile);

export default router;