import User from '../models/User.js';
import Project from '../models/Project.js';

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) { next(err); }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json({ message: `User ${user.status === 'active' ? 'activated' : 'suspended'} successfully`, user: user.toSafeObject() });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    await Project.deleteMany({ owner: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and all their projects deleted' });
  } catch (err) { next(err); }
}