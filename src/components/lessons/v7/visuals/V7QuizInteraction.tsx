/**
 * V7QuizInteraction - Componente de quiz interativo
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { V7QuizInteraction as V7QuizInteractionType, V7QuizOption } from '@/types/V7Contract';

interface V7QuizInteractionProps {
  interaction: V7QuizInteractionType;
  onAnswer: (option: V7QuizOption) => void;
}

export default function V7QuizInteraction({ interaction, onAnswer }: V7QuizInteractionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (option: V7QuizOption) => {
    if (selectedId) return; // Already selected
    setSelectedId(option.id);

    // Small delay before triggering answer callback
    setTimeout(() => {
      onAnswer(option);
    }, 300);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
      <motion.div
        className="w-full max-w-2xl px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Question */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {interaction.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {interaction.options.map((option, index) => (
            <motion.button
              key={option.id}
              className={`w-full text-left p-4 md:p-6 rounded-xl border-2 transition-all ${
                selectedId === option.id
                  ? option.isCorrect
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-red-500 bg-red-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-cyan-500 hover:bg-cyan-500/10'
              }`}
              onClick={() => handleSelect(option)}
              disabled={selectedId !== null}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={selectedId === null ? { scale: 1.02 } : {}}
              whileTap={selectedId === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg text-white">{option.text}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Hint (timeout) */}
        {interaction.timeout && (
          <motion.div
            className="text-center text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {interaction.timeout.hints[0]}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
