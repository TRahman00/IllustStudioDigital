import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import client from '../api/client.js';
import SettingsModal from '../components/SettingsModal.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import './DashboardPage.css';

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await client.delete(`/projects/${id}`);
      setRecentWorks((prev) => prev.filter((work) => work._id !== id));
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const openProject = (projectId) => navigate(`/studio/${projectId}`);
  const launchNewDraw = () => navigate('/studio?tab=draw');
  const launchNewPhoto = () => navigate('/studio?tab=photo');
  const launchNewAnimate = () => navigate('/studio?tab=animate');

  const handleConnectDrive = () => {
    const token = localStorage.getItem('illust_token');
    if (!token) return alert('Please log in first.');
    window.location.href = `http://localhost:5000/api/drive/auth?token=${token}`;
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const getMeta = (work) => {
    const date = new Date(work.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${work.type === 'animation' ? 'Animation' : work.type === 'photo' ? 'Photo' : 'Illustration'} · edited ${date}`;
  };

  return (
    <div className="dashboard-page" data-theme={theme}>
      <Header />
      
      <main className="wrap">
        <div className="page-head">
          <div>
            <span className="eyebrow">Your workspace</span>
            <h1>Your projects</h1>
            <div className="stat-strip">
              <span className="plan-pill">{user?.plan?.toUpperCase()} PLAN</span>
              <span className="stat-chip"><b>{user?.loyaltyPoints || 0}</b>&nbsp;loyalty points</span>
              <span className="stat-chip"><b>{recentWorks.length}</b>&nbsp;saved files</span>
              <span className="stat-chip"><b>7 / 15</b>&nbsp;layers used on last file</span>
            </div>
          </div>
          
          <div className="new-actions">
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-100 dark:bg-[#1A2A27] border border-neutral-300 dark:border-[#1D2926] text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-[#1D2926] transition"
              >
                Admin Panel
              </Link>
            )}
            <button className="btn" onClick={launchNewPhoto}>Edit a photo</button>
            <button className="btn" onClick={launchNewAnimate}>New animation</button>
            <button className="btn" onClick={handleConnectDrive}>
              {user?.googleConnected ? '☁️ Drive Connected' : '☁️ Connect to Drive'}
            </button>
            <button className="btn btn-primary" onClick={launchNewDraw}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New illustration
            </button>
          </div>
        </div>

        <div className="section-label">Recent ({recentWorks.length})</div>
        
        <div className="project-grid">
          {loading ? (
            <p style={{gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0'}}>Loading projects...</p>
          ) : recentWorks.length === 0 ? (
            <p style={{gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0'}}>
              No projects yet. Launch a new one!
            </p>
          ) : (
            recentWorks.map((work) => (
              <div className="card" key={work._id}>
                <div className="thumb">
                  <span className="type-tag">
                    {work.type === 'animation' ? 'Animation' : work.type === 'photo' ? 'Photo' : 'Illustration'}
                  </span>
                  {work.thumbnail ? (
                    <img src={work.thumbnail} alt={work.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <svg viewBox="0 0 200 140" fill="none">
                      <circle cx="100" cy="70" r="45" fill="none" stroke="var(--teal-400)" strokeWidth="3" strokeDasharray="3 6"/>
                      <path d="M100 30 L112 62 L146 62 L119 82 L129 114 L100 94 L71 114 L81 82 L54 62 L88 62 Z" fill="var(--teal-600)" opacity=".8"/>
                    </svg>
                  )}
                </div>
                <div className="card-body">
                  <p className="name">{work.title}</p>
                  <p className="meta">{getMeta(work)}</p>
                  <div className="card-actions">
                    <button className="btn" onClick={() => openProject(work._id)}>Open</button>
                    <button className="btn btn-danger" onClick={(e) => handleDelete(e, work._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}

          <a className="new-card" onClick={launchNewDraw} style={{cursor: 'pointer'}}>
            <span className="plus">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </span>
            <span style={{fontSize:'13px',fontWeight:'600'}}>Start something new</span>
          </a>
        </div>
      </main>

      <Footer />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}