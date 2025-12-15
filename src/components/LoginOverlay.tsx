/**
 * Login Overlay Component
 * Shows login form when user tries to access protected content
 * Responsive design with header/footer visible
 */

import React, { useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, setAuthToken } from '../lib/auth-client';

export default function LoginOverlay() {
  const { siteConfig } = useDocusaurusContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Get auth URL from Docusaurus config (set via BETTER_AUTH_URL env var)
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || 'http://localhost:3001';

  // Create auth client with the correct URL
  const authClient = useMemo(() => createClientForUrl(authUrl), [authUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: async () => {
            try {
              const tokenResult = await authClient.token();
              if (tokenResult.data?.token) {
                setAuthToken(tokenResult.data.token);
              }
            } catch (tokenError) {
              // Token fetch failed, but login succeeded
            }
            window.location.reload();
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
      // Use full URL for OAuth callback (origin + pathname)
      const callbackURL = window.location.origin + window.location.pathname;
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <Layout title="Sign In Required" description="Please sign in to access this content">
      <div className="login-overlay-container">
        <div className="login-overlay-card">
          <h1 className="login-overlay-title">Sign In Required</h1>
          <p className="login-overlay-subtitle">
            Please sign in to access the Physical AI & Humanoid Robotics textbook
          </p>

          {error && <div className="login-overlay-error">{error}</div>}

          {/* Social Login Buttons */}
          <div className="login-overlay-social">
            <button
              type="button"
              className="login-overlay-social-btn login-overlay-google"
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {socialLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              className="login-overlay-social-btn login-overlay-github"
              onClick={() => handleSocialLogin('github')}
              disabled={!!socialLoading || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {socialLoading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </button>
          </div>

          <div className="login-overlay-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="login-overlay-form">
            <div className="login-overlay-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading || !!socialLoading}
              />
            </div>

            <div className="login-overlay-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading || !!socialLoading}
              />
            </div>

            <button
              type="submit"
              className="login-overlay-submit"
              disabled={isLoading || !!socialLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-overlay-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>

        <style>{`
          .login-overlay-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 120px);
            padding: 2rem 1rem;
          }

          .login-overlay-card {
            background: var(--ifm-card-background-color);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
          }

          .login-overlay-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            text-align: center;
            color: var(--ifm-heading-color);
          }

          .login-overlay-subtitle {
            color: var(--ifm-color-secondary-darkest);
            text-align: center;
            margin: 0 0 1.5rem 0;
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .login-overlay-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            text-align: center;
          }

          .login-overlay-social {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .login-overlay-social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid var(--ifm-color-emphasis-300);
            background: var(--ifm-background-color);
            color: var(--ifm-font-color-base);
            width: 100%;
          }

          .login-overlay-social-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .login-overlay-social-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .login-overlay-google {
            border-color: #4285f4;
          }

          .login-overlay-google:hover:not(:disabled) {
            background: rgba(66, 133, 244, 0.05);
          }

          .login-overlay-github {
            border-color: #333;
          }

          .login-overlay-github:hover:not(:disabled) {
            background: rgba(51, 51, 51, 0.05);
          }

          .login-overlay-divider {
            display: flex;
            align-items: center;
            margin: 1.5rem 0;
            color: var(--ifm-color-secondary-darkest);
            font-size: 0.8rem;
          }

          .login-overlay-divider::before,
          .login-overlay-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--ifm-color-emphasis-300);
          }

          .login-overlay-divider span {
            padding: 0 1rem;
          }

          .login-overlay-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .login-overlay-field {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }

          .login-overlay-field label {
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--ifm-font-color-base);
          }

          .login-overlay-field input {
            padding: 0.7rem 0.9rem;
            border: 1px solid var(--ifm-color-emphasis-300);
            border-radius: 8px;
            font-size: 0.95rem;
            background: var(--ifm-background-color);
            color: var(--ifm-font-color-base);
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .login-overlay-field input:focus {
            outline: none;
            border-color: var(--ifm-color-primary);
            box-shadow: 0 0 0 3px var(--ifm-color-primary-lighter);
          }

          .login-overlay-field input:disabled {
            background: var(--ifm-color-emphasis-100);
            cursor: not-allowed;
          }

          .login-overlay-submit {
            padding: 0.8rem 1.5rem;
            background: var(--ifm-color-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 0.5rem;
            transition: background 0.2s;
          }

          .login-overlay-submit:hover:not(:disabled) {
            background: var(--ifm-color-primary-dark);
          }

          .login-overlay-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .login-overlay-footer {
            margin-top: 1.5rem;
            text-align: center;
            padding-top: 1.5rem;
            border-top: 1px solid var(--ifm-color-emphasis-200);
          }

          .login-overlay-footer p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--ifm-color-secondary-darkest);
          }

          .login-overlay-footer a {
            color: var(--ifm-color-primary);
            font-weight: 500;
            text-decoration: none;
          }

          .login-overlay-footer a:hover {
            text-decoration: underline;
          }

          /* Dark mode */
          [data-theme='dark'] .login-overlay-card {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          [data-theme='dark'] .login-overlay-error {
            background: rgba(220, 38, 38, 0.1);
            border-color: rgba(220, 38, 38, 0.3);
          }

          /* Tablet styles */
          @media (max-width: 768px) {
            .login-overlay-container {
              padding: 1.5rem;
              min-height: calc(100vh - 120px);
            }

            .login-overlay-card {
              padding: 2rem;
              max-width: 380px;
            }

            .login-overlay-title {
              font-size: 1.35rem;
            }

            .login-overlay-subtitle {
              font-size: 0.85rem;
            }
          }

          /* Mobile styles */
          @media (max-width: 480px) {
            .login-overlay-container {
              padding: 1rem;
              min-height: calc(100vh - 100px);
              align-items: flex-start;
              padding-top: 2rem;
            }

            .login-overlay-card {
              padding: 1.25rem;
              border-radius: 10px;
              max-width: 100%;
            }

            .login-overlay-title {
              font-size: 1.25rem;
              margin-bottom: 0.25rem;
            }

            .login-overlay-subtitle {
              font-size: 0.8rem;
              margin-bottom: 1rem;
            }

            .login-overlay-social {
              gap: 0.6rem;
              margin-bottom: 1rem;
            }

            .login-overlay-social-btn {
              font-size: 0.85rem;
              padding: 0.6rem 0.75rem;
              border-radius: 6px;
              gap: 0.6rem;
            }

            .login-overlay-social-btn svg {
              width: 18px;
              height: 18px;
            }

            .login-overlay-divider {
              margin: 1rem 0;
              font-size: 0.75rem;
            }

            .login-overlay-form {
              gap: 0.85rem;
            }

            .login-overlay-field {
              gap: 0.3rem;
            }

            .login-overlay-field label {
              font-size: 0.8rem;
            }

            .login-overlay-field input {
              padding: 0.6rem 0.8rem;
              font-size: 0.9rem;
              border-radius: 6px;
            }

            .login-overlay-submit {
              padding: 0.7rem 1rem;
              font-size: 0.9rem;
              border-radius: 6px;
            }

            .login-overlay-error {
              padding: 0.6rem 0.75rem;
              font-size: 0.8rem;
              border-radius: 6px;
            }

            .login-overlay-footer {
              margin-top: 1rem;
              padding-top: 1rem;
            }

            .login-overlay-footer p {
              font-size: 0.8rem;
            }
          }

          /* Extra small screens */
          @media (max-width: 360px) {
            .login-overlay-container {
              padding: 0.75rem;
              padding-top: 1.5rem;
            }

            .login-overlay-card {
              padding: 1rem;
            }

            .login-overlay-title {
              font-size: 1.15rem;
            }

            .login-overlay-social-btn {
              font-size: 0.8rem;
              padding: 0.55rem 0.65rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
