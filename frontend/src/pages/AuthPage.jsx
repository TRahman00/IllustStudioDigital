import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPage.css';

export default function AuthPage({ initialMode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('light');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  
  // Form states
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', phone: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const knobIcon = document.getElementById('knobIcon');
    if (knobIcon) {
      knobIcon.innerHTML = theme === 'dark'
        ? '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" stroke="none"/>'
        : '<circle cx="12" cy="12" r="4.6"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke-linecap="round"/>';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const updateForm = (field, value) => setForm({ ...form, [field]: value });

  const handleLogin = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login({ email: form.email, password: form.password }); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setBusy(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await register({ name: form.name, email: form.email, password: form.password }); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page" data-theme={theme}>
      <div className="topbar">
        <Link to="/" className="logo">
          <svg viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="14" fill="var(--teal-600)"/><path d="M9 20C9 14 12 9 20 9" stroke="var(--on-accent)" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="9" r="2.4" fill="var(--on-accent)"/></svg>
          Illust Studio
        </Link>
        <button className="toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span className="knob" id="knob"><svg id="knobIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="4.6"/></svg></span>
        </button>
      </div>

      <div className="center">
        <div className="form-wrap">
          {/* Sign In Panel */}
          <div className={`panel ${mode === 'login' ? 'active' : ''}`}>
            <span className="eyebrow">Welcome back</span>
            <h2 className="form-title">Sign in to Illust Studio</h2>
            <p className="form-sub">Pick up right where you left off.</p>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="••••••••••" value={form.password} onChange={(e) => updateForm('password', e.target.value)} required />
              </div>
              <div className="row-between">
                <label className="checkbox-row"><input type="checkbox" defaultChecked /> Remember me</label>
                <a href="#">Forgot password?</a>
              </div>
              {error && <p style={{color: 'var(--danger)', fontSize: '13px', marginBottom: '12px'}}>{error}</p>}
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
            </form>
            <div className="divider">or continue with</div>
            {/* Removed GitHub button, made Google full width */}
            <button className="sso-btn">
              <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"/></svg> Google
            </button>
            <p className="switch-line">New to Illust Studio? <button type="button" onClick={() => { setMode('signup'); setStep(1); }}>Create a free account</button></p>
          </div>

          {/* Sign Up Panel */}
          <div className={`panel ${mode === 'signup' ? 'active' : ''}`}>
            <span className="eyebrow">Get started</span>
            <h2 className="form-title">Create your account</h2>
            <p className="form-sub">Free forever — upgrade only if you want more room.</p>
            
            <div className="steps-track">
              <div className={`step-seg ${step >= 1 ? 'done' : ''}`}><i></i></div>
              <div className={`step-seg ${step >= 2 ? 'done' : ''}`}><i></i></div>
            </div>
            <div className="step-label">Step {step} of 2 — {step === 1 ? 'Account' : 'Profile'}</div>

            {step === 1 && (
              <div className="step-pane active">
                <div className="field">
                  <label>Full name</label>
                  <input type="text" placeholder="Maya Reyes" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
                  <p className="field-hint">You'll verify this email in the next step.</p>
                </div>
                <div className="step-actions">
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Continue</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-pane active">
                <div className="field">
                  <label>Location</label>
                  <input type="text" placeholder="City, Country" value={form.location} onChange={(e) => updateForm('location', e.target.value)} />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                  <p className="field-hint">Used only for account recovery — never shared.</p>
                </div>
                <div className="field">
                  <label className="checkbox-row"><input type="checkbox" defaultChecked style={{marginRight:'4px'}} /> I agree to the Terms & Privacy Policy</label>
                </div>
                {error && <p style={{color: 'var(--danger)', fontSize: '13px', marginBottom: '12px'}}>{error}</p>}
                <div className="step-actions">
                  <button className="btn" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" onClick={handleRegister} disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
                </div>
              </div>
            )}

            <p className="switch-line">Already have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button></p>
          </div>

          <div className="mini-stats">
            <div className="mini-stat"><b>15+</b><span>free layers</span></div>
            <div className="mini-stat"><b>&lt;1s</b><span>autosave</span></div>
            <div className="mini-stat"><b>$7/mo</b><span>premium</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}