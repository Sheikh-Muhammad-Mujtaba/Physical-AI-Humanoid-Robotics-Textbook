import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatbotWidget: React.FC = () => {
  const { isOpen, openChat, closeChat, messages, selectedText, sendMessage, isLoading, handleSelection } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle sending message with selection context
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Clear selection tag
  const clearSelection = () => {
    handleSelection(null);
  };

  // Truncate text for display
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {!isOpen ? (
        <button
          onClick={openChat}
          className="w-16 h-16 rounded-full bg-primary text-white border-none text-2xl cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          💬
        </button>
      ) : (
        <div className="w-96 h-[550px] bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <span className="font-semibold">AI Tutor</span>
            <button
              onClick={closeChat}
              className="bg-transparent border-none text-white text-xl cursor-pointer hover:opacity-80"
            >
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-3 overflow-y-auto">
            {messages.length === 0 && !selectedText ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Select text from the book or ask a question to get started!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block rounded-lg px-3 py-2 max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="mb-3 text-left">
                    <div className="inline-block rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {/* WhatsApp-style Selection Tag */}
            {selectedText && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-primary">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary dark:text-blue-400 block mb-1">
                      Selected from book:
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">
                      "{truncateText(selectedText, 120)}"
                    </p>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Input Field */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={selectedText ? "Ask about the selection..." : "Type a message..."}
                className="flex-grow p-2 border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
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
                className="bg-primary text-white p-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
