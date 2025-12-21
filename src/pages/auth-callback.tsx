/**
 * OAuth Callback Handler - Session-Based Auth
 * Handles the OAuth callback and waits for session cookies to be set
 * Better Auth automatically sets secure httpOnly cookies on OAuth success
 */

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, DEV_AUTH_URL, DEV_API_BASE_URL } from '../lib/auth-client';
import styles from './auth.module.css';

export default function AuthCallbackPage(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;

  // Get frontend URL (use current origin in browser, fallback to siteConfig.url)
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : siteConfig.url;

  // Get API base URL from config
  const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;

  const authClient = useMemo(() => createClientForUrl(authUrl, apiBaseUrl, frontendUrl), [authUrl, apiBaseUrl, frontendUrl]);
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState('');
  const { refetch } = authClient.useSession();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AUTH-CALLBACK] Processing OAuth callback with frontend-owned callback pattern...');

      try {
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/docs/intro';
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors from provider
        if (error) {
          console.error('[AUTH-CALLBACK] OAuth provider error:', error, errorDescription);
          setError(`OAuth authentication failed: ${error}${errorDescription ? ' - ' + errorDescription : ''}`);
          return;
        }

        // For the frontend-owned callback pattern, we just need to verify the session
        // The frontend OAuth callback endpoint (/api/oauth/callback) has already:
        // 1. Received the code and state from OAuth provider
        // 2. Validated them
        // 3. Redirected us here

        console.log('[AUTH-CALLBACK] Frontend-owned callback received. Code:', code ? 'present' : 'missing');
        console.log('[AUTH-CALLBACK] Waiting for session to be established...');

        // Wait for session cookies to be set by the browser
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Attempt to get session multiple times (retry logic)
        let sessionResult = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          console.log(`[AUTH-CALLBACK] Session check attempt ${attempts + 1}/${maxAttempts}...`);

          try {
            sessionResult = await authClient.getSession({
              fetchOptions: {
                credentials: 'include',
              }
            });

            console.log('[AUTH-CALLBACK] Session check result:', sessionResult);

            if (sessionResult.data?.user) {
              console.log('[AUTH-CALLBACK] ✓ Session established successfully via OAuth.');
              console.log('[AUTH-CALLBACK] User:', sessionResult.data.user.email);
              console.log('[AUTH-CALLBACK] Refetching session in provider...');

              // Refetch session to update AuthProvider state
              await refetch();

              console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
              history.push(redirectTo);
              return;
            }
          } catch (checkErr) {
            console.warn(`[AUTH-CALLBACK] Session check attempt ${attempts + 1} failed:`, checkErr);
          }

          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // No session found after retries
        console.error('[AUTH-CALLBACK] Failed to establish session after OAuth callback.');
        setError('OAuth authentication completed but session was not established. The auth server may be having issues. Please try again.');
      } catch (err) {
        console.error('[AUTH-CALLBACK] Error during callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed unexpectedly');
      }
    };

    handleCallback();
  }, [authClient, history, location, refetch]);

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
