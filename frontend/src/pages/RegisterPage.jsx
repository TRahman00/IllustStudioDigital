import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { await register(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-display">IS</span>
          <span className="font-display font-semibold text-lg">Illust Studio</span>
        </div>
        <h1 className="text-xl font-semibold mb-6 text-center">Create your account</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password (min 8 characters)" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={busy} className="btn btn-primary">{busy ? 'Creating account…' : 'Create free account'}</button>
        </form>
        <p className="text-sm text-neutral-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-teal-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}