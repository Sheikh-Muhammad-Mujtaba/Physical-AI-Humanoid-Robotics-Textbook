// textbook/src/lib/chatApi.ts

const API_BASE_URL = '/api'; // Proxied by Vercel to the Python backend

export async function getHistory(sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/history/${sessionId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to get chat history');
  }

  return response.json();
}

export async function chatWithBackend(query: string, sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to get chat response');
  }

  return response.json();
}

export async function askSelectionWithBackend(selection: string, question: string, sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ask-selection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selection, question, session_id: sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to get explanation');
  }

  return response.json();
}

export async function sendFeedback(messageId: string, rating: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message_id: messageId, rating }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to send feedback');
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