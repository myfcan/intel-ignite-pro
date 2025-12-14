import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Circle, Crosshair, Sparkles, Focus } from 'lucide-react';

interface CardEffectFocusSelectionProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectFocusSelection: React.FC<CardEffectFocusSelectionProps> = ({ 
  duration = 25, 
  onComplete 
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  useEffect(() => {
    if (currentScene < totalScenes - 1) {
      const timer = setTimeout(() => setCurrentScene(prev => prev + 1), sceneTime);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, sceneTime);
      return () => clearTimeout(timer);
    }
  }, [currentScene, sceneTime, onComplete]);

  useEffect(() => {
    if (currentScene >= 4 && currentScene <= 6) {
      const taskIndex = currentScene - 4;
      if (!selectedTasks.includes(taskIndex)) {
        setSelectedTasks(prev => [...prev, taskIndex]);
      }
    }
  }, [currentScene]);

  const tasks = [
    'Responder e-mails',
    'Organizar agenda',
    'Revisar textos',
    'Montar relatórios',
    'Organizar ideias'
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-emerald-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Muitas tarefas */}
        {currentScene <= 2 && (
          <motion.div
            key="many-tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-40 h-40">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center"
                  initial={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 50,
                    y: Math.sin(i * 60 * Math.PI / 180) * 50,
                    opacity: 0
                  }}
                  animate={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 50 + 50,
                    y: Math.sin(i * 60 * Math.PI / 180) * 50 + 50,
                    opacity: 0.6,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    delay: i * 0.1,
                    scale: { duration: 1, repeat: Infinity, delay: i * 0.2 }
                  }}
                >
                  <Circle className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mt-8 text-center"
            >
              Tentar usar I.A. em tudo gera confusão
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Selecionando focos */}
        {currentScene >= 3 && currentScene <= 6 && (
          <motion.div
            key="selecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <Crosshair className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Escolha 2-3 tarefas foco
              </h3>
            </div>
            
            <div className="space-y-2 w-full">
              {tasks.map((task, i) => (
                <motion.div
                  key={task}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    selectedTasks.includes(i) 
                      ? 'bg-emerald-500/20 border-emerald-500/50' 
                      : 'bg-muted/50 border-border/50'
                  }`}
                >
                  <motion.div
                    animate={selectedTasks.includes(i) ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {selectedTasks.includes(i) ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </motion.div>
                  <span className="text-sm text-foreground">{task}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Foco definido */}
        {currentScene >= 7 && currentScene <= 8 && (
          <motion.div
            key="focused"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0)', '0 0 0 20px rgba(16, 185, 129, 0.2)', '0 0 0 0 rgba(16, 185, 129, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Target className="w-10 h-10 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Poucos focos, mais impacto
            </h3>
            <p className="text-muted-foreground text-sm">
              Dominar poucas tarefas primeiro
            </p>
          </motion.div>
        )}

        {/* Cenas 9-10: Resultado esperado */}
        {currentScene >= 9 && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            
            <h3 className="text-xl font-bold text-foreground mb-3">
              Ao final do mês
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Pelo menos 2 rotinas onde a I.A. realmente ajuda você
            </p>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-primary rounded-full mt-6"
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

export default CardEffectFocusSelection;
