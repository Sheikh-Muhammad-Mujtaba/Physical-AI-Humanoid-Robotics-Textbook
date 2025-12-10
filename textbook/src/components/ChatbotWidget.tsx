// textbook/src/components/ChatbotWidget.tsx

import React, { useState } from 'react'; // Add useState
import { useChat } from '../contexts/ChatContext.tsx';

const ChatbotWidget: React.FC = () => {
  const { isOpen, openChat, closeChat, messages, selectedText, sendMessage, isLoading } = useChat(); // Add sendMessage and isLoading
  const [inputMessage, setInputMessage] = useState(''); // State for input field

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {!isOpen ? (
        // Collapsed state (Floating Action Button placeholder)
        <button
          onClick={openChat}
          className="w-15 h-15 rounded-full bg-blue-600 text-white border-none text-2xl cursor-pointer flex items-center justify-center shadow-lg"
          // Equivalent to:
          // width: 60, height: 60, borderRadius: '50%', backgroundColor: '#007bff',
          // color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer',
          // display: 'flex', alignItems: 'center', justifyContent: 'center',
          // boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        >
          💬
        </button>
      ) : (
        // Expanded state (Chatbot Window placeholder)
        <div
          className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
          // Equivalent to:
          // width: 350, height: 500, backgroundColor: 'white', borderRadius: '10px',
          // boxShadow: '0 8px 16px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
          // overflow: 'hidden',
        >
          <div
            className="bg-blue-600 text-white p-2 flex justify-between items-center"
            // Equivalent to:
            // backgroundColor: '#007bff', color: 'white', padding: '10px',
            // display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          >
            Chatbot
            <button
              onClick={closeChat}
              className="bg-transparent border-none text-white text-xl cursor-pointer"
              // Equivalent to:
              // background: 'none', border: 'none', color: 'white',
              // fontSize: '20px', cursor: 'pointer',
            >
              &times;
            </button>
          </div>
          <div className="flex-grow p-2 overflow-y-auto border-b border-gray-200">
            {/* Equivalent to: flexGrow: 1, padding: '10px', overflowY: 'auto', borderBottom: '1px solid #eee' */}
            {messages.length === 0 && selectedText ? (
              <div className="mb-2 text-left">
                <span className="inline-block rounded-md px-3 py-2 bg-gray-100">
                  You selected: "{selectedText}". How can I help with this?
                </span>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet.</p>
              // Equivalent to: textAlign: 'center', color: '#888'
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                  // Equivalent to: marginBottom: '8px', textAlign: msg.sender === 'user' ? 'right' : 'left',
                >
                  <span
                    className={`inline-block rounded-md px-3 py-2 ${
                      msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    // Equivalent to: display: 'inline-block', borderRadius: '5px', padding: '8px 12px',
                    // backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f0f0f0',
                  >
                    {msg.content}
                  </span>
                </div>
              ))
            )}
            {isLoading && ( // Conditional rendering for typing indicator
              <div className="mb-2 text-left">
                <span className="inline-block rounded-md px-3 py-2 bg-gray-100 italic">
                  AI is typing...
                </span>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-200 flex items-center"> {/* Add flex for button */}
            {/* Equivalent to: padding: '10px', borderTop: '1px solid #eee' */}
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-grow p-2 border border-gray-300 rounded-md mr-2" // flex-grow and margin-right
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => { // Send message on Enter key press
                if (e.key === 'Enter' && inputMessage.trim()) {
                  sendMessage(inputMessage);
                  setInputMessage('');
                }
              }}
              // Removed disabled
            />
            <button
              onClick={() => { // Send message on button click
                if (inputMessage.trim()) {
                  sendMessage(inputMessage);
                  setInputMessage('');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
