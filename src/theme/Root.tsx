import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { AuthProvider } from '../components/AuthProvider';
import AppContent from './AppContent';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AuthProvider>
        <AppContent>
          {children}
        </AppContent>
      </AuthProvider>
    </ChatProvider>
  );
}

