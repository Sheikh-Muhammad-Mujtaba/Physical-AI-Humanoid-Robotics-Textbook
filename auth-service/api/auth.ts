import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../src/auth.js';

// CORS helper - Parse allowed origins from environment
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

// Always allow the production frontend
const PRODUCTION_FRONTEND = 'https://ai-spec-driven.vercel.app';
if (!allowedOrigins.includes(PRODUCTION_FRONTEND)) {
  allowedOrigins.push(PRODUCTION_FRONTEND);
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Log unrecognized origins for debugging
    console.log('Unrecognized origin:', origin, 'Allowed:', allowedOrigins);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Convert Vercel request to Web Request
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

    // Call Better Auth handler
    const response = await auth.handler(webRequest);

    // Copy response headers
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

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
      if (text && text.length > 0) {
        try {
          const json = JSON.parse(text);
          res.json(json);
        } catch {
          // If JSON parse fails, send as text
          res.send(text);
        }
      } else {
        // Empty response body
        res.end();
      }
    } else {
      const text = await response.text();
      if (text && text.length > 0) {
        res.send(text);
      } else {
        res.end();
      }
    }
  } catch (error) {
    console.error('Auth handler error:', error.message || error);
    // Optionally, log the full error object for more details in server logs
    // console.error('Auth handler detailed error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
