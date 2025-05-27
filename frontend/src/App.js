import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything based on the documents.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
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
    <div className="app-container">
      <div className="background-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="gradient-mesh"></div>
      </div>
      
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <div className="bot-avatar">
              <div className="avatar-ring"></div>
              <div className="avatar-core">
                <span className="bot-icon">🤖</span>
              </div>
              <div className="status-indicator"></div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Document Assistant</h1>
              <p className="header-subtitle">AI-powered document analysis</p>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.sender}`}>
              <div className={`message ${msg.sender}`}>
                {msg.typing ? (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                ) : (
                  <div className="message-text">{msg.text}</div>
                )}
                {!msg.typing && (
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={`input-container ${isInputFocused ? 'focused' : ''}`}>
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Ask me anything about your documents..."
              disabled={loading}
              className="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`send-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m22 2-7 20-4-9-9-4z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          animation: float 20s infinite linear;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          left: -150px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          top: 60%;
          right: -100px;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: 30%;
          animation-delay: -10s;
        }

        .orb-4 {
          width: 250px;
          height: 250px;
          top: 20%;
          right: 20%;
          animation-delay: -15s;
        }

        .gradient-mesh {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 94, 77, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(17, 153, 142, 0.3) 0%, transparent 50%);
          animation: meshMove 15s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        @keyframes meshMove {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .chat-container {
          width: 90%;
          max-width: 900px;
          height: 85vh;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          position: relative;
          z-index: 1;
          animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .chat-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .bot-avatar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-ring {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .avatar-core {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .bot-icon {
          font-size: 24px;
          animation: bounce 2s ease-in-out infinite;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #4ade80;
          border-radius: 50%;
          border: 2px solid white;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .header-text {
          color: white;
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-subtitle {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 400;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(to bottom, #fafafa, #f5f5f5);
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .message-wrapper {
          display: flex;
          animation: messageSlide 0.4s ease-out;
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-wrapper.bot {
          justify-content: flex-start;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message {
          max-width: 75%;
          padding: 16px 20px;
          border-radius: 20px;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .message:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .message.user {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 6px;
          margin-left: 40px;
        }

        .message.bot {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border-bottom-left-radius: 6px;
          margin-right: 40px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .message-text {
          font-size: 15px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 8px;
          text-align: right;
        }

        .message.bot .message-time {
          text-align: left;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          height: 20px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-dots .dot {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite both;
        }

        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingBounce {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .input-container {
          padding: 24px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .input-container.focused {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
        }

        .input-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
          background: white;
          border-radius: 25px;
          padding: 4px;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .input-container.focused .input-wrapper {
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.15),
            0 0 0 2px rgba(102, 126, 234, 0.3);
        }

        .message-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 16px 20px;
          font-size: 15px;
          background: transparent;
          color: #333;
          font-family: inherit;
        }

        .message-input::placeholder {
          color: #999;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .send-icon {
          width: 20px;
          height: 20px;
          stroke-width: 2;
          transition: transform 0.3s ease;
        }

        .send-button:hover:not(:disabled) .send-icon {
          transform: translateX(1px);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .chat-container {
            width: 95%;
            height: 90vh;
            border-radius: 16px;
          }

          .chat-header {
            padding: 20px;
          }

          .header-title {
            font-size: 20px;
          }

          .messages-container {
            padding: 16px;
          }

          .message {
            max-width: 85%;
            padding: 12px 16px;
          }

          .input-container {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .chat-container {
            width: 100%;
            height: 100vh;
            border-radius: 0;
          }

          .message {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;