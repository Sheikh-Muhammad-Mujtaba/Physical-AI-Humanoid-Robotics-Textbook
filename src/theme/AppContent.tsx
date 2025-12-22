import React from 'react';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget';

export default function AppContent({ children }: { children: React.ReactNode }) {
  // Show chat features on all pages - text selection and Ask AI button should work everywhere
  return (
    <>
      {children}
      <TextSelectionButton />
      <ChatbotWidget />
    </>
  );
}

