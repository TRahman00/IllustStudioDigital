const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getRecentWorks,
  uploadArtwork
} = require('../controllers/dashboardController');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All routes here require authentication
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.get('/recent-works', protect, getRecentWorks);
router.post('/upload', protect, upload.single('image'), uploadArtwork);

module.exports = router;