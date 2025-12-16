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
  const frontendUrl = siteConfig.url || DEV_FRONTEND_URL; // Use siteConfig.url for frontend URL

  // Create auth client with the correct URLs
  const authClient = useMemo(() => createClientForUrl(authUrl, apiBaseUrl, frontendUrl), [authUrl, apiBaseUrl, frontendUrl]);

  // Use the session hook from the auth client
  const { data: session, isPending } = authClient.useSession();

  const value = useMemo(() => ({
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    user: session?.user || null,
    authClient,
  }), [session, isPending, authClient]);

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
