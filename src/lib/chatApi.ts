import { ensureJWTToken, clearAuthToken } from './auth-client';

const API_BASE_URL = '/api'; // Proxied by Vercel to the Python backend

/**
 * Get a valid JWT token - fetches a fresh one if needed
 * IMPORTANT: JWT tokens expire after 15 minutes, but sessions last 7 days
 * We must always fetch a fresh token from the auth service, not rely on stale localStorage
 *
 * @param authServiceUrl - The auth service URL from environment variables
 */
async function requireAuthToken(authServiceUrl: string): Promise<string> {
  // ensureJWTToken checks localStorage first, then fetches fresh token if needed/expired
  const token = await ensureJWTToken(authServiceUrl);

  if (!token) {
    // No session exists, user needs to log in
    throw new Error("Not authenticated. Please sign in.");
  }

  return token;
}

/**
 * Handle 401 responses by clearing token and redirecting to login
 */
function handleUnauthorized(): never {
  clearAuthToken();
  window.location.href = '/login';
  throw new Error("Session expired. Please sign in again.");
}

async function handleResponseError(response: Response, defaultMessage: string): Promise<Error> {
  let errorDetail = defaultMessage;
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || defaultMessage;
      console.error('API Error (JSON):', errorData);
    } catch (e) {
      errorDetail = `Could not parse JSON error response: ${e instanceof Error ? e.message : String(e)}`;
      console.error('API Error (JSON parse failed):', e);
    }
  } else {
    // If not JSON, read as plain text
    errorDetail = await response.text();
    if (!errorDetail) {
      errorDetail = `${defaultMessage} (Status: ${response.status})`;
    }
    console.error(`API Error (Text - Status: ${response.status}):`, errorDetail);
  }
  return new Error(errorDetail);
}

export async function getHistory(sessionId: string, authServiceUrl: string): Promise<any> {
  const token = await requireAuthToken(authServiceUrl);

  const response = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat history');
  }

  return response.json();
}

export async function chatWithBackend(query: string, sessionId: string, authServiceUrl: string): Promise<any> {
  const token = await requireAuthToken(authServiceUrl);

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat response');
  }

  return response.json();
}

export async function askSelectionWithBackend(selection: string, question: string, sessionId: string, authServiceUrl: string): Promise<any> {
  const token = await requireAuthToken(authServiceUrl);

  const response = await fetch(`${API_BASE_URL}/ask-selection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ selection, question, session_id: sessionId }),
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get explanation');
  }

  return response.json();
}

export async function sendFeedback(messageId: string, rating: number, authServiceUrl: string): Promise<any> {
  const token = await requireAuthToken(authServiceUrl);

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message_id: messageId, rating }),
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to send feedback');
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}