"use client";

import React from 'react';
import FloatingChatbotIcon from './FloatingChatbotIcon';
import ChatbotWindow from './ChatbotWindow';
import { useChatbot } from '../lib/ChatbotProvider';

const ChatBot: React.FC = () => {
  const { isChatbotVisible } = useChatbot();

  return (
    <>
      {!isChatbotVisible && <FloatingChatbotIcon />}
      <ChatbotWindow />
    </>
  );
};

export default ChatBot;
