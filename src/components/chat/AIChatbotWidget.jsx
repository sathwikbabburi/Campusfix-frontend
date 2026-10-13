import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../services/api';

const AIChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your **CampusFix AI Assistant**.\n\nAsk me anything about campus maintenance, check ticket statuses (e.g., `CF-2026-001`), or learn how automated complaint routing works!",
      suggestedQuestions: [
        'How do I report a water leak?',
        'What is the SLA for WiFi issues?',
        'Check status of CF-2026-001',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await aiApi.chat(text, history);
      if (res.success && res.data) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.reply,
          suggestedQuestions: res.data.suggestedQuestions || [],
          relevantTickets: res.data.relevantTickets || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Could not get AI response');
      }
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "⚠️ I'm sorry, I encountered a temporary connection issue. Please check your query or try again in a few moments.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: '✨ Chat cleared! How can I assist you with campus facilities today?',
        suggestedQuestions: [
          'How do I report a water leak?',
          'What is the SLA for WiFi issues?',
          'Check status of CF-2026-001',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple Markdown parser for bold, code, lists, and linebreaks
  const renderFormattedText = (rawText) => {
    return rawText.split('\n').map((line, idx) => {
      let content = line;
      // Headings
      if (content.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-sm text-gray-900 mt-2 mb-1">{content.replace('### ', '')}</h4>;
      }
      if (content.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-base text-gray-900 mt-2 mb-1">{content.replace('## ', '')}</h3>;
      }
      // Bullet items
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) {
        content = content.replace(/^[-*]\s+/, '');
      }

      // Inline styles: **bold**, `code`, *italic*
      const parts = content.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="px-1.5 py-0.5 bg-gray-100 text-blue-700 rounded text-xs font-mono font-bold">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="text-gray-600">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-1.5 my-0.5 ml-1 text-xs">
            <span className="text-blue-500 font-bold">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      if (!content.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return <p key={idx} className="text-xs leading-relaxed">{renderedParts}</p>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <span className="flex h-3 w-3 absolute -top-1 -right-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="font-semibold text-sm pr-1">CampusFix AI</span>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white text-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight leading-none">CampusFix AI Assistant</h3>
                <span className="text-[11px] text-blue-200 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  RAG Knowledge Base Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Render ticket cards if retrieved */}
                  {msg.relevantTickets && msg.relevantTickets.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Referenced Tickets
                      </div>
                      {msg.relevantTickets.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-blue-50/50 p-1.5 rounded-lg border border-blue-100 text-[11px]">
                          <span className="font-mono font-bold text-blue-700">{t.ticketNumber}</span>
                          <span className="truncate max-w-[140px] text-gray-600">{t.title}</span>
                          <span className="text-[10px] font-semibold uppercase text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Suggested prompt chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedQuestions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(q)}
                        className="text-[11px] text-left px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200/80 rounded-full shadow-2xs transition"
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-2xl rounded-bl-none max-w-[120px] shadow-xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CampusFix AI (e.g. status of CF-2026-001)..."
                rows={1}
                className="flex-1 resize-none text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl shadow-xs transition disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-1.5">
              Powered by Spring Boot RAG & Campus Database Retrieval
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbotWidget;
