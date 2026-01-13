import { useState, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  onCharacter?: () => void;
  onComplete?: () => void;
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const { speed = 55, onCharacter, onComplete } = options;
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const abortRef = useRef(false);

  const typeText = useCallback(async (text: string) => {
    abortRef.current = false;
    setDisplayText('');
    setIsTyping(true);
    setShowCursor(true);

    for (let i = 0; i < text.length; i++) {
      if (abortRef.current) break;
      
      setDisplayText(text.slice(0, i + 1));
      
      if (text[i] !== ' ' && text[i] !== '\n') {
        onCharacter?.();
      }
      
      await new Promise(resolve => setTimeout(resolve, speed));
    }

    setIsTyping(false);
    await new Promise(resolve => setTimeout(resolve, 200));
    setShowCursor(false);
    onComplete?.();
  }, [speed, onCharacter, onComplete]);

  const stop = useCallback(() => {
    abortRef.current = true;
    setIsTyping(false);
    setShowCursor(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setDisplayText('');
    setIsTyping(false);
    setShowCursor(false);
  }, []);

  return {
    displayText,
    isTyping,
    showCursor,
    typeText,
    stop,
    reset,
  };
}
