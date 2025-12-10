import React, { createContext, useContext, useState } from 'react';

interface ChatbotContextType {
  isChatbotVisible: boolean;
  setIsChatbotVisible: (isVisible: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  return (
    <ChatbotContext.Provider value={{ isChatbotVisible, setIsChatbotVisible }}>
      {children}
    </ChatbotContext.Provider>
  );
};
