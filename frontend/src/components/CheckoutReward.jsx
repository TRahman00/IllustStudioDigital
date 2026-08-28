import React, { useState } from 'react';
import axios from 'axios';

const CheckoutReward = ({ user }) => {
  
  const [usePoints, setUsePoints] = useState(false);
  const basePrice = 200; 

  // 1000 points = $100 discount (1 point = $0.1)
  const discount = usePoints ? (user?.loyaltyPoints || 0) * 0.1 : 0;
  const finalPrice = Math.max(0, basePrice - discount);

  const handleRenewal = async () => {
    try {
      const res = await axios.post('/api/rewards/earn', {
        userId: user.id,
        pointsEarned: 1000,
      });
      alert('Subscription Renewed & 1000 Reward Points Added!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Premium Subscription Renewal</h3>
      <p>Your Loyalty Points: <strong>{user?.loyaltyPoints || 0} Points</strong></p>

      {user?.loyaltyPoints > 0 && (
        <label>
          <input
            type="checkbox"
            checked={usePoints}
            onChange={(e) => setUsePoints(e.target.checked)}
          />
          Use points for discount (${(user.loyaltyPoints * 0.1).toFixed(2)} off)
        </label>
      )}

      <hr />
      <p>Original Fee: ${basePrice}</p>
      <p>Discount: -${discount}</p>
      <h4>Total Payable: ${finalPrice}</h4>

      <button onClick={handleRenewal}>Renew Subscription</button>
    </div>
  );
};

export default CheckoutReward;