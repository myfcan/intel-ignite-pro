import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Heart, Zap, CheckSquare } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectObjectiveLens: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Objetivos claros em cada etapa",
  subtitle = "O que o aluno precisa levar de cada pedaço"
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

  const lessons = [
    { title: 'Aula 1', verb: 'Entender', icon: Brain, color: 'from-blue-400 to-blue-600' },
    { title: 'Aula 2', verb: 'Sentir', icon: Heart, color: 'from-pink-400 to-pink-600' },
    { title: 'Aula 3', verb: 'Aplicar', icon: Zap, color: 'from-amber-400 to-amber-600' },
    { title: 'Aula 4', verb: 'Dominar', icon: CheckSquare, color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-950 dark:to-amber-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.title}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="w-28 h-20 sm:w-32 sm:h-24 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700"
                >
                  <FileText className="w-6 h-6 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{lesson.title}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.title}
                  className="relative w-28 h-20 sm:w-32 sm:h-24 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700"
                >
                  <FileText className="w-6 h-6 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{lesson.title}</span>
                  
                  {/* Animated seal */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                    className={`absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r ${lesson.color} shadow-md`}
                  >
                    <span className="text-xs font-bold text-white">{lesson.verb}</span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.title}
                  animate={{
                    boxShadow: i === 1 
                      ? ['0 0 0 0 rgba(251, 146, 60, 0)', '0 0 0 8px rgba(251, 146, 60, 0.3)', '0 0 0 0 rgba(251, 146, 60, 0)']
                      : 'none'
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`relative w-28 h-20 sm:w-32 sm:h-24 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center border-2 ${
                    i === 1 ? 'border-amber-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <lesson.icon className={`w-6 h-6 ${i === 1 ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{lesson.title}</span>
                  
                  <motion.div
                    className={`absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r ${lesson.color} shadow-md`}
                  >
                    <span className="text-xs font-bold text-white">{lesson.verb}</span>
                  </motion.div>
                </motion.div>
              ))}
              <p className="col-span-2 text-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                Foco de luz em cada etapa
              </p>
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.title}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative w-28 h-20 sm:w-32 sm:h-24 bg-gradient-to-br ${lesson.color} rounded-xl shadow-lg flex flex-col items-center justify-center`}
                  >
                    <lesson.icon className="w-6 h-6 text-white" />
                    <span className="text-sm font-bold text-white mt-1">{lesson.verb}</span>
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-slate-600 dark:text-slate-300"
              >
                Checklist visual completo
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
              i === currentScene ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectObjectiveLens;
