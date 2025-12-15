import React, { useState, useEffect } from 'react';
import { useSession, isAuthenticated as checkAuthToken } from '../lib/auth-client';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget';

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/login', '/register', '/blog'];
  return publicPaths.includes(pathname) || pathname.startsWith('/blog');
}

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [pathname, setPathname] = useState<string>('');
  const [hasToken, setHasToken] = useState<boolean>(false);

  // Get pathname on client side only and check for auth token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      setHasToken(checkAuthToken());

      // Listen for route changes
      const handleRouteChange = () => {
        setPathname(window.location.pathname);
      };

      window.addEventListener('popstate', handleRouteChange);

      // Poll for auth token changes
      const tokenInterval = setInterval(() => {
        setHasToken(checkAuthToken());
      }, 500);

      // Use interval to check pathname for client-side navigation
      const pathInterval = setInterval(() => {
        const currentPath = window.location.pathname;
        setPathname(prev => prev !== currentPath ? currentPath : prev);
      }, 200);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        clearInterval(tokenInterval);
        clearInterval(pathInterval);
      };
    }
  }, []);

  // User is authenticated if we have a session with a user OR we have an auth token
  const isAuthenticated = (!isPending && !!session?.user) || hasToken;
  const showChatFeatures = isAuthenticated && pathname !== '' && !isPublicPath(pathname);

  return (
    <>
      {children}
      {showChatFeatures && <TextSelectionButton />}
      {showChatFeatures && <ChatbotWidget />}
    </>
  );
}

