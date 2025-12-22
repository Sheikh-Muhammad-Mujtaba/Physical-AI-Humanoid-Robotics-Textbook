// textbook/src/components/TextSelectionButton.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';

interface TextSelectionButtonProps {
  // No explicit props needed if consuming from ChatContext
}

const TextSelectionButton: React.FC<TextSelectionButtonProps> = () => {
  const { handleSelection, openChat } = useChat();
  const [buttonState, setButtonState] = useState<{ position: { x: number; y: number } | null; text: string | null }>({
    position: null,
    text: null,
  });
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
    const buttonWidth = 100;
    const buttonHeight = 40;
    const padding = 10;

    // Constrain horizontal position
    x = Math.max(padding + buttonWidth / 2, Math.min(x, window.innerWidth - padding - buttonWidth / 2));

    // Calculate positions for above and below text
    let positionAbove = rect.top + scrollY - 50; // 50px above selection
    let positionBelow = rect.bottom + scrollY + 10; // 10px below selection

    // Use position above selection, but if it goes off screen, use position below
    if (positionAbove < padding) {
      y = positionBelow;
    } else if (positionAbove + buttonHeight > window.innerHeight + scrollY) {
      // If both would go off screen, use position below
      y = positionBelow;
    } else {
      y = positionAbove;
    }

    // Final safety check - ensure y is not below the bottom of viewport minus padding
    // This allows button to stay visible even at the very bottom
    y = Math.max(padding, y);

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

    console.log('[TextSelection] Selection detected:', {
      hasSelection: !!selection && selection.rangeCount > 0,
      textLength: selectedText.length,
      text: selectedText.substring(0, 100),
    });

    if (selectedText.length > 0) {
      const coords = getSelectionCoords();
      if (coords) {
        console.log('[TextSelection] Updating button state with coords:', coords);
        setButtonState({ position: coords, text: selectedText });
      } else {
        console.log('[TextSelection] No valid coords');
        setButtonState({ position: null, text: null });
      }
    } else {
      console.log('[TextSelection] No text, hiding button');
      setButtonState({ position: null, text: null });
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
            // Only clear if there's no active selection
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                console.log('[TextSelection] Scroll: no selection, hiding button');
                setButtonState({ position: null, text: null });
            } else if (buttonState.position && buttonState.text) {
                // Update button position while keeping selection active during scroll
                console.log('[TextSelection] Scroll: updating button position');
                const coords = getSelectionCoords();
                if (coords) {
                    setButtonState({ position: coords, text: buttonState.text });
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
  if (!buttonState.position || !buttonState.text) {
    return null;
  }

  console.log('[TextSelection] Rendering button at:', {
    position: buttonState.position,
    selection: buttonState.text.substring(0, 50),
  });

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed z-[9999] bg-primary text-white dark:text-gray-100 px-4 py-2 rounded-lg text-sm font-semibold shadow-xl cursor-pointer hover:bg-opacity-90 hover:shadow-2xl transition-all duration-200 border border-transparent hover:border-white/30"
      style={{
        left: `${buttonState.position.x}px`,
        top: `${buttonState.position.y}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        visibility: 'visible',
      }}
      title="Click to ask AI about selected text"
    >
      ✨ Ask AI
    </button>
  );
};

export default TextSelectionButton;