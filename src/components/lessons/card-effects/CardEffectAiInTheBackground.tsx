import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Settings } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectAiInTheBackground: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-700 flex items-center justify-center mb-6"
            >
              <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">A I.A. não aparece</h2>
            <p className="text-slate-300 text-lg">Ela trabalha atrás das cortinas</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="behind"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative"
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-dashed border-slate-600" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-8">Bastidores</h2>
            <p className="text-slate-300 mt-2">O motor invisível</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="delivery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-700/50 p-4 rounded-xl text-center"
              >
                <EyeOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-slate-300 text-sm">I.A. oculta</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 p-4 rounded-xl text-center"
              >
                <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
                <span className="text-white text-sm">Você entrega</span>
              </motion.div>
            </div>
            <p className="text-slate-300 text-center mt-4 max-w-sm">Quem paga vê o resultado, não a ferramenta</p>
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
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center mb-6"
            >
              <span className="text-4xl sm:text-5xl">🎭</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Seu Palco</h2>
            <p className="text-slate-300 text-lg">A I.A. é só a equipe técnica</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-slate-400' : 'w-1.5 bg-slate-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAiInTheBackground;
