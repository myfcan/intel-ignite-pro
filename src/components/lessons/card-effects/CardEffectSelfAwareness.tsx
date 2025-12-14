import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Map, Compass, Target, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface CardEffectSelfAwarenessProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectSelfAwareness: React.FC<CardEffectSelfAwarenessProps> = ({ 
  duration = 31, 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-cyan-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Mapa mental */}
        {currentScene <= 2 && (
          <motion.div
            key="map-intro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
              }}
              className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6"
            >
              <Map className="w-12 h-12 text-cyan-500" />
            </motion.div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Mapa de Consciência
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Saber onde você está para decidir para onde ir
            </p>
          </motion.div>
        )}

        {/* Cenas 3-5: Perguntas de reflexão */}
        {currentScene >= 3 && currentScene <= 5 && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <Eye className="w-10 h-10 text-primary mb-6" />
            
            <div className="space-y-4 w-full">
              {[
                { q: 'Onde a I.A. já poderia estar ajudando?', show: currentScene >= 3 },
                { q: 'Qual sua relação atual com a tecnologia?', show: currentScene >= 4 },
                { q: 'Por onde começar de forma prática?', show: currentScene >= 5 }
              ].map((item, i) => (
                item.show && (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <p className="text-sm font-medium text-foreground">{item.q}</p>
                  </motion.div>
                )
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 6-7: Bússola direcionando */}
        {currentScene >= 6 && currentScene <= 7 && (
          <motion.div
            key="compass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 45, 0, -30, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative"
            >
              <div className="w-28 h-28 rounded-full border-4 border-primary/30 flex items-center justify-center">
                <Compass className="w-14 h-14 text-primary" />
              </div>
              
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-6 bg-red-500 rounded-full"
                animate={{ rotate: [0, 45, 0, -30, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            
            <p className="text-muted-foreground text-sm mt-6 text-center">
              Encontrando sua direção
            </p>
          </motion.div>
        )}

        {/* Cenas 8-9: Destino claro */}
        {currentScene >= 8 && currentScene <= 9 && (
          <motion.div
            key="destination"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-6 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"
              >
                <span className="text-xl">📍</span>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-primary" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center"
              >
                <Target className="w-7 h-7 text-emerald-500" />
              </motion.div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground">
              De onde você está → Para onde quer ir
            </h3>
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
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center mb-6"
            >
              <Lightbulb className="w-10 h-10 text-primary" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Clareza gera ação
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Olhe para sua rotina real e identifique as oportunidades
            </p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <CheckCircle className="w-8 h-8 text-emerald-500" />
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

export default CardEffectSelfAwareness;
