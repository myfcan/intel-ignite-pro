import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Target, Clock, Sparkles, CheckSquare, Layers, Rocket, Zap } from 'lucide-react';

interface CardEffectPlanBuilderProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectPlanBuilder: React.FC<CardEffectPlanBuilderProps> = ({ 
  duration = 28, 
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

  const steps = [
    { num: 1, label: 'Área da vida', desc: 'Onde a I.A. vai ajudar', color: 'from-blue-500 to-cyan-500' },
    { num: 2, label: 'Tarefa foco', desc: 'O que consome tempo demais', color: 'from-violet-500 to-purple-500' },
    { num: 3, label: 'Tempo disponível', desc: 'Quanto você pode investir', color: 'from-amber-500 to-orange-500' },
    { num: 4, label: 'Objetivo claro', desc: 'Meta para 30 dias', color: 'from-emerald-500 to-green-500' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/25 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-violet-400/40 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {/* Cenas 0-2: Plano sendo construído */}
          {currentScene <= 2 && (
            <motion.div
              key="building"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotateY: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-28 h-32 bg-gradient-to-br from-violet-600/40 to-purple-600/40 border-2 border-violet-400/50 rounded-xl shadow-2xl shadow-violet-500/30 mb-6 backdrop-blur-sm"
              >
                <div className="absolute top-4 left-4 right-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: i * 0.3, duration: 0.5 }}
                      className="h-2.5 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"
                    />
                  ))}
                </div>
                <FileText className="absolute bottom-3 right-3 w-6 h-6 text-violet-300" />
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Seu Plano Começa Aqui
              </h3>
              <p className="text-violet-200 text-sm sm:text-base">
                Da rotina solta ao foco definido
              </p>
            </motion.div>
          )}

          {/* Cenas 3-7: 4 passos do plano */}
          {currentScene >= 3 && currentScene <= 7 && (
            <motion.div
              key="steps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-sm"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center">
                Monte seu plano em 4 passos
              </h3>
              
              <div className="space-y-3 w-full">
                {steps.map((step, i) => {
                  const isActive = currentScene - 3 >= i;
                  const isCurrent = currentScene - 3 === i;
                  
                  return (
                    <motion.div
                      key={step.num}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ 
                        x: isActive ? 0 : -30,
                        opacity: isActive ? 1 : 0.3,
                        scale: isCurrent ? 1.02 : 1
                      }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border flex items-center gap-4 backdrop-blur-sm transition-all ${
                        isCurrent 
                          ? 'bg-white/15 border-violet-400/60 shadow-lg shadow-violet-500/20' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <motion.div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg`}
                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="text-sm font-bold text-white">{step.num}</span>
                      </motion.div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-white">{step.label}</span>
                        <p className="text-xs text-violet-200/70">{step.desc}</p>
                      </div>
                      {isActive && currentScene > 3 + i && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cenas 8-9: Plano montado */}
          {currentScene >= 8 && currentScene <= 9 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 30px rgba(139, 92, 246, 0.3)', '0 0 60px rgba(139, 92, 246, 0.5)', '0 0 30px rgba(139, 92, 246, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl"
              >
                <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </motion.div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Plano pessoal de 30 dias
              </h3>
              <p className="text-violet-200 text-sm max-w-xs">
                Pronto para gerar no simulador
              </p>
              
              {/* Floating sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${30 + i * 8}%`,
                    top: `${25 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-violet-300" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cena 10: CTA */}
          {currentScene >= 10 && (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/50">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Hora de agir!
              </h3>
              <p className="text-violet-200 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                O simulador vai montar seu prompt pronto
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
              i <= currentScene ? 'bg-violet-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-violet-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-violet-400/40"
      >
        <span className="text-violet-200 text-xs font-medium">Plano 30 dias</span>
      </motion.div>
    </div>
  );
};

export default CardEffectPlanBuilder;
