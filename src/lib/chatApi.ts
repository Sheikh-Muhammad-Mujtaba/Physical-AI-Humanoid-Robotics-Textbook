const API_BASE_URL = '/api'; // Proxied by Vercel to the Python backend

// Track if we've already initiated a redirect to prevent redirect loops
let isRedirectingToLogin = false;

/**
 * Get the current user ID from the auth system
 * This function retrieves the user ID from BetterAuth session
 */
export function getUserId(): string | null {
  // Try to get user ID from auth session (set by AuthProvider)
  // This is accessed from the global auth context
  if (typeof window !== 'undefined') {
    // Check if there's a way to access the current auth state
    // For now, we'll need to pass it as a parameter to API calls
    return null;
  }
  return null;
}

/**
 * Handle 401 responses by marking session as stale
 *
 * When a 401 is received, it means the session has expired or is invalid.
 * We return a stale session error instead of redirecting immediately to prevent loops.
 */
function handleUnauthorized(): Error {
  // Only redirect once, and not during SSR or if we're already redirecting
  if (!isRedirectingToLogin && typeof window !== 'undefined') {
    isRedirectingToLogin = true;
    console.warn('[AUTH] Session expired or invalid. Marking as stale.');
    // Redirect after a small delay to allow error handling to complete
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
  return new Error("Session expired or invalid. Please sign in again.");
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

/**
 * Get chat history for a session
 * Sends user ID via X-User-ID header for authentication
 */
export async function getHistory(sessionId: string, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
    headers: {
      'X-User-ID': userId,
    },
  });

  if (response.status === 401) {
    throw handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat history');
  }

  return response.json();
}

/**
 * Send a chat message to the backend
 * Sends user ID via X-User-ID header for authentication
 */
export async function chatWithBackend(query: string, sessionId: string, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
    },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (response.status === 401) {
    throw handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat response');
  }

  return response.json();
}

/**
 * Ask a question about selected text
 * Sends user ID via X-User-ID header for authentication
 */
export async function askSelectionWithBackend(selection: string, question: string, sessionId: string, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ask-selection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
    },
    body: JSON.stringify({ selection, question, session_id: sessionId }),
  });

  if (response.status === 401) {
    throw handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get explanation');
  }

  return response.json();
}

/**
 * Send feedback for a message
 * Sends user ID via X-User-ID header for authentication
 */
export async function sendFeedback(messageId: string, rating: number, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
    },
    body: JSON.stringify({ message_id: messageId, rating }),
  });

  if (response.status === 401) {
    throw handleUnauthorized();
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