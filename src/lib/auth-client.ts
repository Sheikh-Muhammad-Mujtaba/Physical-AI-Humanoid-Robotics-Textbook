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


