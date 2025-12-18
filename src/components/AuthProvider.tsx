/**
 * AuthProvider - Provides authentication context using BetterAuth
 * Uses Docusaurus context to get the correct auth URL from environment variables
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, DEV_AUTH_URL, DEV_API_BASE_URL, DEV_FRONTEND_URL } from '../lib/auth-client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  authClient: ReturnType<typeof createClientForUrl>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { siteConfig } = useDocusaurusContext();

  // Get auth URL, API Base URL, and Frontend URL from Docusaurus config
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;
  const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;

  // Get frontend URL (use current origin in browser, fallback to siteConfig.url)
  // IMPORTANT: Must match the frontendUrl used in other components (LoginOverlay, UserMenu, login.tsx, etc.)
  // to ensure we're using the same cached auth client instance
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : (siteConfig.url || DEV_FRONTEND_URL);

  // Create auth client with the correct URLs
  const authClient = useMemo(() => createClientForUrl(authUrl, apiBaseUrl, frontendUrl), [authUrl, apiBaseUrl, frontendUrl]);

  // Use the session hook from the auth client
  // Note: cookieCache is disabled on the backend, so we always get fresh data from database
  const { data: session, isPending, error } = authClient.useSession();

  // DETAILED LOGGING for debugging
  console.log('[AUTH-PROVIDER] Session State:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    isPending,
    error: error || null,
    user: session?.user || null,
    sessionData: session || null,
  });

  const value = useMemo(() => {
    const authState = {
      isAuthenticated: !!session?.user,
      isLoading: isPending,
      user: session?.user || null,
      authClient,
    };
    console.log('[AUTH-PROVIDER][DEBUG] session:', session);
    console.log('[AUTH-PROVIDER][DEBUG] isPending:', isPending);
    console.log('[AUTH-PROVIDER][DEBUG] isAuthenticated:', !!session?.user);
    console.log('[AUTH-PROVIDER][DEBUG] authState:', authState);
    return authState;
  }, [session, isPending, authClient]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
