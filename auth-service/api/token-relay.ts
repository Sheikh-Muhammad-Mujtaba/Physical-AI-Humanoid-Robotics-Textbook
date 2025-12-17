import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../src/auth.js';

/**
 * Token Relay Endpoint
 *
 * This endpoint is used as the OAuth callback to extract the token from headers
 * and pass it to the frontend via URL parameters (since browsers can't read redirect headers).
 *
 * Flow:
 * 1. OAuth provider redirects to auth service /callback
 * 2. Auth service processes OAuth and redirects here with set-auth-token header
 * 3. This endpoint extracts the token from headers
 * 4. Redirects to frontend with token in URL
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TOKEN-RELAY] Received request');

  // Get the token from the session
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    console.log('[TOKEN-RELAY] Session:', { hasSession: !!session });

    if (session?.session) {
      // Get JWT token
      const tokenResponse = await auth.api.token({
        headers: req.headers as any,
      });

      console.log('[TOKEN-RELAY] Token response:', { hasToken: !!tokenResponse });

      if (tokenResponse) {
        // Extract redirect URL from query params
        const redirectTo = (req.query.redirect as string) || '/docs/intro';
        const frontendUrl = process.env.FRONTEND_URL;

        // Ensure tokenResponse has a token property
        if (typeof tokenResponse === 'object' && tokenResponse !== null && 'token' in tokenResponse) {
          const jwtToken = (tokenResponse as { token: string }).token; // Type assert to ensure 'token' is present
          const encodedToken = encodeURIComponent(jwtToken);

          // Redirect to frontend with token
          const redirectUrl = `${frontendUrl}/auth-callback?token=${encodedToken}&redirect=${encodeURIComponent(redirectTo)}`;

          console.log('[TOKEN-RELAY] Redirecting to:', redirectUrl);
          res.redirect(302, redirectUrl);
          return;
        } else {
          console.error('[TOKEN-RELAY] Token response missing "token" property:', tokenResponse);
          // Fallback to error redirect if token not found in response
          const frontendUrl = process.env.FRONTEND_URL;
          res.redirect(302, `${frontendUrl}/login?error=token_missing_in_response`);
          return;
        }
      }
    }

    // If no session or token, redirect to login
    console.error('[TOKEN-RELAY] No session or token, redirecting to login');
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(302, `${frontendUrl}/login?error=no_session`);
  } catch (error) {
    console.error('[TOKEN-RELAY] Error:', error);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(302, `${frontendUrl}/login?error=token_relay_failed`);
  }
}
