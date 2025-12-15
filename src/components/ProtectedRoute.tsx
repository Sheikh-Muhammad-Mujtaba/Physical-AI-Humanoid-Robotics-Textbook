/**
 * ProtectedRoute Component
 * Wrapper that requires authentication to access children
 * Redirects to login if not authenticated
 */

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Requires authentication to render children
 *
 * @param children - Content to render when authenticated
 * @param fallback - Optional loading content while checking auth
 * @param redirectTo - Path to redirect if not authenticated (default: '/login')
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner" />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * RequireAuth - Simpler version that just hides content when not authenticated
 * Does not redirect, just shows nothing or fallback
 */
export function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * ShowWhenAuthenticated - Shows content only when authenticated
 * Useful for conditionally showing UI elements like user menus
 */
export function ShowWhenAuthenticated({
  children,
}: {
  children: ReactNode;
}): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * ShowWhenUnauthenticated - Shows content only when NOT authenticated
 * Useful for showing login/register links
 */
export function ShowWhenUnauthenticated({
  children,
}: {
  children: ReactNode;
}): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
