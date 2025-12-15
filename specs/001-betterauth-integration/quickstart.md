# Quickstart Guide: API Authentication with BetterAuth

This guide provides a quick overview for developers to get started with the new API authentication using Bearer Tokens.

## 1. Backend Setup: `BETTER_AUTH_SECRET_KEY`

To enable backend token validation, you need to set the `BETTER_AUTH_SECRET_KEY` environment variable.

### Local Development

For local development, create a `.env` file in your `api/` directory (if one doesn't exist) and add the following:

```
BETTER_AUTH_SECRET_KEY="your-super-secret-development-key"
```

**IMPORTANT**: Replace `"your-super-secret-development-key"` with a strong, unique secret. NEVER commit `.env` files to version control.

### Production Deployment

For production, configure `BETTER_AUTH_SECRET_KEY` via your deployment platform's secret management system (e.g., Vercel Environment Variables, Docker secrets, Kubernetes secrets). Refer to your platform's documentation for specific instructions.

## 2. Obtaining an `AUTH_TOKEN` (Development)

For development purposes, you can use a static token. In a real-world scenario, this token would be obtained after a user successfully logs in.

For the purpose of testing this feature locally, you can use the same value as your `BETTER_AUTH_SECRET_KEY` for `AUTH_TOKEN`.

```typescript
// src/lib/chatApi.ts (example - will be dynamically fetched in production)
const AUTH_TOKEN = "your-super-secret-development-key"; // Match BETTER_AUTH_SECRET_KEY for dev
```
**IMPORTANT**: This is for development only. In production, this token must be dynamically obtained via a secure authentication flow.

## 3. Making Authenticated API Calls (Frontend)

The frontend API client (`src/lib/chatApi.ts`) will automatically inject the `Authorization: Bearer` header for all requests to protected endpoints.

If you are making custom `fetch` calls, ensure your requests include the `Authorization` header:

```typescript
// Example of an authenticated fetch request
const makeAuthenticatedRequest = async (url: string, method: string = 'GET', body?: any) => {
  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`, // Inject the token
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized or other errors
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Authentication failed');
  }

  return response.json();
};

// Usage example for a protected endpoint
try {
  const chatResponse = await makeAuthenticatedRequest('/api/chat', 'POST', { message: 'Hello!' });
  console.log(chatResponse);
} catch (error) {
  console.error('Failed to chat:', error.message);
}
```

## 4. Testing Authentication

To test the authentication:

1.  **Without Token**: Make a request to a protected endpoint (e.g., `/api/chat`) without the `Authorization` header, or with an invalid token. You should receive a `401 Unauthorized` response.
2.  **With Valid Token**: Make a request to a protected endpoint with a correctly configured `Authorization: Bearer <VALID_TOKEN>` header. The request should succeed.
3.  **Performance**: Monitor the response times to ensure the authentication overhead does not exceed the 50ms latency goal (NFR-001).
```
