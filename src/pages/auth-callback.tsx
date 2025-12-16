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

        // Wait a moment for the OAuth flow to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to get session - the onSuccess handler in auth-client will capture the Bearer token
        // from set-auth-token header automatically
        let sessionResult;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          try {
            console.log(`[AUTH-CALLBACK] Checking session (attempt ${retries + 1}/${maxRetries})...`);

            sessionResult = await authClient.getSession({
              fetchOptions: {
                onSuccess: (ctx) => {
                  // The global onSuccess handler already captures set-auth-token
                  // But we can also capture it here for redundancy
                  const token = ctx.response.headers.get('set-auth-token');
                  if (token) {
                    console.log('[AUTH-CALLBACK] Token captured from session check');
                    setAuthToken(decodeURIComponent(token));
                  }
                }
              }
            });

            if (sessionResult.data) {
              console.log('[AUTH-CALLBACK] Session established successfully');
              break;
            }

            console.warn('[AUTH-CALLBACK] No session data, retrying...');
          } catch (err) {
            console.error(`[AUTH-CALLBACK] Session check attempt ${retries + 1} failed:`, err);

            if (retries < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          retries++;
        }

        if (sessionResult?.data) {
          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          console.log('[AUTH-CALLBACK] Authentication successful, redirecting to:', redirectTo);
          history.push(redirectTo);
        } else {
          console.error('[AUTH-CALLBACK] Failed to establish session after all retries');
          setError('Authentication completed but session could not be established. Please try signing in again.');
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
