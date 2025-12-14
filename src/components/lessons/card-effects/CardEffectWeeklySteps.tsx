import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, ArrowRight, Sparkles } from 'lucide-react';

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
    { num: 1, title: 'Explorar', desc: 'Testar e ajustar', color: 'from-blue-500' },
    { num: 2, title: 'Padronizar', desc: 'Salvar o que funciona', color: 'from-violet-500' },
    { num: 3, title: 'Aprofundar', desc: 'Combinar ferramentas', color: 'from-amber-500' },
    { num: 4, title: 'Consolidar', desc: 'Definir hábitos', color: 'from-emerald-500' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-blue-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Calendário */}
        {currentScene <= 2 && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
            >
              <Calendar className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              4 Semanas
            </h3>
            <p className="text-muted-foreground text-sm">
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
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
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
                    className={`p-3 rounded-xl bg-gradient-to-r ${week.color} to-transparent/10 border ${isCurrent ? 'border-primary' : 'border-border/30'} flex items-center gap-3`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive && currentScene > 3 + i ? 'bg-emerald-500' : 'bg-background/50'}`}>
                      {isActive && currentScene > 3 + i ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-foreground">{week.num}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{week.title}</span>
                      <p className="text-xs text-muted-foreground">{week.desc}</p>
                    </div>
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
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-3 mb-6">
              {weeks.map((week, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${week.color} to-transparent flex items-center justify-center`}
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground">
              Visão única de progresso
            </h3>
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

export default CardEffectWeeklySteps;
