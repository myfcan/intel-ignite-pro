import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectQualityUpgrade: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="basic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="flex gap-1 mb-6">
              <Star className="w-8 h-8 text-cyan-400" fill="currentColor" />
              <Star className="w-8 h-8 text-slate-500" />
              <Star className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Rascunho Comum</h2>
            <p className="text-cyan-200 text-lg">Ponto de partida</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="upgrade"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <TrendingUp className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-6">Refinando com I.A.</h2>
            <p className="text-cyan-200 mt-2">Clareza e objetividade</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="improvements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {['Revisão de clareza', 'Variações de títulos', 'Argumentos testados'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-cyan-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span className="text-white text-sm sm:text-lg">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="premium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div className="flex gap-1 mb-6">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Star className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" fill="currentColor" />
                </motion.div>
              ))}
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Versão Refinada</h2>
            <p className="text-cyan-200 text-lg">Qualidade profissional</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-cyan-400' : 'w-1.5 bg-cyan-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectQualityUpgrade;
