/**
 * BetterAuth client for authentication
 * Handles sign-in, sign-up, sign-out, and token management
 *
 * Configure via environment variable BETTER_AUTH_URL in Vercel dashboard
 *
 * IMPORTANT: Use createClientForUrl() inside React components with useDocusaurusContext
 * to ensure the correct URL is used. Do NOT use the exported authClient directly
 * as it may be initialized before Docusaurus context is available.
 */

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Default fallback URL for local development
export const DEV_AUTH_URL = "http://localhost:3001";

// Cache for auth client instances by URL
const clientCache = new Map<string, ReturnType<typeof createAuthClient>>();

/**
 * Create or get cached auth client for a specific URL
 * Use this inside React components with the URL from useDocusaurusContext
 */
export const createClientForUrl = (baseURL: string) => {
  if (!clientCache.has(baseURL)) {
    clientCache.set(baseURL, createAuthClient({
      baseURL,
      fetchOptions: {
        credentials: 'include',
        // Use Bearer token authentication for cross-origin requests
        auth: {
          type: 'Bearer',
          token: () => getAuthToken() || '',
        },
        onSuccess: async (context) => {
          // Capture token from set-auth-token header (sent after login/OAuth)
          const token = context.response.headers.get('set-auth-token');
          if (token) {
            console.log('[AUTH] Token received in header, storing...');
            setAuthToken(decodeURIComponent(token));
          }
        },
        onError: (context) => {
          console.error('[AUTH] Request failed:', {
            status: context.response?.status,
            url: context.request?.url,
          });
        },
      },
      plugins: [
        jwtClient({
          fetchOptions: {
            onSuccess: async (context) => {
              // Also capture from JWT plugin responses
              const token = context.response.headers.get('set-auth-token');
              if (token) {
                console.log('[AUTH-JWT] Token received in header, storing...');
                setAuthToken(decodeURIComponent(token));
              }
            },
          },
        }),
      ],
    }));
  }
  return clientCache.get(baseURL)!;
};

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
 * Requires the auth client to be passed in (from useAuth context)
 */
export async function refreshToken(authClient: ReturnType<typeof createAuthClient>): Promise<string | null> {
  try {
    const result = await authClient.token();
    if (result.data?.token) {
      setAuthToken(result.data.token);
      return result.data.token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Ensure we have a valid token, refreshing if needed
 * Returns the token or null if not authenticated
 * Requires the auth client to be passed in (from useAuth context)
 */
export async function ensureToken(authClient: ReturnType<typeof createAuthClient>): Promise<string | null> {
  // First check if we have a stored token
  const existingToken = getAuthToken();
  if (existingToken) {
    return existingToken;
  }

  // Try to get a fresh token
  return refreshToken(authClient);
}
