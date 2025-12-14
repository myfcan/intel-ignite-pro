import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Briefcase, Package, Users, DollarSign } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectExtraIncomePaths: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 via-emerald-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/30 flex items-center justify-center mb-6"
            >
              <Route className="w-10 h-10 sm:w-12 sm:h-12 text-green-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Caminhos de Renda</h2>
            <p className="text-green-200 text-lg">Três possibilidades reais</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="path1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-green-500/30 flex items-center justify-center mb-6"
            >
              <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-green-300" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">1. Serviços Simples</h2>
            <p className="text-green-200 mt-2 text-center max-w-sm">Textos, posts, apresentações</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 8 && (
          <motion.div
            key="path2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-emerald-500/30 flex items-center justify-center mb-6"
            >
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">2. Produtos Digitais</h2>
            <p className="text-emerald-200 mt-2 text-center max-w-sm">eBooks, mini aulas, planilhas</p>
          </motion.div>
        )}

        {currentScene >= 8 && currentScene < 10 && (
          <motion.div
            key="path3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-teal-500/30 flex items-center justify-center mb-6"
            >
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">3. Consultorias</h2>
            <p className="text-teal-200 mt-2 text-center max-w-sm">Sessões práticas de orientação</p>
          </motion.div>
        )}

        {currentScene >= 10 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6"
            >
              <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Renda Extra Real</h2>
            <p className="text-green-200 text-lg">Sem promessas mágicas</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-green-400' : 'w-1.5 bg-green-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectExtraIncomePaths;
