import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import client from '../api/client.js';
import SettingsModal from '../components/SettingsModal.jsx';
import AiChatbot from '../components/AiChatbot.jsx';
import '../pages/DashboardPage.css'; // CSS Import

export default function DashboardPage() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [recentWorks, setRecentWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [driveMessage, setDriveMessage] = useState('');
  const [aiChatOpen, setAiChatOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // 1. Synchronize latest User Profile Data
    const syncUserData = async () => {
      try {
        const res = await client.get('/auth/me');
        const fetchedUser = res.data.user || res.data;
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Priority to backend plan data
        const mergedUser = {
          ...fetchedUser,
          plan: fetchedUser.plan || localUser.plan || 'free',
          points: fetchedUser.loyaltyPoints ?? fetchedUser.points ?? localUser.points ?? 0
        };

        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      } catch (err) {
        console.error('Failed to sync user data:', err);
      }
    };

    syncUserData();

    // 2. Google Drive Sync Check
    if (params.get('drive') === 'connected') {
      setDriveMessage('✅ Connected to Google Drive!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('drive') === 'error') {
      setDriveMessage('❌ Failed to connect Google Drive.');
    }

    // 3. Subscription Payment Sync Check
    if (params.get('subscription') === 'success' || params.get('upgraded') === '1') {
      syncUserData().then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    // 4. Fetch Recent Works
    const fetchWorks = async () => {
      try {
        const res = await client.get('/dashboard/recent-works');
        setRecentWorks(res.data.works || []);
      } catch (err) {
        console.error('Failed to fetch recent works', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, [setUser]);

  const handleConnectDrive = () => {
    const token = localStorage.getItem('illust_token') || localStorage.getItem('token');
    if (!token) return alert('Please log in first.');
    window.location.href = `http://localhost:5000/api/drive/auth?token=${token}`;
  };

  const openProject = (projectId) => navigate(`/studio/${projectId}`);
  const launchNew = () => navigate('/studio/new');
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isPremiumUser = user?.plan?.toLowerCase() === 'premium';

  return (
    <div className="dashboard-page" data-theme={theme}>
      {/* HEADER / NAV */}
      <header>
        <nav>
          <div className="logo">
            <svg viewBox="0 0 30 30" fill="none" className="logo-mark">
              <circle cx="15" cy="15" r="14" fill="var(--teal-600)" />
              <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="20" cy="9" r="2.4" fill="white" />
            </svg>
            Illust Studio
          </div>

          <div className="nav-links">
            <Link to="/dashboard" className="active">Dashboard</Link>
            <Link to="/Pricing">Pricing</Link>
          </div>

          <div className="nav-right">
            {/* Theme Toggle Button */}
            <button className="toggle" onClick={toggle} title="Toggle theme">
              <div className="knob">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>

            {/* Profile Avatar */}
            <div className="avatar-chip">
              <div className="dot">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <span>{user?.name || 'User'}</span>
            </div>

            <button className="btn" onClick={() => setSettingsOpen(true)}>⚙️ Settings</button>
            <button className="btn btn-danger" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>
      </header>

      {/* PAGE BODY */}
      <div className="wrap">
        {/* PAGE HEAD */}
        <div className="page-head">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>Welcome back, {user?.name || 'Creator'}</h1>
            <div className="stat-strip">
              <div className="stat-chip">
                Points: <b>{user?.points ?? user?.loyaltyPoints ?? 0} pts</b>
              </div>
              <div className="stat-chip">
                Plan: <span className="plan-pill">{user?.plan || 'free'}</span>
              </div>
            </div>
          </div>

          <div className="new-actions">
            {/* AI Assistant Button */}
            <button 
              className={`btn ${isPremiumUser ? 'btn-primary' : ''}`}
              onClick={() => {
                if (isPremiumUser) {
                  setAiChatOpen(!aiChatOpen);
                } else {
                  alert('Upgrade to Premium to access AI Assistant!');
                  navigate('/Pricing');
                }
              }}
            >
              💬 AI Assistant {!isPremiumUser && '(PRO)'}
            </button>

            <button className="btn" onClick={handleConnectDrive}>
              {user?.googleConnected ? '☁️ Drive Connected' : '☁️ Connect Drive'}
            </button>

            <button className="btn btn-primary" onClick={launchNew}>
              🚀 Launch New
            </button>
          </div>
        </div>

        {driveMessage && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>{driveMessage}</p>}

        {/* PROJECTS GRID */}
        <div className="section-label">Recent Projects</div>
        
        <div className="project-grid">
          {/* Create New Project Card */}
          <button className="new-card" onClick={launchNew}>
            <div className="plus">+</div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Create Blank Canvas</span>
          </button>

          {/* Project Cards List */}
          {!loading && recentWorks.map((work) => (
            <div key={work._id} className="card" onClick={() => openProject(work._id)}>
              <div className="thumb">
                {work.thumbnail ? (
                  <img src={work.thumbnail} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Preview</span>
                )}
                <span className="type-tag">Canvas</span>
              </div>
              <div className="card-body">
                <div className="name">{work.title || 'Untitled Project'}</div>
                <div className="meta">Updated recently</div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); openProject(work._id); }}>
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chatbot Popup Window */}
      {aiChatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow)',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--teal-600)' }}>
              💬 AI Assistant
            </span>
            <button onClick={() => setAiChatOpen(false)} style={{ fontSize: '14px', color: 'var(--text-muted)' }}>✕</button>
          </div>
          <div style={{ padding: '12px' }}>
            <AiChatbot />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}