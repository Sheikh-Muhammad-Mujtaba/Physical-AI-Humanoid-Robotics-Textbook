import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../src/auth.js';

/**
 * OAuth Callback Handler - One-Time Token Bridge for Cross-Domain Auth
 *
 * This endpoint handles OAuth callbacks from Google/GitHub and generates
 * a one-time token to bridge the cross-domain authentication gap.
 *
 * Flow:
 * 1. User clicks "Login with Google"
 * 2. Frontend initiates OAuth via signIn.social() on frontend domain
 * 3. OAuth provider redirects back to /api/auth/callback/{provider} on auth service domain
 * 4. Better Auth validates OAuth code and creates session cookie
 * 5. Better Auth redirects to this endpoint (callbackURL configured in auth.ts)
 * 6. We verify the session exists and generate a one-time token
 * 7. Redirect to frontend with token as URL parameter: /auth-callback?token=xxx
 * 8. Frontend verifies the token to establish authentication
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')[0].trim()
      : 'http://localhost:3000';

    console.log('[OAUTH-CALLBACK] Handler started');
    console.log('[OAUTH-CALLBACK] Frontend URL:', frontendUrl);
    console.log('[OAUTH-CALLBACK] Request URL:', req.url);
    console.log('[OAUTH-CALLBACK] Request headers:', Object.keys(req.headers));

    // Convert Vercel request to Web Request for Better Auth
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : undefined,
    });

    // Get current session to verify user is authenticated
    console.log('[OAUTH-CALLBACK] Checking session...');
    const session = await auth.api.getSession({
      headers: webRequest.headers,
    });

    console.log('[OAUTH-CALLBACK] Session check result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user) {
      console.error('[OAUTH-CALLBACK] No session found after OAuth callback');
      return res.status(401).json({
        error: 'OAuth authentication failed',
        message: 'Session not established after OAuth callback',
      });
    }

    console.log('[OAUTH-CALLBACK] Session verified, user:', session.user.email);

    // Generate one-time token for this authenticated session
    console.log('[OAUTH-CALLBACK] Generating one-time token...');
    const tokenResponse = await auth.api.generateOneTimeToken({
      headers: webRequest.headers,
    });

    console.log('[OAUTH-CALLBACK] Token generation response:', {
      status: tokenResponse.status,
      token: tokenResponse.token ? `${tokenResponse.token.substring(0, 20)}...` : null,
    });

    if (!tokenResponse.token) {
      console.error('[OAUTH-CALLBACK] Failed to generate one-time token');
      return res.status(500).json({
        error: 'Token generation failed',
        message: 'Could not generate one-time token for session',
      });
    }

    // Redirect to frontend with the one-time token as query parameter
    // Frontend will verify the token to establish the session
    const redirectUrl = `${frontendUrl}/auth-callback?token=${encodeURIComponent(tokenResponse.token)}`;

    console.log('[OAUTH-CALLBACK] Redirecting to frontend with token');
    console.log('[OAUTH-CALLBACK] Redirect URL:', redirectUrl);

    // Set session cookies on the redirect response
    // These will be sent with the redirect and subsequent requests
    if (tokenResponse.headers) {
      const setCookieHeaders = tokenResponse.headers.getSetCookie?.() || [];
      if (setCookieHeaders.length > 0) {
        res.setHeader('Set-Cookie', setCookieHeaders);
        console.log('[OAUTH-CALLBACK] Setting cookies:', setCookieHeaders.length);
      }
    }

    res.redirect(307, redirectUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[OAUTH-CALLBACK] Error:', {
      message: errorMessage,
      stack: errorStack,
      type: error?.constructor?.name,
    });

    res.status(500).json({
      error: 'OAuth callback processing failed',
      message: errorMessage,
    });
  }
}
