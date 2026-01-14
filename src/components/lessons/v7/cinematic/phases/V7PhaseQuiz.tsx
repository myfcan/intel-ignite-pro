// V7PhaseQuiz - Interactive self-assessment quiz phase
// Features: Checkboxes with animation, result reveal, personalized feedback
// ✅ V7-v2.1: Sistema de estados de interação + efeitos sonoros
// ✅ V7-v2.2: TTS contextual com ElevenLabs para sussurros durante interação
// ✅ V7-v3.1: TTS para feedback + confetti explosion

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useV7ContextualTTS } from '../useV7ContextualTTS';
import { useV7SoundEffects } from '../useV7SoundEffects';
import { supabase } from '@/integrations/supabase/client';
import type { 
  V7PhaseQuizProps, 
  V7AudioControl,
  V7TimeoutConfig,
  V7ContextualLoopConfig,
  DEFAULT_TIMEOUT_CONFIG
} from '../../v7-phase-contracts';

// Default contextual loops for quiz phase
const DEFAULT_CONTEXTUAL_LOOPS: V7ContextualLoopConfig[] = [
  { triggerAfter: 5, text: 'Responda pra gente seguir em frente.', volume: 0.5 },
  { triggerAfter: 12, text: 'Tá pensando muito hein!', volume: 0.5 },
  { triggerAfter: 18, text: 'Brincadeira, não precisa ter pressa!', volume: 0.5 },
  { triggerAfter: 26, text: 'Hum, acho que vou tirar uma soneca.', volume: 0.4 }
];

