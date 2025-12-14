import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, List, Zap, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectSummaryBooster: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "De ideia solta a sumário inicial",
  subtitle = "Primeiro rascunho guiado pela I.A."
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

  const summaryItems = [
    'Módulo 1: Introdução',
    'Módulo 2: Fundamentos',
    'Módulo 3: Prática',
    'Módulo 4: Avançado',
    'Módulo 5: Conclusão',
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-slate-950 dark:to-violet-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 z-10"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-56 h-72 sm:w-64 sm:h-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-start justify-center pt-8"
              >
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1 h-6 bg-violet-500"
                />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Página em branco...</p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-56 h-72 sm:w-64 sm:h-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden">
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <List className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: i * 0.3 + 0.1, duration: 0.5 }}
                      className="h-3 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"
                    >
                      <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{item}</span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Sumário se formando...</p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-56 h-72 sm:w-64 sm:h-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden"
              >
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item}
                    animate={{
                      backgroundColor: i === 1 || i === 2 
                        ? ['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']
                        : 'transparent'
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2 mb-2 px-2 py-1 rounded"
                  >
                    <List className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Zoom nos títulos</p>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden">
                {summaryItems.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 mb-2 px-2 py-1"
                  >
                    <List className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.15, type: 'spring' }}
                    >
                      <Zap className="w-3 h-3 text-yellow-500" />
                    </motion.div>
                  </div>
                ))}

                {/* AI sparkles floating */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: [-20, -60],
                      x: [0, (i - 1) * 30]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute bottom-4 left-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-violet-500" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-4"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Acelerado pela I.A.</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentScene ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectSummaryBooster;
