// textbook/src/components/TextSelectionButton.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';

interface TextSelectionButtonProps {
  // No explicit props needed if consuming from ChatContext
}

const TextSelectionButton: React.FC<TextSelectionButtonProps> = () => {
  const { handleSelection, openChat } = useChat();
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getSelectionCoords = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
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
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (selectedText.length > 0) {
      const coords = getSelectionCoords();
      if (coords) {
        setButtonPosition(coords);
        setCurrentSelection(selectedText);
      }
    } else {
      setButtonPosition(null);
      setCurrentSelection(null);
    }
  }, [getSelectionCoords]);

  const handleClick = useCallback(() => {
    if (currentSelection) {
      // Set the selection in context and open chat
      handleSelection(currentSelection);
      openChat();
      // Clear the button
      setButtonPosition(null);
      setCurrentSelection(null);
      // Clear browser selection
      window.getSelection()?.removeAllRanges();
    }
  }, [currentSelection, handleSelection, openChat]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    const handleScroll = () => {
        setButtonPosition(null);
        setCurrentSelection(null);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseUp]);

  if (!buttonPosition || !currentSelection) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed z-[1001] bg-primary text-white dark:text-gray-100 px-3 py-1 rounded-md text-sm shadow-md cursor-pointer hover:bg-opacity-80 transition-colors duration-200"
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