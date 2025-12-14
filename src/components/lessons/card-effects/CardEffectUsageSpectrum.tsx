import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Compass, Target, ArrowRight, Sparkles } from 'lucide-react';

interface CardEffectUsageSpectrumProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectUsageSpectrum: React.FC<CardEffectUsageSpectrumProps> = ({ 
  duration = 15, 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-amber-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Uso solto */}
        {currentScene <= 2 && (
          <motion.div
            key="loose-usage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
            >
              <Shuffle className="w-10 h-10 text-amber-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Uso Solto
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Uma ajuda aqui, outra ali, sem muita intenção
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 mt-6"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                  className="w-3 h-3 rounded-full bg-amber-500/50"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 3-5: Transição */}
        {currentScene >= 3 && currentScene <= 5 && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center"
              >
                <Shuffle className="w-8 h-8 text-amber-500" />
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 text-muted-foreground" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0)', '0 0 0 10px rgba(34, 197, 94, 0.2)', '0 0 0 0 rgba(34, 197, 94, 0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
              >
                <Target className="w-8 h-8 text-emerald-500" />
              </motion.div>
            </div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm mt-8 text-center"
            >
              Da experiência ocasional ao hábito estruturado
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-7: Uso consciente */}
        {currentScene >= 6 && currentScene <= 7 && (
          <motion.div
            key="conscious-usage"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Compass className="w-10 h-10 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Uso Consciente
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Direção clara, intenção definida
            </p>
          </motion.div>
        )}

        {/* Cenas 8-9: Espectro visual */}
        {currentScene >= 8 && currentScene <= 9 && (
          <motion.div
            key="spectrum"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full px-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              O Espectro do Uso
            </h3>
            
            <div className="w-full max-w-sm">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1 }}
              />
              
              <div className="flex justify-between mt-3">
                <span className="text-xs text-muted-foreground">Solto</span>
                <span className="text-xs text-muted-foreground">Estruturado</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cena 10: Conclusão */}
        {currentScene >= 10 && (
          <motion.div
            key="conclusion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground">
              Qual é o seu padrão atual?
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

export default CardEffectUsageSpectrum;
