const API_BASE_URL = '/api'; // Proxied by Vercel to the Python backend

/**
 * Handle 401 responses by redirecting to login
 *
 * Session-based auth: BetterAuth cookies handle authentication automatically.
 * No need for manual JWT token management.
 */
function handleUnauthorized(): never {
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

/**
 * Get chat history for a session
 * Uses session cookies for authentication (no JWT token needed)
 */
export async function getHistory(sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
    credentials: 'include', // Send session cookies
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat history');
  }

  return response.json();
}

/**
 * Send a chat message to the backend
 * Uses session cookies for authentication (no JWT token needed)
 */
export async function chatWithBackend(query: string, sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send session cookies
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

/**
 * Ask a question about selected text
 * Uses session cookies for authentication (no JWT token needed)
 */
export async function askSelectionWithBackend(selection: string, question: string, sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ask-selection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send session cookies
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

/**
 * Send feedback for a message
 * Uses session cookies for authentication (no JWT token needed)
 */
export async function sendFeedback(messageId: string, rating: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send session cookies
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