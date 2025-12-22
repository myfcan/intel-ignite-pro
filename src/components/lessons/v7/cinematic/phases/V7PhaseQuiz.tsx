// V7PhaseQuiz - Interactive self-assessment quiz phase
// Features: Checkboxes with animation, result reveal, personalized feedback
// ✅ V7-v2.1: Sistema de estados de interação + efeitos sonoros

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractionState, SoundEffectType } from '../useV7AudioManager';

interface QuizOption {
  id: string;
  text: string;
  category: 'good' | 'bad';
}

interface AudioControl {
  pause: () => void;
  play: () => void;
  togglePlayPause: () => void;
  isPlaying: boolean;
  // V7-v2: Novos métodos com fade
  fadeToVolume?: (volume: number, duration?: number) => Promise<void>;
  pauseWithFade?: (duration?: number) => Promise<void>;
  resumeWithFade?: (duration?: number) => Promise<void>;
  // V7-v2.1: Estado de interação e efeitos sonoros
  interactionState?: InteractionState;
  updateInteractionState?: (state: InteractionState) => void;
  playSoundEffect?: (effect: SoundEffectType, volume?: number) => void;
  // V7-v2.2: Contextual loops (TTS para hints audíveis)
  speakText?: (text: string, volume?: number) => Promise<void>;
  stopSpeech?: () => void;
}

// V7-v2.2: Configuração de loops contextuais (TTS durante espera)
interface ContextualLoopConfig {
  triggerAfter: number; // Segundos após início da interação
  text: string;         // Texto a ser falado
  volume: number;       // Volume (0-1)
}

interface V7PhaseQuizProps {
  title: string;
  subtitle?: string;
  options: QuizOption[];
  revealTitle: string;
  revealMessage: string;
  revealValue?: string;
  // ✅ NEW: Separate feedback messages for correct/incorrect results
  correctFeedback?: string;
  incorrectFeedback?: string;
  sceneIndex: number;
  onComplete?: (selectedIds: string[]) => void;
  audioControl?: AudioControl;
  // V7-v2: Configuração de timeouts (visual hints)
  timeoutConfig?: {
    soft: number;    // 7s - primeira dica
    medium: number;  // 15s - segunda dica
    hard: number;    // 30s - auto-avanço
    hints: string[];
  };
  // V7-v2.2: Contextual audio loops (TTS)
  contextualLoops?: ContextualLoopConfig[];
}

