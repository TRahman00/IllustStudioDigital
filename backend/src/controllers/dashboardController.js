import Project from '../models/Project.js';
import User from '../models/User.js';

const RECENT_WORKS_LIMIT = 9;

// GET /api/dashboard/recent-works
// Powers the "Recent Works" grid on the dashboard. Illustration-type projects only,
// since those are what the drawing app (DrawStudio) can open and continue editing.
export async function getRecentWorks(req, res, next) {
  try {
    const works = await Project.find({ owner: req.user._id, type: 'illustration' })
      .sort({ updatedAt: -1 })
      .limit(RECENT_WORKS_LIMIT)
      .select('title thumbnail updatedAt createdAt');
    res.json({ works });
  } catch (err) { next(err); }
}

// PUT /api/dashboard/profile
export async function updateProfile(req, res, next) {
  try {
    const { name, handle, bio, profilePicture } = req.body;

    if (handle) {
      const clean = String(handle).trim().toLowerCase();
      const taken = await User.findOne({ handle: clean, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: 'That handle is already taken' });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (handle !== undefined) update.handle = String(handle).trim().toLowerCase();
    if (bio !== undefined) update.bio = bio;
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
}