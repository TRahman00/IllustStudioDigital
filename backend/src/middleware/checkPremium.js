const Subscription = require('../models/Subscription');

// Middleware to grant access ONLY to users with active subscriptions
exports.requirePremium = async (req, res, next) => {
  try {
    const activeSubscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() } // Ensure subscription hasn't expired
    });

    if (!activeSubscription) {
      return res.status(403).json({ 
        message: 'Access denied. Premium subscription required to use this feature.' 
      });
    }

    req.subscription = activeSubscription;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying premium status.', error: error.message });
  }
};