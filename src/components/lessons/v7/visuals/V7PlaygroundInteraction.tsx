/**
 * V7PlaygroundInteraction - Comparação de prompts amador vs profissional
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { V7PlaygroundInteraction as V7PlaygroundType } from '@/types/V7Contract';

interface V7PlaygroundInteractionProps {
  interaction: V7PlaygroundType;
  onComplete: () => void;
}

export default function V7PlaygroundInteraction({ interaction, onComplete }: V7PlaygroundInteractionProps) {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40 p-4">
      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚔️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            A DIFERENÇA NA PRÁTICA
          </h2>
          <p className="text-gray-400 mt-2">Prompt amador vs profissional</p>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Amateur */}
          <motion.div
            className="bg-red-900/20 border border-red-500/30 rounded-xl p-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
              <span>😬</span> PROMPT AMADOR
            </div>

            <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 mb-4">
              {interaction.amateurPrompt}
            </div>

            {showResults && interaction.amateurResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="text-xs text-gray-500 mb-2">RESULTADO:</div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
                  {typeof interaction.amateurResult === 'object' ? interaction.amateurResult.content : interaction.amateurResult}
                </div>
                {typeof interaction.amateurResult === 'object' && (
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-red-400 text-sm">{interaction.amateurResult.verdict}</span>
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
                      {interaction.amateurResult.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Professional */}
          <motion.div
            className="bg-green-900/20 border border-green-500/30 rounded-xl p-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
              <span>💪</span> PROMPT PROFISSIONAL
            </div>

            <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 mb-4 max-h-[120px] overflow-y-auto">
              {interaction.professionalPrompt}
            </div>

            {showResults && interaction.professionalResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="text-xs text-gray-500 mb-2">RESULTADO:</div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 max-h-[150px] overflow-y-auto whitespace-pre-line">
                  {typeof interaction.professionalResult === 'object' ? interaction.professionalResult.content : interaction.professionalResult}
                </div>
                {typeof interaction.professionalResult === 'object' && (
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-green-400 text-sm">{interaction.professionalResult.verdict}</span>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                      {interaction.professionalResult.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-colors"
            >
              VER RESULTADOS
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition-colors"
            >
              CONTINUAR
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
