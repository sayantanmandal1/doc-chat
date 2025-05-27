import React, { useState, useEffect, useRef } from 'react';

// Custom SVG Icons
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
  </svg>
);

const FileTextIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10,9 9,9 8,9"></polyline>
  </svg>
);

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21 5,3"></polygon>
  </svg>
);

const SquareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  </svg>
);

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything based on the documents.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

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
    const currentInput = input;
    setInput('');
    setLoading(true);
    setPaused(false);
    setMessages((msgs) => [...msgs, { sender: 'bot', typing: true }]);

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`https://doc-chat-ea9c.onrender.com/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((msgs) => [...msgs.filter((m) => !m.typing), {
          sender: 'bot',
          text: data.answer || 'No response received.',
          timestamp: new Date(),
        }]);
      } else {
        throw new Error('Response not ok');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled/paused
        setMessages((msgs) => [...msgs.filter((m) => !m.typing), {
          sender: 'bot',
          text: 'Response was paused. Click resume to continue or ask a new question.',
          timestamp: new Date(),
          paused: true
        }]);
        setPaused(true);
      } else {
        setMessages((msgs) => [...msgs.filter((m) => !m.typing), {
          sender: 'bot',
          text: 'Error reaching the backend.',
          timestamp: new Date(),
        }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const pauseResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resumeResponse = () => {
    setPaused(false);
    // Remove the paused message and retry with the last user input
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage) {
      setInput(lastUserMessage.text);
      // Remove paused message
      setMessages(msgs => msgs.filter(m => !m.paused));
    }
  };

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPaused(false);
    setMessages(msgs => msgs.filter(m => !m.typing));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) sendMessage();
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .gradient-bg {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .glass-morphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
          }

          .message-enter {
            animation: messageSlideIn 0.4s ease-out;
          }

          @keyframes messageSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .typing-indicator {
            display: flex;
            gap: 4px;
            align-items: center;
            padding: 12px 16px;
          }

          .typing-dot {
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            animation: typingBounce 1.4s infinite ease-in-out;
          }

          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          .typing-dot:nth-child(3) { animation-delay: 0; }

          @keyframes typingBounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .input-focus {
            transition: all 0.3s ease;
          }

          .input-focus:focus {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          }

          .send-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .send-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }

          .send-button:active {
            transform: translateY(-1px);
          }

          .send-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .send-button:hover::before {
            left: 100%;
          }

          .header-glow {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
          }

          .header-glow::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: headerShimmer 3s linear infinite;
          }

          @keyframes headerShimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }

          .message-bubble {
            transition: all 0.3s ease;
            position: relative;
          }

          .message-bubble:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }

          .floating-icon {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .pulse-ring {
            animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.33);
            }
            80%, 100% {
              opacity: 0;
            }
          }

          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          .glow-text {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
      
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-morphism w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="header-glow p-6 relative">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <FileTextIcon />
                <div className="absolute inset-0 rounded-full bg-white opacity-20 pulse-ring"></div>
              </div>
              <h1 className="text-2xl font-bold text-white glow-text">Document Intelligence</h1>
              <div className="floating-icon" style={{ animationDelay: '1s' }}>
                <SparklesIcon />
              </div>
            </div>
            <p className="text-center text-white/80 mt-2 font-light">
              Powered by AI • Ask anything about your documents
            </p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" 
               style={{ height: 'calc(90vh - 200px)' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message Bubble */}
                  <div className={`message-bubble rounded-2xl px-4 py-3 ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : msg.paused 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-yellow-300'
                        : 'bg-white/90 text-gray-800 border border-white/20'
                  }`}>
                    {msg.typing ? (
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <span className="ml-2 text-gray-600 text-sm">AI is thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  {!msg.typing && (
                    <div className={`text-xs text-white/60 mt-1 px-2 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 mr-3 ${
                  msg.sender === 'user' ? 'order-1 bg-gradient-to-r from-purple-500 to-pink-500' : 'order-2 bg-gradient-to-r from-blue-500 to-teal-500'
                }`}>
                  {msg.sender === 'user' ? (
                    <span className="text-white font-bold text-sm">U</span>
                  ) : (
                    <MessageCircleIcon />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/5 backdrop-blur-sm border-t border-white/10">
            <div className="flex space-x-4 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your documents..."
                  disabled={loading && !paused}
                  className="input-focus w-full px-6 py-4 bg-white/90 border border-white/20 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium text-lg"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
                </div>
              </div>
              
              {/* Control Buttons */}
              {loading && !paused ? (
                <div className="flex space-x-2">
                  <button
                    onClick={pauseResponse}
                    className="send-button px-4 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    title="Pause Response"
                  >
                    <PauseIcon />
                  </button>
                  <button
                    onClick={stopResponse}
                    className="send-button px-4 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    title="Stop Response"
                  >
                    <SquareIcon />
                  </button>
                </div>
              ) : paused ? (
                <button
                  onClick={resumeResponse}
                  className="send-button px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  title="Resume Response"
                >
                  <div className="flex items-center space-x-2">
                    <PlayIcon />
                    <span>Resume</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="send-button px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <SendIcon />
                      <span>Send</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;