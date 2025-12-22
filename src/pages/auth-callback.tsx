/**
 * OAuth Callback Handler - One-Time Token Verification
 * Handles the OAuth callback and verifies the one-time token for cross-domain auth
 * Flow:
 * 1. OAuth provider redirects back to auth service's /api/auth/callback/{provider}
 * 2. Better Auth validates the OAuth code and creates a session
 * 3. Our custom /api/oauth-callback endpoint generates a one-time token
 * 4. Auth service redirects to frontend /auth-callback with token as URL param
 * 5. This page verifies the token to establish the session on the frontend domain
 */

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, DEV_AUTH_URL, DEV_API_BASE_URL } from '../lib/auth-client';
import styles from './auth.module.css';

export default function AuthCallbackPage(): React.ReactElement {
  const { siteConfig } = useDocausaurusContext();
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
      console.log('[AUTH-CALLBACK] Processing OAuth callback with one-time token...');

      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const redirectTo = searchParams.get('redirect') || '/docs/intro';

        if (!token) {
          console.error('[AUTH-CALLBACK] No one-time token found in URL parameters');
          setError('Invalid callback: Missing authentication token. Please try logging in again.');
          return;
        }

        console.log('[AUTH-CALLBACK] One-time token found:', `${token.substring(0, 20)}...`);
        console.log('[AUTH-CALLBACK] Verifying token with auth service...');

        // Verify the one-time token
        // This exchanges the token for a verified session
        const verifyResult = await authClient.oneTimeToken.verify({
          token,
        });

        console.log('[AUTH-CALLBACK] Token verification result:', {
          hasError: !!verifyResult.error,
          error: verifyResult.error,
          hasSession: !!verifyResult.data,
        });

        if (verifyResult.error) {
          console.error('[AUTH-CALLBACK] Token verification failed:', verifyResult.error);
          setError(`Token verification failed: ${verifyResult.error}. Please try logging in again.`);
          return;
        }

        if (!verifyResult.data?.user) {
          console.error('[AUTH-CALLBACK] Token verified but no user session found');
          setError('Token verified but user session could not be established. Please try logging in again.');
          return;
        }

        console.log('[AUTH-CALLBACK] ✓ Token verified successfully');
        console.log('[AUTH-CALLBACK] User authenticated:', verifyResult.data.user.email);

        // Refetch session to update AuthProvider state
        console.log('[AUTH-CALLBACK] Refreshing session state...');
        await refetch();

        console.log('[AUTH-CALLBACK] Redirecting to:', redirectTo);
        history.push(redirectTo);
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
