import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Combine, FileText, Table, Calendar, Bell, ArrowRight, Sparkles } from 'lucide-react';

interface CardEffectToolCombinationProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectToolCombination: React.FC<CardEffectToolCombinationProps> = ({ 
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

  const tools = [
    { icon: FileText, label: 'I.A. de Texto', color: 'bg-blue-500/20 text-blue-500' },
    { icon: Table, label: 'Planilhas', color: 'bg-emerald-500/20 text-emerald-500' },
    { icon: Calendar, label: 'Agenda', color: 'bg-violet-500/20 text-violet-500' },
    { icon: Bell, label: 'Lembretes', color: 'bg-amber-500/20 text-amber-500' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-emerald-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Ferramentas separadas */}
        {currentScene <= 2 && (
          <motion.div
            key="tools-separate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className={`w-16 h-16 rounded-xl ${tool.color.split(' ')[0]} flex items-center justify-center`}
                >
                  <tool.icon className={`w-8 h-8 ${tool.color.split(' ')[1]}`} />
                </motion.div>
              ))}
            </div>
            
            <p className="text-muted-foreground text-sm text-center">
              Ferramentas que trabalham juntas
            </p>
          </motion.div>
        )}

        {/* Cenas 3-6: Combinação */}
        {currentScene >= 3 && currentScene <= 6 && (
          <motion.div
            key="combining"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
              Combinando poderes
            </h3>
            
            <div className="flex items-center gap-2">
              {tools.slice(0, Math.min(currentScene - 2, 4)).map((tool, i) => (
                <React.Fragment key={tool.label}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-12 h-12 rounded-xl ${tool.color.split(' ')[0]} flex items-center justify-center`}
                  >
                    <tool.icon className={`w-6 h-6 ${tool.color.split(' ')[1]}`} />
                  </motion.div>
                  
                  {i < Math.min(currentScene - 3, 3) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Combine className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full mt-6"
            />
          </motion.div>
        )}

        {/* Cenas 7-8: Fluxo integrado */}
        {currentScene >= 7 && currentScene <= 8 && (
          <motion.div
            key="integrated"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="relative w-32 h-32"
            >
              {tools.map((tool, i) => {
                const angle = (i * 90) * Math.PI / 180;
                const x = Math.cos(angle) * 45;
                const y = Math.sin(angle) * 45;
                
                return (
                  <motion.div
                    key={tool.label}
                    className={`absolute w-10 h-10 rounded-lg ${tool.color.split(' ')[0]} flex items-center justify-center`}
                    style={{ 
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 20px)`
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <tool.icon className={`w-5 h-5 ${tool.color.split(' ')[1]}`} />
                  </motion.div>
                );
              })}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                  <Combine className="w-4 h-4 text-primary" />
                </div>
              </div>
            </motion.div>
            
            <p className="text-muted-foreground text-sm mt-6 text-center">
              Texto, planilha e rotina no mesmo fluxo
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
                y: [0, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Ferramentas integradas
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Use I.A. para criar, planilhas para acompanhar, lembretes para manter
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

export default CardEffectToolCombination;
