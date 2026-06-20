import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { generateChatResponse } from '../utils/engine';

export default function SupportiveChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi there! I'm your Aura companion. How is your studying going today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateChatResponse(input, newMsgs);
      setMessages([...newMsgs, { role: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <div className="glass-panel flex-column" style={{ height: '400px' }}>
      <h3 className="flex-center gap-2" style={{ justifyContent: 'flex-start', color: '#93c5fd', marginBottom: '1rem' }}>
        <MessageCircle size={20} /> Supportive Chat
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '1rem',
            borderBottomRightRadius: msg.role === 'user' ? '0' : '1rem',
            borderBottomLeftRadius: msg.role === 'ai' ? '0' : '1rem',
            maxWidth: '85%'
          }}>
            <p style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex-between gap-2 mt-4">
        <input 
          type="text" 
          className="input-field" 
          style={{ marginBottom: 0 }} 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
