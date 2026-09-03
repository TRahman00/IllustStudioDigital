import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('illust_token');
    if (!token) { setLoading(false); return; }
    client.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('illust_token'))
      .finally(() => setLoading(false));
  }, []);

  async function register(payload) {
    const res = await client.post('/auth/register', payload);
    localStorage.setItem('illust_token', res.data.token);
    setUser(res.data.user);
  }
  async function login(payload) {
    const res = await client.post('/auth/login', payload);
    localStorage.setItem('illust_token', res.data.token);
    setUser(res.data.user);
  }
  function logout() {
    localStorage.removeItem('illust_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { return useContext(AuthContext); }