/**
 * UserMenu Component
 * Shows user authentication status in navbar
 * Displays login button when not authenticated, user menu when authenticated
 *
 * Note: This component uses useSession directly from auth-client instead of useAuth
 * to avoid Docusaurus router context issues when rendered in the navbar.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createClientForUrl, clearAuthToken, DEV_AUTH_URL, DEV_API_BASE_URL, DEV_FRONTEND_URL } from '../lib/auth-client';

export default function UserMenu() {
  const { siteConfig } = useDocusaurusContext();

  // Get auth URL from Docusaurus config (set via BETTER_AUTH_URL env var)
  const authUrl = (siteConfig.customFields?.betterAuthUrl as string) || DEV_AUTH_URL;

  // Get frontend URL (use current origin in browser, fallback to siteConfig.url)
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : (siteConfig.url || DEV_FRONTEND_URL);

  // Get API base URL from config
  const apiBaseUrl = (siteConfig.customFields?.apiBaseUrl as string) || DEV_API_BASE_URL;

  // Create auth client with the correct URL
  const authClient = useMemo(() => createClientForUrl(authUrl, apiBaseUrl, frontendUrl), [authUrl, apiBaseUrl, frontendUrl]);

  const { data: session, isPending } = authClient.useSession({
    query: {
      disableCookieCache: true, // Force fresh session from database
    },
  });
  const user = session?.user;
  const isAuthenticated = !!user;
  const isLoading = isPending;

  // DETAILED LOGGING for debugging
  console.log('[USER-MENU] Session State:', {
    hasSession: !!session,
    hasUser: !!user,
    isPending,
    isAuthenticated,
    userData: user || null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      // Use BetterAuth's signOut method - it handles cookie clearing via Set-Cookie headers
      await authClient.signOut({
        fetchOptions: {
          credentials: 'include', // Ensure cookies are sent and received
        },
      });
    } catch (err) {
      // Sign out from server failed, continue with local cleanup
    }

    // Clear our custom auth token from localStorage
    clearAuthToken();

    // Clear all localStorage items related to auth
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        if (key.includes('auth') || key.includes('session') || key.includes('better-auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });

      // Fallback: Clear cookies client-side in case server fails
      // This handles the case where the server sign-out fails due to origin issues
      const cookiesToClear = ['better-auth.session_token', 'better-auth.session', '__Secure-better-auth.session_token'];
      cookiesToClear.forEach(cookieName => {
        // Clear for current path and root
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      });
    }

    // Redirect to login page - the server should have cleared the cookie
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="user-menu-loading">
        <div className="user-menu-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="user-menu-guest">
        <a href="/login" className="user-menu-login-btn">
          Sign In
        </a>
        <style>{`
          .user-menu-guest {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .user-menu-login-btn {
            padding: 0.4rem 1rem;
            background: var(--ifm-color-primary);
            color: white !important;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.2s;
          }
          .user-menu-login-btn:hover {
            background: var(--ifm-color-primary-dark);
            text-decoration: none;
          }
          @media (max-width: 480px) {
            .user-menu-login-btn {
              padding: 0.35rem 0.75rem;
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    );
  }

  const getInitials = () => {
    if (!user) return '??';
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return '??';
  };
  const initials = getInitials();

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.image ? (
          <img src={user.image} alt={user.name || 'User'} className="user-menu-avatar" />
        ) : (
          <div className="user-menu-initials">{initials}</div>
        )}
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-menu-name">{user?.name || 'User'}</div>
            <div className="user-menu-email">{user?.email}</div>
          </div>
          <div className="user-menu-divider" />
          <button
            className="user-menu-item user-menu-signout"
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      <style>{`
        .user-menu {
          position: relative;
        }

        .user-menu-loading {
          display: flex;
          align-items: center;
          padding: 0.5rem;
        }

        .user-menu-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--ifm-color-emphasis-200);
          border-top-color: var(--ifm-color-primary);
          border-radius: 50%;
          animation: user-menu-spin 1s linear infinite;
        }

        @keyframes user-menu-spin {
          to { transform: rotate(360deg); }
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .user-menu-trigger:hover {
          transform: scale(1.05);
        }

        .user-menu-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-menu-initials {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--ifm-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--ifm-background-color);
          border: 1px solid var(--ifm-color-emphasis-200);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
        }

        .user-menu-header {
          padding: 0.75rem 1rem;
        }

        .user-menu-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--ifm-heading-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-menu-email {
          font-size: 0.8rem;
          color: var(--ifm-color-secondary-darkest);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-menu-divider {
          height: 1px;
          background: var(--ifm-color-emphasis-200);
        }

        .user-menu-item {
          display: block;
          width: 100%;
          padding: 0.65rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--ifm-font-color-base);
          transition: background 0.15s;
        }

        .user-menu-item:hover {
          background: var(--ifm-color-emphasis-100);
        }

        .user-menu-signout {
          color: var(--ifm-color-danger);
        }

        .user-menu-signout:hover {
          background: var(--ifm-color-danger-lightest);
        }

        [data-theme='dark'] .user-menu-dropdown {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 480px) {
          .user-menu-avatar,
          .user-menu-initials {
            width: 28px;
            height: 28px;
          }

          .user-menu-initials {
            font-size: 0.7rem;
          }

          .user-menu-dropdown {
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  );
}
