const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  zoomLevel: { type: Number, default: 1.0 },
  panOffset: { x: Number, y: Number },
  rotationAngle: { type: Number, default: 0 }
});

module.exports = mongoose.model('CanvasSettings', canvasSchema);