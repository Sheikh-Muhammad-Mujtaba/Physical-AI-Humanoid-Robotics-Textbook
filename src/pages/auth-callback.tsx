/**
 * OAuth Callback Handler
 * Handles the OAuth callback, extracts token from URL params or makes a token request
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
      console.log('[AUTH-CALLBACK] Processing OAuth callback...');

      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const redirectTo = searchParams.get('redirect') || '/docs/intro';

        if (token) {
          console.log('[AUTH-CALLBACK] Found token in URL, verifying with oneTimeToken...');
          const { error: verifyError } = await authClient.oneTimeToken.verify({ token });

          if (verifyError) {
            console.error('[AUTH-CALLBACK] One-time token verification failed:', verifyError);
            setError('Session verification failed. The link may have expired.');
            return;
          }

          console.log('[AUTH-CALLBACK] One-time token verified successfully. Refetching session...');
          // Refetch session to update AuthProvider state
          await refetch();
          console.log('[AUTH-CALLBACK] Session refetched. Redirecting to:', redirectTo);
          history.push(redirectTo);
          return;
        }
        
        // Fallback for cookie-based flow if no token is present
        console.log('[AUTH-CALLBACK] No token in URL, attempting cookie-based session check...');
        console.log('[AUTH-CALLBACK] Waiting briefly for cookies to propagate...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Shorter wait

        const sessionResult = await authClient.getSession({
          fetchOptions: {
            credentials: 'include',
          }
        });

        console.log('[AUTH-CALLBACK] Session check result:', sessionResult);

        if (sessionResult.data?.user) {
          console.log('[AUTH-CALLBACK] Session established successfully via cookie.');
          console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
          history.push(redirectTo);
          return;
        }

        // No session found
        console.error('[AUTH-CALLBACK] No session found after OAuth callback (neither token nor cookie).');
        setError('OAuth authentication completed but session was not established. Please try again.');
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
