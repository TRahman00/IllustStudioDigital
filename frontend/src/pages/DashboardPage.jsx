import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import client from '../api/client.js';
import SettingsModal from '../components/SettingsModal.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [recentWorks, setRecentWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await client.get('/dashboard/recent-works');
        setRecentWorks(res.data.works);
      } catch (err) {
        console.error('Failed to fetch recent works', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const openProject = (projectId) => navigate(`/studio/${projectId}`);
  const launchNew = () => navigate('/studio/new');
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FBFAF6] dark:bg-[#070C0B]">
      {/* Side Menu – tablet‑style buttons with text */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col p-4 flex-none">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 font-display font-semibold text-neutral-800 dark:text-white mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <svg viewBox="0 0 30 30" fill="none" className="w-7 h-7">
            <circle cx="15" cy="15" r="14" fill="#128077" />
            <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="20" cy="9" r="2.4" fill="white" />
          </svg>
          Illust Studio
        </div>

        {/* Main actions */}
        <div className="flex-1 flex flex-col gap-2">
          <button
            onClick={launchNew}
            className="w-full px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition text-left"
          >
            🚀 Launch new project
          </button>
          <button
            onClick={() => navigate('/Pricing')}
            className="w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition text-left"
          >
            💳 Pricing
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition text-left"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Bottom: theme toggle + sign out */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <button
            onClick={toggle}
            className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-teal-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition text-sm"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content – unchanged */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Profile Section */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-4xl font-semibold text-teal-700 dark:text-teal-300 flex-none">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <span className="text-sm text-neutral-500">@{user?.handle || 'user'}</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">{user?.bio || 'No bio yet'}</p>
            <div className="flex items-center gap-6 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                {user?.loyaltyPoints || 0} pts
              </span>
              <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                {user?.plan || 'free'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Works Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Works</h3>
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : recentWorks.length === 0 ? (
            <p className="text-neutral-500">No projects yet. Launch a new one!</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentWorks.map((work) => (
                <div
                  key={work._id}
                  onClick={() => openProject(work._id)}
                  className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition group"
                >
                  {work.thumbnail ? (
                    <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">No preview</div>
                  )}
                  <div className="p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-sm font-medium truncate">
                    {work.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}