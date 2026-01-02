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
    // ✅ V7-v25: Melhor responsivo para iPad/mobile - safe-area + padding bottom maior
    <div className="absolute inset-0 flex items-start md:items-center justify-center bg-black/70 backdrop-blur-md z-40 p-4 pt-8 pb-40 md:pb-32 overflow-y-auto">
      <motion.div
        className="w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-3xl md:text-4xl mb-2">⚔️</div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
            A DIFERENÇA NA PRÁTICA
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base">Prompt amador vs profissional</p>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Amateur */}
          <motion.div
            className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 md:p-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm font-bold text-red-400 mb-3 md:mb-4 flex items-center gap-2">
              <span>😬</span> PROMPT AMADOR
            </div>

            <div className="bg-gray-900/80 rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm text-gray-300 mb-3 md:mb-4">
              {interaction.amateurPrompt}
            </div>

            {showResults && interaction.amateurResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 md:mt-4"
              >
                <div className="text-xs text-gray-500 mb-2">RESULTADO:</div>
                <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 text-xs md:text-sm text-gray-400 max-h-[120px] md:max-h-[150px] overflow-y-auto">
                  {typeof interaction.amateurResult === 'object' ? interaction.amateurResult.content : interaction.amateurResult}
                </div>
                {typeof interaction.amateurResult === 'object' && (
                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <span className="text-red-400 text-xs md:text-sm">{interaction.amateurResult.verdict}</span>
                    <span className="bg-red-500/20 text-red-400 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {interaction.amateurResult.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Professional */}
          <motion.div
            className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 md:p-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm font-bold text-green-400 mb-3 md:mb-4 flex items-center gap-2">
              <span>💪</span> PROMPT PROFISSIONAL
            </div>

            <div className="bg-gray-900/80 rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm text-gray-300 mb-3 md:mb-4 max-h-[100px] md:max-h-[120px] overflow-y-auto">
              {interaction.professionalPrompt}
            </div>

            {showResults && interaction.professionalResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 md:mt-4"
              >
                <div className="text-xs text-gray-500 mb-2">RESULTADO:</div>
                <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 text-xs md:text-sm text-gray-300 max-h-[120px] md:max-h-[150px] overflow-y-auto whitespace-pre-line">
                  {typeof interaction.professionalResult === 'object' ? interaction.professionalResult.content : interaction.professionalResult}
                </div>
                {typeof interaction.professionalResult === 'object' && (
                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <span className="text-green-400 text-xs md:text-sm">{interaction.professionalResult.verdict}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {interaction.professionalResult.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Action Button - ✅ V7-v25: Botão fixo na área segura, acima do player */}
        <motion.div
          className="sticky bottom-0 left-0 right-0 pt-4 pb-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent -mx-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-center">
            {!showResults ? (
              <motion.button
                onClick={() => setShowResults(true)}
                className="px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold rounded-2xl transition-all text-base md:text-lg shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VER RESULTADOS
              </motion.button>
            ) : (
              <motion.button
                onClick={onComplete}
                className="px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold rounded-2xl transition-all text-base md:text-lg shadow-lg shadow-green-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: ['0 10px 25px rgba(34, 197, 94, 0.3)', '0 10px 40px rgba(34, 197, 94, 0.5)', '0 10px 25px rgba(34, 197, 94, 0.3)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✅ CONTINUAR
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
