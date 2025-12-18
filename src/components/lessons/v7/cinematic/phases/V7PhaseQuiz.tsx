// V7PhaseQuiz - Interactive self-assessment quiz phase
// Features: Checkboxes with animation, result reveal, personalized feedback

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizOption {
  id: string;
  text: string;
  category: 'good' | 'bad';
}

interface V7PhaseQuizProps {
  title: string;
  subtitle?: string;
  options: QuizOption[];
  revealTitle: string;
  revealMessage: string;
  revealValue?: string;
  sceneIndex: number;
  onComplete?: (selectedIds: string[]) => void;
  audioControl?: {
    pause: () => void;
    play: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
  };
}

export const V7PhaseQuiz = ({
  title,
  subtitle,
  options,
  revealTitle,
  revealMessage,
  revealValue,
  sceneIndex,
  onComplete,
  audioControl,
}: V7PhaseQuizProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Track if we paused the audio (so we only resume what we paused)
  const [audioPausedByQuiz, setAudioPausedByQuiz] = useState(false);

  // ✅ Use refs to ensure stable audioControl reference in callbacks
  const audioControlRef = useRef(audioControl);
  audioControlRef.current = audioControl;

  // ✅ Show reminder if user doesn't interact within 7 seconds
  useEffect(() => {
    if (isRevealed || selectedIds.length > 0) {
      setShowReminder(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!isRevealed && selectedIds.length === 0) {
        setShowReminder(true);
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [isRevealed, selectedIds.length]);

  // Auto-pause audio when quiz appears (Bug #13 fix)
  // ✅ Add 2 second delay to let current narration sentence finish
  useEffect(() => {
    const timer = setTimeout(() => {
      const ctrl = audioControlRef.current;
      if (ctrl?.isPlaying) {
        ctrl.pause();
        setAudioPausedByQuiz(true);
        console.log('[V7PhaseQuiz] Audio paused for interaction (after 2s delay)');
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
      if (audioPausedByQuiz && ctrl && !ctrl.isPlaying) {
        ctrl.play();
        console.log('[V7PhaseQuiz] Audio resumed after quiz exit');
      }
    };
  }, [audioPausedByQuiz]);

  // Scene 0: Show title and quiz icon
  // Scene 1: Show options with animation
  // Scene 2: User selects options (interaction)
  // Scene 3: Reveal result

  const toggleOption = useCallback((id: string) => {
    if (isRevealed) return;
    
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, [isRevealed]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
    setTimeout(() => setShowResult(true), 500);

    // Resume audio after showing result (2 seconds delay for user to see feedback)
    setTimeout(() => {
      const ctrl = audioControlRef.current;
      if (audioPausedByQuiz && ctrl && !ctrl.isPlaying) {
        ctrl.play();
        setAudioPausedByQuiz(false); // Mark as resumed so cleanup doesn't double-resume
        console.log('[V7PhaseQuiz] Audio resumed after quiz completion');
      }
    }, 2500);

    onComplete?.(selectedIds);
  }, [selectedIds, onComplete, audioPausedByQuiz]);

  const badCount = selectedIds.filter(id => 
    options.find(o => o.id === id)?.category === 'bad'
  ).length;

  const isInBadGroup = badCount >= selectedIds.length / 2;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
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

        {/* Reminder message after 7 seconds of no interaction */}
        <AnimatePresence>
          {showReminder && !isRevealed && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.p
                className="text-amber-400 text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👆 Estou esperando sua resposta... Selecione as opções acima!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Reveal */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className={`
                  inline-block px-8 py-6 rounded-2xl border-2
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
                {revealValue && (
                  <div className="text-white/70">
                    {revealMessage}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default V7PhaseQuiz;
