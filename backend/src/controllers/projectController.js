import Project from '../models/Project.js';
import User from '../models/User.js';

const FREE_LAYER_LIMIT = 15;
const FREE_FRAME_LIMIT = 20; // Added for Animation
const FREE_FPS_LIMIT = 12;   // Added for Animation

function overLayerLimit(req) {
  return req.body.type === 'illustration' && req.user.plan === 'free' && (req.body.layers || []).length > FREE_LAYER_LIMIT;
}

// New function to check Animation limits
function overAnimationLimit(req) {
  if (req.body.type !== 'animation' || req.user.plan !== 'free') return false;
  const frames = req.body.frames || [];
  const fps = req.body.fps || 0;
  return frames.length > FREE_FRAME_LIMIT || fps > FREE_FPS_LIMIT;
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
    if (overAnimationLimit(req)) return res.status(403).json({ message: `Free plan is limited to ${FREE_FRAME_LIMIT} frames and ${FREE_FPS_LIMIT} FPS. Upgrade to Premium for unlimited animations.` });
    
    // 1. Create the new project
    const project = await Project.create({ ...req.body, owner: req.user._id });

    // 2. Logic: Earn Points & Auto-Upgrade to Premium on reaching 100 Points
    const user = await User.findById(req.user._id);
    if (user) {
      let currentPts = user.points || user.loyaltyPoints || 0;
      
      // Basic creation reward: 10 points
      let earnedPts = 10;

      // Milestone Bonus: If project has complex content (more than 3 layers or frames)
      const layersCount = (req.body.layers || []).length;
      const framesCount = (req.body.frames || []).length;
      if (layersCount > 3 || framesCount > 3) {
        earnedPts += 20; // Extra bonus points for detailed work
      }

      const totalPts = currentPts + earnedPts;
      user.points = totalPts;
      user.loyaltyPoints = totalPts;

      // Premium unlock criteria: Auto-upgrade if points reach 100 or more
      if (totalPts >= 100 && user.plan !== 'premium') {
        user.plan = 'premium';
      }

      await user.save();
    }

    res.status(201).json({ project, user });
  } catch (err) { next(err); }
}

export async function updateProject(req, res, next) {
  try {
    if (overLayerLimit(req)) return res.status(403).json({ message: `Free plan is limited to ${FREE_LAYER_LIMIT} layers per file. Upgrade to Premium for unlimited layers.` });
    if (overAnimationLimit(req)) return res.status(403).json({ message: `Free plan is limited to ${FREE_FRAME_LIMIT} frames and ${FREE_FPS_LIMIT} FPS. Upgrade to Premium for unlimited animations.` });
    
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