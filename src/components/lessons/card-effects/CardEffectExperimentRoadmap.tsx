import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Beaker, CheckCircle, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectExperimentRoadmap: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-cyan-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-500/30 flex items-center justify-center mb-6"
            >
              <Map className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Plano de Experimentos</h2>
            <p className="text-teal-200 text-lg">Um teste por vez</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="steps"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-2"
          >
            {[
              'Escolha uma tarefa',
              'Teste um prompt',
              'Avalie o resultado',
              'Ajuste e repita'
            ].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3 bg-teal-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl w-full max-w-sm"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs text-white font-bold">
                  {i + 1}
                </div>
                <span className="text-white text-sm sm:text-base">{step}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="experiment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Beaker className="w-16 h-16 sm:w-20 sm:h-20 text-teal-400" />
            </motion.div>
            <div className="flex items-center gap-4">
              <span className="text-teal-300">Teste</span>
              <ArrowRight className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300">Aprenda</span>
              <ArrowRight className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300">Melhore</span>
            </div>
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
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pequenos Testes</h2>
            <p className="text-teal-200 text-lg">Grandes ganhos progressivos</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-teal-400' : 'w-1.5 bg-teal-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectExperimentRoadmap;
