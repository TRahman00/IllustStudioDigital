import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); 
    setBusy(true);

    try { 
      
      const res = await login(form); 

      
      const token = res?.token || res?.data?.token || res?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
      }

      
      navigate('/dashboard'); 
    } catch (err) { 
      console.error('Login error details:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.'); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-display">IS</span>
          <span className="font-display font-semibold text-lg">Illust Studio</span>
        </div>
        
        <h1 className="text-xl font-semibold mb-6 text-center">Sign in</h1>
        
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input 
            className="input" 
            type="email" 
            placeholder="Email" 
            required 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
          <input 
            className="input" 
            type="password" 
            placeholder="Password" 
            required 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
          />
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <button disabled={busy} className="btn btn-primary">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-neutral-500 mt-4 text-center">
          No account yet? <Link to="/register" className="text-teal-600 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}