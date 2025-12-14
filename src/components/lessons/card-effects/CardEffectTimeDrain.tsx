import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Zap, Battery, TrendingDown } from 'lucide-react';

interface CardEffectTimeDrainProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectTimeDrain: React.FC<CardEffectTimeDrainProps> = ({ 
  duration = 6, 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-red-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-3: Tempo escorrendo */}
        {currentScene <= 3 && (
          <motion.div
            key="time-draining"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Clock className="w-20 h-20 text-red-500/70" />
              
              {/* Gotas de tempo caindo */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-red-500"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: 60, opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </motion.div>
            
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mt-8 mb-2"
            >
              Para onde seu tempo vai?
            </motion.h3>
            <p className="text-muted-foreground text-sm">
              Enxergando as tarefas que drenam energia
            </p>
          </motion.div>
        )}

        {/* Cenas 4-6: Bateria baixando */}
        {currentScene >= 4 && currentScene <= 6 && (
          <motion.div
            key="energy-drain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              className="relative w-16 h-28 border-4 border-red-500/50 rounded-lg overflow-hidden"
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 to-red-400"
                initial={{ height: '80%' }}
                animate={{ height: '20%' }}
                transition={{ duration: 2 }}
              />
              
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-red-500/50 rounded-t" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mt-6"
            >
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-semibold">Energia baixa</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 7-9: Identificando vilões */}
        {currentScene >= 7 && currentScene <= 9 && (
          <motion.div
            key="identify"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
            
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">
              Tarefas que drenam você
            </h3>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {['E-mails', 'Relatórios', 'Agendas', 'Revisões'].map((task, i) => (
                <motion.span
                  key={task}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm font-medium"
                >
                  {task}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cena 10: Hora de mudar */}
        {currentScene >= 10 && (
          <motion.div
            key="change"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5 }}
            >
              <Zap className="w-14 h-14 text-primary" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mt-4">
              Hora de recuperar esse tempo!
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

export default CardEffectTimeDrain;
