import React, { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';
import { useChatbot } from '../lib/ChatbotProvider';
import AnimatedAvatar from './AnimatedAvatar';
import MessageBubble from './MessageBubble';
import { v4 as uuidv4 } from 'uuid';
import { chatWithBackend, askSelectionWithBackend, getHistory, sendFeedback } from '../lib/chatApi';
import { useChat } from '../lib/ChatProvider'; // Assuming useChat from ChatProvider for selected text
import { motion } from 'framer-motion';

interface Message {
  message_id?: string;
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

const ChatbotWindow = () => {
  const { isChatbotVisible, setIsChatbotVisible } = useChatbot();
  const { selection, clearSelection, setConversation } = useChat(); // Use selection from global ChatProvider
  const chatbotRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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
          setLocalMessages(mappedHistory);
          setConversation(mappedHistory); // Update global conversation in ChatProvider
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    if (storedSessionId) {
      fetchHistory(storedSessionId);
    }
  }, [setConversation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsChatbotVisible(false);
      }
    };

    if (isChatbotVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatbotVisible, setIsChatbotVisible]);

  if (!isChatbotVisible) {
    return null;
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setLocalMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      let botResponse;
      if (selection) {
        const question = `Tell me more about "${selection}" and also answer: ${input}`;
        botResponse = await askSelectionWithBackend(selection, question, sessionId);
        clearSelection(); // Clear selection after asking about it
      } else {
        botResponse = await chatWithBackend(input, sessionId);
      }
      
      const botMessage: Message = { 
        message_id: botResponse.message_id,
        text: botResponse.answer || "No answer found.", 
        sender: 'bot' 
      };
      setLocalMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        text: `Error: ${error.message || 'Something went wrong.'}`,
        sender: 'bot',
        isError: true,
      };
      setLocalMessages((prev) => [...prev, errorMessage]);
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

  return (
    <motion.div
      ref={chatbotRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-96 h-[70vh] flex flex-col border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl shadow-md">
        <div className="flex items-center">
          <AnimatedAvatar />
          <h3 className="text-lg font-semibold ml-3">AI Assistant</h3>
        </div>
        <button onClick={() => setIsChatbotVisible(false)} className="text-white hover:text-gray-200 transition-colors duration-200 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            {message.sender === 'bot' && <AnimatedAvatar />}
            <MessageBubble text={message.text} sender={message.sender} />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center">
            <AnimatedAvatar />
            <div className="ml-2">
              <span className="inline-block h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="inline-block h-2 w-2 bg-gray-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.1s' }}></span>
              <span className="inline-block h-2 w-2 bg-gray-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-xl">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder='Ask a question...'
          disabled={loading}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </motion.div>
  );
};

export default ChatbotWindow;
