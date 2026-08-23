import React, { useState } from 'react';
import client from '../api/client.js'; // <-- Import client to call backend

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const price = selectedPlan === 'monthly' ? 7 : 65;

  // This triggers the real Stripe checkout session
  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const interval = selectedPlan === 'monthly' ? 'month' : 'year';
      const res = await client.post('/subscription/checkout', { interval });
      // Redirect the browser to Stripe's secure payment page
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start subscription. Please check your Stripe keys.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0d0c] text-white min-h-screen font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Upgrade to Premium</h1>
            <p className="text-teal-400 text-sm mt-1">Unlock advanced animation features and perks</p>
          </div>
          {/* Keep these as they are for the UI */}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Free Plan */}
          <div className="bg-[#111818] border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-2">Free Artist</h2>
              <h3 className="text-2xl font-black text-teal-400 mb-4">$0 <span className="text-xs text-gray-400 font-normal">/ month</span></h3>
              <p className="text-sm text-gray-400 mb-6">Basic tools & 15 layers included</p>
            </div>
            <button disabled className="w-full bg-neutral-800 text-gray-500 font-semibold py-2.5 rounded-lg text-sm cursor-not-allowed">Current Plan</button>
          </div>

          {/* Monthly Plan */}
          <div className={`bg-[#111818] rounded-xl p-6 flex flex-col justify-between border-2 transition-all ${selectedPlan === 'monthly' ? 'border-teal-400 shadow-lg shadow-teal-500/10' : 'border-neutral-800'}`}>
            <div>
              <h2 className="text-lg font-bold mb-2">Monthly Plan</h2>
              <h3 className="text-2xl font-black text-teal-400 mb-4">$7 <span className="text-xs text-gray-400 font-normal">/ month</span></h3>
              <p className="text-sm text-gray-400 mb-6">Extended limits & cloud backup</p>
            </div>
            <button onClick={() => setSelectedPlan('monthly')} className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors ${selectedPlan === 'monthly' ? 'bg-teal-400 text-black' : 'border border-teal-400 text-teal-400 hover:bg-teal-400/10'}`}>
              {selectedPlan === 'monthly' ? '✓ Selected' : 'Select Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className={`bg-[#111818] rounded-xl p-6 flex flex-col justify-between border-2 transition-all ${selectedPlan === 'yearly' ? 'border-teal-400 shadow-lg shadow-teal-500/10' : 'border-neutral-800'}`}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Yearly Plan</h2>
                <span className="text-[10px] bg-teal-400/20 text-teal-400 px-2 py-0.5 rounded-full font-bold">Save $19</span>
              </div>
              <h3 className="text-2xl font-black text-teal-400 mb-4">$65 <span className="text-xs text-gray-400 font-normal">/ year</span></h3>
              <p className="text-sm text-gray-400 mb-6">Best value for serious creators</p>
            </div>
            <button onClick={() => setSelectedPlan('yearly')} className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors ${selectedPlan === 'yearly' ? 'bg-teal-400 text-black' : 'border border-teal-400 text-teal-400 hover:bg-teal-400/10'}`}>
              {selectedPlan === 'yearly' ? '✓ Selected' : 'Select Yearly'}
            </button>
          </div>
        </div>

        {/* Dynamic Payment Action - Now REAL Stripe */}
        <div className="text-center bg-[#111818] border border-neutral-800 rounded-xl p-6">
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-teal-400/20"
          >
            {loading ? 'Redirecting to Stripe...' : `Pay Through Stripe ($${price})`}
          </button>
        </div>
      </div>
    </div>
  );
}