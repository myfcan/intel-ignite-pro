import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ZoomOut, Grid3X3, Lightbulb } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectMapVisual: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Transformando medo em mapa visual!",
  subtitle = "Da confusão para uma visão clara do que importa"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneDuration = ((duration || 14) * 1000) / 4;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const chaosSymbols = ["$", "123", "%", "#", "456", "@", "789", "&", "0"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Emaranhado de números e símbolos (confusão) */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64"
          >
            {chaosSymbols.map((symbol, i) => (
              <motion.span
                key={i}
                className="absolute text-lg sm:text-2xl font-bold text-indigo-400/70 dark:text-indigo-500/50"
                initial={{ 
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 150 - 75,
                  rotate: Math.random() * 360,
                  opacity: 0 
                }}
                animate={{ 
                  opacity: 1,
                  x: [null, Math.random() * 40 - 20],
                  y: [null, Math.random() * 40 - 20],
                  rotate: [null, Math.random() * 30 - 15]
                }}
                transition={{ 
                  delay: i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  left: `${20 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 30}%`,
                }}
              >
                {symbol}
              </motion.span>
            ))}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Shuffle className="w-6 h-6" />
              <span className="text-sm font-medium">Confusão inicial</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Zoom out começando */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64 flex items-center justify-center"
          >
            <motion.div
              className="relative"
              animate={{ scale: [1, 0.8] }}
              transition={{ duration: 1.5 }}
            >
              {chaosSymbols.map((symbol, i) => (
                <motion.span
                  key={i}
                  className="absolute text-base sm:text-lg font-medium text-indigo-400/50"
                  animate={{ 
                    x: (i % 3 - 1) * 50,
                    y: (Math.floor(i / 3) - 1) * 40,
                    opacity: 0.5
                  }}
                  transition={{ duration: 1 }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                >
                  {symbol}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ZoomOut className="w-6 h-6" />
              <span className="text-sm font-medium">Afastando para ver...</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Elementos se reorganizam em quadro com colunas */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-64 sm:w-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Data", "Tipo", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-2 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs sm:text-sm font-medium text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-6 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Grid3X3 className="w-5 h-5" />
              <span className="text-sm font-medium">Estrutura clara</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Linhas se iluminam em sequência */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-64 sm:w-80">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Data", "Tipo", "Valor"].map((col) => (
                  <div
                    key={col}
                    className="px-2 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs sm:text-sm font-medium text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[0, 1, 2].map((row) => (
                  <motion.div
                    key={row}
                    className="grid grid-cols-3 gap-2"
                    animate={{ 
                      backgroundColor: ["transparent", "rgba(99,102,241,0.1)", "transparent"]
                    }}
                    transition={{ delay: row * 0.5, duration: 1, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((col) => (
                      <motion.div
                        key={col}
                        className="h-6 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                        animate={{
                          boxShadow: ["0 0 0 rgba(99,102,241,0)", "0 0 10px rgba(99,102,241,0.5)", "0 0 0 rgba(99,102,241,0)"]
                        }}
                        transition={{ delay: row * 0.5 + col * 0.15, duration: 1, repeat: Infinity }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-amber-600 dark:text-amber-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Lightbulb className="w-6 h-6" />
              <span className="font-medium">Mapa visual pronto!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === i ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectMapVisual;
