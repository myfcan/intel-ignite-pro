/**
 * V7FeedbackOverlay - Mostra feedback após responder quiz
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { V7QuizFeedback } from '@/types/V7Contract';

interface V7FeedbackOverlayProps {
  feedback: V7QuizFeedback;
  isCorrect: boolean;
  onContinue: () => void;
}

export default function V7FeedbackOverlay({ feedback, isCorrect, onContinue }: V7FeedbackOverlayProps) {
  const moodColors = {
    success: { bg: 'bg-green-900/80', border: 'border-green-500', text: 'text-green-400' },
    warning: { bg: 'bg-yellow-900/80', border: 'border-yellow-500', text: 'text-yellow-400' },
    danger: { bg: 'bg-red-900/80', border: 'border-red-500', text: 'text-red-400' },
    neutral: { bg: 'bg-gray-900/80', border: 'border-gray-500', text: 'text-gray-400' },
  };

  const colors = moodColors[feedback.mood as keyof typeof moodColors] || moodColors.neutral;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
      <motion.div
        className={`max-w-lg mx-4 p-8 rounded-2xl ${colors.bg} border-2 ${colors.border}`}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Icon */}
        <motion.div
          className="text-6xl text-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {isCorrect ? '✅' : feedback.mood === 'warning' ? '⚠️' : '❌'}
        </motion.div>

        {/* Title */}
        <motion.h3
          className={`text-2xl md:text-3xl font-bold text-center ${colors.text} mb-2`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {feedback.title}
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          className="text-lg text-gray-300 text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {feedback.subtitle}
        </motion.p>

        {/* Continue Button */}
        <motion.button
          className={`w-full py-4 rounded-xl font-bold text-lg text-black transition-colors ${
            isCorrect
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-cyan-500 hover:bg-cyan-600'
          }`}
          onClick={onContinue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          CONTINUAR
        </motion.button>
      </motion.div>
    </div>
  );
}
