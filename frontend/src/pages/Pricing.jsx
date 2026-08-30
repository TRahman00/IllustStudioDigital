import React, { useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // <--- Ensures Theme toggle works
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const CheckIcon = () => (
  <svg className="w-4 h-4 mt-1 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function Pricing() {
  const { user } = useAuth();
  const { theme } = useTheme(); // Forces re-render on theme change
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const price = selectedPlan === 'monthly' ? 7 : 65;

  const handleCheckout = async () => {
    setLoading(true); setError('');
    try {
      const interval = selectedPlan === 'monthly' ? 'month' : 'year';
      const res = await client.post('/subscription/checkout', { interval, redeemPoints: Number(redeemPoints) || 0 });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start subscription.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF6] dark:bg-[#070C0B] text-neutral-900 dark:text-[#EDF3F0] font-body flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1080px] mx-auto px-6">
        {/* Hero */}
        <section className="py-16 text-center">
          <span className="font-mono text-xs tracking-widest uppercase text-[#14B8A6] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#14B8A6] rounded-full"></span> Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mt-4 mb-4">Free to start. Premium when you need the room.</h1>
          <p className="text-neutral-500 dark:text-[#8AA39B] max-w-lg mx-auto">Every account begins on Free. Upgrade any time.</p>
        </section>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button type="button" onClick={() => setSelectedPlan('monthly')} className={`text-sm font-semibold ${selectedPlan === 'monthly' ? '' : 'text-neutral-500 dark:text-[#8AA39B]'}`}>Monthly</button>
          <button type="button" onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'yearly' : 'monthly')} className="relative w-16 h-8 rounded-full border border-neutral-300 dark:border-[#1D2926] bg-neutral-100 dark:bg-[#121C1A]">
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-[#14B8A6] transition-all ${selectedPlan === 'yearly' ? 'left-9' : 'left-1'}`}></span>
          </button>
          <button type="button" onClick={() => setSelectedPlan('yearly')} className={`text-sm font-semibold ${selectedPlan === 'yearly' ? '' : 'text-neutral-500 dark:text-[#8AA39B]'}`}>Yearly</button>
          <span className="text-[10px] font-mono bg-[#0F2C29] text-[#14B8A6] px-2 py-1 rounded-full">save 22%</span>
        </div>

        {/* Three-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Free Tier */}
          <div className="border border-neutral-200 dark:border-[#1D2926] rounded-3xl p-8 bg-white dark:bg-[#0D1615] flex flex-col">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-[#8AA39B]">Free</span>
            <h3 className="font-display text-2xl font-semibold mt-3">Get drawing</h3>
            <div className="mt-2 mb-2"><span className="text-5xl font-bold">$0</span><span className="text-sm text-neutral-500 dark:text-[#8AA39B]"> / forever</span></div>
            <ul className="flex flex-col gap-3 text-sm mb-8">
              {['Full brush, pencil, airbrush & eraser set','Up to 15 layers per file','Standard animation length & frame rate','Cloud save + local export','Google Drive connectivity'].map((item) => (
                <li key={item} className="flex gap-2 items-start"><span className="text-[#14B8A6]"><CheckIcon /></span>{item}</li>
              ))}
            </ul>
            <button type="button" className="mt-auto w-full py-2.5 rounded-xl border border-neutral-300 dark:border-[#1D2926] font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Current Plan</button>
          </div>

          {/* Monthly Tier */}
          <div className="border border-[#14B8A6] rounded-3xl p-8 bg-gradient-to-br from-[#0B3B37] to-[#0F766E] flex flex-col relative overflow-hidden shadow-xl">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#D8F5EE]">Premium</span>
            <h3 className="font-display text-2xl font-semibold mt-3 text-white">Monthly Plan</h3>
            <div className="mt-2 mb-2"><span className="text-5xl font-bold text-white">$7</span><span className="text-sm text-[#D8F5EE]"> / month</span></div>
            <p className="text-xs text-[#D8F5EE] mb-6">or $65 billed yearly</p>
            <ul className="flex flex-col gap-3 text-sm mb-8 text-white">
              {['Unlimited layers, storage & file generation','Extended animation time & frame rate','AI keyframe in-betweening','24/7 AI assistant for tools & guidance','Loyalty points on every renewal'].map((item) => (
                <li key={item} className="flex gap-2 items-start"><span className="text-[#D8F5EE]"><CheckIcon /></span>{item}</li>
              ))}
            </ul>

            {/* The Payment Button - Now has type="button" */}
            {selectedPlan === 'monthly' ? (
              <button type="button" onClick={handleCheckout} disabled={loading} className="mt-auto w-full py-2.5 rounded-xl bg-white text-[#0B3B37] font-bold text-sm hover:opacity-90">
                {loading ? 'Redirecting...' : `✓ Selected — Pay $7`}
              </button>
            ) : (
              <button type="button" onClick={() => setSelectedPlan('monthly')} className="mt-auto w-full py-2.5 rounded-xl border border-[#D8F5EE] text-white font-semibold text-sm hover:bg-white hover:text-[#0B3B37]">Select Monthly</button>
            )}
          </div>

          {/* Yearly Tier */}
          <div className={`border rounded-3xl p-8 flex flex-col relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-[#14B8A6] bg-gradient-to-br from-[#0B3B37] to-[#0F766E] shadow-xl' : 'border-neutral-200 dark:border-[#1D2926] bg-white dark:bg-[#0D1615]'}`}>
            {selectedPlan === 'yearly' && <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none"></span>}
            <span className="absolute top-4 right-4 bg-[#14B8A6] text-black text-[10px] font-bold px-2 py-1 rounded-full">Save $19</span>
            <span className={`font-mono text-xs uppercase tracking-widest ${selectedPlan === 'yearly' ? 'text-[#D8F5EE]' : 'text-neutral-500 dark:text-[#8AA39B]'}`}>Premium</span>
            <h3 className={`font-display text-2xl font-semibold mt-3 ${selectedPlan === 'yearly' ? 'text-white' : ''}`}>Yearly Plan</h3>
            <div className="mt-2 mb-2"><span className={`text-5xl font-bold ${selectedPlan === 'yearly' ? 'text-white' : ''}`}>$65</span><span className={`text-sm ${selectedPlan === 'yearly' ? 'text-[#D8F5EE]' : 'text-neutral-500 dark:text-[#8AA39B]'}`}> / year</span></div>
            <p className={`text-xs mb-6 ${selectedPlan === 'yearly' ? 'text-[#D8F5EE]' : 'text-neutral-500 dark:text-[#8AA39B]'}`}>that's $5.42/mo, billed yearly</p>
            <ul className={`flex flex-col gap-3 text-sm mb-8 ${selectedPlan === 'yearly' ? 'text-white' : ''}`}>
              {['Unlimited layers, storage & file generation','Extended animation time & frame rate','AI keyframe in-betweening','24/7 AI assistant for tools & guidance','Loyalty points on every renewal'].map((item) => (
                <li key={item} className="flex gap-2 items-start"><span className={selectedPlan === 'yearly' ? 'text-[#D8F5EE]' : 'text-[#14B8A6]'}><CheckIcon /></span>{item}</li>
              ))}
            </ul>
            
            {/* The Payment Button - Now has type="button" */}
            {selectedPlan === 'yearly' ? (
              <button type="button" onClick={handleCheckout} disabled={loading} className="mt-auto w-full py-2.5 rounded-xl bg-white text-[#0B3B37] font-bold text-sm hover:opacity-90">{loading ? 'Redirecting...' : `✓ Selected — Pay $65`}</button>
            ) : (
              <button type="button" onClick={() => setSelectedPlan('yearly')} className="mt-auto w-full py-2.5 rounded-xl border border-[#14B8A6] text-[#14B8A6] font-semibold text-sm hover:bg-[#14B8A6] hover:text-black">Select Yearly</button>
            )}
          </div>
        </div>

        {/* Loyalty, FAQ, CTA etc (Kept the same) */}
        {user?.loyaltyPoints > 0 && (
          <div className="bg-neutral-100 dark:bg-[#0D1615] border border-neutral-200 dark:border-[#1D2926] rounded-2xl p-6 text-center mb-16">
            <p className="text-neutral-500 dark:text-[#8AA39B] text-sm mb-3">Redeem your points for a discount! (1000 points = $100)</p>
            <input type="number" min="0" max={user.loyaltyPoints} value={redeemPoints} onChange={(e) => setRedeemPoints(e.target.value)} className="w-32 px-4 py-2 rounded-lg bg-white dark:bg-[#121C1A] text-neutral-900 dark:text-white border border-neutral-300 dark:border-[#1D2926] text-center outline-none" placeholder="0" />
          </div>
        )}
        {error && <div className="text-center text-red-500 mb-8">{error}</div>}

        <section className="mb-20">
          <h2 className="text-2xl font-display font-semibold mb-8 text-center">Every feature, side by side</h2>
          <div className="overflow-x-auto border border-neutral-200 dark:border-[#1D2926] rounded-2xl">
            <table className="w-full text-sm">
              <thead><tr className="bg-neutral-100 dark:bg-[#0D1615] border-b border-neutral-200 dark:border-[#1D2926] text-neutral-500 dark:text-[#8AA39B] uppercase font-mono text-xs"><th className="text-left py-4 px-6">Feature</th><th className="py-4 px-6">Free</th><th className="py-4 px-6">Premium</th></tr></thead>
              <tbody>
                <tr className="border-b border-neutral-200 dark:border-[#1D2926]"><td className="py-3 px-6">Brush, pencil, airbrush, eraser</td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td></tr>
                <tr className="border-b border-neutral-200 dark:border-[#1D2926]"><td className="py-3 px-6">Layers per file</td><td className="text-center">15</td><td className="text-center">Unlimited</td></tr>
                <tr className="border-b border-neutral-200 dark:border-[#1D2926]"><td className="py-3 px-6">AI keyframe in-betweening</td><td className="text-center text-neutral-500 dark:text-[#8AA39B]">—</td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td></tr>
                <tr className="border-b border-neutral-200 dark:border-[#1D2926]"><td className="py-3 px-6">24/7 AI chatbot assistant</td><td className="text-center text-neutral-500 dark:text-[#8AA39B]">—</td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td></tr>
                <tr className="border-b border-neutral-200 dark:border-[#1D2926]"><td className="py-3 px-6">Google Drive connectivity</td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td><td className="text-center"><span className="inline-flex justify-center text-[#14B8A6]"><CheckIcon /></span></td></tr>
                <tr><td className="py-3 px-6">File storage</td><td className="text-center">Standard</td><td className="text-center">Unlimited</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-display font-semibold mb-8 text-center">Billing, in plain language</h2>
          {[{q:"How does billing work?",a:"Premium is billed at the start of each cycle — $7 monthly or $65 yearly."},{q:"Can I cancel any time?",a:"Yes — cancel from your dashboard whenever you like."},{q:"How do loyalty points work?",a:"Every successful renewal earns points. 1,000 points = $100 off."}].map((faq,i)=>(
            <div key={i} className="border-b border-neutral-200 dark:border-[#1D2926] py-4">
              <button type="button" onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="w-full flex justify-between items-center text-left font-semibold">{faq.q}<svg className={`w-4 h-4 text-neutral-500 dark:text-[#8AA39B] transition-transform ${openFaq===i?'rotate-45':''}`} fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg></button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq===i?'max-h-40 mt-3':'max-h-0'}`}><p className="text-neutral-500 dark:text-[#8AA39B] text-sm">{faq.a}</p></div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}