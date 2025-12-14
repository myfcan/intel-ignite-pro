import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Zap, TrendingUp, Target, Clock, Brain } from 'lucide-react';

interface CardEffectIaStartingPointProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectIaStartingPoint: React.FC<CardEffectIaStartingPointProps> = ({ 
  duration = 36, 
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

  const levels = [
    { level: 1, label: 'Curiosidade', desc: 'Conhece mas quase não usa', icon: Brain, color: 'from-blue-500/20 to-blue-600/20' },
    { level: 2, label: 'Uso Pontual', desc: 'Usa às vezes para testes', icon: Zap, color: 'from-amber-500/20 to-amber-600/20' },
    { level: 3, label: 'Uso Estratégico', desc: 'Integra em rotinas importantes', icon: Target, color: 'from-emerald-500/20 to-emerald-600/20' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Introdução - Onde você está? */}
        {currentScene <= 2 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center mb-6"
            >
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
            >
              Ponto de Partida com I.A.
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm sm:text-base max-w-sm"
            >
              Antes de montar um plano, você precisa entender onde está hoje
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Os 3 níveis aparecem */}
        {currentScene >= 3 && currentScene <= 5 && (
          <motion.div
            key="levels"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-md"
          >
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg sm:text-xl font-semibold text-foreground mb-6 text-center"
            >
              Em qual nível você está?
            </motion.h3>
            
            <div className="w-full space-y-3">
              {levels.map((item, index) => (
                <motion.div
                  key={item.level}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    scale: currentScene - 3 === index ? 1.05 : 1
                  }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-4 rounded-xl bg-gradient-to-r ${item.color} border border-border/50 flex items-center gap-4 ${currentScene - 3 === index ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">NÍVEL {item.level}</span>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 6-7: Transição - Reflexão */}
        {currentScene >= 6 && currentScene <= 7 && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 20px rgba(139, 92, 246, 0.1)', '0 0 0 0 rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-6"
            >
              <Clock className="w-8 h-8 text-violet-400" />
            </motion.div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Não existe ponto "certo"
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              O que existe é clareza sobre onde você está agora
            </p>
          </motion.div>
        )}

        {/* Cenas 8-9: Visão do plano */}
        {currentScene >= 8 && currentScene <= 9 && (
          <motion.div
            key="plan-vision"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', duration: 1 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center mb-6"
            >
              <TrendingUp className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">
              Plano de 30 Dias
            </h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Que faça sentido para a sua realidade
            </p>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full mt-6"
            />
          </motion.div>
        )}

        {/* Cena 10: Conclusão */}
        {currentScene >= 10 && (
          <motion.div
            key="conclusion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mb-6"
            >
              <Sparkles className="w-16 h-16 text-primary" />
            </motion.div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Clareza é o primeiro passo
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Sem promessas mágicas, sem exigir que você vire outra pessoa
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'bg-primary w-4' : 'bg-muted w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectIaStartingPoint;
