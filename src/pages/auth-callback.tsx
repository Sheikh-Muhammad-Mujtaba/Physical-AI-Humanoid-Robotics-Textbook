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

        // Check if we came from OAuth flow
        const from = searchParams.get('from');
        if (from !== 'oauth') {
          console.log('[AUTH-CALLBACK] Not an OAuth callback, redirecting...');
          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          history.push(redirectTo);
          return;
        }

        // Wait longer for the OAuth flow to complete and session to be established
        console.log('[AUTH-CALLBACK] Waiting for OAuth session to establish...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to get token directly using the JWT plugin
        let tokenResult;
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
          try {
            console.log(`[AUTH-CALLBACK] Attempt ${retries + 1}/${maxRetries}...`);

            // First try to get the token directly
            tokenResult = await authClient.token({
              fetchOptions: {
                credentials: 'include', // Include cookies
              }
            });

            console.log('[AUTH-CALLBACK] Token response:', tokenResult);

            if (tokenResult.data?.token) {
              console.log('[AUTH-CALLBACK] Token received successfully');
              setAuthToken(tokenResult.data.token);

              // Verify we can get session with this token
              const sessionResult = await authClient.getSession();
              if (sessionResult.data) {
                console.log('[AUTH-CALLBACK] Session verified with token');
                const redirectTo = searchParams.get('redirect') || '/docs/intro';
                console.log('[AUTH-CALLBACK] Authentication successful, redirecting to:', redirectTo);
                history.push(redirectTo);
                return;
              }
            }

            console.log('[AUTH-CALLBACK] No token in response, retrying...');
          } catch (err) {
            console.error(`[AUTH-CALLBACK] Attempt ${retries + 1} failed:`, err);
          }

          if (retries < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          retries++;
        }

        console.error('[AUTH-CALLBACK] Failed to get token after all retries');
        setError('Authentication completed but token could not be retrieved. This may be due to cross-domain restrictions. Please try signing in again.');
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
