/**
 * Login Page
 * Handles user authentication via email/password and social providers
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, DEV_AUTH_URL, DEV_API_BASE_URL } from '../lib/auth-client';
import styles from './auth.module.css';

export default function LoginPage(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;

  // Get frontend URL for OAuth callbacks (use current origin in browser, fallback to siteConfig.url)
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : siteConfig.url;

  // Get API base URL from config
  const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;

  const authClient = useMemo(() => createClientForUrl(authUrl, apiBaseUrl, frontendUrl), [authUrl, apiBaseUrl, frontendUrl]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);
  const history = useHistory();
  const { data: session, isPending, refetch } = authClient.useSession();

  // Redirect if already logged in - use ref to ensure single redirect
  useEffect(() => {
    // Only redirect if session is fully loaded (not pending) and user exists
    // Use ref to guarantee only one redirect happens
    if (!hasRedirectedRef.current && session?.user && !isPending) {
      console.log('[LOGIN] User already authenticated, redirecting to /docs/intro');
      hasRedirectedRef.current = true;
      history.push('/docs/intro');
    }
  }, [session?.user, isPending, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            // Refetch session to update UI
            await refetch();

            // Redirect to dashboard
            history.push('/docs/intro');
          },
          onError: (ctx) => {
            setError(ctx.error?.message || 'Sign in failed. Please check your credentials.');
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    setSocialLoading(provider);

    try {
      // Better Auth OAuth flow:
      // 1. signIn.social() initiates OAuth with the auth service
      // 2. Better Auth handles the full OAuth flow server-side
      // 3. Session cookie is set on auth service domain by Better Auth
      // 4. Browser automatically includes cookies in cross-origin requests (credentials: include)
      // 5. Frontend can read the session via getSession()

      await authClient.signIn.social({
        provider,
      });
      // Note: Code after this line won't execute because social login causes a redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  if (isPending) {
    return (
      <Layout title="Sign In">
        <div className={styles.authContainer}>
          <div className={styles.loadingSpinner}>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sign In" description="Sign in to access the textbook">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Sign In</h1>
          <p className={styles.authSubtitle}>
            Sign in to access the Physical AI & Humanoid Robotics textbook
          </p>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={`${styles.socialButton} ${styles.googleButton}`}
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading || isLoading}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {socialLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              className={`${styles.socialButton} ${styles.githubButton}`}
              onClick={() => handleSocialLogin('github')}
              disabled={!!socialLoading || isLoading}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {socialLoading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </button>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={styles.input}
                disabled={isLoading || !!socialLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={styles.input}
                disabled={isLoading || !!socialLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !!socialLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className={styles.authLink}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
