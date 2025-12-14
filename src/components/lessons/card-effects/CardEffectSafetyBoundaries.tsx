import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Eye, Lock, CheckCircle, Sparkles } from 'lucide-react';

interface CardEffectSafetyBoundariesProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectSafetyBoundaries: React.FC<CardEffectSafetyBoundariesProps> = ({ 
  duration = 23, 
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

  const safetyRules = [
    { icon: Lock, label: 'Evite dados sensíveis', desc: 'Não coloque info sigilosa' },
    { icon: Eye, label: 'Sempre revise', desc: 'Cheque antes de usar' },
    { icon: Shield, label: 'Use com responsabilidade', desc: 'Decisões são suas' }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-red-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Alerta */}
        {currentScene <= 2 && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Segurança em Primeiro Lugar
            </h3>
            <p className="text-muted-foreground text-sm">
              Usar I.A. com responsabilidade
            </p>
          </motion.div>
        )}

        {/* Cenas 3-6: Regras de segurança */}
        {currentScene >= 3 && currentScene <= 6 && (
          <motion.div
            key="rules"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
          >
            <Shield className="w-10 h-10 text-primary mb-6" />
            
            <div className="space-y-3 w-full">
              {safetyRules.map((rule, i) => {
                const isActive = currentScene - 3 >= i;
                
                return (
                  <motion.div
                    key={rule.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                      x: isActive ? 0 : -20,
                      opacity: isActive ? 1 : 0.3
                    }}
                    transition={{ delay: i * 0.2 }}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      isActive ? 'bg-red-500/10 border-red-500/30' : 'bg-muted/30 border-border/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-red-500/20' : 'bg-muted'
                    }`}>
                      <rule.icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{rule.label}</span>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Escudo protetor */}
        {currentScene >= 7 && currentScene <= 8 && (
          <motion.div
            key="shield"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0)', '0 0 0 20px rgba(34, 197, 94, 0.2)', '0 0 0 0 rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Shield className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Você está protegido
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Com essas práticas, você usa I.A. de forma segura
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
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 mb-6"
            >
              <Shield className="w-10 h-10 text-emerald-500" />
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Confiança e Direção
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              A I.A. ajuda, mas quem guia o processo é você
            </p>
            
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

export default CardEffectSafetyBoundaries;
