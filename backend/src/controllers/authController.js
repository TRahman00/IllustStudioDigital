import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../services/emailService.js';

async function makeUniqueHandle(name, email) { // generates handle from email
  const base = (name || email.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'artist';
  let handle = base;
  let n = 1;
  while (await User.findOne({ handle })) {
    n += 1;
    handle = `${base}${n}`;
  }
  return handle;
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with that email already exists' });
    const handle = await makeUniqueHandle(name, email);
    const user = await User.create({ name, email, password, handle });
    sendWelcomeEmail(user).catch((e) => console.warn('Welcome email failed:', e.message));
    res.status(201).json({ user: user.toSafeObject(), token: generateToken(user._id) });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.status === 'suspended') return res.status(403).json({ message: 'This account has been suspended' });
    res.json({ user: user.toSafeObject(), token: generateToken(user._id) });
  } catch (err) { next(err); }
}


export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}
export async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}