// Default timeout configuration
const DEFAULT_QUIZ_TIMEOUT: V7TimeoutConfig = {
  soft: 7,
  medium: 15,
  hard: 30,
  hints: [
    '👆 Estou esperando sua resposta... Selecione as opções acima!',
    '🤔 Pense com calma... Qual mais combina com você?',
    '⏰ Vamos continuar a jornada...'
  ]
};

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
  phaseProgress,
  onComplete,
  audioControl,
  isPausedByAnchor = false,
  onResultShow,
  timeoutConfig = DEFAULT_QUIZ_TIMEOUT,
  contextualLoops = DEFAULT_CONTEXTUAL_LOOPS
}: V7PhaseQuizProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optionsRevealed, setOptionsRevealed] = useState(true); // ✅ CORRIGIDO: Opções aparecem IMEDIATAMENTE
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=soft, 2=medium
  const [audioPausedByQuiz, setAudioPausedByQuiz] = useState(false);
  const [ttsStarted, setTtsStarted] = useState(false);
  // ✅ V7-v18: Marcadores desabilitados até narração pausar no anchor
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [showEnableEffect, setShowEnableEffect] = useState(false);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  
  // ✅ Sound effects hook
  const { playSound } = useV7SoundEffects(0.6, true);

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

  // ✅ V7-v9 FIX: NÃO pausar áudio automaticamente!
  // O áudio DEVE continuar tocando até o anchorText detectar a palavra-chave "IA"
  // A pausa prematura quebrava o sistema de anchorText porque:
  // - Quiz monta em ~20.6s
  // - Pausava áudio em ~21.6s (1s delay)
  // - Palavra "IA" está em 33.3s
  // - AnchorText via "not playing" e ignorava a ação
  const hasPausedRef = useRef(false);

  // ✅ V7-v3 FIX: Pausar quando isPausedByAnchor for true
  // ✅ V7-v18: Habilitar opções quando o áudio pausar no anchor
  useEffect(() => {
    const ctrl = audioControlRef.current;
    
    // ✅ CASO 1: Anchor disparou - pausar e habilitar opções
    if (isPausedByAnchor && !hasPausedRef.current) {
      hasPausedRef.current = true;
      console.log('[V7PhaseQuiz] 🎯 isPausedByAnchor = true - habilitando opções!');
      
      const pauseAndEnable = async () => {
        // Pausar áudio se estiver tocando
        if (ctrl?.isPlaying) {
          if (ctrl.pauseWithFade) {
            await ctrl.pauseWithFade(500);
            console.log('[V7PhaseQuiz] 🔇 Narração PAUSADA por anchorAction!');
          } else {
            ctrl.pause();
            console.log('[V7PhaseQuiz] 🔇 Narração pausada por anchorAction (fallback)');
          }
        }
        setAudioPausedByQuiz(true);
        
        // ✅ V7-v18: Habilitar opções com efeito visual
        console.log('[V7PhaseQuiz] ✨ Habilitando opções com efeito visual');
        setShowEnableEffect(true);
        setTimeout(() => {
          setOptionsEnabled(true);
          ctrl?.playSoundEffect?.('reveal', 0.4);
        }, 300);
        setTimeout(() => {
          setShowEnableEffect(false);
        }, 1500);
      };
      pauseAndEnable();
    }
  }, [isPausedByAnchor]);

  // ✅ V7-v17 FIX: TTS Contextual - Inicia quando:
  // 1. O áudio foi pausado pelo anchor (audioPausedByQuiz), OU
  // 2. O áudio já está pausado (!audioControl.isPlaying) após 2s de espera
  // Isso garante que o sussurro sempre toque mesmo se o anchor falhar
  useEffect(() => {
    if (isRevealed || selectedIds.length > 0 || ttsStarted) {
      return;
    }
    
    const ctrl = audioControlRef.current;
    
    // ✅ CASO 1: Áudio foi pausado pelo anchor - iniciar TTS imediatamente
    if (audioPausedByQuiz) {
      const startTimer = setTimeout(async () => {
        if (!isRevealed && selectedIds.length === 0) {
          console.log('[V7PhaseQuiz] 🎵 Iniciando TTS contextual (pausado por anchor)');
          setTtsStarted(true);
          await startContextualHints();
        }
      }, 1000);
      return () => clearTimeout(startTimer);
    }
    
    // ✅ CASO 2: Fallback - se o áudio não está tocando após 2s, iniciar TTS
    // Isso cobre casos onde o anchor não funcionou ou o áudio já estava pausado
    const fallbackTimer = setTimeout(async () => {
      if (!isRevealed && selectedIds.length === 0 && !ttsStarted) {
        const isAudioPaused = !ctrl?.isPlaying;
        if (isAudioPaused) {
          console.log('[V7PhaseQuiz] 🎵 Iniciando TTS contextual (fallback - áudio parado)');
          setTtsStarted(true);
          await startContextualHints();
        }
      }
    }, 2000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isRevealed, selectedIds.length, ttsStarted, audioPausedByQuiz, startContextualHints]);

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
    
    // ✅ V7-v19: Bloquear seleção + mostrar tooltip
    if (!optionsEnabled) {
      console.log('[V7PhaseQuiz] ⏳ Opções ainda desabilitadas - mostrando tooltip');
      const ctrl = audioControlRef.current;
      ctrl?.playSoundEffect?.('hint', 0.2);
      
      // Mostrar tooltip temporário
      setShowBlockedTooltip(true);
      setTimeout(() => setShowBlockedTooltip(false), 2500);
      return;
    }

    // 🆕 V7-v2.1: Tocar efeito sonoro de seleção
    playSound('click-soft');

    // ✅ Do NOT pause audio on option selection - let narration continue
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, [isRevealed, optionsEnabled, playSound]);

  // ✅ FASE 1: Primeiro clique revela as opções
  const handleRevealOptions = useCallback(() => {
    console.log('[V7PhaseQuiz] 🎯 REVELAR VERDADE clicked - showing options');
    playSound('reveal');
    setOptionsRevealed(true);
  }, [playSound]);

  // ✅ V7-v3.1: Função para falar o feedback com TTS
  const speakFeedback = useCallback(async (feedbackText: string) => {
    try {
      console.log('[V7PhaseQuiz] 🎤 Falando feedback:', feedbackText);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-contextual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: feedbackText, // ✅ Corrigido: usar 'text' ao invés de 'hints'
            whisper: false // Voz normal, não sussurro
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to generate feedback audio: ${errorData}`);
      }

      const data = await response.json();
      if (data.audioBase64) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;
        await audio.play();
      }
    } catch (error) {
      console.error('[V7PhaseQuiz] ❌ Erro ao falar feedback:', error);
    }
  }, []);

  // ✅ V7-v3.1: Função para disparar confetti (só para acertos)
  const fireConfetti = useCallback(() => {
    const colors = ['#22c55e', '#4ade80', '#86efac', '#ffffff']; // Verde

    // Explosão central
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    // Explosões laterais
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 150);
  }, []);

  // ✅ V7-v3.2: Som de erro para respostas incorretas
  const playErrorSound = useCallback(() => {
    playSound('quiz-wrong');
    console.log('[V7PhaseQuiz] 🔊 Som de erro tocado');
  }, [playSound]);

  // ✅ FASE 1: Segundo clique confirma a resposta
  const handleConfirm = useCallback(() => {
    // Limpar timers (hints visuais) e parar TTS
    timersRef.current.forEach(timer => clearTimeout(timer));
    stopTts();
    console.log('[V7PhaseQuiz] ✅ CONFIRMAR clicked - showing results');

    // 🆕 V7-v2.1: Tocar efeito de revelação
    playSound('click-confirm');
    const ctrl = audioControlRef.current;
    // Parar qualquer TTS em andamento
    ctrl?.stopSpeech?.();
    ctrl?.updateInteractionState?.('idle');

    setIsRevealed(true);
    setTimeout(() => {
      setShowResult(true);
      playSound('reveal');
      
      // ✅ V7-v9: Notify parent that result is showing (to hide player controls)
      onResultShow?.(true);
      
      // ✅ V7-v3.2: Calcular resultado e disparar efeitos visuais/sonoros
      const badCount = selectedIds.filter(id => 
        options.find(o => o.id === id)?.category === 'bad'
      ).length;
      const isPositiveResult = badCount < selectedIds.length / 2;
      
      // Feedback diferenciado baseado no resultado
      // ✅ V7-vv FIX: NÃO chamar speakFeedback() aqui - o V7PhasePlayer
      // já gerencia o feedbackAudio pré-gravado. Chamar speakFeedback
      // aqui causa sobreposição de áudio.
      if (isPositiveResult) {
        // ✅ CORRETO: Confetti verde + som de acerto
        playSound('quiz-correct');
        fireConfetti();
        console.log('[V7PhaseQuiz] ✅ Resultado positivo - confetti triggered');
      } else {
        // ✅ INCORRETO: Som de erro
        playErrorSound();
        console.log('[V7PhaseQuiz] ❌ Resultado negativo - error sound triggered');
      }
    }, 500);

    // ✅ V7-v7 FIX: NÃO retomar áudio aqui - deixar a próxima fase decidir
    // Se a próxima fase for secret-reveal, ela vai pausar o áudio e tocar sua própria narração
    // Apenas chamar onComplete após o delay do feedback
    setTimeout(() => {
      console.log('[V7PhaseQuiz] ✅ Feedback completo - chamando onComplete');
      onComplete?.(selectedIds);
    }, 4500); // Delay para dar tempo do feedback ser falado
  }, [selectedIds, onComplete, options, correctFeedback, incorrectFeedback, fireConfetti, playErrorSound, speakFeedback, stopTts, playSound]);

  const badCount = selectedIds.filter(id => 
    options.find(o => o.id === id)?.category === 'bad'
  ).length;

  const isInBadGroup = badCount >= selectedIds.length / 2;

  // ✅ V7-v15: Quando resultado aparece, container usa justify-center e esconde opções
  return (
    <div className={`w-full h-full flex flex-col items-center p-3 sm:p-4 md:p-6 pb-28 relative overflow-hidden ${showResult ? 'justify-center' : 'justify-start pt-4 sm:pt-6 md:pt-10'}`}>
      <div className="w-full max-w-2xl">
        {/* ✅ V7-v15: Quiz Header - Escondido quando resultado aparece */}
        {!showResult && (
          <motion.div
            className="text-center mb-3 sm:mb-4 md:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: sceneIndex >= 0 ? 1 : 0, y: sceneIndex >= 0 ? 0 : -20 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 px-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/60 text-xs sm:text-sm">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* ✅ V7-v15: Options - escondidas quando resultado aparece (sem scroll!) */}
        <AnimatePresence>
          {optionsRevealed && !showResult && (
            <motion.div
              className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* ✅ V7-v19: Loading indicator enquanto opções estão desabilitadas */}
              <AnimatePresence>
                {!optionsEnabled && !isRevealed && (
                  <motion.div
                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3 border border-white/10"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                    >
                      {/* Spinner animado */}
                      <motion.div
                        className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="text-white/80 text-sm font-medium">
                        Aguarde a narração...
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* ✅ V7-v19: Tooltip quando usuário tenta clicar em opção bloqueada */}
              <AnimatePresence>
                {showBlockedTooltip && (
                  <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="bg-amber-500/90 text-black px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                      <span className="mr-1">🎧</span>
                      Espere a narração terminar...
                      {/* Seta do tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-amber-500/90 rotate-45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* ✅ V7-v18: Efeito visual de habilitação (flash dourado) */}
              <AnimatePresence>
                {showEnableEffect && (
                  <motion.div
                    className="absolute inset-0 z-10 pointer-events-none rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                      background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.3), rgba(255, 215, 0, 0.4))',
                      boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.3)',
                    }}
                  />
                )}
              </AnimatePresence>
              
              {options.map((option, index) => {
                const isSelected = selectedIds.includes(option.id);
                const showFeedback = isRevealed;
                const isBad = option.category === 'bad';
                // ✅ V7-v18: Opção desabilitada até optionsEnabled = true
                const isOptionDisabled = !optionsEnabled && !isRevealed;

                  return (
                    <motion.div
                      key={option.id}
                      className={`
                        min-h-[40px] sm:min-h-[48px] md:min-h-[56px]
                      relative flex items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl
                      border-2 transition-all overflow-hidden
                      ${isOptionDisabled 
                        ? 'cursor-not-allowed opacity-50 border-white/5 bg-white/[0.01]'
                        : 'cursor-pointer'
                      }
                      ${!isOptionDisabled && showFeedback && isSelected && isBad
                        ? 'border-red-500/50 bg-red-500/10'
                        : !isOptionDisabled && showFeedback && isSelected && !isBad
                          ? 'border-green-500/50 bg-green-500/10'
                          : !isOptionDisabled && isSelected
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : !isOptionDisabled
                              ? 'border-white/10 bg-white/[0.02] hover:border-white/30'
                              : ''
                      }
                      ${isRevealed ? 'pointer-events-none' : ''}
                    `}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: isOptionDisabled ? 0.5 : 1, 
                      x: 0,
                      scale: showEnableEffect ? [1, 1.02, 1] : 1
                    }}
                    transition={{ delay: index * 0.1, duration: showEnableEffect ? 0.4 : 0.3 }}
                    onClick={() => toggleOption(option.id)}
                    whileHover={{ scale: isRevealed || isOptionDisabled ? 1 : 1.01 }}
                    whileTap={{ scale: isRevealed || isOptionDisabled ? 1 : 0.99 }}
                  >
                    {/* Checkbox */}
                    <motion.div
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center
                        transition-colors flex-shrink-0
                        ${isOptionDisabled
                          ? 'border-white/10'
                          : showFeedback && isSelected && isBad
                            ? 'bg-red-500 border-red-500'
                            : showFeedback && isSelected && !isBad
                              ? 'bg-green-500 border-green-500'
                              : isSelected
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-white/30'
                        }
                      `}
                      animate={{ 
                        scale: isSelected ? [1, 1.2, 1] : 1,
                        borderColor: showEnableEffect ? ['rgba(255,255,255,0.3)', 'rgba(255,215,0,0.8)', 'rgba(255,255,255,0.3)'] : undefined
                      }}
                      transition={{ duration: showEnableEffect ? 0.6 : 0.3 }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            className="text-white text-xs sm:text-sm font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            {showFeedback && isBad ? '✗' : '✓'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <span className={`text-sm sm:text-base ${isOptionDisabled ? 'text-white/50' : 'text-white/90'}`}>{option.text}</span>

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

        {/* ✅ Botão CONFIRMAR - Positioned with safe margin from player controls */}
        {optionsRevealed && !isRevealed && (
          <motion.button
            className="w-full py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg font-bold text-white rounded-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mb-6"
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

        {/* ✅ V7-v15: Result Reveal - Centralizado na tela, sem scroll */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              className="text-center"
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
