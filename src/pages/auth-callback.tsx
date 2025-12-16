/**
 * OAuth Callback Handler
 * Handles the OAuth callback, extracts token from URL params or makes a token request
 */

import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, setAuthToken, DEV_AUTH_URL } from '../lib/auth-client';
import styles from './auth.module.css';

export default function AuthCallbackPage(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;
  const authClient = createClientForUrl(authUrl);
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AUTH-CALLBACK] Processing OAuth callback...');

      try {
        const searchParams = new URLSearchParams(location.search);

        // Check if token is in URL (from token-relay endpoint)
        const tokenFromUrl = searchParams.get('token');

        if (tokenFromUrl) {
          console.log('[AUTH-CALLBACK] Token found in URL, storing...');
          setAuthToken(decodeURIComponent(tokenFromUrl));

          // Redirect to the intended destination
          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
          history.push(redirectTo);
          return;
        }

        // Fallback: Try to get token from session (for backwards compatibility)
        console.log('[AUTH-CALLBACK] No token in URL, trying session-based approach...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        let tokenResult;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          try {
            console.log(`[AUTH-CALLBACK] Attempt ${retries + 1}/${maxRetries}...`);
            tokenResult = await authClient.token();

            if (tokenResult.data?.token) {
              console.log('[AUTH-CALLBACK] Token received!');
              break;
            }

            console.warn('[AUTH-CALLBACK] No token in response, retrying...');
          } catch (err) {
            console.error(`[AUTH-CALLBACK] Token request attempt ${retries + 1} failed:`, err);

            if (retries < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          retries++;
        }

        if (tokenResult?.data?.token) {
          console.log('[AUTH-CALLBACK] Token successfully obtained, storing...');
          setAuthToken(tokenResult.data.token);

          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
          history.push(redirectTo);
        } else {
          console.error('[AUTH-CALLBACK] Failed to get token after all retries');
          setError('Authentication completed but could not obtain access token. Third-party cookies may be blocked by your browser. Please try a different browser or enable third-party cookies.');
        }
      } catch (err) {
        console.error('[AUTH-CALLBACK] Unexpected error during callback:', err);
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
