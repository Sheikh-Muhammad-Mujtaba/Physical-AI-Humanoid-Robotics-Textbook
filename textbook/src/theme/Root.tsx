import React from 'react';
import { ChatProvider, useChat } from '../lib/ChatProvider';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatBot from '../components/ChatBot';
import { askSelectionWithBackend } from '../lib/chatApi';

function AppContent({ children }) {
  const { selection, buttonPosition, clearSelection, setConversation } = useChat();

  const handleAsk = async () => {
    if (selection) {
      const question = `Tell me more about "${selection}"`;
      setConversation(prev => [...prev, { text: question, sender: 'user' }]);
      clearSelection();
      
      try {
        const botResponse = await askSelectionWithBackend(selection, question, localStorage.getItem('chat_session_id') || '');
        const botMessage = { 
          message_id: botResponse.message_id,
          text: botResponse.answer || "No answer found.", 
          sender: 'bot' 
        };
        setConversation(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage = {
          text: `Error: ${error.message || 'Something went wrong.'}`,
          sender: 'bot',
          isError: true,
        };
        setConversation(prev => [...prev, errorMessage]);
      }
    }
  };

  return (
    <>
      {selection && buttonPosition && <TextSelectionButton position={buttonPosition} onAsk={handleAsk} />}
      {children}
      <ChatBot />
    </>
  );
}

export default function Root({ children }) {
  return (
    <ChatProvider>
      <AppContent>{children}</AppContent>
    </ChatProvider>
  );
}
