import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectHumanCheck: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {currentScene < 3 && (
          <motion.div
            key="ai-output"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-blue-500/30 flex items-center justify-center mb-6"
            >
              <span className="text-3xl sm:text-4xl">🤖</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">I.A. Gerou</h2>
            <p className="text-blue-200 text-lg">Mas será que está certo?</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Eye className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-6">Revisão Humana</h2>
            <p className="text-blue-200 mt-2">Passo obrigatório</p>
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {[
              { icon: CheckCircle, text: 'Fatos corretos?', color: 'text-green-400' },
              { icon: AlertCircle, text: 'Dados inventados?', color: 'text-yellow-400' },
              { icon: CheckCircle, text: 'Faz sentido?', color: 'text-green-400' }
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 bg-blue-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-white text-sm sm:text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 9 && (
          <motion.div
            key="approved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6"
            >
              <UserCheck className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Revisão Humana</h2>
            <p className="text-blue-200 text-lg">Antes de enviar, você confere</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-blue-400' : 'w-1.5 bg-blue-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectHumanCheck;