export const V7PhaseQuiz = ({
  title,
  subtitle,
  options,
  revealTitle,
  revealMessage,
  revealValue,
  correctFeedback,
  incorrectFeedback,
  sceneIndex,
  onComplete,
  audioControl,
  timeoutConfig = {
    soft: 7,
    medium: 15,
    hard: 30,
    hints: [
      '👆 Estou esperando sua resposta... Selecione as opções acima!',
      '🤔 Pense com calma... Qual mais combina com você?',
      '⏰ Vamos continuar a jornada...'
    ]
  },
  // V7-v2.2: Loops contextuais com voz (TTS)
  contextualLoops = [
    { triggerAfter: 7, text: 'Reflita com calma...', volume: 0.5 },
    { triggerAfter: 15, text: 'Pense bem antes de responder.', volume: 0.5 },
    { triggerAfter: 25, text: 'Tome seu tempo...', volume: 0.4 }
  ]
}: V7PhaseQuizProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=soft, 2=medium
  const [audioPausedByQuiz, setAudioPausedByQuiz] = useState(false);

  // ✅ Debug: Log options on mount
  useEffect(() => {
    console.log('[V7PhaseQuiz] 🎯 Mounted with options:', options);
    console.log('[V7PhaseQuiz] 🎯 Title:', title, 'Subtitle:', subtitle);
  }, [options, title, subtitle]);

  // ✅ Use refs to ensure stable audioControl reference in callbacks
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const contextualTimersRef = useRef<NodeJS.Timeout[]>([]);

  // ✅ V7-v2.1: Sistema de hints progressivos com estados de interação
  useEffect(() => {
    const ctrl = audioControlRef.current;

    if (isRevealed || selectedIds.length > 0) {
      // Limpar hints se usuário interagiu
      setCurrentHint(null);
      setHintLevel(0);
      // Atualizar estado para "thinking"
      ctrl?.updateInteractionState?.('thinking');
      return;
    }

    // Iniciar como "waiting"
    ctrl?.updateInteractionState?.('waiting');

    // Soft hint (7s) - estado: stuck
    const softTimer = setTimeout(() => {
      if (!isRevealed && selectedIds.length === 0) {
        setCurrentHint(timeoutConfig.hints[0]);
        setHintLevel(1);
        ctrl?.updateInteractionState?.('stuck');
        ctrl?.playSoundEffect?.('hint', 0.3);
      }
    }, timeoutConfig.soft * 1000);

    // Medium hint (15s) - estado: struggling
    const mediumTimer = setTimeout(() => {
      if (!isRevealed && selectedIds.length === 0) {
        setCurrentHint(timeoutConfig.hints[1]);
        setHintLevel(2);
        ctrl?.updateInteractionState?.('struggling');
        ctrl?.playSoundEffect?.('hint', 0.4);
      }
    }, timeoutConfig.medium * 1000);

    // Hard timeout - auto avançar (30s) - estado: abandoned
    const hardTimer = setTimeout(() => {
      if (!isRevealed && selectedIds.length === 0) {
        setCurrentHint(timeoutConfig.hints[2]);
        ctrl?.updateInteractionState?.('abandoned');
        ctrl?.playSoundEffect?.('timeout', 0.5);
        // Auto-revelar após 2s mostrando o hint final
        setTimeout(() => {
          if (!isRevealed) {
            handleReveal();
          }
        }, 2000);
      }
    }, timeoutConfig.hard * 1000);

    timersRef.current = [softTimer, mediumTimer, hardTimer];

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [isRevealed, selectedIds.length, timeoutConfig]);

  // ✅ V7-v2 FIX: PAUSAR narração completamente (não apenas baixar volume!)
  // A ideia é: Quiz aparece → Narração PAUSA → Loops contextuais tocam → Resposta → Narração RETOMA
  useEffect(() => {
    const ctrl = audioControlRef.current;
    if (!ctrl) return;

    const pauseNarration = async () => {
      if (ctrl.isPlaying) {
        // ✅ CORRETO: Usar pauseWithFade para PARAR completamente (não apenas baixar volume!)
        if (ctrl.pauseWithFade) {
          await ctrl.pauseWithFade(500);
          console.log('[V7PhaseQuiz] 🔇 Narração PAUSADA (não apenas volume baixo!)');
        } else {
          ctrl.pause();
          console.log('[V7PhaseQuiz] 🔇 Narração pausada (fallback)');
        }
        setAudioPausedByQuiz(true);
      }
    };

    pauseNarration();
  }, []);

  // ✅ V7-v2.2: Contextual audio loops (TTS) - Fala frases de incentivo durante a espera
  useEffect(() => {
    const ctrl = audioControlRef.current;
    if (!ctrl?.speakText || isRevealed || selectedIds.length > 0) {
      // Não fala se não tiver TTS, se já revelou ou se usuário já interagiu
      return;
    }

    // Agendar cada loop contextual
    contextualLoops.forEach((loop) => {
      const timer = setTimeout(() => {
        // Só fala se ainda não interagiu
        if (!isRevealed && selectedIds.length === 0) {
          ctrl.speakText?.(loop.text, loop.volume);
          console.log(`[V7PhaseQuiz] 🗣️ Contextual loop: "${loop.text}"`);
        }
      }, loop.triggerAfter * 1000);

      contextualTimersRef.current.push(timer);
    });

    return () => {
      // Limpar timers e parar qualquer fala
      contextualTimersRef.current.forEach(timer => clearTimeout(timer));
      contextualTimersRef.current = [];
      ctrl?.stopSpeech?.();
    };
  }, [isRevealed, selectedIds.length, contextualLoops]);

  const toggleOption = useCallback((id: string) => {
    if (isRevealed) return;

    // 🆕 V7-v2.1: Tocar efeito sonoro de seleção
    const ctrl = audioControlRef.current;
    ctrl?.playSoundEffect?.('click', 0.3);

    // ✅ Do NOT pause audio on option selection - let narration continue
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, [isRevealed]);

  const handleReveal = useCallback(() => {
    // Limpar timers (hints visuais e loops contextuais)
    timersRef.current.forEach(timer => clearTimeout(timer));
    contextualTimersRef.current.forEach(timer => clearTimeout(timer));
    contextualTimersRef.current = [];
    console.log('[V7PhaseQuiz] REVEAL clicked - showing results');

    // 🆕 V7-v2.1: Tocar efeito de revelação
    const ctrl = audioControlRef.current;
    // Parar qualquer TTS em andamento
    ctrl?.stopSpeech?.();
    ctrl?.playSoundEffect?.('reveal', 0.5);
    ctrl?.updateInteractionState?.('idle');

    setIsRevealed(true);
    setTimeout(() => setShowResult(true), 500);

    // ✅ V7-v2 FIX: RETOMAR narração de onde parou após mostrar resultado
    setTimeout(async () => {
      const ctrl = audioControlRef.current;
      if (audioPausedByQuiz && ctrl) {
        // ✅ CORRETO: Usar resumeWithFade para retomar de onde parou
        if (ctrl.resumeWithFade) {
          await ctrl.resumeWithFade(500);
          console.log('[V7PhaseQuiz] 🔊 Narração RETOMADA de onde parou!');
        } else if (!ctrl.isPlaying) {
          ctrl.play();
          console.log('[V7PhaseQuiz] 🔊 Narração retomada (fallback)');
        }
        setAudioPausedByQuiz(false);
      }
      // Tocar som de sucesso antes de completar
      ctrl?.playSoundEffect?.('success', 0.4);
      onComplete?.(selectedIds);
    }, 3000);
  }, [selectedIds, onComplete, audioPausedByQuiz]);

  const badCount = selectedIds.filter(id => 
    options.find(o => o.id === id)?.category === 'bad'
  ).length;

  const isInBadGroup = badCount >= selectedIds.length / 2;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 pb-24 relative overflow-hidden">
      <div className="w-full max-w-2xl">
        {/* Quiz Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: sceneIndex >= 0 ? 1 : 0, y: sceneIndex >= 0 ? 0 : -30 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(168, 85, 247, 0.4)',
                '0 0 0 20px rgba(168, 85, 247, 0)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-lg font-bold text-purple-300">TESTE RELÂMPAGO</span>
          </motion.div>
          
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/60">{subtitle}</p>
          )}
        </motion.div>

        {/* Options - show immediately for user interaction */}
        <motion.div
          className="space-y-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {options.map((option, index) => {
            const isSelected = selectedIds.includes(option.id);
            const showFeedback = isRevealed;
            const isBad = option.category === 'bad';

            return (
              <motion.div
                key={option.id}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl cursor-pointer
                  border-2 transition-all overflow-hidden
                  ${showFeedback && isSelected && isBad
                    ? 'border-red-500/50 bg-red-500/10'
                    : showFeedback && isSelected && !isBad
                      ? 'border-green-500/50 bg-green-500/10'
                      : isSelected
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                  }
                  ${isRevealed ? 'pointer-events-none' : ''}
                `}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => toggleOption(option.id)}
                whileHover={{ scale: isRevealed ? 1 : 1.01 }}
                whileTap={{ scale: isRevealed ? 1 : 0.99 }}
              >
                {/* Checkbox */}
                <motion.div
                  className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center
                    transition-colors flex-shrink-0
                    ${showFeedback && isSelected && isBad
                      ? 'bg-red-500 border-red-500'
                      : showFeedback && isSelected && !isBad
                        ? 'bg-green-500 border-green-500'
                        : isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30'
                    }
                  `}
                  animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        className="text-white text-sm font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {showFeedback && isBad ? '✗' : '✓'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <span className="text-white/90">{option.text}</span>

                {/* Feedback indicator */}
                {showFeedback && isSelected && (
                  <motion.span
                    className="ml-auto text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {isBad ? '😬' : '✨'}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Reveal Button */}
        {!isRevealed && (
          <motion.button
            className="w-full py-4 px-8 text-lg font-bold text-white rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReveal}
            disabled={selectedIds.length === 0}
          >
            <motion.div
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10">REVELAR VERDADE</span>
          </motion.button>
        )}

        {/* Hint progressivo - V7-v2 */}
        <AnimatePresence mode="wait">
          {currentHint && !isRevealed && (
            <motion.div
              key={currentHint}
              className="text-center mt-4"
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
          )}
        </AnimatePresence>

        {/* Result Reveal - Posicionado acima dos controles */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              className="text-center mt-6 mb-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className={`
                  inline-block px-6 py-5 rounded-2xl border-2
                  ${isInBadGroup
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                  }
                `}
                animate={{
                  boxShadow: isInBadGroup
                    ? [
                        '0 0 20px rgba(239, 68, 68, 0.3)',
                        '0 0 40px rgba(239, 68, 68, 0.5)',
                        '0 0 20px rgba(239, 68, 68, 0.3)',
                      ]
                    : [
                        '0 0 20px rgba(34, 197, 94, 0.3)',
                        '0 0 40px rgba(34, 197, 94, 0.5)',
                        '0 0 20px rgba(34, 197, 94, 0.3)',
                      ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-4xl mb-3">
                  {isInBadGroup ? '😱' : '🎉'}
                </div>
                <div className={`text-lg font-bold mb-2 ${isInBadGroup ? 'text-red-400' : 'text-green-400'}`}>
                  {revealTitle}
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {isInBadGroup ? 'VOCÊ ESTÁ NO GRUPO 98%' : 'VOCÊ ESTÁ NO GRUPO 2%'}
                </div>
                {/* ✅ Show appropriate feedback message based on result */}
                <div className="text-white/70 text-sm mt-2">
                  {isInBadGroup 
                    ? (incorrectFeedback || revealMessage || 'Vou te ensinar o método agora.')
                    : (correctFeedback || revealMessage || 'Continue assim!')}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default V7PhaseQuiz;
