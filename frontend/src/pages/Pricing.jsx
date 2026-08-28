import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current user points from storage or context (default 0)
  const userPoints = user?.points || 0;

  // Base price for selected plan
  const basePrice = selectedPlan === 'yearly' ? 65 : 7;

  // Points earned for current plan (Monthly = 70 pts, Yearly = 500 pts)
  const earnedPoints = selectedPlan === 'yearly' ? 500 : 70;

  // Point redemption logic (10 points = $1 discount)
  const maxRedeemablePoints = Math.min(userPoints, basePrice * 10);
  const discountAmount = usePoints ? Math.floor(maxRedeemablePoints / 10) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Handle Payment & Point Calculation
  const handleRenewalAndPayment = () => {
    setLoading(true);

    // Calculate updated points (deduct used points + add earned reward points)
    const updatedPoints = usePoints 
      ? userPoints - maxRedeemablePoints + earnedPoints 
      : userPoints + earnedPoints;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = {
      ...storedUser,
      plan: 'premium',
      points: updatedPoints
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard?subscription=success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0d0e] text-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-4xl font-bold mb-2">Upgrade & Renew Premium</h1>
        <p className="text-teal-400 text-sm">Earn reward points on renewals and convert them to discounts!</p>
      </div>

      {/* Reward Balance Display */}
      <div className="bg-neutral-900 border border-teal-500/30 rounded-xl px-6 py-3 mb-8 flex items-center gap-4">
        <span className="text-2xl">🪙</span>
        <div>
          <div className="text-xs text-neutral-400">Your Loyalty Balance</div>
          <div className="text-lg font-bold text-teal-400">
            {userPoints} Points (${(userPoints / 10).toFixed(2)} Discount Value)
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full mb-8">
        {/* Monthly Plan */}
        <div 
          onClick={() => setSelectedPlan('monthly')}
          className={`bg-neutral-900/50 border rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition ${
            selectedPlan === 'monthly' ? 'border-teal-400 ring-1 ring-teal-400' : 'border-neutral-800'
          }`}
        >
          <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
          <div className="text-3xl font-extrabold text-teal-400 mb-1">$7 <span className="text-xs text-neutral-400">/ month</span></div>
          <p className="text-xs font-semibold text-teal-300 mt-2">+70 Reward Points on Renewal</p>
        </div>

        {/* Yearly Plan */}
        <div 
          onClick={() => setSelectedPlan('yearly')}
          className={`bg-neutral-900/50 border rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition ${
            selectedPlan === 'yearly' ? 'border-teal-400 ring-1 ring-teal-400' : 'border-neutral-800'
          }`}
        >
          <h3 className="text-xl font-bold mb-2">Yearly Plan</h3>
          <div className="text-3xl font-extrabold text-teal-400 mb-1">$65 <span className="text-xs text-neutral-400">/ year</span></div>
          <p className="text-xs font-semibold text-teal-300 mt-2">+500 Reward Points on Renewal</p>
        </div>
      </div>

      {/* Checkout Section */}
      <div className="max-w-md w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
        {userPoints > 0 && (
          <label className="flex items-center justify-between p-3 bg-neutral-800/60 rounded-lg cursor-pointer border border-neutral-700">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={usePoints} 
                onChange={(e) => setUsePoints(e.target.checked)} 
                className="accent-teal-400 w-4 h-4"
              />
              <span className="text-sm font-medium">Redeem Points</span>
            </div>
            <span className="text-xs font-bold text-teal-400">-${discountAmount} Off</span>
          </label>
        )}

        {/* Price Summary */}
        <div className="space-y-1 text-sm border-t border-neutral-800 pt-3">
          <div className="flex justify-between text-neutral-400">
            <span>Base Price:</span>
            <span>${basePrice}</span>
          </div>
          {usePoints && (
            <div className="flex justify-between text-teal-400">
              <span>Points Discount ({maxRedeemablePoints} pts):</span>
              <span>-${discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-teal-300 text-xs">
            <span>Points Earned this Purchase:</span>
            <span>+{earnedPoints} pts</span>
          </div>
          <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-neutral-800">
            <span>Total Payable:</span>
            <span>${finalPrice}</span>
          </div>
        </div>

        <button
          onClick={handleRenewalAndPayment}
          disabled={loading}
          className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-lg transition mt-2"
        >
          {loading ? 'Processing Payment...' : `Pay $${finalPrice} & Renew`}
        </button>
      </div>
    </div>
  );
}