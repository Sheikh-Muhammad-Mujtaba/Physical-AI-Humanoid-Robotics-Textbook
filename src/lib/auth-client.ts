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

// Get the auth service URL from Docusaurus config (set via BETTER_AUTH_URL env var)
export const getAuthUrl = (): string => {
  // Server-side rendering - use fallback
  if (typeof window === 'undefined') {
    return DEV_AUTH_URL;
  }

  // Check if Docusaurus has injected the config (from BETTER_AUTH_URL env var)
  const docusaurusConfig = (window as any).__DOCUSAURUS__;
  if (docusaurusConfig?.siteConfig?.customFields?.betterAuthUrl) {
    const url = docusaurusConfig.siteConfig.customFields.betterAuthUrl;
    // Ensure we don't use localhost in production
    if (url && url !== 'http://localhost:3001') {
      return url;
    }
  }

  // Check if we're on production domain - fail safe
  if (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1') {
    // We're on production but don't have the URL - log error
    console.error('BETTER_AUTH_URL not configured! Set it in Vercel environment variables.');
  }

  // Fallback to localhost for development
  return DEV_AUTH_URL;
};

// Lazy singleton for auth client
let _authClient: ReturnType<typeof createAuthClient> | null = null;

export const getAuthClient = () => {
  if (!_authClient) {
    const baseURL = getAuthUrl();
    console.log('Initializing auth client with URL:', baseURL);
    _authClient = createAuthClient({
      baseURL,
      fetchOptions: {
        credentials: 'include', // Include cookies in cross-origin requests
      },
      plugins: [
        jwtClient(),
      ],
    });
  }
  return _authClient;
};

// For backward compatibility - but prefer using getAuthClient()
export const authClient = typeof window !== 'undefined'
  ? getAuthClient()
  : createAuthClient({
      baseURL: DEV_AUTH_URL,
      fetchOptions: { credentials: 'include' },
      plugins: [jwtClient()],
    });

// Export auth methods and hooks - these will use the lazy client
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
