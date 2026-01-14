// V7PhasePlayground - Split screen playground: Amateur vs Professional
// ✅ V7-v2: User-driven progression with continue button
// - PAUSES audio with FADE when entering playground
// - User clicks pulsing button to see next step
// - Audio resumes with FADE after completion
// - Hints progressivos após timeout
// ✅ V7-v26: Input real do usuário com feedback de IA

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { V7UserChallengeInput } from './V7UserChallengeInput';
import { useV7SoundEffects } from '../useV7SoundEffects';
import type { 
  V7PhasePlaygroundProps, 
  V7PlaygroundResult,
  V7PlaygroundVerdict,
  V7AudioControl 
} from '../../v7-phase-contracts';

// Steps: 0=intro, 1=amateur, 2=amateur-result, 3=professional, 4=professional-result, 5=comparison, 6=userChallenge
type PlaygroundStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const V7PhasePlayground = ({
  challengeTitle,
  challengeSubtitle,
  amateurPrompt,
  amateurResult,
  professionalPrompt,
  professionalResult,
  onComplete,
  audioControl,
  timeoutConfig = {
    perStep: 10,
    hints: [
      '👆 Clique no botão para continuar...',
      '⏳ Não se apresse, analise com calma...',
      '💡 Perceba a diferença na estrutura...'
    ]
  },
  userChallenge,
  lessonId
}: V7PhasePlaygroundProps) => {
  const [currentStep, setCurrentStep] = useState<PlaygroundStep>(0);
  const [audioPausedByPlayground, setAudioPausedByPlayground] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Sound effects
  const { playSound } = useV7SoundEffects(0.6, true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ V7-v2: PAUSE audio with FADE when playground appears
  useEffect(() => {
    const ctrl = audioControlRef.current;
    if (!ctrl) return;

    const pauseAudio = async () => {
      if (ctrl.isPlaying) {
        // Usar pauseWithFade se disponível
        if (ctrl.pauseWithFade) {
          await ctrl.pauseWithFade(300);
        } else {
          ctrl.pause();
        }
        setAudioPausedByPlayground(true);
        console.log('[V7PhasePlayground] 🔇 Audio pausado com fade');
      }
    };

    pauseAudio();
  }, []);

  // ✅ V7-v2: Hints por step
  useEffect(() => {
    // Limpar hint anterior
    setCurrentHint(null);

    // Configurar novo timer
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    hintTimerRef.current = setTimeout(() => {
      const hintIndex = currentStep % timeoutConfig.hints.length;
      setCurrentHint(timeoutConfig.hints[hintIndex]);
    }, timeoutConfig.perStep * 1000);

    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [currentStep, timeoutConfig]);

  // ✅ V7-vv: Determine max step based on whether userChallenge exists
  const maxStep = userChallenge ? 6 : 5;

  const handleContinue = useCallback(async () => {
    // Limpar hint ao interagir
    setCurrentHint(null);
    
    // ✅ Sound effect on button click
    playSound('click-confirm');

    if (currentStep < maxStep) {
      // ✅ Play reveal sound for step transitions
      if (currentStep === 1 || currentStep === 3) {
        // Showing results - dramatic sound
        playSound('reveal');
      } else if (currentStep === 4) {
        // Showing comparison - success sound
        playSound('success');
      } else {
        playSound('transition-whoosh');
      }
      
      setCurrentStep((prev) => (prev + 1) as PlaygroundStep);
    } else {
      // ✅ V7-v2: Final step - completion sound + resume audio with FADE
      playSound('completion');
      console.log(`[V7PhasePlayground] All ${maxStep + 1} steps complete`);
      const ctrl = audioControlRef.current;
      if (audioPausedByPlayground && ctrl) {
        if (ctrl.resumeWithFade) {
          await ctrl.resumeWithFade(500);
        } else if (!ctrl.isPlaying) {
          ctrl.play();
        }
        setAudioPausedByPlayground(false);
        console.log('[V7PhasePlayground] 🔊 Audio retomado com fade');
      }
      onCompleteRef.current?.();
    }
  }, [currentStep, audioPausedByPlayground, maxStep, playSound]);

  // ✅ V7-v26: Handler quando o userChallenge é completado (após feedback da IA)
  const handleUserChallengeComplete = useCallback(async () => {
    console.log('[V7PhasePlayground] 🎯 User challenge completed');
    const ctrl = audioControlRef.current;
    if (audioPausedByPlayground && ctrl) {
      if (ctrl.resumeWithFade) {
        await ctrl.resumeWithFade(500);
      } else if (!ctrl.isPlaying) {
        ctrl.play();
      }
      setAudioPausedByPlayground(false);
      console.log('[V7PhasePlayground] 🔊 Audio retomado após user challenge');
    }
    onCompleteRef.current?.();
  }, [audioPausedByPlayground]);

  const getVerdictColor = (verdict: V7PlaygroundVerdict) => {
    switch (verdict) {
      case 'bad': return 'text-red-400';
      case 'good': return 'text-yellow-400';
      case 'excellent': return 'text-green-400';
    }
  };

  const getVerdictBg = (verdict: V7PlaygroundVerdict) => {
    switch (verdict) {
      case 'bad': return 'bg-red-500/10 border-red-500/30';
      case 'good': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'excellent': return 'bg-green-500/10 border-green-500/30';
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Vamos comparar dois tipos de prompt';
      case 1: return '👎 Prompt Amador';
      case 2: return 'Resultado do Amador';
      case 3: return '👍 Prompt Profissional';
      case 4: return 'Resultado do Profissional';
      case 5: return '💡 A Diferença';
      case 6: return '✏️ Sua Vez!';
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 0: return 'Ver Prompt Amador';
      case 1: return 'Ver Resultado';
      case 2: return 'Ver Prompt Profissional';
      case 3: return 'Ver Resultado';
      case 4: return 'Ver Comparação';
      case 5: return userChallenge ? 'Aceitar o Desafio' : 'Continuar Aula';
      case 6: return 'Finalizar Aula';
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* ========== MAIN CONTENT: Flex centered with CTA below ========== */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-40 sm:pb-36">
        <div className="w-full max-w-xl mx-auto">
          {/* Challenge Header - compacto */}
          <motion.div
            className="text-center mb-2 sm:mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-1.5"
            >
              <span className="text-base">🎮</span>
              <span className="text-xs sm:text-sm font-bold text-purple-300">DESAFIO PRÁTICO</span>
            </motion.div>

            <h2 className="text-base sm:text-lg font-bold text-white">
              {challengeTitle}
            </h2>
            {challengeSubtitle && (
              <p className="text-white/60 text-xs">{challengeSubtitle}</p>
            )}
          </motion.div>

          {/* Step Indicator - compacto */}
          <div className="flex justify-center gap-1 mb-2">
            {[0, 1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  step === currentStep
                    ? 'bg-purple-500'
                    : step < currentStep
                      ? 'bg-purple-500/50'
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Current Step Title */}
          <motion.h3
            key={currentStep}
            className="text-center text-sm sm:text-base font-semibold text-white/80 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {getStepTitle()}
          </motion.h3>

          {/* Content Area */}
          <div className="min-h-[150px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* Step 0: Intro */}
              {currentStep === 0 && (
                <motion.div
                  key="intro"
                  className="text-center py-8 sm:py-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="text-6xl sm:text-7xl mb-4">🆚</div>
                  <p className="text-white/70 text-sm sm:text-base">
                    Veja a diferença entre prompts
                  </p>
                </motion.div>
              )}

              {/* Step 1: Amateur Prompt */}
              {currentStep === 1 && (
                <motion.div
                  key="amateur-prompt"
                  className="w-full bg-white/[0.02] border border-red-500/30 rounded-lg p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">AMADOR</span>
                    <span className="text-white/50 text-xs">Prompt simples</span>
                  </div>
                  <div className="bg-black/40 rounded p-3 font-mono text-xs sm:text-sm text-red-300">
                    {amateurPrompt}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Amateur Result */}
              {currentStep === 2 && (
                <motion.div
                  key="amateur-result"
                  className={`w-full rounded-lg p-3 border ${getVerdictBg(amateurResult.verdict)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="text-white/60 text-xs mb-1">RESULTADO:</div>
                  <div className="text-white/90 text-xs sm:text-sm mb-3 whitespace-pre-line line-clamp-4">
                    {amateurResult.content}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-white/50 text-xs">Valor comercial:</span>
                    <span className="text-lg font-bold text-red-400">
                      R$ {amateurResult.score}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Professional Prompt */}
              {currentStep === 3 && (
                <motion.div
                  key="pro-prompt"
                  className="w-full bg-white/[0.02] border border-emerald-500/30 rounded-lg p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">PROFISSIONAL</span>
                    <span className="text-white/50 text-xs">Método PERFEITO</span>
                  </div>
                  <div className="bg-black/40 rounded p-3 font-mono text-xs sm:text-sm text-emerald-300">
                    {professionalPrompt}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Professional Result */}
              {currentStep === 4 && (
                <motion.div
                  key="pro-result"
                  className={`w-full rounded-lg p-3 border ${getVerdictBg(professionalResult.verdict)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="text-white/60 text-xs mb-1">RESULTADO:</div>
                  <div className="text-white/90 text-xs sm:text-sm mb-3 whitespace-pre-line line-clamp-4">
                    {professionalResult.content}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-white/50 text-xs">Valor comercial:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      R$ {professionalResult.score}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Comparison */}
              {currentStep === 5 && (
                <motion.div
                  key="comparison"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">R$ {amateurResult.score}</div>
                      <div className="text-[10px] text-white/50">Amador</div>
                    </div>
                    <div className="text-white/40">→</div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">R$ {professionalResult.score}</div>
                      <div className="text-[10px] text-white/50">Profissional</div>
                    </div>
                  </div>
                  <div className="text-center py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-emerald-400 text-sm font-bold">
                      +R$ {professionalResult.score - amateurResult.score} com o método certo!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 6: User Challenge */}
              {currentStep === 6 && userChallenge && (
                <motion.div
                  key="user-challenge"
                  className="w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <V7UserChallengeInput
                    userChallenge={userChallenge}
                    lessonId={lessonId}
                    onComplete={handleUserChallengeComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========== CTA BUTTON (Fixed above player controls) ========== */}
      {currentStep !== 6 && (
        <div className="absolute bottom-36 sm:bottom-32 left-0 right-0 px-4 z-[90]">
          <div className="max-w-xl mx-auto">
            <motion.button
              className="w-full py-3 px-6 text-sm font-bold text-white rounded-full relative overflow-hidden"
              style={{
                background: currentStep === 5 && userChallenge
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
              }}
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: currentStep === 5 && userChallenge
                    ? [
                        '0 5px 20px rgba(245, 158, 11, 0.4)',
                        '0 10px 30px rgba(245, 158, 11, 0.6)',
                        '0 5px 20px rgba(245, 158, 11, 0.4)',
                      ]
                    : [
                        '0 5px 20px rgba(102, 126, 234, 0.4)',
                        '0 10px 30px rgba(102, 126, 234, 0.6)',
                        '0 5px 20px rgba(102, 126, 234, 0.4)',
                      ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
            >
              <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {getButtonText()}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* Hint progressivo - V7-v2 */}
            <AnimatePresence>
              {currentHint && (
                <motion.div
                  className="text-center mt-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <motion.p
                    className="text-amber-400 text-xs font-medium"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentHint}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ========== ZONE 3: PLAYER CONTROLS ========== */}
      {/* Player controls ocupam ~80px no bottom - gerenciado por V7MinimalControls */}
      {/* Não renderizamos aqui, apenas deixamos espaço reservado */}
    </div>
  );
};

export default V7PhasePlayground;
