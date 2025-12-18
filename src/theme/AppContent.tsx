import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget';

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/login', '/register', '/blog'];
  return publicPaths.includes(pathname) || pathname.startsWith('/blog');
}

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isPending } = useAuth();
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

  const showChatFeatures = isAuthenticated && !isPending && pathname !== '' && !isPublicPath(pathname);

  return (
    <>
      {children}
      {showChatFeatures && <TextSelectionButton />}
      {showChatFeatures && <ChatbotWidget />}
    </>
  );
}

