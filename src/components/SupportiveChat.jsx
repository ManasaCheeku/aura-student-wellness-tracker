import { useCallback, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { generateChatResponse, StorageHelper } from '../utils/engine';

const quickPrompts = [
  "I'm overwhelmed with syllabus",
  'I studied too long today',
  "I can't sleep before exams"
];

const getInitialGreeting = () => {
  const profile = StorageHelper.getProfile() || StorageHelper.getSavedProfile();
  const name = profile?.name ? `, ${profile.name.split(' ')[0]}` : '';

  return { role: 'ai', text: `Hi${name}! I'm your Aura companion. How is your studying going today?` };
};

export default function SupportiveChat() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = StorageHelper.getChatMessages();
    return savedMessages.length > 0 ? savedMessages : [getInitialGreeting()];
  });
  const [input, setInput] = useState('');

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsgs = [...messages, { role: 'user', text: trimmed }];
    const aiResponse = generateChatResponse(trimmed, newMsgs);
    const nextMessages = [...newMsgs, { role: 'ai', text: aiResponse }];
    setMessages(nextMessages);
    StorageHelper.saveChatMessages(nextMessages);
    setInput('');
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="glass-panel flex-column" style={{ height: '480px' }}>
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

      <div className="flex-center gap-2 mt-4" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.7rem', fontSize: '0.78rem' }}
            onClick={() => sendMessage(prompt)}
          >
            {prompt}
          </button>
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
