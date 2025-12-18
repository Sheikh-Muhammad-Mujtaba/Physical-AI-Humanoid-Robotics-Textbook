import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import v4 as uuidv4
import { chatWithBackend, askSelectionWithBackend, getHistory } from '../lib/chatApi';
import { useAuth } from './AuthProvider';


// Interface for Chat Message
export interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sent' | 'received' | 'pending' | 'error';
}

// Interface for Chat Context State
export interface ChatContextState {
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  selectedText: string | null;
  isLoading: boolean; // Add isLoading property
}

// Interface for Chat Context Functions
export interface ChatContextFunctions {
  openChat: () => void;
  closeChat: () => void;
  handleSelection: (text: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
}

// Full Chat Context Interface combining state and functions
export interface ChatContextType extends ChatContextState, ChatContextFunctions {}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Props for the ChatProvider
interface ChatProviderProps {
  children: ReactNode;
}

// Implement the ChatProvider component
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Get authenticated user from BetterAuth
  const { user, isLoading: authLoading } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyLoaded, setHistoryLoaded] = useState<boolean>(false);

  // --- Functions exposed by the context ---

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelection = useCallback((text: string | null) => {
    setSelectedText(text);
    if (text) {
      openChat(); // Open chat if text is selected
    }
  }, [openChat]);

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true);

    // Create user message - include selection context if present
    const userMessageContent = selectedText
      ? `Re: "${selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"\n\n${text}`
      : text;

    const newUserMessage: ChatMessage = {
      content: userMessageContent,
      sender: 'user',
      timestamp: new Date(),
      status: 'pending',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      let botResponseContent: string;

      // Get user ID from authenticated user
      const userId = user?.id;
      if (!userId) {
        botResponseContent = "Error: Not authenticated. Please sign in.";
        console.error("Error: No authenticated user");
        throw new Error("User not authenticated");
      }

      console.log("Attempting to fetch chat/ask-selection API with user:", userId);

      if (selectedText && sessionId) {
        // Use askSelectionWithBackend if text is selected
        console.log("Fetching /api/ask-selection with selected text and query:", selectedText, text);
        const response = await askSelectionWithBackend(selectedText, text, sessionId, userId);
        botResponseContent = response.answer;
        // Clear selection after sending
        setSelectedText(null);
      } else if (sessionId) {
        // Use chatWithBackend for general chat
        console.log("Fetching /api/chat with query:", text);
        const response = await chatWithBackend(text, sessionId, userId);
        botResponseContent = response.answer;
      } else {
        botResponseContent = "Error: Session not established.";
        console.error("Error: Session not established for sending message.");
      }

      const aiResponse: ChatMessage = {
        content: botResponseContent,
        sender: 'ai',
        timestamp: new Date(),
        status: 'received',
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);

    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessageContent: string;
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessageContent = "Error: Could not connect to the AI service. Please try again later.";
      } else if (error instanceof Error) {
        errorMessageContent = `Error: ${error.message}`;
      } else {
        errorMessageContent = `Error: ${String(error)}`;
      }

      const errorMessage: ChatMessage = {
        content: errorMessageContent,
        sender: 'ai',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedText, sessionId]);

  // --- Session management placeholder ---
  useEffect(() => {
    // Generate or load a session ID
    if (!sessionId) {
      setSessionId(uuidv4()); // Use uuidv4()
    }
  }, [sessionId]);

  // --- Load chat history when session ID and user are available ---
  // Only attempt to load history on protected pages (not on login/register)
  useEffect(() => {
    const userId = user?.id;
    if (sessionId && userId && !historyLoaded && typeof window !== 'undefined') {
      // Don't attempt to load history on public auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';

      if (isAuthPage) {
        console.log('[CHAT-CONTEXT] Skipping history load on auth page:', currentPath);
        setHistoryLoaded(true);
        return;
      }

      const loadHistory = async () => {
        try {
          const history = await getHistory(sessionId, userId);
          // Assuming history is an array of messages compatible with ChatMessage[]
          setMessages(history);
          setHistoryLoaded(true);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn("[CHAT-CONTEXT] Error loading chat history:", errorMessage);

          // Silently handle auth errors - user might be on login/register page or session expired
          // The redirect will be handled by the auth system
          if (errorMessage.includes('Session expired') || errorMessage.includes('invalid')) {
            console.log('[CHAT-CONTEXT] Session auth error - redirect will be handled by auth system');
          } else {
            // For non-auth errors, show error in chat
            setMessages((prev) => [
              ...prev,
              {
                content: `Error loading history: ${errorMessage}`,
                sender: 'ai',
                timestamp: new Date(),
                status: 'error',
              },
            ]);
          }
          // Mark as loaded even on error to prevent infinite retries
          setHistoryLoaded(true);
        }
      };
      loadHistory();
    }
  }, [sessionId, user, historyLoaded]); // Rerun when sessionId, user, or auth state changes


  // Value provided by the context
  const contextValue: ChatContextType = {
    isOpen,
    sessionId,
    messages,
    selectedText,
    isLoading, // Add isLoading to context value
    openChat,
    closeChat,
    handleSelection,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
