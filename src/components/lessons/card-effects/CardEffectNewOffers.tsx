import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, FileText, Users, Plus, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectNewOffers: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) {
      setCurrentScene(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentScene(prev => (prev < totalScenes - 1 ? prev + 1 : prev));
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="before"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-violet-500/30 flex items-center justify-center mb-6"
            >
              <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-violet-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Novas Entregas</h2>
            <p className="text-violet-200 text-lg">O que você não fazia antes</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="offers"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            {[
              { icon: FileText, text: 'Relatórios' },
              { icon: Package, text: 'Materiais' },
              { icon: Users, text: 'Consultorias' }
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-violet-500/20 px-6 py-3 rounded-xl"
              >
                <item.icon className="w-6 h-6 text-violet-300" />
                <span className="text-white text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {['Guias e apostilas', 'Checklists prontos', 'Sessões de orientação'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-violet-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <Sparkles className="w-5 h-5 text-violet-300" />
                <span className="text-white text-sm sm:text-lg">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6"
            >
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Serviços na Mesa</h2>
            <p className="text-violet-200 text-lg">Antes impossíveis, agora acessíveis</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-violet-400' : 'w-1.5 bg-violet-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectNewOffers;
