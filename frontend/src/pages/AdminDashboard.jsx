import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Footer from '../components/Footer.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const [section, setSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await client.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    await client.put(`/admin/users/${id}/toggle-status`);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their projects?')) return;
    await client.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'support', label: 'Support', icon: '💬' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] dark:bg-[#070C0B] text-neutral-900 dark:text-[#EDF3F0] font-body flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0D1615] border-r border-neutral-200 dark:border-[#1D2926] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-neutral-200 dark:border-[#1D2926] flex items-center gap-2 font-display font-semibold text-lg text-neutral-900 dark:text-white">
          <svg className="w-6 h-6" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="14" fill="#14B8A6"/><path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="20" cy="9" r="2.4" fill="white"/></svg>
          Illust Studio <span className="text-[10px] font-mono bg-neutral-100 dark:bg-[#1D2926] px-2 py-1 rounded">ADMIN</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button 
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition ${section === item.id ? 'bg-teal-600 text-white' : 'text-neutral-500 dark:text-[#8AA39B] hover:bg-neutral-100 dark:hover:bg-[#1A2A27]'}`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-[#1D2926] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0] || 'A'}</div>
            <div className="text-xs">
              <p className="font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
              <p className="text-neutral-500 dark:text-[#8AA39B]">Super Admin</p>
            </div>
          </div>
          <button type="button" onClick={toggle} className="relative w-10 h-6 rounded-full bg-neutral-100 dark:bg-[#121C1A] border border-neutral-300 dark:border-[#1D2926]">
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#14B8A6] transition-all ${theme === 'dark' ? 'translate-x-4' : ''}`}></span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-neutral-200 dark:border-[#1D2926] bg-white dark:bg-[#0D1615] flex items-center px-6 gap-4">
          <p className="text-sm text-neutral-500 dark:text-[#8AA39B]">Admin / <span className="text-neutral-900 dark:text-white capitalize">{section}</span></p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Back to Artist Dashboard Button */}
          <div className="mb-6">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#1A2A27] border border-neutral-300 dark:border-[#1D2926] text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-[#1D2926] transition"
            >
              ← Back to Artist Dashboard
            </Link>
          </div>

          {/* Dashboard Section */}
          {section === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-display font-semibold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Artists', value: '4,290', icon: '👥', trend: '+3.2%' },
                  { label: 'Premium Subscribers', value: '1,284', icon: '⭐', trend: '+1.8%' },
                  { label: 'MRR', value: '$8,988', icon: '💰', trend: '+2.1%' },
                  { label: 'Pending Reviews', value: '23', icon: '⏳', trend: '-5' },
                ].map((m) => (
                  <div key={m.label} className="bg-white dark:bg-[#0D1615] border border-neutral-200 dark:border-[#1D2926] rounded-xl p-5">
                    <p className="text-xs font-mono uppercase text-neutral-500 dark:text-[#8AA39B]">{m.label}</p>
                    <p className="text-3xl font-bold mt-2">{m.value}</p>
                    <p className="text-xs text-teal-600 mt-2">{m.trend} vs last month</p>
                    <div className="text-2xl mt-2">{m.icon}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-[#0D1615] border border-neutral-200 dark:border-[#1D2926] rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-neutral-200 dark:border-[#1D2926] pb-3"><span>✅ User verified</span><span className="text-xs text-neutral-500 dark:text-[#8AA39B]">5m ago</span></div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-[#1D2926] pb-3"><span>💎 Premium Subscription</span><span className="text-xs text-neutral-500 dark:text-[#8AA39B]">12m ago</span></div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-[#1D2926] pb-3"><span>⚠️ Bug report</span><span className="text-xs text-neutral-500 dark:text-[#8AA39B]">1h ago</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          {section === 'users' && (
            <div>
              <h2 className="text-2xl font-display font-semibold mb-4">User Management</h2>
              <div className="bg-white dark:bg-[#0D1615] border border-neutral-200 dark:border-[#1D2926] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-[#0D1615] text-neutral-500 dark:text-[#8AA39B] uppercase text-xs">
                    <tr>
                      <th className="text-left py-4 px-6">User</th>
                      <th className="py-4 px-6">Plan</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="4" className="text-center py-6">Loading users...</td></tr> : users.map((u) => (
                      <tr key={u._id} className="border-b border-neutral-200 dark:border-[#1D2926]">
                        <td className="py-3 px-6">
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-[#8AA39B]">{u.email}</p>
                        </td>
                        <td className="py-3 px-6 capitalize text-teal-600">{u.plan}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                        </td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button type="button" onClick={() => handleToggle(u._id)} className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-[#1D2926] hover:bg-neutral-100 dark:hover:bg-[#1A2A27]">
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button type="button" onClick={() => handleDelete(u._id)} className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Static Mock Sections for Subscriptions, Rewards, Support, System */}
          {section === 'subscriptions' && <h2 className="text-2xl font-display font-semibold mb-4">Subscriptions</h2>}
          {section === 'rewards' && <h2 className="text-2xl font-display font-semibold mb-4">Rewards</h2>}
          {section === 'support' && <h2 className="text-2xl font-display font-semibold mb-4">Support</h2>}
          {section === 'system' && <h2 className="text-2xl font-display font-semibold mb-4">System</h2>}
        </div>
      </main>

      <Footer />
    </div>
  );
}