import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Copy, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';

const ChatbotWidget: React.FC = () => {
  const { isOpen, openChat, closeChat, messages, selectedText, sendMessage, isLoading, handleSelection } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect dark mode
  useEffect(() => {
    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDarkMode(darkMode);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          setIsDarkMode(isDark);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle sending message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
      setCharCount(0);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 500);
    setInputMessage(value);
    setCharCount(value.length);
  };

  // Copy message
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Clear selection
  const clearSelection = () => {
    handleSelection(null);
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000]">
      {/* Ask AI Button */}
      {!isOpen ? (
        <button
          onClick={openChat}
          className={`relative w-14 h-14 rounded-full text-white border-2 cursor-pointer flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 ${
            isDarkMode
              ? 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400'
              : 'bg-gradient-to-br from-[#ff0000] to-[#cc0000] border-red-500'
          }`}
          title="Ask AI"
        >
          <span className="text-2xl">💬</span>
          <div
            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse ${
              isDarkMode ? 'bg-purple-400' : 'bg-red-700'
            }`}
          ></div>
        </button>
      ) : (
        /* Chat Window - Mobile Responsive */
        <div
          className={`fixed inset-4 bottom-auto sm:fixed sm:bottom-20 sm:right-4 sm:w-96 sm:inset-auto rounded-lg sm:rounded-2xl flex flex-col overflow-hidden border shadow-2xl transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-950 border-purple-900 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          style={{
            height: 'calc(100vh - 8rem)',
            maxHeight: '80vh',
            minHeight: 'calc(100vh - 240px)',
          }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
              isDarkMode
                ? 'bg-purple-900/40 border-purple-800'
                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isDarkMode ? 'bg-purple-400' : 'bg-red-600'
                }`}
              ></div>
              <span className="font-bold text-base">AI Tutor</span>
            </div>
            <button
              onClick={closeChat}
              className={`w-7 h-7 flex items-center justify-center rounded border text-base font-bold transition-all duration-200 ${
                isDarkMode
                  ? 'hover:bg-purple-800 border-purple-700 text-purple-300'
                  : 'hover:bg-red-100 border-red-300 text-red-600'
              }`}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div
            className={`flex-1 overflow-y-auto px-3 py-4 space-y-3 ${
              isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}
          >
            {messages.length === 0 && !selectedText ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">✨</div>
                <p className={`text-center text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ask a question!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    onMouseEnter={() => msg.sender === 'assistant' && setHoveredMessageIndex(index)}
                    onMouseLeave={() => setHoveredMessageIndex(null)}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        msg.sender === 'user'
                          ? isDarkMode
                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
                            : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-800 border border-gray-700 text-gray-100'
                          : 'bg-gray-200 border border-gray-300 text-gray-900'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      {msg.sender === 'assistant' && hoveredMessageIndex === index && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-current border-opacity-20">
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className={`p-1 rounded transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                            }`}
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className={`p-1 rounded transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                            }`}
                            title="Like"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            className={`p-1 rounded transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                            }`}
                            title="Dislike"
                          >
                            <ThumbsDown size={14} />
                          </button>
                          <button
                            className={`p-1 rounded transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                            }`}
                            title="Regenerate"
                          >
                            <RotateCw size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div
                      className={`inline-flex gap-1.5 px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-200 border border-gray-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-purple-400' : 'bg-red-500'
                        }`}
                        style={{ animationDelay: '0ms' }}
                      ></span>
                      <span
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-purple-300' : 'bg-red-400'
                        }`}
                        style={{ animationDelay: '150ms' }}
                      ></span>
                      <span
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-purple-200' : 'bg-red-300'
                        }`}
                        style={{ animationDelay: '300ms' }}
                      ></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Section */}
          <div
            className={`flex-shrink-0 border-t p-3 ${
              isDarkMode
                ? 'bg-gray-900 border-purple-800/50'
                : 'bg-gray-50 border-red-200'
            }`}
          >
            {/* Selection Banner */}
            {selectedText && (
              <div
                className={`mb-2 p-2 rounded border text-xs ${
                  isDarkMode
                    ? 'bg-purple-900/40 border-purple-800'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold mb-1 ${isDarkMode ? 'text-purple-300' : 'text-red-600'}`}>
                      📖 Selected
                    </p>
                    <p className={`italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      "{truncateText(selectedText, 60)}"
                    </p>
                  </div>
                  <button
                    onClick={clearSelection}
                    className={`flex-shrink-0 font-bold ${isDarkMode ? 'text-purple-300' : 'text-red-600'}`}
                    title="Clear"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input Field */}
            <div
              className={`flex gap-1.5 border rounded px-2 py-1.5 items-center focus-within:ring-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-800 border-purple-700 focus-within:border-purple-600 focus-within:ring-purple-600/50'
                  : 'bg-white border-red-300 focus-within:border-red-500 focus-within:ring-red-500/30'
              }`}
            >
              <input
                type="text"
                placeholder="Ask..."
                className={`flex-1 bg-transparent text-sm focus:outline-none ${
                  isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-600'
                }`}
                value={inputMessage}
                onChange={handleInputChange}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`p-1 rounded text-white transition-all flex-shrink-0 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:shadow-md'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-md'
                } disabled:opacity-50`}
                title="Send"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Counter */}
            <div className="flex justify-end mt-1 text-xs">
              <span
                className={
                  charCount > 450
                    ? isDarkMode
                      ? 'text-red-400'
                      : 'text-red-600'
                    : isDarkMode
                    ? 'text-purple-400'
                    : 'text-red-500'
                }
              >
                {charCount}/500
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
