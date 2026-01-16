// V7PhaseCTA - Call to Action final phase
// ✅ V7-v2: Suporta fade in/out de áudio e hints progressivos
// ✅ Prevents double-click with isProcessing guard + disabled state
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioControl {
  pause: () => void;
  play: () => void;
  togglePlayPause: () => void;
  isPlaying: boolean;
  // V7-v2: Novos métodos com fade
  fadeToVolume?: (volume: number, duration?: number) => Promise<void>;
  pauseWithFade?: (duration?: number) => Promise<void>;
  resumeWithFade?: (duration?: number) => Promise<void>;
}

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
  audioControl?: AudioControl;
  // V7-v2: Configuração de timeouts
  timeoutConfig?: {
    soft: number;    // 5s - primeira dica
    medium: number;  // 12s - segunda dica
    hard: number;    // 25s - auto-escolha
    hints: string[];
  };
}

export default function V7PhaseCTA({
  title,
  subtitle,
  options,
  duration,
  onChoice,
  audioControl,
  timeoutConfig = {
    soft: 5,
    medium: 12,
    hard: 25,
    hints: [
      '⏳ Este é o momento da decisão...',
      '🤔 Qual caminho você escolhe?',
      '⚡ Escolhendo automaticamente...'
    ]
  }
}: V7PhaseCTAProps) {
  const [selected, setSelected] = useState<'negative' | 'positive' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const hasPausedAudio = useRef(false);
  const hasCalledChoice = useRef(false);

  // Use ref to ensure stable reference
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const onChoiceRef = useRef(onChoice);
  onChoiceRef.current = onChoice;

  // ✅ V7-v2: Sistema de hints progressivos
  useEffect(() => {
    if (selected || isProcessing) {
      // Limpar hints se usuário escolheu
      setCurrentHint(null);
      setHintLevel(0);
      return;
    }

    // Soft hint
    const softTimer = setTimeout(() => {
      if (!selected && !hasCalledChoice.current) {
        setCurrentHint(timeoutConfig.hints[0]);
        setHintLevel(1);
      }
    }, timeoutConfig.soft * 1000);

    // Medium hint
    const mediumTimer = setTimeout(() => {
      if (!selected && !hasCalledChoice.current) {
        setCurrentHint(timeoutConfig.hints[1]);
        setHintLevel(2);
      }
    }, timeoutConfig.medium * 1000);

    // Hard timeout - auto-escolher positivo
    const hardTimer = setTimeout(() => {
      if (!selected && !hasCalledChoice.current) {
        setCurrentHint(timeoutConfig.hints[2]);
        // Auto-selecionar a opção positiva após 2s
        setTimeout(() => {
          if (!selected && !hasCalledChoice.current) {
            handleSelect('positive');
          }
        }, 2000);
      }
    }, timeoutConfig.hard * 1000);

    timersRef.current = [softTimer, mediumTimer, hardTimer];

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [selected, isProcessing, timeoutConfig]);

  // ✅ V7-v2: Pausar áudio com FADE após delay para narração
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (hasPausedAudio.current || hasCalledChoice.current) return;

      const ctrl = audioControlRef.current;
      if (ctrl?.isPlaying) {
        // Usar fade se disponível, senão pause normal
        if (ctrl.fadeToVolume) {
          await ctrl.fadeToVolume(0.2, 500);
        } else {
          ctrl.pause();
        }
        console.log('[V7PhaseCTA] 🔇 Audio em background - aguardando escolha');
      }
      hasPausedAudio.current = true;
    }, 3000); // Wait 3s for CTA narration intro

    return () => clearTimeout(timer);
  }, []);

  // ✅ Combined: handleSelect with double-click guard AND fade audio
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

    // Limpar timers de hints
    timersRef.current.forEach(timer => clearTimeout(timer));
    setCurrentHint(null);
    console.log('[V7PhaseCTA] Choice locked:', variant);

    // ✅ V7-v2: Resume com fade após seleção
    setTimeout(async () => {
      try {
        const ctrl = audioControlRef.current;
        if (hasPausedAudio.current && ctrl) {
          if (ctrl.fadeToVolume) {
            await ctrl.fadeToVolume(1, 500);
          } else if (!ctrl.isPlaying) {
            ctrl.play();
          }
          console.log('[V7PhaseCTA] 🔊 Audio retomado com fade');
        }
      } catch (e) {
        console.log('[V7PhaseCTA] Audio resume failed:', e);
      }

      onChoiceRef.current(variant);
    }, 300);
  }, [isProcessing, selected]);

  return (
    <div className="w-full h-full flex items-center justify-center px-4 sm:px-8 pt-4 pb-28">
      {/* pb-28 = espaço para CTA + player controls */}
      <div className="max-w-2xl w-full text-center space-y-8 sm:space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground px-2">
            {title}
          </h2>
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground px-2">
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
                relative px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl font-bold
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

        {/* Hint progressivo - V7-v2 */}
        <AnimatePresence mode="wait">
          {currentHint && !selected ? (
            <motion.div
              key={currentHint}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.p
                className={`text-sm font-medium ${
                  hintLevel === 1 ? 'text-amber-400' :
                  hintLevel === 2 ? 'text-orange-400' : 'text-red-400'
                }`}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentHint}
              </motion.p>
            </motion.div>
          ) : !selected ? (
            <motion.div
              key="default-hint"
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
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
