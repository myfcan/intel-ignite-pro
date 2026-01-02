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
interface PlaygroundResult {
  title: string;
  content: string;
  score: number;
  maxScore: number;
  verdict: 'bad' | 'good' | 'excellent';
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
}

// ✅ V7-vv: User challenge data structure
interface UserChallenge {
  instruction: string;
  challengePrompt: string;
  hints: string[];
}

interface V7PhasePlaygroundProps {
  challengeTitle: string;
  challengeSubtitle?: string;
  amateurPrompt: string;
  amateurResult: PlaygroundResult;
  professionalPrompt: string;
  professionalResult: PlaygroundResult;
  sceneIndex: number;
  phaseProgress: number;
  onComplete?: () => void;
  audioControl?: AudioControl;
  // V7-v2: Configuração de timeouts
  timeoutConfig?: {
    perStep: number;   // segundos por step sem interação
    hints: string[];
  };
  // ✅ V7-vv: User challenge (optional - step 6)
  userChallenge?: UserChallenge;
  // ✅ V7-v26: Lesson ID para salvar sessões
  lessonId?: string;
}

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

    if (currentStep < maxStep) {
      setCurrentStep((prev) => (prev + 1) as PlaygroundStep);
    } else {
      // ✅ V7-v2: Final step - resume audio with FADE
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
  }, [currentStep, audioPausedByPlayground, maxStep]);

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

  const getVerdictColor = (verdict: PlaygroundResult['verdict']) => {
    switch (verdict) {
      case 'bad': return 'text-red-400';
      case 'good': return 'text-yellow-400';
      case 'excellent': return 'text-green-400';
    }
  };

  const getVerdictBg = (verdict: PlaygroundResult['verdict']) => {
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
      case 0: return 'Ver Prompt Amador →';
      case 1: return 'Ver Resultado →';
      case 2: return 'Ver Prompt Profissional →';
      case 3: return 'Ver Resultado →';
      case 4: return 'Ver Comparação →';
      case 5: return userChallenge ? 'Aceitar o Desafio →' : 'Continuar Aula →';
      case 6: return 'Finalizar Aula →';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-3 sm:p-4 pb-20">
      <div className="w-full max-w-xl flex flex-col h-full">
        {/* Challenge Header - compacto */}
        <motion.div
          className="text-center mb-2 sm:mb-3 flex-shrink-0"
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
        <div className="flex justify-center gap-1 mb-2 flex-shrink-0">
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
          className="text-center text-sm sm:text-base font-semibold text-white/80 mb-2 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {getStepTitle()}
        </motion.h3>

        {/* Content Area - flex-grow para ocupar espaço disponível */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Step 0: Intro */}
            {currentStep === 0 && (
              <motion.div
                key="intro"
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-5xl sm:text-6xl mb-3">🆚</div>
                <p className="text-white/70 text-sm">
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
                  <span className={`text-xl font-bold ${getVerdictColor(amateurResult.verdict)}`}>
                    R$ {amateurResult.score}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Professional Prompt */}
            {currentStep === 3 && (
              <motion.div
                key="professional-prompt"
                className="w-full bg-white/[0.02] border border-green-500/30 rounded-lg p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded">PROFISSIONAL</span>
                  <span className="text-white/50 text-xs">Método PERFEITO</span>
                </div>
                <div className="bg-black/40 rounded p-3 font-mono text-[10px] sm:text-xs text-green-300 max-h-32 overflow-y-auto whitespace-pre-line">
                  {professionalPrompt}
                </div>
              </motion.div>
            )}

            {/* Step 4: Professional Result */}
            {currentStep === 4 && (
              <motion.div
                key="professional-result"
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
                  <motion.span
                    className={`text-xl font-bold ${getVerdictColor(professionalResult.verdict)}`}
                    style={{ textShadow: '0 0 15px rgba(34, 197, 94, 0.5)' }}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    R$ {professionalResult.score}
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Step 5: Comparison */}
            {currentStep === 5 && (
              <motion.div
                key="comparison"
                className="text-center w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="inline-block px-6 py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(168, 85, 247, 0.3)',
                      '0 0 25px rgba(168, 85, 247, 0.5)',
                      '0 0 15px rgba(168, 85, 247, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-red-400 text-lg sm:text-xl font-bold">R$ {amateurResult.score}</div>
                      <div className="text-white/50 text-[10px]">Amador</div>
                    </div>
                    <div className="text-white/30 text-xl">→</div>
                    <div className="text-center">
                      <div className="text-green-400 text-lg sm:text-xl font-bold">R$ {professionalResult.score}</div>
                      <div className="text-white/50 text-[10px]">Profissional</div>
                    </div>
                  </div>
                  <div className="text-cyan-400 text-sm sm:text-base font-bold">
                    +R$ {professionalResult.score - amateurResult.score} com o método certo!
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 6: User Challenge */}
            {currentStep === 6 && userChallenge && (
              <motion.div
                key="user-challenge"
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
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

        {/* Continue Button - fixed at bottom, não mostrar no step 6 */}
        {currentStep !== 6 && (
          <motion.button
            className="w-full mt-3 py-3 px-6 text-sm font-bold text-white rounded-full relative overflow-hidden flex-shrink-0"
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
        )}

        {/* Hint progressivo - V7-v2 */}
        <AnimatePresence>
          {currentHint && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.p
                className="text-amber-400 text-sm font-medium"
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
  );
};

export default V7PhasePlayground;
