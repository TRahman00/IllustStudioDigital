import express from 'express';
import multer from 'multer';
import { upload as uploadDrawing, status } from '../controllers/cadController.js';
import { protect } from '../middleware/authMiddleware.js';

const uploadMiddleware = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);
router.post('/import', uploadMiddleware.single('file'), uploadDrawing);
router.get('/status/:urn', status);
export default router;