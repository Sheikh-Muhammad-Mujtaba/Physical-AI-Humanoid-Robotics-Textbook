/**
 * AuthProvider - Provides authentication context using BetterAuth
 * Uses Docusaurus context to get the correct auth URL from environment variables
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl } from '../lib/auth-client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  authClient: ReturnType<typeof createClientForUrl>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { siteConfig } = useDocusaurusContext();

  // Get auth URL from Docusaurus config (set via BETTER_AUTH_URL env var)
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || 'http://localhost:3001';

  // Create auth client with the correct URL
  const authClient = useMemo(() => createClientForUrl(authUrl), [authUrl]);

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
