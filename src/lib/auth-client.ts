/**
 * BetterAuth client for authentication
 * Handles sign-in, sign-up, sign-out, and token management
 *
 * Configure via environment variable BETTER_AUTH_URL in Vercel dashboard
 */

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Default fallback URL for local development
const DEV_AUTH_URL = "http://localhost:3001";

// Cache for auth client instances by URL
const clientCache = new Map<string, ReturnType<typeof createAuthClient>>();

/**
 * Create or get cached auth client for a specific URL
 */
export const createClientForUrl = (baseURL: string) => {
  if (!clientCache.has(baseURL)) {
    clientCache.set(baseURL, createAuthClient({
      baseURL,
      fetchOptions: {
        credentials: 'include',
      },
      plugins: [
        jwtClient(),
      ],
    }));
  }
  return clientCache.get(baseURL)!;
};

/**
 * Get the auth service URL from Docusaurus config
 * Call this AFTER Docusaurus has initialized (inside components)
 */
export const getAuthUrl = (): string => {
  if (typeof window === 'undefined') {
    return DEV_AUTH_URL;
  }

  // Read from Docusaurus runtime config
  const docusaurusConfig = (window as any).__DOCUSAURUS__;
  const betterAuthUrl = docusaurusConfig?.siteConfig?.customFields?.betterAuthUrl;

  if (betterAuthUrl && betterAuthUrl !== DEV_AUTH_URL) {
    return betterAuthUrl;
  }

  return DEV_AUTH_URL;
};

/**
 * Get the auth client - use this in components after Docusaurus is loaded
 */
export const getAuthClient = () => {
  return createClientForUrl(getAuthUrl());
};

// Default client for SSR and initial load
const defaultClient = createAuthClient({
  baseURL: DEV_AUTH_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [jwtClient()],
});

// For backward compatibility - components should prefer getAuthClient()
export const authClient = typeof window !== 'undefined' ? getAuthClient() : defaultClient;

// Export auth methods - these use the default client
// Components should use getAuthClient() for proper URL resolution
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;

// Token storage key
const TOKEN_KEY = "auth_token";

/**
 * Get the stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear the stored auth token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get a fresh JWT token from BetterAuth
 * Call this before making API requests
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const result = await authClient.token();
    if (result.data?.token) {
      setAuthToken(result.data.token);
      return result.data.token;
    }
    return null;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

/**
 * Ensure we have a valid token, refreshing if needed
 * Returns the token or null if not authenticated
 */
export async function ensureToken(): Promise<string | null> {
  // First check if we have a stored token
  const existingToken = getAuthToken();
  if (existingToken) {
    return existingToken;
  }

  // Try to get a fresh token
  return refreshToken();
}
