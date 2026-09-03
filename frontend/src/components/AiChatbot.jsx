import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AiChatbot() {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Case-insensitive check to avoid string mismatch issues
  const isPremium = user?.plan?.toLowerCase() === 'premium';

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await client.post('/ai/chat', { message: input });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { sender: 'ai', text: err.response?.data?.message || 'Something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="p-4 bg-neutral-900 text-neutral-300">
        <h3 className="font-bold text-base text-teal-400">AI Chatbot</h3>
        <p className="text-xs mt-2 leading-relaxed">
          Premium subscribers get 24/7 access to a smart assistant for general platform and service questions. 
          Ask about specific tools, guides, and smart workflows.
        </p>
        
        <button 
          onClick={() => navigate('/Pricing')} 
          className="mt-4 btn btn-primary text-xs w-full"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-80 bg-neutral-900 p-2">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
        {messages.length === 0 && (
          <div className="text-xs text-neutral-500 text-center mt-8">
            👋 Hello {user?.name || 'there'}! How can I assist your project today?
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`text-xs p-2.5 rounded-lg break-words ${
              m.sender === 'user' 
                ? 'bg-teal-600 text-white ml-auto max-w-[85%]' 
                : 'bg-neutral-800 text-neutral-200 mr-auto max-w-[85%]'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-teal-400 animate-pulse">AI is thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 border-t border-neutral-800 pt-2">
        <input 
          type="text" 
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI anything..." 
        />
        <button 
          onClick={handleSend} 
          disabled={loading}
          className="btn btn-primary !py-1 text-xs px-3 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}