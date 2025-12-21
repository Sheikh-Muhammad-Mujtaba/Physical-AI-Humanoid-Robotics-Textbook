import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * OAuth Callback Handler - Session-Based Auth
 *
 * This endpoint handles the OAuth callback on the auth service domain.
 * Better Auth automatically redirects here after successful OAuth and sets the session cookie.
 * We then redirect to the frontend with the session established.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')[0].trim()
      : 'http://localhost:3000';

    // Get redirect target from query params or default to /auth-callback on frontend
    const redirectPath = req.query.redirect || '/auth-callback';
    const targetUrl = `${frontendUrl}${redirectPath}`;

    console.log(`[AUTH-CALLBACK] Redirecting from auth service to frontend: ${targetUrl}`);
    console.log(`[AUTH-CALLBACK] Session cookie should be preserved in subsequent requests`);
    console.log(`[AUTH-CALLBACK] FRONTEND_URL: ${frontendUrl}`);
    console.log(`[AUTH-CALLBACK] Request URL: ${req.url}`);

    // Redirect to frontend
    // The session cookie (set by Better Auth) will be automatically included in the redirect
    // because it was set on the auth service domain and this redirect maintains the domain context
    res.redirect(307, targetUrl);
  } catch (error) {
    console.error('[AUTH-CALLBACK] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Redirect failed',
      message: errorMessage,
    });
  }
}
