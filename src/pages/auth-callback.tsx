/**
 * OAuth Callback Handler
 * Handles the OAuth callback, extracts token from URL params or makes a token request
 */

import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, setAuthToken, DEV_AUTH_URL, DEV_API_BASE_URL } from '../lib/auth-client';
import styles from './auth.module.css';

export default function AuthCallbackPage(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;

  // Get frontend URL (use current origin in browser, fallback to siteConfig.url)
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : siteConfig.url;

  // Get API base URL from config
  const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;

  const authClient = createClientForUrl(authUrl, apiBaseUrl, frontendUrl);
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AUTH-CALLBACK] Processing OAuth callback...');

      try {
        const searchParams = new URLSearchParams(location.search);

        // Check if we came from OAuth flow
        const from = searchParams.get('from');
        if (from !== 'oauth') {
          console.log('[AUTH-CALLBACK] Not an OAuth callback, redirecting...');
          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          history.push(redirectTo);
          return;
        }

        // BetterAuth OAuth flow:
        // 1. User clicks "Sign in with Google" on frontend
        // 2. Frontend calls signIn.social() which redirects to auth service
        // 3. Auth service redirects to Google OAuth
        // 4. Google redirects back to auth service /callback/google with auth code
        // 5. Auth service exchanges code for tokens, creates session, sets cookies
        // 6. Auth service redirects here (frontend /auth-callback?from=oauth)
        // 7. Session cookies should already be set by auth service

        console.log('[AUTH-CALLBACK] Waiting briefly for cookies to propagate...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if session exists (cookies should be set by auth service)
        const sessionResult = await authClient.getSession({
          fetchOptions: {
            credentials: 'include',
          }
        });

        console.log('[AUTH-CALLBACK] Session check result:', sessionResult);

        if (sessionResult.data?.user) {
          console.log('[AUTH-CALLBACK] Session established successfully');

          // Try to get JWT token for backend API calls
          try {
            const tokenResult = await authClient.token({
              fetchOptions: {
                credentials: 'include',
              }
            });

            if (tokenResult.data?.token) {
              console.log('[AUTH-CALLBACK] JWT token obtained');
              setAuthToken(tokenResult.data.token);
            }
          } catch (tokenErr) {
            console.warn('[AUTH-CALLBACK] Could not get JWT token, but session exists:', tokenErr);
            // Continue anyway - session cookies are enough for auth
          }

          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
          history.push(redirectTo);
          return;
        }

        // No session found
        console.error('[AUTH-CALLBACK] No session found after OAuth callback');
        setError('OAuth authentication completed but session was not established. This may be a cookie issue. Please try again or use email/password login.');
      } catch (err) {
        console.error('[AUTH-CALLBACK] Error during callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed unexpectedly');
      }
    };

    handleCallback();
  }, [authClient, history, location]);

  if (error) {
    return (
      <Layout title="Authentication Error">
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>Authentication Error</h1>
            <div className={styles.errorMessage}>{error}</div>
            <a href="/login" className={styles.authLink}>
              Try Again
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Completing Sign In">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.loadingSpinner}>
            <div>Completing sign in...</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
