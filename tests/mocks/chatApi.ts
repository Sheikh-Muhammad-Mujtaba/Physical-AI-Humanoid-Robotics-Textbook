/**
 * Mock Chat API responses for testing
 */

export interface MockChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MockChatResponse {
  success: boolean;
  data?: MockChatMessage;
  error?: string;
}

/**
 * Mock responses for different chat scenarios
 */
export const mockChatResponses = {
  simpleQuestion: {
    success: true,
    data: {
      id: 'mock-1',
      role: 'assistant',
      content: 'This is a simple answer to your question about Physical AI and Humanoid Robotics.',
      timestamp: Date.now(),
    },
  } as MockChatResponse,

  explanationWithMCQ: {
    success: true,
    data: {
      id: 'mock-2',
      role: 'assistant',
      content: 'Here is a detailed explanation about the topic. This is a comprehensive answer that covers the key concepts and principles involved in understanding this subject matter.',
      timestamp: Date.now(),
    },
  } as MockChatResponse,

  errorResponse: {
    success: false,
    error: 'Failed to generate response',
  } as MockChatResponse,

  emptyResponse: {
    success: true,
    data: {
      id: 'mock-3',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    },
  } as MockChatResponse,
};

/**
 * Mock function to simulate chat API call
 */
export async function mockChatApiCall(
  query: string,
  _context?: string,
  delay: number = 100
): Promise<MockChatResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different responses based on query
      if (query.toLowerCase().includes('error')) {
        resolve(mockChatResponses.errorResponse);
      } else if (query.length > 100) {
        resolve(mockChatResponses.explanationWithMCQ);
      } else {
        resolve(mockChatResponses.simpleQuestion);
      }
    }, delay);
  });
}

/**
 * Mock selected text context for testing
 */
export const mockSelectedTextContexts = {
  shortText: {
    text: 'This is a short selected text.',
    sourceIndicator: 'Selected from book',
  },
  longText: {
    text: 'This is a much longer selected text that might get truncated in the UI to fit within the display constraints and maintain readability.',
    sourceIndicator: 'Selected from book',
  },
  emptyText: {
    text: '',
    sourceIndicator: 'Selected from book',
  },
};
