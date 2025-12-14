import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Clock, Star, ArrowUpRight, Rocket } from 'lucide-react';

interface CardEffectImpactForecastProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectImpactForecast: React.FC<CardEffectImpactForecastProps> = ({ 
  duration = 5, 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-violet-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-3: Gráfico subindo */}
        {currentScene <= 3 && (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-48 h-32">
              {/* Eixos */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border" />
              <div className="absolute bottom-0 left-0 w-0.5 h-full bg-border" />
              
              {/* Linha do gráfico */}
              <svg className="absolute inset-0" viewBox="0 0 200 130">
                <motion.path
                  d="M 10 120 Q 50 100 80 80 T 150 30 L 190 10"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              
              {/* Seta no topo */}
              <motion.div
                className="absolute top-0 right-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
              </motion.div>
            </div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-foreground mt-6 text-center"
            >
              Onde a mudança mais vale?
            </motion.h3>
          </motion.div>
        )}

        {/* Cenas 4-6: Benefícios */}
        {currentScene >= 4 && currentScene <= 6 && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
              Tarefas que destravam resultados
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Tempo', color: 'text-blue-500' },
                { icon: Zap, label: 'Clareza', color: 'text-amber-500' },
                { icon: Star, label: 'Resultados', color: 'text-emerald-500' }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-center p-4 rounded-xl bg-muted/50"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </motion.div>
                  <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-10: Decolagem */}
        {currentScene >= 7 && (
          <motion.div
            key="takeoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rocket className="w-16 h-16 text-primary" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-foreground mt-6"
            >
              Pronto para decolar!
            </motion.h3>
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

export default CardEffectImpactForecast;
