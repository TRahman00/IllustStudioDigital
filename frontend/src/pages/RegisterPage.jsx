import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    role: 'artist'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend URL
      await axios.post('http://localhost:1600/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#00e599] flex items-center justify-center font-bold text-black text-sm">
            IS
          </div>
          <span className="font-semibold text-lg text-white tracking-wide">Illust Studio</span>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-6">
          ARTIST REGISTRATION
        </h2>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center bg-red-900/20 border border-red-500/30 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00e599] transition"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Gmail"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00e599] transition"
            />
          </div>

          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00e599] transition"
            />
          </div>

          <div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00e599] transition"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00e599] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00e599] text-black font-semibold rounded-lg hover:bg-[#00c784] transition duration-200 mt-2"
          >
            {loading ? 'Registering...' : 'REGISTER AS ARTIST'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00e599] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}