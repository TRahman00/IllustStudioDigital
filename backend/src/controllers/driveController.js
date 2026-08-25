import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAuthUrl, exchangeCodeForTokens, saveUserTokens, uploadFileToDrive } from '../services/driveService.js';

// UPDATED: Read token from query and verify it
export async function connectDrive(req, res) {
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const url = getAuthUrl(user._id.toString());
    res.redirect(url);
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}

// UPDATED: Use the 'state' parameter to find the user
export async function driveCallback(req, res) {
  const { code, state } = req.query;

  try {
    const user = await User.findById(state);
    if (!user) throw new Error('User not found');

    const tokens = await exchangeCodeForTokens(code);
    await saveUserTokens(user._id, tokens);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?drive=connected`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/dashboard?drive=error`);
  }
}

export async function uploadToDrive(req, res, next) {
  try {
    const { fileName, mimeType, dataUrl } = req.body;
    const file = await uploadFileToDrive(req.user._id, fileName, mimeType, dataUrl);
    res.json({ success: true, fileId: file.id });
  } catch (err) {
    next(err);
  }
}