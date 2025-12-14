import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, ArrowRight, Sparkles, Rocket, Target, Zap, Trophy } from 'lucide-react';

interface CardEffectWeeklyStepsProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectWeeklySteps: React.FC<CardEffectWeeklyStepsProps> = ({ 
  duration = 10, 
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

  const weeks = [
    { num: 1, title: 'Explorar', desc: 'Testar e ajustar', gradient: 'from-blue-500 to-cyan-500', glow: 'rgba(59, 130, 246, 0.5)' },
    { num: 2, title: 'Padronizar', desc: 'Salvar o que funciona', gradient: 'from-violet-500 to-purple-500', glow: 'rgba(139, 92, 246, 0.5)' },
    { num: 3, title: 'Aprofundar', desc: 'Combinar ferramentas', gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245, 158, 11, 0.5)' },
    { num: 4, title: 'Consolidar', desc: 'Definir hábitos', gradient: 'from-emerald-500 to-green-500', glow: 'rgba(16, 185, 129, 0.5)' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500/25 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
            style={{
              left: `${10 + (i * 9)}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-8, 8, -8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {/* Cenas 0-2: Calendário */}
          {currentScene <= 2 && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40">
                  <Calendar className="w-14 h-14 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: ['0 0 30px rgba(59, 130, 246, 0.4)', '0 0 60px rgba(59, 130, 246, 0.6)', '0 0 30px rgba(59, 130, 246, 0.4)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                4 Semanas
              </h3>
              <p className="text-blue-200 text-sm sm:text-base">
                Do teste à consolidação
              </p>
            </motion.div>
          )}

          {/* Cenas 3-7: Semanas aparecendo */}
          {currentScene >= 3 && currentScene <= 7 && (
            <motion.div
              key="weeks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-sm"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center">
                Seu plano de 30 dias
              </h3>
              
              <div className="space-y-3 w-full">
                {weeks.map((week, i) => {
                  const isActive = currentScene - 3 >= i;
                  const isCurrent = currentScene - 3 === i;
                  
                  return (
                    <motion.div
                      key={week.num}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ 
                        x: isActive ? 0 : -30, 
                        opacity: isActive ? 1 : 0.3,
                        scale: isCurrent ? 1.02 : 1
                      }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border backdrop-blur-sm flex items-center gap-4 ${
                        isCurrent 
                          ? 'bg-white/15 border-blue-400/60 shadow-lg' 
                          : 'bg-white/5 border-white/10'
                      }`}
                      style={isCurrent ? { boxShadow: `0 0 20px ${week.glow}` } : {}}
                    >
                      <motion.div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${week.gradient} shadow-lg`}
                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {isActive && currentScene > 3 + i ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-sm font-bold text-white">{week.num}</span>
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-white">{week.title}</span>
                        <p className="text-xs text-blue-200/70">{week.desc}</p>
                      </div>
                      {isCurrent && (
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 text-blue-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cenas 8-10: Conclusão */}
          {currentScene >= 8 && (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="flex items-center gap-3 mb-6">
                {weeks.map((week, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${week.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${week.glow}` }}
                  >
                    <Check className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Visão única de progresso
              </h3>
              <p className="text-blue-200 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Do caos ao controle em 30 dias
              </p>
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
              i <= currentScene ? 'bg-blue-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-blue-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/40"
      >
        <span className="text-blue-200 text-xs font-medium">4 Semanas</span>
      </motion.div>
    </div>
  );
};

export default CardEffectWeeklySteps;
