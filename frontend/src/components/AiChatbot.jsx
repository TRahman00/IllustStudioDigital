import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AiChatbot() {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Case-insensitive check to avoid string mismatch issues
  const isPremium = user?.plan?.toLowerCase() === 'premium';

  const handleSend = async () => {
    if (!input.trim()) return;
    
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
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
        <h3 className="font-bold text-lg text-teal-400">AI Chatbot</h3>
        <p className="text-sm mt-1">
          Premium subscribers get 24/7 access to a smart assistant for general platform and service questions. 
          Ask about specific tools, information, guides—plus suggestions on when to use which available tool.
        </p>
        
        <button 
          onClick={() => navigate('/Pricing')} 
          className="mt-3 btn btn-primary text-xs"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-80 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.map((m, i) => (
          <div key={i} className={`text-xs p-2 rounded ${m.sender === 'user' ? 'bg-teal-600 text-white ml-auto max-w-[80%]' : 'bg-neutral-800 text-neutral-200 mr-auto max-w-[80%]'}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-neutral-500">AI is thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI anything..." 
        />
        <button onClick={handleSend} className="btn btn-primary !py-1 text-xs">Send</button>
      </div>
    </div>
  );
}