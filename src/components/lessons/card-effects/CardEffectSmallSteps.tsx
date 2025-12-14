import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, TrendingUp, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface CardEffectSmallStepsProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectSmallSteps: React.FC<CardEffectSmallStepsProps> = ({ 
  duration = 32, 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-blue-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Passos pequenos */}
        {currentScene <= 2 && (
          <motion.div
            key="small-steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6"
            >
              <Footprints className="w-10 h-10 text-blue-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Passos Pequenos
            </h3>
            <p className="text-muted-foreground text-sm">
              O que importa é não parar
            </p>
          </motion.div>
        )}

        {/* Cenas 3-5: Trilha de passos */}
        {currentScene >= 3 && currentScene <= 5 && (
          <motion.div
            key="step-trail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-32">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: currentScene - 2 >= i / 2 ? 1 : 0.3,
                    scale: currentScene - 2 >= i / 2 ? 1 : 0.8
                  }}
                  transition={{ delay: i * 0.2 }}
                  className="absolute"
                  style={{
                    left: `${i * 20}%`,
                    top: `${50 + Math.sin(i * 0.8) * 20}%`,
                    transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`
                  }}
                >
                  <Footprints className={`w-8 h-8 ${currentScene - 2 >= i / 2 ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mt-6 text-center"
            >
              Comece pequeno, mas constante
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-7: Progresso visual */}
        {currentScene >= 6 && currentScene <= 7 && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
              Avanço real, dia após dia
            </h3>
            
            <div className="w-full space-y-4">
              {[
                { label: 'Dia 1', progress: 20 },
                { label: 'Dia 15', progress: 50 },
                { label: 'Dia 30', progress: 100 }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-muted-foreground w-12">{item.label}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ delay: i * 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 8-9: Mantenha 1-2 tarefas */}
        {currentScene >= 8 && currentScene <= 9 && (
          <motion.div
            key="focus-tasks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </motion.div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              1-2 tarefas fixas
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Em vez de mudar tudo, mantenha poucos focos consistentes
            </p>
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
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-16 h-16 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Consistência vence intensidade
            </h3>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-amber-500 mt-2" />
            </motion.div>
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

export default CardEffectSmallSteps;
