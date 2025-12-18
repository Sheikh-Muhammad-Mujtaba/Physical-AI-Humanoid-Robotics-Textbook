import React, { useState, useEffect } from 'react';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget';

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/login', '/register', '/blog'];
  return publicPaths.includes(pathname) || pathname.startsWith('/blog');
}

export default function AppContent({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>('');

  // Get pathname on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);

      // Listen for route changes
      const handleRouteChange = () => {
        setPathname(window.location.pathname);
      };

      window.addEventListener('popstate', handleRouteChange);

      // Use interval to check pathname for client-side navigation (keep this for SPA routing)
      const pathInterval = setInterval(() => {
        const currentPath = window.location.pathname;
        setPathname(prev => prev !== currentPath ? currentPath : prev);
      }, 200);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        clearInterval(pathInterval);
      };
    }
  }, []);

  // Don't show chat features on public paths or when pathname is empty
  const shouldShowChatFeatures = pathname !== '' && !isPublicPath(pathname);

  return (
    <>
      {children}
      {shouldShowChatFeatures && <TextSelectionButton />}
      {shouldShowChatFeatures && <ChatbotWidget />}
    </>
  );
}

