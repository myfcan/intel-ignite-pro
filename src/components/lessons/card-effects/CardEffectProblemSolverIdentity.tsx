import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Target, Zap, Award } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectProblemSolverIdentity: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-900 via-amber-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="task"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-600/50 flex items-center justify-center mb-6">
              <span className="text-3xl sm:text-4xl">📋</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Menos Tarefa</h2>
            <p className="text-slate-300 text-lg">O que qualquer um faz</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="transformation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-6">Nova Identidade</h2>
            <p className="text-yellow-200 mt-2">De executor a resolvedor</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {[
              { icon: Target, text: 'Identifica problemas' },
              { icon: Zap, text: 'Acelera soluções' },
              { icon: Award, text: 'Entrega resultados' }
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-yellow-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <item.icon className="w-5 h-5 text-yellow-300" />
                <span className="text-white text-sm sm:text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mb-6"
            >
              <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Identidade de Resolvedor</h2>
            <p className="text-yellow-200 text-lg">Mais solução, mais valor</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-yellow-400' : 'w-1.5 bg-yellow-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectProblemSolverIdentity;
