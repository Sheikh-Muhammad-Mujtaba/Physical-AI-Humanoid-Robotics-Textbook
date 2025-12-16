import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../src/auth.js';

// Debug logging helper
function debugLog(context: string, data: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH-DEBUG][${timestamp}][${context}]`, JSON.stringify(data, null, 2));
}

// Extract token info for logging (without exposing full token)
function extractTokenInfo(req: VercelRequest): Record<string, unknown> {
  const authHeader = req.headers.authorization;
  const cookies = req.headers.cookie;

  return {
    hasAuthHeader: !!authHeader,
    authHeaderType: authHeader ? authHeader.split(' ')[0] : null,
    tokenPreview: authHeader ? `${authHeader.substring(0, 20)}...` : null,
    hasCookies: !!cookies,
    cookieNames: cookies ? cookies.split(';').map(c => c.trim().split('=')[0]) : [],
    hasBetterAuthCookie: cookies?.includes('better-auth') || false,
  };
}

// CORS helper - Parse allowed origins from environment
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

// Always allow the backend API
const BACKEND_API_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Add production origins if not already present
if (!allowedOrigins.includes(BACKEND_API_URL)) {
  allowedOrigins.push(BACKEND_API_URL);
}

console.log('[AUTH-API] Allowed CORS origins:', allowedOrigins);

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Log unrecognized origins for debugging
    console.log('[CORS] Unrecognized origin:', origin, 'Allowed:', allowedOrigins);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie');
  // IMPORTANT: Expose both Set-Cookie and set-auth-token headers for cross-origin requests
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, set-auth-token');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Log incoming request
  debugLog('REQUEST_START', {
    requestId,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    host: req.headers.host,
    tokenInfo: extractTokenInfo(req),
    userAgent: req.headers['user-agent'],
  });

  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    debugLog('PREFLIGHT', { requestId, status: 200 });
    res.status(200).end();
    return;
  }

  try {
    // Convert Vercel request to Web Request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    debugLog('REQUEST_DETAILS', {
      requestId,
      constructedUrl: url,
      protocol,
      host,
      originalUrl: req.url,
    });

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

    // Get body for POST/PUT requests
    let body: string | undefined;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: body,
    });

    debugLog('CALLING_AUTH_HANDLER', {
      requestId,
      webRequestMethod: webRequest.method,
      webRequestUrl: webRequest.url,
      hasBody: !!body,
      bodyPreview: body ? body.substring(0, 100) + '...' : null,
    });

    // Call Better Auth handler
    const response = await auth.handler(webRequest);

    debugLog('AUTH_HANDLER_RESPONSE', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Copy response headers
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    // For successful sign-in (email or OAuth), generate and send JWT token in response header
    // This allows the frontend to capture the token directly without relying on cookies
    const isSignInRequest = req.url?.includes('/sign-in/');
    if (isSignInRequest && response.status === 200) {
      try {
        // Try to get session from the response cookies
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          debugLog('ATTEMPTING_JWT_GENERATION', {
            requestId,
            message: 'Attempting to generate JWT token after sign-in',
          });

          // Create a new request with the session cookie to get the JWT token
          const tokenRequest = new Request(`${protocol}://${host}/api/auth/token`, {
            method: 'GET',
            headers: {
              'cookie': setCookieHeader,
            },
          });

          const tokenResponse = await auth.handler(tokenRequest);

          debugLog('JWT_TOKEN_RESPONSE', {
            requestId,
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
          });

          if (tokenResponse.status === 200) {
            const tokenText = await tokenResponse.text();
            if (tokenText) {
              try {
                const tokenData = JSON.parse(tokenText);
                if (tokenData?.token) {
                  // Send token in custom header for frontend to capture
                  res.setHeader('set-auth-token', encodeURIComponent(tokenData.token));
                  debugLog('JWT_TOKEN_SENT', {
                    requestId,
                    message: 'JWT token generated and sent in set-auth-token header',
                    tokenPreview: tokenData.token.substring(0, 20) + '...',
                  });
                }
              } catch (e) {
                debugLog('JWT_TOKEN_PARSE_ERROR', {
                  requestId,
                  error: String(e),
                });
              }
            }
          } else {
            debugLog('JWT_TOKEN_GENERATION_FAILED', {
              requestId,
              status: tokenResponse.status,
              message: 'Token endpoint returned non-200 status',
            });
          }
        }
      } catch (e) {
        debugLog('JWT_TOKEN_GENERATION_ERROR', {
          requestId,
          error: String(e),
          message: 'Failed to generate JWT token after sign-in',
        });
      }
    }

    // Handle redirects (OAuth callbacks return 302)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        res.redirect(response.status, location);
        return;
      }
    }

    // Send response
    res.status(response.status);

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // Clone the response to safely read the body
      const text = await response.text();

      debugLog('JSON_RESPONSE_BODY', {
        requestId,
        contentType,
        bodyLength: text?.length || 0,
        bodyPreview: text ? text.substring(0, 200) : null,
      });

      if (text && text.length > 0) {
        try {
          const json = JSON.parse(text);

          // Log specific auth-related response data (handle null responses)
          if (json === null) {
            debugLog('AUTH_NULL_RESPONSE', {
              requestId,
              message: 'Auth handler returned null (no session found)',
            });
          } else if (json.error || json.message) {
            debugLog('AUTH_ERROR_RESPONSE', {
              requestId,
              error: json.error,
              message: json.message,
              code: json.code,
            });
          } else if (json.user || json.session) {
            debugLog('AUTH_SUCCESS_RESPONSE', {
              requestId,
              hasUser: !!json.user,
              hasSession: !!json.session,
              userId: json.user?.id,
              sessionId: json.session?.id,
            });
          }

          res.json(json);
        } catch (parseError) {
          debugLog('JSON_PARSE_ERROR', {
            requestId,
            error: String(parseError),
            rawText: text.substring(0, 200),
          });
          // If JSON parse fails, send as text
          res.send(text);
        }
      } else {
        debugLog('EMPTY_JSON_RESPONSE', { requestId });
        // Empty response body
        res.end();
      }
    } else {
      const text = await response.text();
      debugLog('NON_JSON_RESPONSE', {
        requestId,
        contentType,
        bodyLength: text?.length || 0,
      });
      if (text && text.length > 0) {
        res.send(text);
      } else {
        res.end();
      }
    }

    debugLog('REQUEST_COMPLETE', {
      requestId,
      finalStatus: response.status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    debugLog('REQUEST_ERROR', {
      requestId,
      error: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
    });

    console.error('Auth handler error:', errorMessage);
    res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
}
