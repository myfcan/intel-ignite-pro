import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, FileText, Clock } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectAssetLibrary: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Sua biblioteca de ativos digitais",
  subtitle = "Conteúdo que trabalha por você"
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

  const assets = [
    { icon: BookOpen, label: 'Cursos', color: 'from-blue-400 to-blue-600' },
    { icon: Video, label: 'Aulas', color: 'from-red-400 to-red-600' },
    { icon: FileText, label: 'PDFs', color: 'from-green-400 to-green-600' },
    { icon: BookOpen, label: 'eBooks', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-teal-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              className="flex flex-col items-center"
            >
              {/* Empty shelves */}
              <div className="space-y-3">
                {[0, 1].map((row) => (
                  <motion.div
                    key={row}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: row * 0.2 }}
                    className="w-56 sm:w-64 h-16 sm:h-20 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-inner"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Estantes surgindo...</p>
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
              {/* Shelves with items */}
              <div className="space-y-3">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="w-56 sm:w-64 h-16 sm:h-20 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-inner flex items-end justify-center gap-2 pb-1 px-2"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <motion.div
                        key={asset.label}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: (row * 2 + i) * 0.15, type: 'spring' }}
                        className={`w-14 h-12 sm:w-16 sm:h-14 bg-gradient-to-br ${asset.color} rounded-lg shadow-md flex flex-col items-center justify-center`}
                      >
                        <asset.icon className="w-5 h-5 text-white" />
                        <span className="text-[10px] text-white mt-0.5">{asset.label}</span>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Preenchendo estantes</p>
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
              {/* Shelves with items and clocks appearing */}
              <div className="space-y-3">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="relative w-56 sm:w-64 h-16 sm:h-20 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-inner flex items-end justify-center gap-2 pb-1 px-2"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <div
                        key={asset.label}
                        className="relative"
                      >
                        <div className={`w-14 h-12 sm:w-16 sm:h-14 bg-gradient-to-br ${asset.color} rounded-lg shadow-md flex flex-col items-center justify-center`}>
                          <asset.icon className="w-5 h-5 text-white" />
                          <span className="text-[10px] text-white mt-0.5">{asset.label}</span>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: (row * 2 + i) * 0.2, type: 'spring' }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center"
                        >
                          <Clock className="w-3 h-3 text-teal-500" />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Relógios aparecem</p>
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
              {/* Shelves with animated clocks */}
              <div className="space-y-3">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="relative w-56 sm:w-64 h-16 sm:h-20 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-inner flex items-end justify-center gap-2 pb-1 px-2"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <motion.div
                        key={asset.label}
                        animate={{ 
                          boxShadow: ['0 0 0 0 rgba(20, 184, 166, 0)', '0 0 10px 3px rgba(20, 184, 166, 0.3)', '0 0 0 0 rgba(20, 184, 166, 0)']
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: (row * 2 + i) * 0.3 }}
                        className="relative"
                      >
                        <div className={`w-14 h-12 sm:w-16 sm:h-14 bg-gradient-to-br ${asset.color} rounded-lg shadow-md flex flex-col items-center justify-center`}>
                          <asset.icon className="w-5 h-5 text-white" />
                          <span className="text-[10px] text-white mt-0.5">{asset.label}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center"
                        >
                          <Clock className="w-3 h-3 text-teal-500" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-teal-500" />
                Valor contínuo ao longo do tempo
              </motion.p>
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
              i === currentScene ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAssetLibrary;
