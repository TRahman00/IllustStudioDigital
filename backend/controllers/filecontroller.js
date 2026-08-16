const Artwork = require('../models/Artwork');

// Helper to get owner ID
const getOwnerId = (req) => (req.user && req.user.id) || 'dev-user-id';

exports.createFile = async (req, res, next) => {
  try {
    const { title, description, fileType, tags, canvasData } = req.body;
    const artwork = await Artwork.create({
      owner: getOwnerId(req),
      title: title || 'Untitled',
      description,
      fileType: fileType || 'illustration',
      tags: tags || [],
      canvasData,
    });
    res.status(201).json(artwork);
  } catch (error) {
    next(error);
  }
};

exports.getUserFiles = async (req, res, next) => {
  try {
    const files = await Artwork.find({ owner: getOwnerId(req) }).sort({ updatedAt: -1 });
    res.json(files);
  } catch (error) {
    next(error);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, owner: getOwnerId(req) });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    next(error);
  }
};

exports.updateFile = async (req, res, next) => {
  try {
    const { canvasData, animationData, title, description, tags, isPublic } = req.body;
    const artwork = await Artwork.findOneAndUpdate(
      { _id: req.params.id, owner: getOwnerId(req) },
      { canvasData, animationData, title, description, tags, isPublic },
      { new: true, runValidators: true }
    );
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const artwork = await Artwork.findOneAndDelete({ _id: req.params.id, owner: getOwnerId(req) });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.exportFile = async (req, res, next) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, owner: getOwnerId(req) });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ url: artwork.canvasData, format: req.body.format || 'png' });
  } catch (error) {
    next(error);
  }
};

exports.saveLocalCopy = async (req, res, next) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, owner: getOwnerId(req) });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Ready for local download', data: artwork.canvasData });
  } catch (error) {
    next(error);
  }
};