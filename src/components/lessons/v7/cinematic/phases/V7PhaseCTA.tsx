// V7PhaseCTA - Call to Action final phase
// ✅ FINAL FIX: Pauses audio, waits for selection, resumes and navigates
// ✅ Prevents double-click with isProcessing guard + disabled state

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

interface V7PhaseCTAProps {
  title: string;
  subtitle: string;
  options: {
    label: string;
    emoji: string;
    variant: 'negative' | 'positive';
    onClick?: () => void;
  }[];
  duration: number;
  onChoice: (choice: 'negative' | 'positive') => void;
  audioControl?: {
    pause: () => void;
    play: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
  };
}

export default function V7PhaseCTA({
  title,
  subtitle,
  options,
  duration,
  onChoice,
  audioControl
}: V7PhaseCTAProps) {
  const [selected, setSelected] = useState<'negative' | 'positive' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasPausedAudio = useRef(false);
  const hasCalledChoice = useRef(false);

  // Use ref to ensure stable reference
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const onChoiceRef = useRef(onChoice);
  onChoiceRef.current = onChoice;

  // ✅ FIXED: Don't pause immediately - let narration play for a bit first
  // The phase has its own narration that should complete before we wait for choice
  // After 5 seconds (enough for CTA narration), pause and wait for user
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPausedAudio.current && !hasCalledChoice.current) {
        const ctrl = audioControlRef.current;
        if (ctrl?.isPlaying) {
          ctrl.pause();
          console.log('[V7PhaseCTA] 🔇 Audio paused after narration delay - waiting for user choice');
        }
        hasPausedAudio.current = true;
      }
    }, 5000); // Wait 5s for CTA narration to complete

    return () => clearTimeout(timer);
  }, []);

  // ✅ SIMPLIFIED: Immediate navigation, no delays that could cause issues
  const handleSelect = useCallback((variant: 'negative' | 'positive') => {
    // Triple guard: isProcessing, selected, and hasCalledChoice
    if (isProcessing || selected !== null || hasCalledChoice.current) {
      console.log('[V7PhaseCTA] Click ignored - already processing');
      return;
    }

    // Lock immediately
    hasCalledChoice.current = true;
    setIsProcessing(true);
    setSelected(variant);
    console.log('[V7PhaseCTA] Choice locked:', variant);

    // Resume audio safely
    try {
      const ctrl = audioControlRef.current;
      if (ctrl && !ctrl.isPlaying) {
        ctrl.play();
        console.log('[V7PhaseCTA] ▶️ Audio resumed');
      }
    } catch (e) {
      console.log('[V7PhaseCTA] Audio resume failed:', e);
    }

    // Call onChoice immediately - let parent handle any delays
    onChoiceRef.current(variant);
  }, [isProcessing, selected]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8 pb-24">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl text-muted-foreground">
            {title}
          </h2>
          <p className="text-4xl sm:text-5xl font-bold text-foreground">
            {subtitle}
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          {options.map((option, index) => (
            <motion.button
              key={option.variant}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: selected === option.variant ? 1.1 : (selected ? 0.9 : [1, 1.05, 1])
              }}
              transition={{
                delay: 0.8 + index * 0.2,
                duration: 0.6,
                scale: { duration: 1.5, repeat: selected ? 0 : Infinity, ease: 'easeInOut' }
              }}
              onClick={() => handleSelect(option.variant)}
              disabled={isProcessing || selected !== null}
              className={`
                relative px-8 py-6 rounded-2xl text-xl font-bold
                transition-all duration-300 overflow-hidden
                ${option.variant === 'negative'
                  ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30 border border-muted/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
                ${selected && selected !== option.variant ? 'opacity-30' : ''}
                ${isProcessing || selected !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Pulsing glow effect for ALL options when not selected */}
              {!selected && !isProcessing && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${
                    option.variant === 'positive' ? 'bg-primary/20' : 'bg-white/10'
                  }`}
                  animate={{
                    boxShadow: option.variant === 'positive'
                      ? [
                          '0 0 20px rgba(0, 217, 166, 0.3)',
                          '0 0 40px rgba(0, 217, 166, 0.6)',
                          '0 0 20px rgba(0, 217, 166, 0.3)'
                        ]
                      : [
                          '0 0 10px rgba(255, 255, 255, 0.1)',
                          '0 0 25px rgba(255, 255, 255, 0.2)',
                          '0 0 10px rgba(255, 255, 255, 0.1)'
                        ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <span className="relative z-10 flex items-center gap-3">
                <motion.span
                  animate={!selected && !isProcessing ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: selected || isProcessing ? 0 : Infinity }}
                >
                  {option.emoji}
                </motion.span>
                <span>{option.label}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Countdown hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-muted-foreground text-sm"
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            A escolha é sua. E é agora.
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
