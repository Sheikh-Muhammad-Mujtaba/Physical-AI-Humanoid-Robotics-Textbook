// textbook/src/components/TextSelectionButton.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';

interface TextSelectionButtonProps {
  // No explicit props needed if consuming from ChatContext
}

const TextSelectionButton: React.FC<TextSelectionButtonProps> = () => {
  const { handleSelection, openChat } = useChat();
  const [buttonState, setButtonState] = useState<{
    position: { x: number; y: number } | null;
    text: string | null;
    top: number | null;
    left: number | null;
  }>({
    position: null,
    text: null,
    top: null,
    left: null,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getSelectionCoords = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Use viewport coordinates (relative to current view) instead of page coordinates
    // This is the proper way to position fixed elements
    const buttonWidth = 100;
    const buttonHeight = 40;
    const padding = 10;

    // Center horizontally on the selection
    let left = rect.left + rect.width / 2;

    // Constrain horizontal position to viewport
    left = Math.max(padding + buttonWidth / 2, Math.min(left, window.innerWidth - padding - buttonWidth / 2));

    // Try to position above the selection
    let top = rect.top - 50; // 50px above

    // If it goes off the top, position below instead
    if (top < padding) {
      top = rect.bottom + 10; // 10px below
    }

    // If it still goes off-screen (very tall selection or at bottom), constrain it
    if (top + buttonHeight > window.innerHeight) {
      top = Math.max(padding, window.innerHeight - buttonHeight - padding);
    }

    console.log('[TextSelection] Button coords (viewport-relative):', {
      text: selection.toString().substring(0, 50),
      rect: { top: rect.top, left: rect.left, bottom: rect.bottom, width: rect.width, height: rect.height },
      buttonPosition: { left, top },
      viewportHeight: window.innerHeight,
    });

    return { left, top };
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    console.log('[TextSelection] Selection detected:', {
      hasSelection: !!selection && selection.rangeCount > 0,
      textLength: selectedText.length,
      text: selectedText.substring(0, 100),
    });

    if (selectedText.length > 0) {
      const coords = getSelectionCoords();
      if (coords) {
        console.log('[TextSelection] Showing button at:', coords);
        setButtonState({
          position: coords,
          text: selectedText,
          left: coords.left,
          top: coords.top,
        });
      } else {
        console.log('[TextSelection] No valid coords');
        setButtonState({ position: null, text: null, left: null, top: null });
      }
    } else {
      console.log('[TextSelection] No text, hiding button');
      setButtonState({ position: null, text: null, left: null, top: null });
    }
  }, [getSelectionCoords]);

  const handleClick = useCallback(() => {
    if (buttonState.text) {
      console.log('[TextSelection] Button clicked, setting selection context:', buttonState.text);
      // Set the selection in context and open chat
      handleSelection(buttonState.text);
      openChat();
      // Clear the button
      setButtonState({ position: null, text: null });
      // Clear browser selection
      window.getSelection()?.removeAllRanges();
    }
  }, [buttonState.text, handleSelection, openChat]);

  useEffect(() => {
    const handleSelectionChange = () => {
      console.log('[TextSelection] selectionchange event fired');
      // Use setTimeout to ensure selection is finalized
      setTimeout(() => {
        handleMouseUp();
      }, 50);
    };

    // Listen to multiple selection events for better coverage
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp); // Mobile support
    document.addEventListener('selectionchange', handleSelectionChange); // Catches programmatic selections

    // Also monitor for selection via keyboard (Shift+Arrow keys)
    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) || e.key === 'Shift') {
        console.log('[TextSelection] Keyboard selection detected');
        handleMouseUp();
      }
    };
    document.addEventListener('keyup', handleKeyUp);

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
        // Debounce scroll handler for performance
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // If button is already visible, update its position while scrolling
            // Don't clear the button - just update position
            if (buttonState.left !== null && buttonState.top !== null && buttonState.text) {
                console.log('[TextSelection] Scroll: updating button position for text:', buttonState.text.substring(0, 30));
                const coords = getSelectionCoords();
                if (coords) {
                    // Update position to follow the selected text as user scrolls
                    setButtonState({
                      position: coords,
                      text: buttonState.text,
                      left: coords.left,
                      top: coords.top,
                    });
                } else {
                    // If coords can't be calculated anymore, it means selection was lost
                    // Only then clear the button
                    console.log('[TextSelection] Scroll: selection lost, hiding button');
                    setButtonState({ position: null, text: null, left: null, top: null });
                }
            }
        }, 50); // Debounce by 50ms
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleMouseUp, buttonState.position, buttonState.text, getSelectionCoords]);

  // Only render if both position and text exist
  if (!buttonState.left || !buttonState.top || !buttonState.text) {
    return null;
  }

  console.log('[TextSelection] Rendering button at:', {
    left: buttonState.left,
    top: buttonState.top,
    selection: buttonState.text.substring(0, 50),
  });

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed z-[9999] bg-[#1cd98e] dark:bg-[#d8b4fe] text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-xl cursor-pointer hover:bg-[#15a860] dark:hover:bg-[#a855f7] hover:shadow-2xl transition-all duration-200 border border-transparent hover:border-white/30 dark:hover:border-gray-900/30"
      style={{
        left: `${buttonState.left}px`,
        top: `${buttonState.top}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        visibility: 'visible',
      }}
      title="Click to ask AI about selected text"
      aria-label="Ask AI about selected text"
      data-testid="ask-ai-button"
    >
      ✨ Ask AI
    </button>
  );
};

export default TextSelectionButton;