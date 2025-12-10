import React from 'react';
import { ChatProvider, useChat } from '../contexts/ChatContext.tsx'; // Use new ChatProvider
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget'; // Import the new ChatbotWidget
import { askSelectionWithBackend } from '../lib/chatApi'; // Keep existing backend communication
// REMOVE old ChatbotProvider related imports
// import { ChatbotProvider, useChatbot } from '../lib/ChatbotProvider';
// import FloatingChatbotIcon from '../components/FloatingChatbotIcon';
// import ChatbotWindow from '../components/ChatbotWindow';

function AppContent({ children }) {
  // Use new useChat hook
  const { isOpen, selectedText, openChat, closeChat, handleSelection, sendMessage } = useChat();
  // const { isChatbotVisible } = useChatbot(); // REMOVE old useChatbot

  // TODO: Refactor handleAsk to use new sendMessage and selectedText from new context
  const handleAsk = async () => {
    if (selectedText) { // Use selectedText from new context
      const question = `Tell me more about "${selectedText}"`;
      // setConversation(prev => [...prev, { text: question, sender: 'user' }]); // This logic moves into sendMessage
      // clearSelection(); // This logic moves into handleSelection or sendMessage callback
      
      // Call new sendMessage
      await sendMessage(question);
      handleSelection(null); // Clear selected text after sending

      // The try/catch for botResponse should be handled within sendMessage
      // or a separate backend service that sendMessage calls.
      // Keeping original structure for now, but will require refactor.
      /*
      try {
        const botResponse = await askSelectionWithBackend(selectedText, question, localStorage.getItem('chat_session_id') || '');
        const botMessage = { 
          message_id: botResponse.message_id,
          text: botResponse.answer || "No answer found.", 
          sender: 'bot' 
        };
        // setConversation(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage = {
          text: `Error: ${error.message || 'Something went wrong.'}`,
          sender: 'bot',
          isError: true,
        };
        // setConversation(prev => [...prev, errorMessage]);
      }
      */
    }
  };

  return (
    <>
      <TextSelectionButton /> {/* Render TextSelectionButton globally */}
      {children}
      {/* Render the new ChatbotWidget */}
      <ChatbotWidget />
    </>
  );
}

export default function Root({ children }) {
  return (
    <ChatProvider> {/* Use new ChatProvider */}
      {/* REMOVE old ChatbotProvider */}
      {/* <ChatbotProvider> */}
        <AppContent>{children}</AppContent>
      {/* </ChatbotProvider> */}
    </ChatProvider>
  );
}
