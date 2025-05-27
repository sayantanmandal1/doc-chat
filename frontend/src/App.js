import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything based on the documents.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const id = Math.random().toString(36).substring(2);
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!window.VANTA || !window.p5) return;

    const effect = window.VANTA.TOPOLOGY({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      backgroundColor: 0x2222,
      color: 0x254225
    });

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input, timestamp: new Date() };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);
    setMessages((msgs) => [...msgs, { sender: 'bot', typing: true }]);

    try {
      const response = await fetch(`https://doc-chat-ea9c.onrender.com/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();
      setMessages((msgs) => [...msgs.filter((m) => !m.typing), {
        sender: 'bot',
        text: data.answer || 'No response received.',
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages((msgs) => [...msgs.filter((m) => !m.typing), {
        sender: 'bot',
        text: 'Error reaching the backend.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) sendMessage();
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div id="vanta-bg" style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: 600,
        width: '90%',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#ece5dd',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#075e54',
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          📄 Document Chatbot
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          gap: '0.5rem'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#fff',
                color: '#000',
                padding: '0.5rem 0.75rem',
                borderRadius: '7.5px',
                borderTopLeftRadius: msg.sender === 'user' ? '7.5px' : '0',
                borderTopRightRadius: msg.sender === 'user' ? '0' : '7.5px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {msg.typing ? (
                  <div style={{
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    height: 20
                  }}>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                ) : (
                  <div>{msg.text}</div>
                )}
              </div>
              {!msg.typing && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#555',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '0.75rem',
          display: 'flex',
          backgroundColor: '#f0f0f0',
          borderTop: '1px solid #ccc'
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
              backgroundColor: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>

        {/* Typing dots animation */}
        <style>
          {`
            .dot {
              width: 6px;
              height: 6px;
              background-color: #aaa;
              border-radius: 50%;
              animation: blink 1.4s infinite both;
            }
            .dot:nth-child(2) {
              animation-delay: 0.2s;
            }
            .dot:nth-child(3) {
              animation-delay: 0.4s;
            }
            @keyframes blink {
              0%, 80%, 100% {
                opacity: 0;
              }
              40% {
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default App;