import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, BookOpen, Code, Zap } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectModuleMap: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Desenhando o mapa de módulos",
  subtitle = "Do ponto de partida à chegada"
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

  const modules = [
    { num: 1, label: 'Início', icon: MapPin },
    { num: 2, label: 'Introdução', icon: BookOpen },
    { num: 3, label: 'Exemplos', icon: Code },
    { num: 4, label: 'Prática', icon: Zap },
    { num: 5, label: 'Chegada', icon: MapPin },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-950 dark:to-cyan-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              className="flex flex-wrap justify-center gap-4"
            >
              {modules.map((module, i) => (
                <motion.div
                  key={module.num}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.15, type: 'spring' }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg"
                >
                  <span className="text-white font-bold text-lg">{module.num}</span>
                </motion.div>
              ))}
              <p className="w-full text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                Marcos numerados aparecem
              </p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {modules.map((module, i) => (
                  <React.Fragment key={module.num}>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white font-bold">{module.num}</span>
                    </motion.div>
                    {i < modules.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                Linha animada conectando...
              </p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                {modules.map((module, i) => (
                  <React.Fragment key={module.num}>
                    <motion.div className="flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.15 }}
                        >
                          <module.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </motion.div>
                      </div>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15 + 0.2 }}
                        className="text-xs mt-1 text-slate-600 dark:text-slate-400"
                      >
                        {module.label}
                      </motion.span>
                    </motion.div>
                    {i < modules.length - 1 && (
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 mt-[-16px]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                Ícones em cada marco
              </p>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full"
            >
              {/* Overhead view effect */}
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative"
              >
                {/* Path line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute top-1/2 left-4 right-4 h-2 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 rounded-full -translate-y-1/2 origin-left"
                />

                <div className="relative flex items-center justify-between px-2">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module.num}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center z-10"
                    >
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            '0 0 0 0 rgba(6, 182, 212, 0)',
                            '0 0 0 8px rgba(6, 182, 212, 0.3)',
                            '0 0 0 0 rgba(6, 182, 212, 0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg"
                      >
                        <module.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </motion.div>
                      <span className="text-xs mt-1 text-slate-600 dark:text-slate-400 hidden sm:block">
                        {module.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6 text-sm text-slate-600 dark:text-slate-300"
              >
                Sobrevoando o trajeto completo
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
              i === currentScene ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectModuleMap;
