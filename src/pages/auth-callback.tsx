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
        // Wait a moment for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to get a JWT token
        console.log('[AUTH-CALLBACK] Requesting JWT token...');
        const tokenResult = await authClient.token();

        if (tokenResult.data?.token) {
          console.log('[AUTH-CALLBACK] Token received, storing...');
          setAuthToken(tokenResult.data.token);

          // Redirect to the intended destination or home
          const searchParams = new URLSearchParams(location.search);
          const redirectTo = searchParams.get('redirect') || '/docs/intro';
          console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
          history.push(redirectTo);
        } else {
          console.error('[AUTH-CALLBACK] No token in response');
          setError('Authentication completed but no token received. Please try logging in again.');
        }
      } catch (err) {
        console.error('[AUTH-CALLBACK] Error during callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
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
