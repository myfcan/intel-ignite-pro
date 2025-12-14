import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, TrendingUp, Zap, CheckCircle, Target, Sparkles } from 'lucide-react';

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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-emerald-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-3: Teste inicial */}
        {currentScene <= 3 && (
          <motion.div
            key="first-test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4"
            >
              <Zap className="w-8 h-8 text-blue-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <span className="text-sm text-muted-foreground mb-2">Primeira tentativa</span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '120px' }}
                transition={{ duration: 1 }}
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
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
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-4 border-violet-500/50 border-t-violet-500 flex items-center justify-center mb-6"
            >
              <Repeat className="w-10 h-10 text-violet-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Repetição intencional
            </h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
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
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-48 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 rounded-full"
            />
            
            <p className="text-muted-foreground text-sm mt-4">
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
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-primary/30 flex items-center justify-center mb-6"
            >
              <Target className="w-10 h-10 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Transformando teste em hábito
            </h3>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-primary mt-4" />
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

export default CardEffectHabitFormation;
