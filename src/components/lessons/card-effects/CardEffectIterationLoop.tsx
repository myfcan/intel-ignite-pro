import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MessageSquare, Settings, Check, Sparkles, ArrowRight } from 'lucide-react';

interface CardEffectIterationLoopProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectIterationLoop: React.FC<CardEffectIterationLoopProps> = ({ 
  duration = 42, 
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
    { icon: MessageSquare, label: 'Testar', desc: 'Criar prompt inicial' },
    { icon: Settings, label: 'Ajustar', desc: 'Refinar o pedido' },
    { icon: RefreshCw, label: 'Repetir', desc: 'Melhorar resultado' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-violet-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Ciclo girando */}
        {currentScene <= 2 && (
          <motion.div
            key="loop-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 rounded-full border-4 border-dashed border-primary/50 flex items-center justify-center mb-6"
            >
              <RefreshCw className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              O Ciclo da Melhoria
            </h3>
            <p className="text-muted-foreground text-sm">
              Testar, ajustar, repetir
            </p>
          </motion.div>
        )}

        {/* Cenas 3-6: Etapas do ciclo */}
        {currentScene >= 3 && currentScene <= 6 && (
          <motion.div
            key="steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
            <h3 className="text-lg font-semibold text-foreground mb-8 text-center">
              O ciclo que faz a I.A. funcionar melhor
            </h3>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {steps.map((step, i) => {
                const isActive = currentScene - 3 >= i;
                const isCurrent = currentScene - 3 === i;
                
                return (
                  <React.Fragment key={step.label}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: isCurrent ? 1.1 : 1, 
                        opacity: isActive ? 1 : 0.4
                      }}
                      className={`flex flex-col items-center p-3 sm:p-4 rounded-xl ${isCurrent ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/50'}`}
                    >
                      <motion.div
                        animate={isCurrent ? { 
                          scale: [1, 1.2, 1],
                          rotate: step.icon === RefreshCw ? [0, 360] : [0, 0]
                        } : {}}
                        transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                      >
                        <step.icon className={`w-8 h-8 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                      </motion.div>
                      <span className="text-sm font-semibold text-foreground mt-2">{step.label}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{step.desc}</span>
                    </motion.div>
                    
                    {i < steps.length - 1 && (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Seta de volta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: currentScene >= 5 ? 1 : 0 }}
              className="mt-4"
            >
              <svg width="200" height="40" viewBox="0 0 200 40">
                <motion.path
                  d="M 180 10 C 180 30, 100 35, 20 10"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 7-8: Resultado do loop */}
        {currentScene >= 7 && currentScene <= 8 && (
          <motion.div
            key="loop-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Cada volta melhora o resultado
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Os melhores prompts surgem da repetição intencional
            </p>
          </motion.div>
        )}

        {/* Cenas 9-10: Conclusão */}
        {currentScene >= 9 && (
          <motion.div
            key="conclusion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Salve os melhores prompts
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Guarde em um lugar seguro para reutilizar
            </p>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full mt-6"
            />
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

export default CardEffectIterationLoop;
