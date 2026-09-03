import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { DrawTabIcon, PhotoTabIcon, AnimateTabIcon } from '../components/icons/Icons.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import DrawStudio from './DrawStudio.jsx';
import PhotoStudio from './PhotoStudio.jsx';
import AnimateStudio from './AnimateStudio.jsx';
import client from '../api/client.js'; // <--- This was missing!
import './AIFeatures.css';

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
  
  const { user } = useAuth(); // No need for logout; Header handles that now
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
    <div className="flex flex-col min-h-screen bg-[#FBFAF6] dark:bg-[#070C0B] text-neutral-900 dark:text-[#EDF3F0]">
      
      {/* Global Header (matches rest of app) */}
      <Header />

      {/* Internal Studio Toolbar (Tabs only) */}
      <div className="sticky top-[60px] z-40 bg-white dark:bg-[#0D1615] border-b border-neutral-200 dark:border-[#1D2926]">
        <nav className="max-w-[1080px] mx-auto px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm text-neutral-500 dark:text-[#8AA39B] hover:text-black dark:hover:text-white transition"
          >
            ← Dashboard
          </button>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#121C1A] rounded-xl p-1">
            {TABS.map((t) => (
              <button 
                type="button" 
                key={t.id} 
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  tab === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
          
          <div className="w-[80px]"></div>
        </nav>
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-hidden">
        <Active projectId={projectId} />
      </div>

      {/* Global Footer (matches rest of app) */}
      <Footer />

      {/* AI Chatbot Widget (Fixed, stays fixed to bottom right) */}
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