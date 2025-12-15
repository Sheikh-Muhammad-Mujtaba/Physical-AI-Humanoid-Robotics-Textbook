/**
 * BetterAuth client for authentication
 * Handles sign-in, sign-up, sign-out, and token management
 */

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Get the auth service URL from Docusaurus config or default to localhost
// In Docusaurus, we access custom fields via useDocusaurusContext hook in components
// For the auth client initialization, we use a default that can be overridden
const getAuthUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Check if Docusaurus has injected the config
    const docusaurusConfig = (window as any).__DOCUSAURUS__;
    if (docusaurusConfig?.siteConfig?.customFields?.betterAuthUrl) {
      return docusaurusConfig.siteConfig.customFields.betterAuthUrl;
    }
  }
  return "http://localhost:3001";
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
