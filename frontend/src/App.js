import React, { useState, useEffect } from 'react';
import API from './api';
import './App.css';

function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Dashboard state
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'settings'

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsProfilePic, setSettingsProfilePic] = useState('');

  // If token exists, fetch dashboard data
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const profileRes = await API.get('/dashboard/profile');
      const worksRes = await API.get('/dashboard/recent-works');
      setUser(profileRes.data);
      setBio(profileRes.data.bio || '');
      setSettingsName(profileRes.data.name || '');
      setSettingsBio(profileRes.data.bio || '');
      setSettingsProfilePic(profileRes.data.profilePicture || '');
      setWorks(worksRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      localStorage.removeItem('token');
      setToken(null);
    }
    setLoading(false);
  };

  // Handle Login / Register
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, handle: email.split('@')[0] };
      const res = await API.post(endpoint, payload);
      setToken(res.data.token);
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    }
  };

  // Update Bio (from Home tab)
  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/dashboard/profile', {
        name: user.name,
        bio
      });
      setUser(res.data);
      setSettingsBio(res.data.bio);
      alert('Bio updated!');
    } catch (error) {
      alert('Failed to update bio');
    }
  };

  // Update Settings (Full profile update)
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/dashboard/profile', {
        name: settingsName,
        bio: settingsBio,
        profilePicture: settingsProfilePic
      });
      setUser(res.data);
      setBio(res.data.bio);
      alert('Profile updated successfully!');
      setActiveTab('home');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  // Upload Artwork
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select a file');

    const formData = new FormData();
    formData.append('image', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('tags', 'illustration,art');

    setUploading(true);
    try {
      const res = await API.post('/dashboard/upload', formData);
      setWorks([res.data, ...works]);
      setUploadFile(null);
      setUploadTitle('');
      alert('Uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.error);
    }
    setUploading(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // --- AUTH SCREEN ---
  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p>
          <span
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create an account' : 'Already have an account? Login'}
          </span>
        </p>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🎨</span>
          <span className="brand-name">Launch</span>
        </div>

        <nav className="sidebar-nav">
          {/* Workspace Section */}
          <div className="nav-section">
            <span className="nav-section-label">Workspace</span>
            <button
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="nav-icon">🏠</span>
              Home
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
          </div>

          {/* Subscription Section */}
          <div className="nav-section">
            <span className="nav-section-label">Subscription</span>
            <button className="nav-item" onClick={() => alert('Manage Subscription - Coming Soon!')}>
              <span className="nav-icon">💳</span>
              Manage Subscription
            </button>
          </div>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Profile Header */}
            <div className="profile-section">
              <img
                src={user?.profilePicture || 'https://i.pravatar.cc/150?img=1'}
                alt="Avatar"
                className="avatar"
              />
              <div className="profile-details">
                <h1>
                  {user?.name} <span className="handle">@{user?.handle}</span>
                </h1>
                <p className="bio">{user?.bio}</p>

                {/* Settings: Update Bio */}
                <form onSubmit={handleUpdateBio} className="bio-form">
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Update your bio"
                  />
                  <button type="submit">Update Bio</button>
                </form>
              </div>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
              <h3>Upload New Artwork</h3>
              <form onSubmit={handleUpload} className="upload-form">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  accept="image/*"
                  required
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                />
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>

            {/* Recent Works Grid */}
            <div className="works-section">
              <h2>Recent Works:</h2>
              <div className="grid">
                {works.length === 0 && <p className="no-works">No artworks yet. Upload one!</p>}
                {works.map((art) => (
                  <div key={art._id} className="grid-item">
                    <img src={art.thumbnailUrl} alt={art.title} />
                    <p className="art-title">{art.title}</p>
                    <div className="tags">
                      {art.tags.map((tag, i) => (
                        <span key={i} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <h2>Account Settings</h2>
            <p className="settings-subtitle">Update your profile information</p>

            <form onSubmit={handleUpdateSettings} className="settings-form">
              <div className="form-group">
                <label>Profile Picture URL</label>
                <input
                  type="text"
                  value={settingsProfilePic}
                  onChange={(e) => setSettingsProfilePic(e.target.value)}
                  placeholder="Enter image URL or use Gravatar"
                />
                <small>Enter a direct image URL for your profile picture</small>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={settingsBio}
                  onChange={(e) => setSettingsBio(e.target.value)}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group">
                <label>Handle (Username)</label>
                <input
                  type="text"
                  value={user?.handle || ''}
                  disabled
                  className="disabled-input"
                />
                <small>Username cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="settings-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setActiveTab('home')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;