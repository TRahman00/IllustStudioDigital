import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import './LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    const cards = document.querySelectorAll('.landing-page .feature-card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in'), i * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(c => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Header />

      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Digital illustration · animation · photo editing</span>
              <h1>Draw, animate, and edit — <em>without leaving the canvas.</em></h1>
              <p className="lead">Illust Studio brings brushes, layers, frame-by-frame animation, and photo tools into one workspace. Start free, sync to Drive, and upgrade whenever the work does.</p>
              <div className="hero-ctas">
                <Link to="/login" className="btn btn-primary btn-lg">Start drawing free</Link>
                <a className="btn btn-ghost btn-lg" href="#pricing">See Premium</a>
              </div>
              <div className="stat-row">
                <div className="stat"><b>15+</b><span>free layers per file</span></div>
                <div className="stat"><b>&lt;1s</b><span>autosave to cloud</span></div>
                <div className="stat"><b>$7/mo</b><span>Premium, billed monthly</span></div>
              </div>
            </div>

            <div className="canvas-scene">
              <div className="layer-stack">
                <div className="layer-panel l1">
                  <svg viewBox="0 0 300 300" fill="none">
                    <rect width="300" height="300" fill="var(--bg-elevated)"/>
                    <circle cx="215" cy="70" r="30" stroke="var(--text-muted)" strokeWidth="1.6" strokeDasharray="4 5"/>
                    <path d="M20 230 L110 120 L165 190 L210 140 L280 230 Z" stroke="var(--text-muted)" strokeWidth="1.6" strokeDasharray="4 5" fill="none"/>
                    <line x1="20" y1="240" x2="280" y2="240" stroke="var(--text-muted)" strokeWidth="1.4" strokeDasharray="2 6"/>
                  </svg>
                </div>
                <div className="layer-panel l2">
                  <svg viewBox="0 0 300 300" fill="none">
                    <rect width="300" height="300" fill="var(--bg-elevated)"/>
                    <circle cx="215" cy="70" r="30" fill="var(--sun-shape)"/>
                    <path d="M20 240 L110 120 L165 190 L210 140 L280 240 Z" fill="var(--teal-500)" opacity=".85"/>
                    <path d="M20 240 L95 145 L140 195 L280 240 Z" fill="var(--teal-700)" opacity=".6"/>
                    <rect x="0" y="240" width="300" height="60" fill="var(--teal-900)" opacity=".5"/>
                  </svg>
                </div>
                <div className="layer-panel l3">
                  <svg viewBox="0 0 300 300" fill="none">
                    <rect width="300" height="300" fill="none"/>
                    <circle cx="215" cy="70" r="30" stroke="var(--text)" strokeWidth="2.4"/>
                    <path d="M20 240 L110 120 L165 190 L210 140 L280 240 Z" stroke="var(--text)" strokeWidth="2.6" strokeLinejoin="round" fill="none"/>
                    <path d="M190 100 L200 88 M205 60 L215 50 M232 62 L240 52" stroke="var(--sun-shape-2)" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M112 122 L120 132" stroke="var(--teal-400)" strokeWidth="2.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="layers-panel-ui">
                  <div className="lp-title">Layers</div>
                  <div className="lp-row"><span className="lp-eye">👁</span><span className="lp-dot" style={{background: 'var(--teal-400)'}}></span><span>Highlights</span></div>
                  <div className="lp-row"><span className="lp-eye">👁</span><span className="lp-dot" style={{background: 'var(--text)'}}></span><span>Linework</span></div>
                  <div className="lp-row"><span className="lp-eye">👁</span><span className="lp-dot" style={{background: 'var(--teal-500)'}}></span><span>Color fill</span></div>
                  <div className="lp-row"><span className="lp-eye">👁</span><span className="lp-dot" style={{background: 'var(--text-muted)'}}></span><span>Sketch</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="made-with">
          <div className="wrap">
            <p>Default tools, free for every artist</p>
            <div className="toolchip-row">
              <span className="toolchip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20l4-1 10-10a2 2 0 0 0-3-3L5 16l-1 4z"/></svg> Brush</span>
              <span className="toolchip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l4-1 12-12-3-3L4 17z"/></svg> Pencil</span>
              <span className="toolchip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg> Airbrush</span>
              <span className="toolchip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H8l-5-5 9-9 8 8-6 6"/></svg> Eraser</span>
              <span className="toolchip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> Color wheel</span>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Toolkit</span>
              <h2>Everything artists need, in one canvas</h2>
              <p>Every free account gets the full drawing kit. Premium raises the ceiling on the things serious projects run into: layers, storage, and animation length.</p>
            </div>
            <div className="feature-grid" id="featureGrid">
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20l4-1 10-10a2 2 0 0 0-3-3L5 16l-1 4z"/></svg></div><h3>Paint & draw</h3><p>Brush, pencil, airbrush, and eraser tools with full RGB color picking, applied straight to your stroke.</p><span className="tag">Free</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="12" height="12" rx="1"/><rect x="8" y="8" width="12" height="12" rx="1"/></svg></div><h3>Layers that behave</h3><p>Stack up to 15 layers free — with masks, blend modes, clipping, and reordering. Premium removes the cap.</p><span className="tag">15 free · Unlimited on Premium</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 9-9 9-9-9z"/></svg></div><h3>Shapes & transforms</h3><p>Drop in ready-made polygons, then select, rotate, skew, or scale any part of your artwork by pixel.</p><span className="tag">Free</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg></div><h3>Frame-by-frame animation</h3><p>Build animations with a set frame rate and duration on the free tier — Premium extends both limits.</p><span className="tag">Free · Extended on Premium</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg></div><h3>AI in-betweening</h3><p>Give it two keyframes and let it generate the frames between them — no manual tweening required.</p><span className="tag">Premium</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-9 9"/></svg></div><h3>Edit photos inline</h3><p>Pull in images from your device or Drive and adjust brightness, contrast, and crop without switching apps.</p><span className="tag">Free</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a5 5 0 0 0-5 5c-2.5.3-4 2-4 4.5A4.5 4.5 0 0 0 7.5 17H18a4 4 0 0 0 .5-8 5 5 0 0 0-6.5-6z"/></svg></div><h3>Google Drive sync</h3><p>Connect your Google account to open and save files directly between Illust Studio and your Drive.</p><span className="tag">Free</span></div>
              <div className="feature-card"><div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg></div><h3>Keyboard-first workflow</h3><p>Undo, redo, and switch tools without leaving the canvas — every shortcut mapped and remappable.</p><span className="tag">Free</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Plans</span>
              <h2>Free to start. Premium when you need the room.</h2>
              <p>Every account begins on Free. Upgrade any time — billing starts the following cycle, with a receipt emailed instantly.</p>
            </div>
            <div className="pricing-grid">
              <div className="plan">
                <span className="plan-badge">Free</span>
                <h3>Get drawing</h3>
                <div className="price"><b>$0</b><span>/ forever</span></div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Full brush, pencil, airbrush & eraser set</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Up to 15 layers per file</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Standard animation length & frame rate</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Cloud save + local export</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Google Drive connectivity</li>
                </ul>
                <Link to="/register" className="btn btn-ghost" style={{border:'1px solid var(--border)'}}>Create free account</Link>
              </div>
              <div className="plan highlight">
                <span className="plan-badge">Premium</span>
                <h3>Go further</h3>
                <div className="price"><b>$7</b><span>/ month · or $65 / year</span></div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Unlimited layers, storage & file generation</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Extended animation time & frame rate</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> AI keyframe in-betweening</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> 24/7 AI assistant for tools & guidance</li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg> Loyalty points on every renewal</li>
                </ul>
                <Link to="/pricing" className="btn" style={{background:'#fff',color:'var(--teal-900)'}}>Upgrade to Premium</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="rewards">
          <div className="wrap rewards">
            <div>
              <span className="eyebrow">Loyalty</span>
              <h2 style={{fontSize:'clamp(24px,3vw,34px)',fontWeight:'600',marginTop:'14px'}}>Renewing pays you back.</h2>
              <p style={{color:'var(--text-muted)',marginTop:'14px',fontSize:'15px',maxWidth:'44ch'}}>Every Premium renewal earns points at a fixed rate. Redeem them straight against your next bill — no separate rewards app to check.</p>
            </div>
            <div className="rewards-visual">
              <div className="points-row"><span>This cycle</span><b>640 pts</b></div>
              <div className="points-bar"><i></i></div>
              <div className="points-row"><span>1,000 pts</span><span>= $100 off renewal</span></div>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap">
            <span className="eyebrow" style={{justifyContent:'center'}}>Start today</span>
            <h2>Your next illustration is one canvas away.</h2>
            <div className="hero-ctas">
              <Link to="/login" className="btn btn-primary btn-lg">Start drawing free</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}