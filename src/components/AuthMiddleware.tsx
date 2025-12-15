
import React from 'react';
import { useAuth } from './AuthProvider';
import LoginOverlay from './LoginOverlay';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/blog',
];

// Check if a path is public
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }
  if (pathname.startsWith('/blog')) {
    return true;
  }
  return false;
}

// Auth middleware component - shows login overlay if not authenticated
export default function AuthMiddleware({ children, location }: { children: React.ReactNode, location: any }) {
  const { isAuthenticated, isLoading } = useAuth();

  // For public paths, always render children
  if (isPublicPath(location.pathname)) {
    return <>{children}</>;
  }

  // Show loading while checking auth - render children with loading overlay
  // This keeps the header/footer visible during loading
  if (isLoading) {
    return (
      <>
        {children}
        <div style={{
          position: 'fixed',
          top: '60px', // Below navbar
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--ifm-background-color)',
          zIndex: 100,
        }}>
          <div style={{ textAlign: 'center', color: 'var(--ifm-color-secondary-darkest)' }}>
            <div className="auth-loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--ifm-color-emphasis-200)',
              borderTopColor: 'var(--ifm-color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <div style={{ fontSize: '1rem' }}>Verifying authentication...</div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // If not authenticated, show login overlay on top of content
  if (!isAuthenticated) {
    return <LoginOverlay />;
  }

  // User is authenticated, show the content
  return <>{children}</>;
}
