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
    let x = rect.left + scrollX + rect.width / 2;
    let y = rect.top + scrollY - 40; // 40px above selection

    // Ensure button stays within viewport bounds
    const buttonWidth = 80;
    const buttonHeight = 32;
    const padding = 10;

    // Constrain horizontal position
    x = Math.max(padding + buttonWidth / 2, Math.min(x, window.innerWidth - padding - buttonWidth / 2));

    // Ensure button doesn't go above viewport
    y = Math.max(padding, y);

    // If button would go off-screen vertically, position below selection instead
    if (y + buttonHeight > window.innerHeight) {
      y = rect.bottom + scrollY + 10; // Position below text instead
    }

    console.log('[TextSelection] Button position calculated:', {
      hasSelection: true,
      text: selection.toString().substring(0, 50),
      selectionRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      scrollPos: { x: scrollX, y: scrollY },
      finalPosition: { x, y },
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
    });

    return { x, y };
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    console.log('[TextSelection] mouseUp detected:', {
      hasSelection: !!selection && selection.rangeCount > 0,
      isCollapsed: selection?.isCollapsed,
      textLength: selectedText.length,
      text: selectedText.substring(0, 100),
    });

    if (selectedText.length > 0) {
      const coords = getSelectionCoords();
      if (coords) {
        console.log('[TextSelection] Button will be shown at:', coords);
        setButtonPosition(coords);
        setCurrentSelection(selectedText);
      } else {
        console.log('[TextSelection] No valid coords returned');
      }
    } else {
      console.log('[TextSelection] No text selected, hiding button');
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
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
        // Debounce scroll handler for performance
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Only clear if there's no active selection
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                console.log('[TextSelection] Scroll: no selection, hiding button');
                setButtonPosition(null);
                setCurrentSelection(null);
            } else if (buttonPosition && currentSelection) {
                // Update button position while keeping selection active during scroll
                console.log('[TextSelection] Scroll: updating button position');
                const coords = getSelectionCoords();
                if (coords) {
                    setButtonPosition(coords);
                }
            }
        }, 50); // Debounce by 50ms
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleMouseUp, buttonPosition, currentSelection, getSelectionCoords]);

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