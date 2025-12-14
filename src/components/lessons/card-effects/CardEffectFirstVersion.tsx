import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, FileText, Edit3, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectFirstVersion: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "A mágica da versão 1",
  subtitle = "Melhor editar algo do que encarar o vazio"
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

  const draftLines = [
    'Introdução ao tema principal',
    'Conceitos fundamentais',
    'Aplicações práticas',
    'Exercícios guiados',
    'Conclusão e próximos passos',
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 sm:gap-6"
            >
              {/* Empty page */}
              <motion.div
                className="w-32 h-44 sm:w-40 sm:h-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-start justify-center pt-6"
              >
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1 h-6 bg-emerald-500"
                />
              </motion.div>

              {/* Page with text appearing */}
              <motion.div
                className="w-32 h-44 sm:w-40 sm:h-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 overflow-hidden"
              >
                {draftLines.slice(0, 3).map((line, i) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="h-2 bg-slate-200 dark:bg-slate-700 rounded mb-2"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 sm:gap-6"
            >
              {/* Empty page fading */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.3 }}
                className="w-32 h-44 sm:w-40 sm:h-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              >
                <Square className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </motion.div>

              {/* Page with complete text */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-32 h-44 sm:w-40 sm:h-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-emerald-400 p-3 overflow-hidden"
              >
                {draftLines.map((line, i) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-1 mb-2"
                  >
                    <FileText className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded flex-1" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Sliding focus to text page */}
              <motion.div
                initial={{ x: -60 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-40 h-52 sm:w-48 sm:h-60 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-emerald-400 p-4 overflow-hidden"
              >
                {draftLines.map((line, i) => (
                  <div
                    key={line}
                    className="flex items-center gap-2 mb-2"
                  >
                    <FileText className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{line}</span>
                  </div>
                ))}
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Focando no rascunho...</p>
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
              <motion.div
                className="relative w-40 h-52 sm:w-48 sm:h-60 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-emerald-400 p-4 overflow-hidden"
              >
                {draftLines.map((line, i) => (
                  <motion.div
                    key={line}
                    animate={{
                      backgroundColor: i === 1 || i === 3
                        ? ['transparent', 'rgba(16, 185, 129, 0.1)', 'transparent']
                        : 'transparent'
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="flex items-center gap-2 mb-2 px-1 py-0.5 rounded"
                  >
                    <FileText className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{line}</span>
                    {(i === 1 || i === 3) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <Edit3 className="w-3 h-3 text-emerald-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Hand/cursor editing */}
                <motion.div
                  animate={{ 
                    x: [0, 10, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-4 right-4"
                >
                  <Edit3 className="w-6 h-6 text-emerald-600" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-4"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Editando e melhorando</span>
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
              i === currentScene ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectFirstVersion;
