/**
 * OAuth Callback Handler - OAuth Proxy Session-Based Auth
 * Handles the OAuth callback using Better Auth's OAuth Proxy plugin
 *
 * Flow with OAuth Proxy:
 * 1. Frontend initiates OAuth on auth service via /api/auth/oauth-proxy endpoint
 * 2. OAuth Proxy redirects user to OAuth provider (with proxy URL)
 * 3. OAuth provider redirects back to OAuth Proxy endpoint on auth service
 * 4. OAuth Proxy validates OAuth response and creates session
 * 5. OAuth Proxy encrypts session cookies in URL and redirects to frontend /auth-callback
 * 6. This page decrypts the URL-based session and establishes authentication
 *
 * The OAuth Proxy plugin solves cross-domain authentication by:
 * - Proxying OAuth requests between different Vercel domains
 * - Encrypting cookies in URL parameters (secure, only decrypt on receiving server)
 * - Allowing session to be transferred across domains without direct cookie sharing
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
      console.log('[AUTH-CALLBACK] Processing OAuth callback via OAuth Proxy...');

      try {
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/docs/intro';

        // Wait briefly for session to be established by OAuth Proxy
        // OAuth Proxy transfers cookies in URL parameters, which are automatically processed
        console.log('[AUTH-CALLBACK] Waiting for session to be established by OAuth Proxy...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refetch session to get the authenticated state transferred by OAuth Proxy
        console.log('[AUTH-CALLBACK] Refetching session after OAuth Proxy...');
        await refetch();

        // Check if we have an authenticated session
        const sessionResult = await authClient.getSession({
          fetchOptions: {
            credentials: 'include',
          }
        });

        console.log('[AUTH-CALLBACK] Session fetch result:', {
          hasSession: !!sessionResult.data,
          hasUser: !!sessionResult.data?.user,
          userEmail: sessionResult.data?.user?.email,
        });

        if (!sessionResult.data?.user) {
          console.error('[AUTH-CALLBACK] No session found after OAuth Proxy redirect');
          setError('OAuth authentication completed but session was not established. Please try again.');
          return;
        }

        console.log('[AUTH-CALLBACK] ✓ Session established successfully via OAuth Proxy');
        console.log('[AUTH-CALLBACK] User authenticated:', sessionResult.data.user.email);

        console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
        history.push(redirectTo);
      } catch (err) {
        console.error('[AUTH-CALLBACK] Error during OAuth callback:', err);
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
