// V7PhasePlayground - Split screen playground: Amateur vs Professional
// ✅ REFACTORED: User-driven progression with continue button
// - PAUSES audio when entering playground
// - User clicks pulsing button to see next step
// - Audio stays paused until user completes all steps

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaygroundResult {
  title: string;
  content: string;
  score: number;
  maxScore: number;
  verdict: 'bad' | 'good' | 'excellent';
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
  audioControl?: {
    pause: () => void;
    play: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
  };
}

// Steps: 0=intro, 1=amateur, 2=amateur-result, 3=professional, 4=professional-result, 5=comparison
type PlaygroundStep = 0 | 1 | 2 | 3 | 4 | 5;

export const V7PhasePlayground = ({
  challengeTitle,
  challengeSubtitle,
  amateurPrompt,
  amateurResult,
  professionalPrompt,
  professionalResult,
  onComplete,
  audioControl,
}: V7PhasePlaygroundProps) => {
  const [currentStep, setCurrentStep] = useState<PlaygroundStep>(0);
  const [audioPausedByPlayground, setAudioPausedByPlayground] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;

  // ✅ PAUSE audio immediately when playground appears
  useEffect(() => {
    const ctrl = audioControlRef.current;
    if (ctrl?.isPlaying) {
      ctrl.pause();
      setAudioPausedByPlayground(true);
      console.log('[V7PhasePlayground] Audio paused - waiting for user to complete all steps');
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as PlaygroundStep);
    } else {
      // Final step - resume audio and complete the playground
      const ctrl = audioControlRef.current;
      if (audioPausedByPlayground && ctrl && !ctrl.isPlaying) {
        ctrl.play();
        setAudioPausedByPlayground(false);
        console.log('[V7PhasePlayground] Audio resumed after completing all steps');
      }
      onCompleteRef.current?.();
    }
  }, [currentStep, audioPausedByPlayground]);

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
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 0: return 'Ver Prompt Amador →';
      case 1: return 'Ver Resultado →';
      case 2: return 'Ver Prompt Profissional →';
      case 3: return 'Ver Resultado →';
      case 4: return 'Ver Comparação →';
      case 5: return 'Continuar Aula →';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 pb-24 overflow-y-auto">
      <div className="w-full max-w-2xl">
        {/* Challenge Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-3"
          >
            <span className="text-xl">🎮</span>
            <span className="text-base font-bold text-purple-300">DESAFIO PRÁTICO</span>
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {challengeTitle}
          </h2>
          {challengeSubtitle && (
            <p className="text-white/60 text-sm">{challengeSubtitle}</p>
          )}
        </motion.div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-1 mb-4">
          {[0, 1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
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
          className="text-center text-lg font-semibold text-white/80 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getStepTitle()}
        </motion.h3>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {/* Step 0: Intro */}
          {currentStep === 0 && (
            <motion.div
              key="intro"
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-6xl mb-4">🆚</div>
              <p className="text-white/70">
                Veja a diferença entre um prompt amador e um prompt profissional
              </p>
            </motion.div>
          )}

          {/* Step 1: Amateur Prompt */}
          {currentStep === 1 && (
            <motion.div
              key="amateur-prompt"
              className="bg-white/[0.02] border-2 border-red-500/30 rounded-xl p-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">AMADOR</span>
                <span className="text-white/50 text-sm">Prompt simples</span>
              </div>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-red-300">
                {amateurPrompt}
              </div>
            </motion.div>
          )}

          {/* Step 2: Amateur Result */}
          {currentStep === 2 && (
            <motion.div
              key="amateur-result"
              className={`rounded-xl p-4 border ${getVerdictBg(amateurResult.verdict)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-white/60 text-sm mb-2">RESULTADO DO AMADOR:</div>
              <div className="text-white/90 text-sm mb-4 whitespace-pre-line">
                {amateurResult.content}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-white/50 text-sm">Valor comercial:</span>
                <span className={`text-2xl font-bold ${getVerdictColor(amateurResult.verdict)}`}>
                  R$ {amateurResult.score}
                </span>
              </div>
            </motion.div>
          )}

          {/* Step 3: Professional Prompt */}
          {currentStep === 3 && (
            <motion.div
              key="professional-prompt"
              className="bg-white/[0.02] border-2 border-green-500/30 rounded-xl p-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-500 text-black text-xs font-bold rounded">PROFISSIONAL</span>
                <span className="text-white/50 text-sm">Método PERFEITO</span>
              </div>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-green-300 max-h-[200px] overflow-y-auto whitespace-pre-line">
                {professionalPrompt}
              </div>
            </motion.div>
          )}

          {/* Step 4: Professional Result */}
          {currentStep === 4 && (
            <motion.div
              key="professional-result"
              className={`rounded-xl p-4 border ${getVerdictBg(professionalResult.verdict)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-white/60 text-sm mb-2">RESULTADO DO PROFISSIONAL:</div>
              <div className="text-white/90 text-sm mb-4 whitespace-pre-line max-h-[150px] overflow-y-auto">
                {professionalResult.content}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-white/50 text-sm">Valor comercial:</span>
                <motion.span
                  className={`text-2xl font-bold ${getVerdictColor(professionalResult.verdict)}`}
                  style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
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
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="inline-block px-8 py-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                    '0 0 40px rgba(168, 85, 247, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-red-400 text-2xl font-bold">R$ {amateurResult.score}</div>
                    <div className="text-white/50 text-xs">Amador</div>
                  </div>
                  <div className="text-white/30 text-2xl">→</div>
                  <div className="text-center">
                    <div className="text-green-400 text-2xl font-bold">R$ {professionalResult.score}</div>
                    <div className="text-white/50 text-xs">Profissional</div>
                  </div>
                </div>
                <div className="text-cyan-400 text-lg font-bold">
                  +R$ {professionalResult.score - amateurResult.score} com o método certo!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button - PULSING to draw attention */}
        <motion.button
          className="w-full mt-6 py-4 px-8 text-lg font-bold text-white rounded-full relative overflow-hidden"
          style={{
            background: currentStep === 5
              ? 'linear-gradient(135deg, #00d9a6, #4ecdc4)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
          animate={{
            scale: [1, 1.03, 1],
            boxShadow: currentStep === 5
              ? [
                  '0 10px 30px rgba(0, 217, 166, 0.4)',
                  '0 15px 50px rgba(0, 217, 166, 0.7)',
                  '0 10px 30px rgba(0, 217, 166, 0.4)',
                ]
              : [
                  '0 10px 30px rgba(102, 126, 234, 0.4)',
                  '0 15px 50px rgba(102, 126, 234, 0.7)',
                  '0 10px 30px rgba(102, 126, 234, 0.4)',
                ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.05 }}
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
      </div>
    </div>
  );
};

export default V7PhasePlayground;
