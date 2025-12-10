import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'bot';
}

const MessageBubble = ({ text, sender }: MessageBubbleProps) => {
  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} max-w-[80%]`}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <div
        className={`p-3 rounded-xl ${
          sender === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none'
        } shadow-md`}
      >
        {text}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
