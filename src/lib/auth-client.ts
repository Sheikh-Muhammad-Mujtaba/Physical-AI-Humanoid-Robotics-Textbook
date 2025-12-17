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
export const DEV_FRONTEND_URL = "http://localhost:3000"; // Assuming frontend runs on 3000 locally

// Cache for auth client instances by URL
const clientCache = new Map<string, ReturnType<typeof createAuthClient>>();

/**
 * Create or get cached auth client for a specific URL
 * Use this inside React components with the URL from useDocusaurusContext
 */
export const createClientForUrl = (
  baseURL: string,
  apiBaseUrl: string,
  frontendUrl: string | string[]
) => {
  const cacheKey = `${baseURL}-${apiBaseUrl}-${JSON.stringify(frontendUrl)}`;
  if (!clientCache.has(cacheKey)) {
    const trustedOrigins = [
      ...(Array.isArray(frontendUrl) ? frontendUrl : [frontendUrl]),
      apiBaseUrl,
      baseURL,
    ].filter((origin, index, self) => self.indexOf(origin) === index); // Remove duplicates

    clientCache.set(cacheKey, createAuthClient({
      baseURL,
      trustedOrigins, // Pass trusted origins to the frontend client
      fetchOptions: {
        credentials: 'include', // Always include cookies for session management
        // CRITICAL: Disable ALL caching to ensure session state updates immediately
        cache: 'no-store',
        // CRITICAL: Add cache-busting headers to prevent browser from using cached responses
        // NOTE: Only use request headers here (Cache-Control, Pragma), NOT response headers (Expires)
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        // CRITICAL: Override fetch to add timestamp for cache busting
        customFetchImpl: async (url, init) => {
          const urlObj = new URL(url);
          urlObj.searchParams.set('_t', Date.now().toString());
          return fetch(urlObj.toString(), init);
        },
        onSuccess: async (context) => {
          // Check if the backend sent a JWT token in the set-auth-token header
          const token = context.response.headers.get('set-auth-token');
          if (token) {
            const decodedToken = decodeURIComponent(token);
            console.log('[AUTH] JWT token received from server, storing...');
            setAuthToken(decodedToken);
          } else {
            // Fallback: If no token in header and this was a sign-in, try fetching it
            const url = context.request?.url || '';
            if (url.includes('/sign-in/')) {
              console.log('[AUTH] No token in header, attempting to fetch JWT token...');

              // Wait a moment for session to be established
              await new Promise(resolve => setTimeout(resolve, 500));

              // Get JWT token using the session (cookies)
              try {
                const tokenResponse = await fetch(`${baseURL}/api/auth/token?_t=${Date.now()}`, {
                  method: 'GET',
                  credentials: 'include', // Send cookies
                  cache: 'no-store',
                  headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                  },
                });

                if (tokenResponse.ok) {
                  const tokenData = await tokenResponse.json();
                  if (tokenData?.token) {
                    console.log('[AUTH] JWT token obtained successfully via fallback');
                    setAuthToken(tokenData.token);
                  }
                } else {
                  console.warn('[AUTH] Failed to get JWT token:', tokenResponse.status);
                }
              } catch (error) {
                console.error('[AUTH] Error fetching JWT token:', error);
              }
            }
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
    const response = await fetch(`${baseURL}/api/auth/token?_t=${Date.now()}`, {
      method: 'GET',
      credentials: 'include', // Send cookies with session
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
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
