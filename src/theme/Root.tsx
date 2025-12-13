import React from 'react';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget'; // Import the new ChatbotWidget


function AppContent({ children }) {
  // Use new useChat hook
  const { isOpen, selectedText, openChat, closeChat, handleSelection, sendMessage } = useChat();

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
        <AppContent>{children}</AppContent>
    </ChatProvider>
  );
}
