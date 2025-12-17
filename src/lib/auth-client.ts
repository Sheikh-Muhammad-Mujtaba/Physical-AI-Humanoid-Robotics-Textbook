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
export const DEV_API_BASE_URL = "http://localhost:8000";
export const DEV_FRONTEND_URL = "http://localhost:3000";

// Cache for auth client instances by URL
const clientCache = new Map<string, ReturnType<typeof createAuthClient>>();

/**
 * Create or get cached auth client for a specific URL
 * Use this inside React components with the URL from useDocusaurusContext
 *
 * IMPORTANT: Following Better Auth documentation for cross-domain authentication:
 * - baseURL must point to auth service (not frontend)
 * - credentials: 'include' is REQUIRED for cross-domain cookies
 * - No custom fetch implementation that might interfere with Better Auth internals
 */
export const createClientForUrl = (
  baseURL: string,
  apiBaseUrl: string,
  frontendUrl: string | string[]
) => {
  const cacheKey = `${baseURL}-${apiBaseUrl}-${JSON.stringify(frontendUrl)}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(cacheKey, createAuthClient({
      baseURL,
      fetchOptions: {
        // CRITICAL: credentials: 'include' is REQUIRED for cross-domain authentication
        // This tells the browser to send cookies with cross-origin requests
        credentials: 'include',

        // Optional callbacks for debugging (safe with null checks)
        onRequest: async (context) => {
          if (context?.request) {
            console.log('[AUTH-CLIENT] Request:', {
              url: context.request.url || 'unknown',
              method: context.request.method || 'unknown',
            });
          }
        },
        onSuccess: async (context) => {
          if (context) {
            console.log('[AUTH-CLIENT] Response Success:', {
              url: context.request?.url || 'unknown',
              status: context.response?.status || 'unknown',
              hasData: !!context.data,
            });

            // Check if backend sent JWT token in custom header
            const token = context.response?.headers?.get('set-auth-token');
            if (token) {
              const decodedToken = decodeURIComponent(token);
              console.log('[AUTH] JWT token received from server, storing...');
              setAuthToken(decodedToken);
            }
          }
        },
        onError: (context) => {
          if (context) {
            console.error('[AUTH] Request failed:', {
              status: context.response?.status || 'unknown',
              url: context.request?.url || 'unknown',
            });
          }
        },
      },
      plugins: [
        jwtClient(),
      ],
    }));
  }

  return clientCache.get(cacheKey)!;
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
 * Get a fresh JWT token from BetterAuth using the session (cookies)
 * This should be called when making API requests to the backend
 * The baseURL parameter should be the auth service URL
 */
export async function getJWTToken(baseURL: string): Promise<string | null> {
  try {
    const response = await fetch(`${baseURL}/api/auth/token`, {
      method: 'GET',
      credentials: 'include', // Send cookies with session
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.token) {
        setAuthToken(data.token);
        return data.token;
      }
    }
    return null;
  } catch (error) {
    console.error('[AUTH] Error fetching JWT token:', error);
    return null;
  }
}

/**
 * Get JWT token for API calls
 * First checks localStorage, then fetches a fresh one if needed
 */
export async function ensureJWTToken(baseURL: string): Promise<string | null> {
  // First check if we have a stored token
  const existingToken = getAuthToken();
  if (existingToken) {
    return existingToken;
  }

  // Try to get a fresh token from the session
  return getJWTToken(baseURL);
}
