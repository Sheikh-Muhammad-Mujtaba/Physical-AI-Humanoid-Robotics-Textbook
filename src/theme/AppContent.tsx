import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { isAuthenticated as checkAuthToken } from '../lib/auth-client';
import TextSelectionButton from '../components/TextSelectionButton';
import ChatbotWidget from '../components/ChatbotWidget';

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/login', '/register', '/blog'];
  return publicPaths.includes(pathname) || pathname.startsWith('/blog');
}

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isSessionAuthenticated, isLoading: isPending } = useAuth();
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

      // Listen for storage changes (when token is updated in another tab or by login)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'auth_token') {
          setHasToken(checkAuthToken());
        }
      };

      window.addEventListener('popstate', handleRouteChange);
      window.addEventListener('storage', handleStorageChange);

      // Use interval to check pathname for client-side navigation (keep this for SPA routing)
      const pathInterval = setInterval(() => {
        const currentPath = window.location.pathname;
        setPathname(prev => prev !== currentPath ? currentPath : prev);
      }, 200);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(pathInterval);
      };
    }
  }, []);

  // User is authenticated if we have a session with a user OR we have an auth token
  const isAuthenticated = (!isPending && isSessionAuthenticated) || hasToken;
  const showChatFeatures = isAuthenticated && pathname !== '' && !isPublicPath(pathname);

  return (
    <>
      {children}
      {showChatFeatures && <TextSelectionButton />}
      {showChatFeatures && <ChatbotWidget />}
    </>
  );
}

