import { useState, useEffect } from 'react';
import './AIFeatures.css';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { DrawTabIcon, PhotoTabIcon, AnimateTabIcon, SunIcon, MoonIcon } from '../components/icons/Icons.jsx';
import DrawStudio from './DrawStudio.jsx';
import PhotoStudio from './PhotoStudio.jsx';
import AnimateStudio from './AnimateStudio.jsx';

const TABS = [
  { id: 'draw', label: 'Draw', icon: DrawTabIcon, Component: DrawStudio },
  { id: 'photo', label: 'Photo', icon: PhotoTabIcon, Component: PhotoStudio },
  { id: 'animate', label: 'Animate', icon: AnimateTabIcon, Component: AnimateStudio },
];

export default function DigitalImagePlatform() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'draw'; 
  const [tab, setTab] = useState(initialTab);
  
  const { logout, user } = useAuth();
  const { theme, toggle } = useTheme();
  const Active = TABS.find((t) => t.id === tab).Component;

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // AI Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hey! I'm your Illust Studio assistant. Need help with tools, layers, or animation?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  async function handleChatSend() {
    if (!chatInput.trim() || chatLoading) return;
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await client.post('/ai/chat', { message: chatInput });
      setChatMessages([...newMessages, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'ai', text: "I'm only available to Premium subscribers. Please upgrade!" }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#FBFAF6] dark:bg-[#070C0B]">
      {/* Header ... unchanged ... */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-none">
        <nav className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">← Dashboard</button>
            <div className="flex items-center gap-2 font-display font-semibold">
              <svg viewBox="0 0 30 30" fill="none" className="w-7 h-7"><circle cx="15" cy="15" r="14" fill="#128077" /><path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" /><circle cx="20" cy="9" r="2.4" fill="white" /></svg>
              Illust Studio
            </div>
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-teal-400">{theme === 'dark' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}</button>
            <button onClick={logout} className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Sign out</button>
          </div>
        </nav>
      </header>

      <div className="flex-1 min-h-0">
        <Active projectId={projectId} />
      </div>

      {/* AI Chatbot Widget */}
      <div className="ai-chatbot-widget">
        <div className={`ai-chat-panel ${chatOpen ? 'open' : ''}`}>
          <div className="ai-chat-header">
            <div className="ai-avatar">🤖</div>
            <div className="ai-info">
              <span className="ai-name">Illust AI</span>
              <span className="ai-status">● Online — 24/7</span>
            </div>
            <span className="premium-badge">PREMIUM</span>
          </div>
          <div className="ai-chat-body">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                <div className="msg-bubble">{msg.text}</div>
                <span className="msg-time">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            ))}
            {chatLoading && <div className="msg ai"><div className="msg-bubble">Thinking...</div></div>}
          </div>
          <div className="quick-chips">
            {["Layer masks", "Animation tips", "Export formats", "Drive sync"].map((chip) => (
              <span className="qs-chip" key={chip} onClick={() => setChatInput(chip)}>{chip}</span>
            ))}
          </div>
          <div className="ai-chat-input">
            <input type="text" placeholder="Ask about tools..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} />
            <button className="send-btn" onClick={handleChatSend}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
        <button className="ai-chat-toggle" onClick={() => setChatOpen(!chatOpen)}>💬</button>
      </div>
    </div>
  );
}