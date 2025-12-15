/**
 * BetterAuth client for authentication
 * Handles sign-in, sign-up, sign-out, and token management
 */

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Production auth service URL - update this when deploying
const PRODUCTION_AUTH_URL = "https://physical-ai-humanoid-robotics-textbook.vercel.app";
const DEV_AUTH_URL = "http://localhost:3001";

// Get the auth service URL
const getAuthUrl = (): string => {
  // Server-side rendering - return production URL
  if (typeof window === 'undefined') {
    return PRODUCTION_AUTH_URL;
  }

  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return DEV_AUTH_URL;
  }

  // Check if Docusaurus has injected the config
  const docusaurusConfig = (window as any).__DOCUSAURUS__;
  if (docusaurusConfig?.siteConfig?.customFields?.betterAuthUrl) {
    return docusaurusConfig.siteConfig.customFields.betterAuthUrl;
  }

  // Production - use the deployed auth service
  return PRODUCTION_AUTH_URL;
};

const BETTER_AUTH_URL = getAuthUrl();

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  fetchOptions: {
    credentials: 'include', // Include cookies in cross-origin requests
  },
  plugins: [
    jwtClient(),
  ],
});

// Export auth methods and hooks
export const { signIn, signUp, signOut, useSession } = authClient;

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
