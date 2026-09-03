import mongoose from 'mongoose';

const layerSchema = new mongoose.Schema(
  {
    name: String,
    dataUrl: String,
    visible: { type: Boolean, default: true },
    opacity: { type: Number, default: 1 },
    // --- Faria's New Layer Features ---
    blendMode: { type: String, default: 'source-over' },
    clipped: { type: Boolean, default: false },
    maskDataUrl: { type: String, default: null }
  },
  { _id: false }
);
const frameSchema = new mongoose.Schema({ dataUrl: String }, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, default: 'Untitled' },
    type: { type: String, enum: ['illustration', 'photo', 'animation'], required: true },
    thumbnail: { type: String },
    width: Number,
    height: Number,
    layers: [layerSchema],
    frames: [frameSchema],
    fps: { type: Number, default: 8 },
    photoDataUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);