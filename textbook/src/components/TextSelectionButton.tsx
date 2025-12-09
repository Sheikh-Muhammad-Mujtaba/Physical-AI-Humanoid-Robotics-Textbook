import React from 'react';
import { useChat } from '../lib/ChatProvider';

interface TextSelectionButtonProps {
  position: { top: number; left: number };
  onAsk: () => void;
}

const TextSelectionButton: React.FC<TextSelectionButtonProps> = ({ position, onAsk }) => {
  const { openChat } = useChat();

  const handleAsk = () => {
    onAsk();
    openChat();
  };

  return (
    <button
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '14px',
        zIndex: 1000,
      }}
      onClick={handleAsk}
    >
      Ask AI
    </button>
  );
};

export default TextSelectionButton;
