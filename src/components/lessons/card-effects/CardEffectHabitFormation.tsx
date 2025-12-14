import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, TrendingUp, Zap, CheckCircle, Target, Sparkles, Rocket, Brain } from 'lucide-react';

interface CardEffectHabitFormationProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectHabitFormation: React.FC<CardEffectHabitFormationProps> = ({ 
  duration = 8, 
  onComplete 
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (currentScene < totalScenes - 1) {
      const timer = setTimeout(() => setCurrentScene(prev => prev + 1), sceneTime);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, sceneTime);
      return () => clearTimeout(timer);
    }
  }, [currentScene, sceneTime, onComplete]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-teal-500/25 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/40 rounded-full"
            style={{
              left: `${8 + (i * 8)}%`,
              top: `${20 + (i % 4) * 18}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Cenas 0-3: Teste inicial */}
          {currentScene <= 3 && (
            <motion.div
              key="first-test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ['0 0 20px rgba(59, 130, 246, 0.4)', '0 0 50px rgba(59, 130, 246, 0.6)', '0 0 20px rgba(59, 130, 246, 0.4)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <span className="text-sm text-emerald-200 mb-3">Primeira tentativa</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '150px' }}
                  transition={{ duration: 1.5 }}
                  className="h-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full shadow-lg"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Cenas 4-6: Repetição */}
          {currentScene >= 4 && currentScene <= 6 && (
            <motion.div
              key="repetition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="relative mb-6"
              >
                <div className="w-24 h-24 rounded-full border-4 border-violet-500/50 border-t-violet-400 flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-sm">
                  <Repeat className="w-12 h-12 text-violet-400" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Repetição intencional
              </h3>
              <p className="text-violet-200 text-sm text-center max-w-xs">
                Da primeira tentativa ao uso consistente
              </p>
            </motion.div>
          )}

          {/* Cenas 7-8: Formação do hábito */}
          {currentScene >= 7 && currentScene <= 8 && (
            <motion.div
              key="habit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-3 mb-6">
                {[
                  { color: 'from-blue-500 to-cyan-500', glow: 'rgba(59, 130, 246, 0.5)' },
                  { color: 'from-violet-500 to-purple-500', glow: 'rgba(139, 92, 246, 0.5)' },
                  { color: 'from-amber-500 to-orange-500', glow: 'rgba(245, 158, 11, 0.5)' },
                  { color: 'from-emerald-500 to-green-500', glow: 'rgba(16, 185, 129, 0.5)' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${item.glow}` }}
                  >
                    <CheckCircle className="w-7 h-7 text-white" />
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="w-56 h-2 bg-gradient-to-r from-blue-500 via-violet-500 via-amber-500 to-emerald-500 rounded-full shadow-lg"
              />
              
              <p className="text-emerald-200 text-sm mt-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                Hábito em formação
              </p>
            </motion.div>
          )}

          {/* Cenas 9-10: Conclusão */}
          {currentScene >= 9 && (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ['0 0 30px rgba(16, 185, 129, 0.4)', '0 0 60px rgba(16, 185, 129, 0.6)', '0 0 30px rgba(16, 185, 129, 0.4)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Transformando teste em hábito
              </h3>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-6 h-6 text-amber-400" />
                <span className="text-emerald-200 text-sm">Consistência gera resultados</span>
                <Sparkles className="w-6 h-6 text-amber-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'bg-emerald-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-emerald-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-400/40"
      >
        <span className="text-emerald-200 text-xs font-medium">Hábito</span>
      </motion.div>
    </div>
  );
};

export default CardEffectHabitFormation;
