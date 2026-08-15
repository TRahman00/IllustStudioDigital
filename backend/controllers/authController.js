const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc   Register user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  const { name, email, password, handle } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, handle });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    token: generateToken(user._id)
  });
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      handle: user.handle,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};