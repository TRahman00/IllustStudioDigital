const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  tags: [{ type: String }],
  fullImageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', ArtworkSchema);