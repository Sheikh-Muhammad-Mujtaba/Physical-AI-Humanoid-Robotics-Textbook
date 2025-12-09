"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatWithBackend, askSelectionWithBackend, getHistory, sendFeedback } from '../lib/chatApi';
import { useChat } from '../lib/ChatProvider';

interface Message {
  message_id?: string;
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

const ChatBot: React.FC = () => {
  const { isChatOpen, openChat, closeChat, conversation: messages, setConversation: setMessages } = useChat();
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('chat_session_id');
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('chat_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    const fetchHistory = async (sid: string) => {
      try {
        const history = await getHistory(sid);
        if (history && history.length > 0) {
          const mappedHistory: Message[] = history.map((msg: any) => ({
            message_id: msg.message_id,
            text: msg.text,
            sender: msg.sender,
          }));
          setMessages(mappedHistory);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    if (storedSessionId) {
      fetchHistory(storedSessionId);
    }
  }, [setMessages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      let botResponse;
      if (selectedText) {
        botResponse = await askSelectionWithBackend(selectedText, input, sessionId);
        setSelectedText('');
      } else {
        botResponse = await chatWithBackend(input, sessionId);
      }
      
      const botMessage: Message = { 
        message_id: botResponse.message_id,
        text: botResponse.answer || "No answer found.", 
        sender: 'bot' 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        text: `Error: ${error.message || 'Something went wrong.'}`,
        sender: 'bot',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await sendFeedback(messageId, rating);
      console.log('Feedback sent successfully');
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full w-14 h-14 text-2xl cursor-pointer shadow-lg z-50"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[500px] border border-gray-300 rounded-lg bg-white flex flex-col font-sans shadow-lg z-50">
      <div className="flex justify-between items-center p-2 border-b border-gray-300">
        <h2 className="m-0 text-lg">Textbook AI Assistant</h2>
        <button onClick={closeChat} className="bg-transparent border-none text-lg cursor-pointer">
          &#x2715;
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-2 bg-gray-100 flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div key={index} className={`self-${msg.sender === 'user' ? 'end' : 'start'}`}>
            <div className={`rounded-lg p-2 max-w-full break-words ${msg.sender === 'user' ? 'bg-green-200' : (msg.isError ? 'bg-red-200 text-red-800' : 'bg-gray-200')}`}>
              {msg.text}
            </div>
            {msg.sender === 'bot' && !msg.isError && msg.message_id && (
              <div className="mt-1 flex gap-1">
                <button onClick={() => handleFeedback(msg.message_id, 1)} className="bg-transparent border-none cursor-pointer">👍</button>
                <button onClick={() => handleFeedback(msg.message_id, -1)} className="bg-transparent border-none cursor-pointer">👎</button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-gray-200 rounded-lg p-2">
            Typing...
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2 p-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder='Ask a question...'
          disabled={loading}
          className="flex-grow p-2 border border-gray-300 rounded-md text-base"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-500 text-white border-none rounded-md px-4 py-2 cursor-pointer text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
