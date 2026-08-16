import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../services/emailService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with that email already exists' });
    const user = await User.create({ name, email, password });
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

export async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
