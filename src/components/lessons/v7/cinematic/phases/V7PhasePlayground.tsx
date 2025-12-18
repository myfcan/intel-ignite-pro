// V7PhasePlayground - Split screen playground: Amateur vs Professional
// Based on spec: Shows contrast between simple and PERFEITO method prompts

import { useState, useEffect, useRef } from 'react';
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

export const V7PhasePlayground = ({
  challengeTitle,
  challengeSubtitle,
  amateurPrompt,
  amateurResult,
  professionalPrompt,
  professionalResult,
  sceneIndex,
  phaseProgress,
  onComplete,
  audioControl,
}: V7PhasePlaygroundProps) => {
  const [showAmateur, setShowAmateur] = useState(false);
  const [showAmateurResult, setShowAmateurResult] = useState(false);
  const [showProfessional, setShowProfessional] = useState(false);
  const [showProfessionalResult, setShowProfessionalResult] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [amateurTyped, setAmateurTyped] = useState('');
  const [professionalTyped, setProfessionalTyped] = useState('');
  const [audioPausedByPlayground, setAudioPausedByPlayground] = useState(false);

  // ✅ Use refs to ensure stable audioControl reference in callbacks
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Auto-pause audio when playground appears
  // ✅ Add 2 second delay to let current narration sentence finish
  useEffect(() => {
    const timer = setTimeout(() => {
      const ctrl = audioControlRef.current;
      if (ctrl?.isPlaying) {
        ctrl.pause();
        setAudioPausedByPlayground(true);
        console.log('[V7PhasePlayground] Audio paused for interaction (after 2s delay)');
      }
    }, 2000); // Wait 2 seconds for narration to finish current sentence

    return () => clearTimeout(timer);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume audio when component unmounts (only if we paused it)
  useEffect(() => {
    return () => {
      const ctrl = audioControlRef.current;
      if (audioPausedByPlayground && ctrl && !ctrl.isPlaying) {
        ctrl.play();
        console.log('[V7PhasePlayground] Audio resumed after playground exit');
      }
    };
  }, [audioPausedByPlayground]);

  // ✅ Show content immediately on mount - no waiting for sceneIndex
  useEffect(() => {
    // Start showing amateur side immediately
    const timer1 = setTimeout(() => setShowAmateur(true), 300);
    const timer2 = setTimeout(() => setShowAmateurResult(true), 2000);
    const timer3 = setTimeout(() => setShowProfessional(true), 3500);
    const timer4 = setTimeout(() => setShowProfessionalResult(true), 5500);
    const timer5 = setTimeout(() => {
      setShowComparison(true);
      // Resume audio when playground completes
      const ctrl = audioControlRef.current;
      if (audioPausedByPlayground && ctrl && !ctrl.isPlaying) {
        ctrl.play();
        setAudioPausedByPlayground(false);
        console.log('[V7PhasePlayground] Audio resumed after playground completion');
      }
      onCompleteRef.current?.();
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [audioPausedByPlayground]);

  // Typing animation for amateur prompt
  useEffect(() => {
    if (showAmateur && amateurTyped.length < amateurPrompt.length) {
      const timeout = setTimeout(() => {
        setAmateurTyped(amateurPrompt.slice(0, amateurTyped.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [showAmateur, amateurTyped, amateurPrompt]);

  // Typing animation for professional prompt
  useEffect(() => {
    if (showProfessional && professionalTyped.length < professionalPrompt.length) {
      const timeout = setTimeout(() => {
        setProfessionalTyped(professionalPrompt.slice(0, professionalTyped.length + 1));
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [showProfessional, professionalTyped, professionalPrompt]);

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl">
        {/* Challenge Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xl">🎮</span>
            <span className="text-lg font-bold text-purple-300">DESAFIO</span>
          </motion.div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {challengeTitle}
          </h2>
          {challengeSubtitle && (
            <p className="text-white/60">{challengeSubtitle}</p>
          )}
        </motion.div>

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Amateur Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: showAmateur ? 1 : 0, x: showAmateur ? 0 : -50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/[0.02] border-2 border-red-500/30 rounded-2xl p-4 sm:p-6 h-full">
              {/* Badge */}
              <div className="absolute -top-3 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                MODO AMADOR
              </div>

              {/* Prompt Box */}
              <div className="bg-black/40 rounded-xl p-4 mb-4 min-h-[100px] font-mono text-sm">
                <span className="text-red-300">{amateurTyped}</span>
                {/* Cursor only shows while typing is in progress */}
                {showAmateur && amateurTyped.length < amateurPrompt.length && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-red-400 ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Result */}
              <AnimatePresence>
                {showAmateurResult && (
                  <motion.div
                    className={`rounded-xl p-4 border ${getVerdictBg(amateurResult.verdict)}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-white/60 text-sm mb-2">RESULTADO:</div>
                    <div className="text-white/90 text-sm mb-4 whitespace-pre-line">
                      {amateurResult.content}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-white/50 text-sm">Valor comercial:</span>
                      <span className={`text-xl font-bold ${getVerdictColor(amateurResult.verdict)}`}>
                        R$ {amateurResult.score}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Professional Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: showProfessional ? 1 : 0, x: showProfessional ? 0 : 50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/[0.02] border-2 border-green-500/30 rounded-2xl p-4 sm:p-6 h-full">
              {/* Badge */}
              <div className="absolute -top-3 left-4 px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
                MODO PROFISSIONAL
              </div>

              {/* Prompt Box */}
              <div className="bg-black/40 rounded-xl p-4 mb-4 min-h-[100px] font-mono text-xs sm:text-sm max-h-[200px] overflow-y-auto">
                <span className="text-green-300 whitespace-pre-line">{professionalTyped}</span>
                {/* Cursor only shows while typing is in progress */}
                {showProfessional && professionalTyped.length < professionalPrompt.length && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-green-400 ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Result */}
              <AnimatePresence>
                {showProfessionalResult && (
                  <motion.div
                    className={`rounded-xl p-4 border ${getVerdictBg(professionalResult.verdict)}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-white/60 text-sm mb-2">RESULTADO:</div>
                    <div className="text-white/90 text-sm mb-4 whitespace-pre-line max-h-[150px] overflow-y-auto">
                      {professionalResult.content}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-white/50 text-sm">Valor comercial:</span>
                      <motion.span 
                        className={`text-xl font-bold ${getVerdictColor(professionalResult.verdict)}`}
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
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Comparison Summary */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                    '0 0 40px rgba(168, 85, 247, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-white/70 text-sm mb-1">💡 Diferença</div>
                <div className="text-2xl font-bold text-white mb-1">
                  30 segundos = R$ {professionalResult.score - amateurResult.score}
                </div>
                <div className="text-cyan-400 text-sm">
                  Isso é R$ {((professionalResult.score - amateurResult.score) * 60).toLocaleString()}/hora
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default V7PhasePlayground;
