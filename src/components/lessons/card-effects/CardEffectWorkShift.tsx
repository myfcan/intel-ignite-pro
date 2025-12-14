import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Repeat, Zap, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectWorkShift: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) {
      setCurrentScene(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentScene(prev => (prev < totalScenes - 1 ? prev + 1 : prev));
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-500/30 flex items-center justify-center mb-6"
            >
              <Repeat className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tarefas Repetitivas</h2>
            <p className="text-purple-200 text-lg max-w-md">A rotina mecânica que consome seu tempo</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="transformation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-4 sm:gap-8">
              <motion.div
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-700/50 flex items-center justify-center"
              >
                <Repeat className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </motion.div>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
              </motion.div>
              <motion.div
                initial={{ x: 50 }}
                animate={{ x: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-purple-500/30 flex items-center justify-center"
              >
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-300" />
              </motion.div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-8 text-center">Do Manual ao Inteligente</h2>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="automation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            {['E-mails automáticos', 'Resumos instantâneos', 'Planilhas estruturadas'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-purple-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span className="text-white text-sm sm:text-lg">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6"
            >
              <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Rotina Inteligente</h2>
            <p className="text-purple-200 text-lg">Menos manual, mais estratégico</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-purple-400' : 'w-1.5 bg-purple-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectWorkShift;
