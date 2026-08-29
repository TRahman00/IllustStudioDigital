import User from '../models/User.js';


export const earnPointsOnRenewal = async (req, res) => {
  try {
    const { userId, pointsEarned } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.loyaltyPoints += Number(pointsEarned || 1000); 
    await user.save();

    res.status(200).json({
      message: 'Points added successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const calculateDiscount = async (req, res) => {
  try {
    const { userId, basePrice, usePoints } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let discount = 0;
    let pointsToDeduct = 0;

    
    if (usePoints && user.loyaltyPoints > 0) {
      discount = user.loyaltyPoints * 0.1;

      if (discount > basePrice) {
        discount = basePrice;
        pointsToDeduct = basePrice * 10;
      } else {
        pointsToDeduct = user.loyaltyPoints;
      }
    }

    const finalPrice = Math.max(0, basePrice - discount);

    res.status(200).json({
      basePrice,
      discount,
      finalPrice,
      pointsToDeduct,
      currentPoints: user.loyaltyPoints,
      remainingPoints: user.loyaltyPoints - pointsToDeduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
