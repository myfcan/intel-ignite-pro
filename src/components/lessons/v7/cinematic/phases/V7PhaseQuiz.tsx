// V7PhaseQuiz - Interactive self-assessment quiz phase
// Features: Checkboxes with animation, result reveal, personalized feedback
// ✅ V7-v2.1: Sistema de estados de interação + efeitos sonoros
// ✅ V7-v2.2: TTS contextual com ElevenLabs para sussurros durante interação

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractionState, SoundEffectType } from '../useV7AudioManager';
import { useV7ContextualTTS } from '../useV7ContextualTTS';

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
  // ✅ V7-v3: isPaused é controlado EXTERNAMENTE pelo anchorText
  // O quiz NÃO pausa automaticamente ao montar - espera o anchorAction
  isPausedByAnchor?: boolean;
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
  isPausedByAnchor = false, // ✅ V7-v3: Controlado externamente
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
    { triggerAfter: 5, text: 'Responda pra gente seguir em frente.', volume: 0.5 },
    { triggerAfter: 12, text: 'Tá pensando muito hein! Brincadeira, não precisa ter pressa!', volume: 0.5 },
    { triggerAfter: 22, text: 'Hum, acho que vou tirar uma soneca.', volume: 0.4 }
  ]
}: V7PhaseQuizProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optionsRevealed, setOptionsRevealed] = useState(true); // ✅ CORRIGIDO: Opções aparecem IMEDIATAMENTE
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=soft, 2=medium
  const [audioPausedByQuiz, setAudioPausedByQuiz] = useState(false);
  const [ttsStarted, setTtsStarted] = useState(false);

  // ✅ V7-v2.2: Hook de TTS contextual com ElevenLabs
  const {
    isGenerating: isTtsGenerating,
    startContextualHints,
    stopAll: stopTts,
    cleanup: cleanupTts
  } = useV7ContextualTTS({
    hints: contextualLoops.map(loop => ({
      triggerAfter: loop.triggerAfter,
      text: loop.text,
      volume: loop.volume
    })),
    whisper: true, // Usar voz sussurrada
    enabled: true
  });

  // ✅ Debug: Log options on mount
  useEffect(() => {
    console.log('[V7PhaseQuiz] 🎯 Mounted with options:', options);
    console.log('[V7PhaseQuiz] 🎯 Title:', title, 'Subtitle:', subtitle);
  }, [options, title, subtitle]);

  // ✅ Use refs to ensure stable audioControl reference in callbacks
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const timersRef = useRef<NodeJS.Timeout[]>([]);

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
          if (!isRevealed && !optionsRevealed) {
            setOptionsRevealed(true); // Revela opções automaticamente no timeout
          }
        }, 2000);
      }
    }, timeoutConfig.hard * 1000);

    timersRef.current = [softTimer, mediumTimer, hardTimer];

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [isRevealed, selectedIds.length, timeoutConfig]);

  // ✅ V7-v3 FIX: NÃO pausar automaticamente ao montar!
  // A pausa é controlada EXTERNAMENTE pelo isPausedByAnchor via useAnchorText
  // Isso garante que o quiz só pausa quando a keyword "atual de IA" for detectada
  useEffect(() => {
    const ctrl = audioControlRef.current;
    if (!ctrl) return;

    // ✅ CRÍTICO: Só pausa quando isPausedByAnchor = true (anchorAction detectado)
    if (isPausedByAnchor && ctrl.isPlaying) {
      const pauseNarration = async () => {
        if (ctrl.pauseWithFade) {
          await ctrl.pauseWithFade(500);
          console.log('[V7PhaseQuiz] 🔇 Narração PAUSADA por anchorAction!');
        } else {
          ctrl.pause();
          console.log('[V7PhaseQuiz] 🔇 Narração pausada por anchorAction (fallback)');
        }
        setAudioPausedByQuiz(true);
      };
      pauseNarration();
    }
  }, [isPausedByAnchor]);

  // ✅ V7-v3: TTS Contextual - Só inicia quando isPausedByAnchor = true
  useEffect(() => {
    if (isRevealed || selectedIds.length > 0 || ttsStarted) {
      return;
    }
    
    // ✅ CRÍTICO: Só inicia TTS quando o áudio foi pausado pelo anchorAction
    if (!isPausedByAnchor) {
      return;
    }

    // Aguardar 1s após pausar narração para iniciar TTS
    const startTimer = setTimeout(async () => {
      if (!isRevealed && selectedIds.length === 0 && isPausedByAnchor) {
        console.log('[V7PhaseQuiz] 🎵 Iniciando TTS contextual (áudio pausado por anchorAction)');
        setTtsStarted(true);
        await startContextualHints();
      }
    }, 1000);

    return () => {
      clearTimeout(startTimer);
    };
  }, [isRevealed, selectedIds.length, ttsStarted, isPausedByAnchor, startContextualHints]);

  // ✅ Parar TTS quando usuário interagir
  useEffect(() => {
    if (selectedIds.length > 0 || isRevealed) {
      stopTts();
    }
  }, [selectedIds.length, isRevealed, stopTts]);

  // ✅ Cleanup TTS ao desmontar
  useEffect(() => {
    return () => {
      cleanupTts();
    };
  }, [cleanupTts]);

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

  // ✅ FASE 1: Primeiro clique revela as opções
  const handleRevealOptions = useCallback(() => {
    console.log('[V7PhaseQuiz] 🎯 REVELAR VERDADE clicked - showing options');
    const ctrl = audioControlRef.current;
    ctrl?.playSoundEffect?.('reveal', 0.5);
    setOptionsRevealed(true);
  }, []);

  // ✅ FASE 1: Segundo clique confirma a resposta
  const handleConfirm = useCallback(() => {
    // Limpar timers (hints visuais) e parar TTS
    timersRef.current.forEach(timer => clearTimeout(timer));
    stopTts();
    console.log('[V7PhaseQuiz] ✅ CONFIRMAR clicked - showing results');

    // 🆕 V7-v2.1: Tocar efeito de revelação
    const ctrl = audioControlRef.current;
    // Parar qualquer TTS em andamento
    ctrl?.stopSpeech?.();
    ctrl?.playSoundEffect?.('success', 0.5);
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
        {/* Quiz Header - Simplificado (sem TESTE RELÂMPAGO intro) */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: sceneIndex >= 0 ? 1 : 0, y: sceneIndex >= 0 ? 0 : -20 }}
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/60">{subtitle}</p>
          )}
        </motion.div>

        {/* ✅ FASE 1: Options - só aparecem APÓS clicar "REVELAR VERDADE" */}
        <AnimatePresence>
          {optionsRevealed && (
            <motion.div
              className="space-y-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
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
          )}
        </AnimatePresence>

        {/* ✅ FASE 1: Botão REVELAR VERDADE - sempre clicável, revela opções */}
        {!optionsRevealed && !isRevealed && (
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
            onClick={handleRevealOptions}
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

        {/* ✅ FASE 1: Botão CONFIRMAR - aparece após selecionar opções */}
        {optionsRevealed && !isRevealed && (
          <motion.button
            className="w-full py-4 px-8 text-lg font-bold text-white rounded-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: selectedIds.length > 0 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #6b7280, #4b5563)',
              boxShadow: selectedIds.length > 0 
                ? '0 10px 30px rgba(16, 185, 129, 0.4)' 
                : 'none',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: selectedIds.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedIds.length > 0 ? 0.98 : 1 }}
            onClick={handleConfirm}
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
            <span className="relative z-10">
              {selectedIds.length > 0 ? '✓ CONFIRMAR RESPOSTA' : 'SELECIONE UMA OPÇÃO'}
            </span>
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
