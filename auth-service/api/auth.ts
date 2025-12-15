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
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response
    res.status(response.status);

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      res.json(json);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
