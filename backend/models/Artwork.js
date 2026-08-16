const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    fileType: {
      type: String,
      enum: ['illustration', 'animation', 'photo_edit'],
      default: 'illustration',
    },
    cloudFileId: String, // Google Drive file ID (optional)
    thumbnailUrl: String,
    canvasData: String, // serialized JSON of canvas layers/state
    animationData: String, // serialized animation frames
    isPublic: { type: Boolean, default: false },
    tags: [String],
    size: Number, // in bytes
    exportHistory: [
      {
        format: String,
        url: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artwork', artworkSchema);