// V7 Typewriter Effect - Code typing animation for playground scenes
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface V7TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  showCursor?: boolean;
  cursorBlinkRate?: number;
  onComplete?: () => void;
  className?: string;
  codeStyle?: boolean;
}

export const V7TypewriterText = ({
  text,
  speed = 50,
  showCursor = true,
  cursorBlinkRate = 530,
  onComplete,
  className = '',
  codeStyle = false,
}: V7TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  const baseClassName = codeStyle
    ? 'font-mono text-sm md:text-base whitespace-pre-wrap'
    : 'text-lg md:text-xl';

  return (
    <div className={`relative ${baseClassName} ${className}`}>
      {displayedText}
      {showCursor && !isComplete && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-cyan-400 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: cursorBlinkRate / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
};

// Preset: Fast professional typing
export const V7FastTypewriter = ({
  text,
  onComplete,
  className = '',
}: {
  text: string;
  onComplete?: () => void;
  className?: string;
}) => (
  <V7TypewriterText
    text={text}
    speed={30}
    showCursor={true}
    onComplete={onComplete}
    codeStyle={true}
    className={className}
  />
);

// Preset: Slow amateur typing
export const V7SlowTypewriter = ({
  text,
  onComplete,
  className = '',
}: {
  text: string;
  onComplete?: () => void;
  className?: string;
}) => (
  <V7TypewriterText
    text={text}
    speed={50}
    showCursor={true}
    onComplete={onComplete}
    codeStyle={true}
    className={className}
  />
);
