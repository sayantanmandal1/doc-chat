import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything based on the documents.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate and store session_id once per app load
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Simple random session ID generator (can be improved with UUID lib)
    const id = Math.random().toString(36).substr(2, 9);
    setSessionId(id);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.answer || 'Sorry, no answer.' };
      setMessages((msgs) => [...msgs, botMessage]);
    } catch (error) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Error connecting to backend.' }]);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: 'auto',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textAlign: 'center'
      }}>
        📄 Document Chatbot
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        padding: '1rem',
        gap: '0.75rem'
      }}>
        {[...messages].reverse().map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
          }}>
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#0084ff' : '#e4e6eb',
              color: msg.sender === 'user' ? 'white' : 'black',
              padding: '0.75rem 1rem',
              borderRadius: '18px',
              borderBottomRightRadius: msg.sender === 'user' ? 0 : '18px',
              borderBottomLeftRadius: msg.sender === 'user' ? '18px' : 0,
              whiteSpace: 'pre-wrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '0.75rem',
        display: 'flex',
        backgroundColor: '#fff',
        borderTop: '1px solid #ddd'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '20px',
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: '0.75rem',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            backgroundColor: '#0084ff',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );

}

export default App;
