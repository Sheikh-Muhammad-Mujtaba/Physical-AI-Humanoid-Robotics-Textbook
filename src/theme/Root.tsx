import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AppContent>
        {children}
      </AppContent>
    </ChatProvider>
  );
}

