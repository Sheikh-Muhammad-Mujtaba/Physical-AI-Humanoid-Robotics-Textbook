import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  conversation: any[];
  setConversation: React.Dispatch<React.SetStateAction<any[]>>;
  selection: string | null;
  buttonPosition: { top: number; left: number } | null;
  clearSelection: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const clearSelection = () => {
    setSelection(null);
    setButtonPosition(null);
  };

  const handleMouseUp = useCallback(() => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection(selectedText);
        setButtonPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      }
    } else {
      clearSelection();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat, conversation, setConversation, selection, buttonPosition, clearSelection }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
