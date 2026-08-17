import Project from '../models/Project.js';

const FREE_LAYER_LIMIT = 15;
function overLayerLimit(req) {
  return req.body.type === 'illustration' && req.user.plan === 'free' && (req.body.layers || []).length > FREE_LAYER_LIMIT;
}

export async function listProjects(req, res, next) {
  try {
    const projects = await Project.find({ owner: req.user._id }).select('-layers -frames').sort('-updatedAt');
    res.json({ projects });
  } catch (err) { next(err); }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
}

export async function createProject(req, res, next) {
  try {
    if (overLayerLimit(req)) return res.status(403).json({ message: `Free plan is limited to ${FREE_LAYER_LIMIT} layers per file. Upgrade to Premium for unlimited layers.` });
    const project = await Project.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ project });
  } catch (err) { next(err); }
}

export async function updateProject(req, res, next) {
  try {
    if (overLayerLimit(req)) return res.status(403).json({ message: `Free plan is limited to ${FREE_LAYER_LIMIT} layers per file. Upgrade to Premium for unlimited layers.` });
    const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
}