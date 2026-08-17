import React, { useState } from 'react';
 import client from '../api/client.js';
export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const price = selectedPlan === 'monthly' ? 7 : 65;

  const handleFreeTrial = () => alert('🎉 14-Day Free Trial Activated!');
  
  const handlePayUsingEmail = () => {
    const email = prompt('Enter your registered Email ID for payment instructions:');
    if (email) alert(`Instructions sent to ${email}`);
  };

  const handleResendCode = () => alert('📩 Verification code resent to your email!');

  const handleManualPayment = () => {
   alert('Stripe/PayPal integration is optional. To test, update this function.');
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
          <div className="flex flex-wrap gap-2">
            <button onClick={handleFreeTrial} className="bg-teal-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-300">
              Free Trial
            </button>
            <button onClick={handlePayUsingEmail} className="border border-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800">
              Pay via Email
            </button>
            <button onClick={handleResendCode} className="border border-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800">
              Resend Code
            </button>
          </div>
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
            <button disabled className="w-full bg-neutral-800 text-gray-500 font-semibold py-2.5 rounded-lg text-sm cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Monthly Plan */}
          <div className={`bg-[#111818] rounded-xl p-6 flex flex-col justify-between border-2 transition-all ${selectedPlan === 'monthly' ? 'border-teal-400 shadow-lg shadow-teal-500/10' : 'border-neutral-800'}`}>
            <div>
              <h2 className="text-lg font-bold mb-2">Monthly Plan</h2>
              <h3 className="text-2xl font-black text-teal-400 mb-4">$7 <span className="text-xs text-gray-400 font-normal">/ month</span></h3>
              <p className="text-sm text-gray-400 mb-6">Extended limits & cloud backup</p>
            </div>
            <button 
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors ${selectedPlan === 'monthly' ? 'bg-teal-400 text-black' : 'border border-teal-400 text-teal-400 hover:bg-teal-400/10'}`}
            >
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
            <button 
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors ${selectedPlan === 'yearly' ? 'bg-teal-400 text-black' : 'border border-teal-400 text-teal-400 hover:bg-teal-400/10'}`}
            >
              {selectedPlan === 'yearly' ? '✓ Selected' : 'Select Yearly'}
            </button>
          </div>
        </div>

        {/* Dynamic Payment Action */}
        <div className="text-center bg-[#111818] border border-neutral-800 rounded-xl p-6">
          <button 
            onClick={handleManualPayment}
            className="bg-teal-400 hover:bg-teal-300 text-black font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-teal-400/20"
          >
            Pay Through PayPal (${price})
          </button>
        </div>
      </div>
    </div>
  );
}