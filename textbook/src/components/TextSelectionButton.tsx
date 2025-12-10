// textbook/src/components/TextSelectionButton.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext.tsx';

interface TextSelectionButtonProps {
  // No explicit props needed if consuming from ChatContext
}

const TextSelectionButton: React.FC<TextSelectionButtonProps> = () => {
  const { selectedText, handleSelection, openChat } = useChat();
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getSelectionCoords = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      handleSelection(null);
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Position the button above the selected text, centered horizontally
    return {
      x: rect.left + scrollX + rect.width / 2,
      y: rect.top + scrollY - 30, // 30px above selection
    };
  }, [handleSelection]);

  const handleMouseUp = useCallback(() => {
    const coords = getSelectionCoords();
    if (coords && window.getSelection()?.toString().trim().length > 0) {
      setButtonPosition(coords);
      handleSelection(window.getSelection()?.toString() || null);
    } else {
      setButtonPosition(null);
      handleSelection(null);
    }
  }, [getSelectionCoords, handleSelection]);

  const handleClick = useCallback(() => {
    if (selectedText) {
      // The openChat() is already called within handleSelection if text exists
      // If we want to explicitly open it here, we could.
      // For now, handleSelection is sufficient.
      // It's crucial for the button to appear only when text is selected.
      console.log("Ask AI clicked with selected text:", selectedText);
      // No need to clear selected text immediately here, it will be cleared by handleAsk in Root.tsx
      // if using it from there, or after sendMessage in ChatContext if moved there.
    }
  }, [selectedText]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  if (!buttonPosition || !selectedText) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed z-[1001] bg-blue-600 text-white px-3 py-1 rounded-md text-sm shadow-md cursor-pointer hover:bg-blue-700 transition-colors duration-200"
      style={{
        left: buttonPosition.x,
        top: buttonPosition.y,
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      Ask AI
    </button>
  );
};

export default TextSelectionButton;