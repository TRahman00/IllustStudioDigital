const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token & attach user object to incoming requests
exports.protect = async (req, res, next) => {
  let token;

  // Extract Bearer token from the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Reject request if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  try {
    // Verify token validity against JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user using ID stored in the decoded token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User belonging to this token no longer exists.' });
    }

    // Immediately deny access if the user has been suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Access denied. Your account is suspended.' });
    }

    // Attach user object to request object for downstream usage
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or token is invalid.' });
  }
};

// Middleware to restrict endpoint access to Administrator role only
exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrators only.' });
  }
  next();
};