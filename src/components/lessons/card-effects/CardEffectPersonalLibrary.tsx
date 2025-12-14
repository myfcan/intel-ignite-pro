import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, FileText, Bookmark, Star, Sparkles, FolderOpen } from 'lucide-react';

interface CardEffectPersonalLibraryProps {
  duration?: number;
  onComplete?: () => void;
}

const CardEffectPersonalLibrary: React.FC<CardEffectPersonalLibraryProps> = ({ 
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-background via-background to-amber-500/5 rounded-2xl">
      
      <AnimatePresence mode="wait">
        {/* Cenas 0-3: Biblioteca surgindo */}
        {currentScene <= 3 && (
          <motion.div
            key="library"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                rotateY: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative"
            >
              <div className="w-24 h-28 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-lg flex items-center justify-center">
                <Library className="w-12 h-12 text-amber-500" />
              </div>
              
              {/* Livros na prateleira */}
              <motion.div
                className="absolute -left-3 top-1/2 -translate-y-1/2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-4 h-16 bg-blue-500/50 rounded-sm" />
              </motion.div>
              <motion.div
                className="absolute -right-3 top-1/2 -translate-y-1/2"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-4 h-14 bg-emerald-500/50 rounded-sm" />
              </motion.div>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mt-6 mb-2">
              Sua Biblioteca de Prompts
            </h3>
            <p className="text-muted-foreground text-sm">
              Guardando o que funciona
            </p>
          </motion.div>
        )}

        {/* Cenas 4-6: Arquivos sendo salvos */}
        {currentScene >= 4 && currentScene <= 6 && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <FolderOpen className="w-12 h-12 text-amber-500 mb-4" />
            
            <div className="space-y-2">
              {[
                { label: 'Prompt para e-mails', delay: 0 },
                { label: 'Modelo de relatórios', delay: 0.3 },
                { label: 'Estrutura de apresentação', delay: 0.6 }
              ].map((item, i) => (
                currentScene - 4 >= i && (
                  <motion.div
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Bookmark className="w-4 h-4 text-amber-500 ml-auto" />
                  </motion.div>
                )
              ))}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-9: Reutilização */}
        {currentScene >= 7 && currentScene <= 9 && (
          <motion.div
            key="reuse"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Star className="w-8 h-8 text-emerald-500" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Salve para reutilizar
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Prompts, modelos e estruturas em um único lugar
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
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-14 h-14 text-primary mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-foreground">
              Seu acervo cresce com você
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

export default CardEffectPersonalLibrary;
