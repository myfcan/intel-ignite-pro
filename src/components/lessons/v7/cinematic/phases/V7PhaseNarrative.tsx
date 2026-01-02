// V7PhaseNarrative - Split screen comparison narrative phase
// Shows 98% vs 2% with animated data reveals

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComparisonData {
  label: string;
  leftValue: string;
  rightValue: string;
  leftColor?: string;
  rightColor?: string;
}

interface V7PhaseNarrativeProps {
  leftTitle: string;
  rightTitle: string;
  leftEmoji: string;
  rightEmoji: string;
  comparisons: ComparisonData[];
  warningTitle?: string;
  warningSubtitle?: string;
  sceneIndex: number;
  phaseProgress: number;
  // ✅ NEW: Center prompt box - displayed between the two sides
  centerPrompt?: string;
  centerEmoji?: string;
}

export const V7PhaseNarrative = ({
  leftTitle,
  rightTitle,
  leftEmoji,
  rightEmoji,
  comparisons,
  warningTitle,
  warningSubtitle,
  sceneIndex,
  phaseProgress,
  centerPrompt,
  centerEmoji,
}: V7PhaseNarrativeProps) => {
  const [animatedValues, setAnimatedValues] = useState<Map<number, { left: number; right: number }>>(new Map());
  const [showWarning, setShowWarning] = useState(false);

  // Scene 0: Show split screen header
  // Scene 1: Animate comparison rows one by one
  // Scene 2: Show warning/urgency section

  // Animate numeric values
  useEffect(() => {
    if (sceneIndex >= 1) {
      comparisons.forEach((comp, index) => {
        setTimeout(() => {
          const leftNum = parseInt(comp.leftValue.replace(/\D/g, '')) || 0;
          const rightNum = parseInt(comp.rightValue.replace(/\D/g, '')) || 0;
          
          let leftCurrent = 0;
          let rightCurrent = 0;
          
          const interval = setInterval(() => {
            leftCurrent = Math.min(leftCurrent + Math.ceil(leftNum / 30), leftNum);
            rightCurrent = Math.min(rightCurrent + Math.ceil(rightNum / 30), rightNum);
            
            setAnimatedValues(prev => {
              const newMap = new Map(prev);
              newMap.set(index, { left: leftCurrent, right: rightCurrent });
              return newMap;
            });
            
            if (leftCurrent >= leftNum && rightCurrent >= rightNum) {
              clearInterval(interval);
            }
          }, 30);
        }, index * 400);
      });
    }
  }, [sceneIndex, comparisons]);

  // Show warning section
  useEffect(() => {
    if (sceneIndex >= 2) {
      setShowWarning(true);
    }
  }, [sceneIndex]);

  const getDisplayValue = (value: string, index: number, side: 'left' | 'right') => {
    // If no value provided, show placeholder
    if (!value) return side === 'left' ? 'R$ 0' : 'R$ 30K';

    const animatedValue = animatedValues.get(index);
    // If no animation yet, show the original value
    if (!animatedValue) return value;

    // Try to extract and animate numeric parts
    const numericPart = value.replace(/\D/g, '');
    if (!numericPart) return value; // No numbers to animate, return as-is

    const prefix = value.match(/^[^\d]*/)?.[0] || '';
    const suffix = value.match(/[^\d]*$/)?.[0] || '';

    const currentNum = side === 'left' ? animatedValue.left : animatedValue.right;
    return `${prefix}${currentNum.toLocaleString()}${suffix}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden min-h-screen">
      {/* Split Screen Header - Estrutura reorganizada para centralização */}
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: sceneIndex >= 0 ? 1 : 0, y: sceneIndex >= 0 ? 0 : -30 }}
        transition={{ duration: 0.6 }}
      >
        {/* Row 1: Emojis + VS */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-4">
          {/* Left Emoji */}
          <motion.span 
            className="text-4xl sm:text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {leftEmoji}
          </motion.span>

          {/* VS Divider - centralizado */}
          <motion.div
            className="text-white/30 text-xl sm:text-3xl font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            VS
          </motion.div>

          {/* Right Emoji */}
          <motion.span 
            className="text-4xl sm:text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {rightEmoji}
          </motion.span>
        </div>

        {/* Row 2: Titles - abaixo do VS, centralizados */}
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          {/* Left Title */}
          <motion.div
            className="text-xl sm:text-3xl md:text-4xl font-bold text-[#ff6b6b] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {leftTitle}
          </motion.div>

          {/* Spacer invisível para manter alinhamento com VS */}
          <div className="w-8 sm:w-12" />

          {/* Right Title */}
          <motion.div
            className="text-xl sm:text-3xl md:text-4xl font-bold text-[#4ecdc4] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {rightTitle}
          </motion.div>
        </div>
      </motion.div>

      {/* ✅ Center Prompt Box - positioned between the headers and comparisons */}
      {centerPrompt && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
        >
          <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 justify-center">
              {centerEmoji && (
                <span className="text-2xl sm:text-3xl">{centerEmoji}</span>
              )}
              <span className="text-lg sm:text-xl font-medium text-white/90">
                {centerPrompt}
              </span>
            </div>
          </div>
        </motion.div>
      )}
      <div className="w-full max-w-4xl space-y-4">
        {comparisons.map((comp, index) => (
          <motion.div
            key={index}
            className="grid grid-cols-3 gap-4 items-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: sceneIndex >= 1 ? 1 : 0,
              x: sceneIndex >= 1 ? 0 : -50,
            }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            {/* Left Value */}
            <motion.div
              className="text-right"
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: comp.leftColor || '#ff6b6b' }}
              >
                {getDisplayValue(comp.leftValue, index, 'left')}
              </div>
            </motion.div>

            {/* Label */}
            <div className="text-center text-white/60 text-sm sm:text-base">
              {comp.label}
            </div>

            {/* Right Value */}
            <motion.div
              className="text-left"
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="text-2xl sm:text-3xl font-bold"
                style={{ 
                  color: comp.rightColor || '#4ecdc4',
                  textShadow: `0 0 20px ${comp.rightColor || '#4ecdc4'}40`,
                }}
              >
                {getDisplayValue(comp.rightValue, index, 'right')}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Warning/Urgency Section */}
      <AnimatePresence>
        {showWarning && warningTitle && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                  '0 0 40px rgba(245, 158, 11, 0.4)',
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">⚠️</span>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {warningTitle}
                </div>
                {warningSubtitle && (
                  <div className="text-white/70 text-sm sm:text-base">
                    {warningSubtitle}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default V7PhaseNarrative;
