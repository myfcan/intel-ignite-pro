import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Layers, MessageSquare, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectToolOrchestrator: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Ferramentas de texto como aliadas",
  subtitle = "Modelos de linguagem organizando suas ideias"
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

  const modules = ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              {/* Keyboard */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-slate-800 dark:bg-slate-900 rounded-lg p-4 shadow-xl"
              >
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        backgroundColor: i === 3 || i === 5 || i === 7
                          ? ['#374151', '#3B82F6', '#374151']
                          : '#374151'
                      }}
                      transition={{ duration: 0.3, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-700"
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-700" />
                  ))}
                </div>
              </motion.div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center gap-2"
              >
                <Keyboard className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Digitando poucas frases...</span>
              </motion.div>
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
              {/* Computer screen with modules */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-56 h-40 sm:w-64 sm:h-48 bg-slate-800 dark:bg-slate-900 rounded-lg shadow-xl border-4 border-slate-700 p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="bg-blue-500/20 border border-blue-400/50 rounded px-2 py-1"
                    >
                      <span className="text-xs text-blue-300">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Módulos surgindo na tela</p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Screen with modules */}
              <div className="w-56 h-40 sm:w-64 sm:h-48 bg-slate-800 dark:bg-slate-900 rounded-lg shadow-xl border-4 border-slate-700 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {modules.map((module) => (
                    <div
                      key={module}
                      className="bg-blue-500/20 border border-blue-400/50 rounded px-2 py-1"
                    >
                      <span className="text-xs text-blue-300">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating chat bubbles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: (i - 1) * 60,
                    y: -20 + i * 15
                  }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className="absolute"
                  style={{ top: 20, left: '50%' }}
                >
                  <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Balões de conversa flutuando</p>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Screen with modules and chat */}
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 20px 10px rgba(59, 130, 246, 0.2)', '0 0 0 0 rgba(59, 130, 246, 0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-56 h-40 sm:w-64 sm:h-48 bg-slate-800 dark:bg-slate-900 rounded-lg shadow-xl border-4 border-blue-500 p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module}
                      animate={{ 
                        borderColor: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0.5)']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="bg-blue-500/20 border border-blue-400/50 rounded px-2 py-1 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-300">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Chat bubbles and sparkles */}
              <div className="absolute inset-0 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute"
                    style={{ 
                      top: `${30 + i * 15}%`, 
                      left: `${20 + i * 20}%` 
                    }}
                  >
                    {i % 2 === 0 ? (
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-300" />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-6"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Diálogo com I.A. completo</span>
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
              i === currentScene ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectToolOrchestrator;
