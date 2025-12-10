import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import v4 as uuidv4
import { chatWithBackend, askSelectionWithBackend, getHistory } from '../lib/chatApi';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add isLoading state

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
    const newUserMessage: ChatMessage = {
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'pending',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      let botResponseContent: string;
      // Add console.log for API fetch attempts
      console.log("Attempting to fetch chat/ask-selection API."); // Log general attempt
      if (selectedText && sessionId) {
        // Use askSelectionWithBackend if text is selected
        console.log("Fetching /api/ask-selection with selected text and query:", selectedText, text);
        const response = await askSelectionWithBackend(selectedText, text, sessionId);
        botResponseContent = response.answer;
      } else if (sessionId) {
        // Use chatWithBackend for general chat
        console.log("Fetching /api/chat with query:", text);
        const response = await chatWithBackend(text, sessionId);
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
        errorMessageContent = "Error: Could not connect to Backend. Is it running on port 8000?";
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
  }, [selectedText, sessionId]); // Add selectedText and sessionId to dependencies

  // --- Session management placeholder ---
  useEffect(() => {
    // Generate or load a session ID
    if (!sessionId) {
      setSessionId(uuidv4()); // Use uuidv4()
    }
  }, [sessionId]);

  // --- Load chat history when session ID is available ---
  useEffect(() => {
    if (sessionId) {
      const loadHistory = async () => {
        try {
          const history = await getHistory(sessionId);
          // Assuming history is an array of messages compatible with ChatMessage[]
          setMessages(history);
        } catch (error) {
          console.error("Error loading chat history:", error);
          // Optionally, display an error message in the chat
          setMessages((prev) => [
            ...prev,
            {
              content: `Error loading history: ${error instanceof Error ? error.message : String(error)}`,
              sender: 'ai',
              timestamp: new Date(),
              status: 'error',
            },
          ]);
        }
      };
      loadHistory();
    }
  }, [sessionId]); // Rerun when sessionId changes


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
