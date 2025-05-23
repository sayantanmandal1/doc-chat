import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything based on the documents.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const id = Math.random().toString(36).substr(2, 9);
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      const response = await fetch(`https://doc-chat-ea9c.onrender.com/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || 'Sorry, no answer.';

      // Simulate typing delay
      setTimeout(() => {
        const botMessage = { sender: 'bot', text: answer };
        setMessages((msgs) => [...msgs, botMessage]);
        setTyping(false);
      }, 1200); // delay to simulate typing

    } catch (error) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Error connecting to backend.' }]);
      console.error('Error:', error);
      setTyping(false);
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
      maxWidth: '600px',
      margin: 'auto',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Segoe UI, sans-serif',
      backgroundColor: '#f4f7fa',
      border: '1px solid #ddd',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: '#2f80ed',
        color: '#fff',
        fontSize: '1.2rem',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: '0.5px'
      }}>
        📄 Document Chatbot
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f9fbfd',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#2f80ed' : '#e6eef5',
              color: msg.sender === 'user' ? '#fff' : '#333',
              padding: '0.75rem 1rem',
              borderRadius: '20px',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
              borderBottomLeftRadius: msg.sender === 'user' ? '20px' : '4px',
              whiteSpace: 'pre-wrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: '#e6eef5',
            color: '#333',
            padding: '0.75rem 1rem',
            borderRadius: '20px',
            maxWidth: '60%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            fontStyle: 'italic',
            opacity: 0.8
          }}>
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
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
          placeholder="Ask a question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '30px',
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border 0.3s',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: '0.75rem',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            backgroundColor: '#2f80ed',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'background 0.3s'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
