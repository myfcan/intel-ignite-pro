import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, Sparkles, CheckCircle, Target, Calendar } from 'lucide-react';

interface CardEffectIaCoachProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectIaCoach: React.FC<CardEffectIaCoachProps> = ({ 
  duration = 24, 
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

  const coachResponses = [
    'Semana 1: Teste I.A. em tarefas simples...',
    'Semana 2: Repita o que funcionou...',
    'Semana 3: Combine com outras ferramentas...',
    'Semana 4: Consolide o hábito!'
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-cyan-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Coach digital */}
        {currentScene <= 2 && (
          <motion.div
            key="coach-intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                <Bot className="w-12 h-12 text-cyan-500" />
              </div>
              
              {/* Pulso */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-500/50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mt-6 mb-2">
              Seu Coach Digital
            </h3>
            <p className="text-muted-foreground text-sm">
              I.A. ajudando a organizar seus próximos passos
            </p>
          </motion.div>
        )}

        {/* Cenas 3-7: Chat com coach */}
        {currentScene >= 3 && currentScene <= 7 && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-cyan-500" />
              <span className="text-sm font-semibold text-foreground">Coach de Produtividade</span>
            </div>
            
            <div className="w-full bg-card rounded-xl border border-border p-4 space-y-3">
              {coachResponses.slice(0, Math.min(currentScene - 2, 4)).map((response, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-3 h-3 text-cyan-500" />
                  </div>
                  <p className="text-sm text-foreground/80">{response}</p>
                </motion.div>
              ))}
              
              {currentScene <= 6 && (
                <motion.div
                  className="flex items-center gap-1 ml-8"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Cenas 8-9: Plano gerado */}
        {currentScene >= 8 && currentScene <= 9 && (
          <motion.div
            key="plan-generated"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Calendar className="w-10 h-10 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Plano de 4 semanas gerado!
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Ações semana a semana personalizadas
            </p>
            
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                </motion.div>
              ))}
            </div>
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
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground">
              I.A. como seu parceiro de produtividade
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

export default CardEffectIaCoach;
