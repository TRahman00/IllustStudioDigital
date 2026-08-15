const Artwork = require('../models/artwork');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (must have env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, profilePicture },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET recent works
const getRecentWorks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPLOAD artwork to Cloudinary
const uploadArtwork = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    // Upload full image
    const fullResult = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'photoshop_clone/full'
    });
    // Upload thumbnail (400x400 crop)
    const thumbResult = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'photoshop_clone/thumbnails',
      transformation: [{ width: 400, height: 400, crop: 'fill' }]
    });

    const newArtwork = new Artwork({
      title: req.body.title || 'Untitled',
      tags: req.body.tags ? req.body.tags.split(',') : ['art'],
      fullImageUrl: fullResult.secure_url,
      thumbnailUrl: thumbResult.secure_url,
      userId: req.user.id
    });
    await newArtwork.save();
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getRecentWorks,
  uploadArtwork
};