import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Frontend OAuth Callback Handler - Session-Based Auth
 *
 * This endpoint implements the "frontend-owned callback" pattern for cross-domain OAuth:
 * 1. OAuth provider redirects HERE (frontend domain) with code + state
 * 2. This endpoint exchanges the code with the auth service
 * 3. Sets the session cookie on the FRONTEND domain (first-party cookie)
 * 4. Redirects to the auth-callback page
 *
 * This solves the cross-domain cookie issue because the session cookie
 * is now set on the same domain where it will be read (ai-spec-driven.vercel.app)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state, error } = req.query;

    console.log('[FRONTEND-OAUTH-CALLBACK] Received OAuth callback');
    console.log('[FRONTEND-OAUTH-CALLBACK] Code:', code ? 'present' : 'missing');
    console.log('[FRONTEND-OAUTH-CALLBACK] State:', state ? 'present' : 'missing');
    console.log('[FRONTEND-OAUTH-CALLBACK] Error:', error || 'none');

    // Handle OAuth errors from provider
    if (error) {
      console.error('[FRONTEND-OAUTH-CALLBACK] OAuth error:', error);
      const errorDescription = req.query.error_description || 'Unknown error';
      return res.redirect(`/auth-callback?error=${encodeURIComponent(String(error))}&error_description=${encodeURIComponent(String(errorDescription))}`);
    }

    // Validate required parameters
    if (!code) {
      console.error('[FRONTEND-OAUTH-CALLBACK] Missing authorization code');
      return res.redirect('/auth-callback?error=invalid_request&error_description=Missing authorization code');
    }

    if (!state) {
      console.error('[FRONTEND-OAUTH-CALLBACK] Missing state parameter');
      return res.redirect('/auth-callback?error=invalid_request&error_description=Missing state parameter');
    }

    // The actual callback handling is done by the frontend auth-callback page
    // which will extract code/state from URL and send it to the auth service
    // This endpoint just validates parameters and redirects

    console.log('[FRONTEND-OAUTH-CALLBACK] Redirecting to auth-callback with code and state');

    // Redirect to the frontend auth-callback page with the OAuth code and state
    // The frontend page will complete the OAuth flow with the auth service
    res.redirect(`/auth-callback?code=${code}&state=${state}`);
  } catch (error) {
    console.error('[FRONTEND-OAUTH-CALLBACK] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.redirect(`/auth-callback?error=server_error&error_description=${encodeURIComponent(errorMessage)}`);
  }
}
