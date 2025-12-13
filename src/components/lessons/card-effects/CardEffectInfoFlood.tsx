import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Filter, Sparkles, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectInfoFlood: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="chaos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -100 }}
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  y: [0, 300],
                  x: Math.sin(i) * 50
                }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="absolute"
                style={{ left: `${10 + i * 10}%` }}
              >
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300/50" />
              </motion.div>
            ))}
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center z-10">Afogado em Informação</h2>
            <p className="text-blue-200 text-lg mt-3 z-10">Dados demais, tempo de menos</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="filter"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500/30 flex items-center justify-center mb-6"
            >
              <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">A I.A. filtra o caos</h2>
            <p className="text-blue-200 mt-2">Extraindo o que importa</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="organize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {['Resumo executivo', 'Pontos-chave', 'Ações sugeridas'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-blue-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm sm:text-lg">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="clarity"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6"
            >
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Clareza Total</h2>
            <p className="text-blue-200 text-lg">Do caos ao resumo em segundos</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-blue-400' : 'w-1.5 bg-blue-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectInfoFlood;
