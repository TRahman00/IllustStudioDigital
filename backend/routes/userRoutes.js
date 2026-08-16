const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/me
// @desc    Get current logged-in user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Exclude sensitive fields
    const user = await User.findById(req.user.id).select(
      '-passwordHash -verificationToken'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;