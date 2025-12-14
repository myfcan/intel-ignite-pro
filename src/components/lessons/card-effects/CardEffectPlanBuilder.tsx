import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Target, Clock, Sparkles, CheckSquare, Layers } from 'lucide-react';

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
    { num: 1, label: 'Área da vida', desc: 'Onde a I.A. vai ajudar' },
    { num: 2, label: 'Tarefa foco', desc: 'O que consome tempo demais' },
    { num: 3, label: 'Tempo disponível', desc: 'Quanto você pode investir' },
    { num: 4, label: 'Objetivo claro', desc: 'Meta para 30 dias' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Plano sendo construído */}
        {currentScene <= 2 && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotateY: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-24 h-28 bg-card border-2 border-primary/30 rounded-lg shadow-xl mb-6"
            >
              <div className="absolute top-3 left-3 right-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: i * 0.3, duration: 0.5 }}
                    className="h-2 bg-primary/30 rounded"
                  />
                ))}
              </div>
              <FileText className="absolute bottom-2 right-2 w-5 h-5 text-primary/50" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Seu Plano Começa Aqui
            </h3>
            <p className="text-muted-foreground text-sm">
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
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
              Monte seu plano em 4 passos
            </h3>
            
            <div className="space-y-3 w-full">
              {steps.map((step, i) => {
                const isActive = currentScene - 3 >= i;
                const isCurrent = currentScene - 3 === i;
                
                return (
                  <motion.div
                    key={step.num}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                      x: isActive ? 0 : -20,
                      opacity: isActive ? 1 : 0.3,
                      scale: isCurrent ? 1.02 : 1
                    }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      isCurrent ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-sm font-bold">{step.num}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{step.label}</span>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {isActive && currentScene > 3 + i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
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
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 20px rgba(139, 92, 246, 0.2)', '0 0 0 0 rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center mb-6"
            >
              <Layers className="w-10 h-10 text-primary" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Plano pessoal de 30 dias
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Pronto para gerar no simulador
            </p>
          </motion.div>
        )}

        {/* Cena 10: CTA */}
        {currentScene >= 10 && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Hora de agir!
            </h3>
            <p className="text-muted-foreground text-sm">
              O simulador vai montar seu prompt pronto
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

export default CardEffectPlanBuilder;
