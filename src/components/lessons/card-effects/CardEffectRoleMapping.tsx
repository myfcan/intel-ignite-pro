import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Briefcase, Compass } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

const CardEffectRoleMapping: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900 via-pink-900 to-slate-900 p-4 sm:p-8">
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
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500/30 flex items-center justify-center mb-6"
            >
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-rose-300" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Mapa da Profissão</h2>
            <p className="text-rose-200 text-lg">Começando pelo que você já faz</p>
          </motion.div>
        )}

        {currentScene >= 3 && currentScene < 6 && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            {['Professora', 'Vendedor', 'Gestor', 'Autônomo'].map((role, i) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3 bg-rose-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              >
                <User className="w-5 h-5 text-rose-300" />
                <span className="text-white text-sm sm:text-lg">{role}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentScene >= 6 && currentScene < 9 && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-rose-500/20 flex items-center justify-center"
              >
                <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-rose-300" />
              </motion.div>
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={angle}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="absolute w-3 h-3 bg-rose-400 rounded-full"
                  style={{
                    top: `${50 + 60 * Math.sin(angle * Math.PI / 180)}%`,
                    left: `${50 + 60 * Math.cos(angle * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-8">Seu papel atual</h2>
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
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6"
            >
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Você está aqui</h2>
            <p className="text-rose-200 text-lg">Base para os próximos passos</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'w-6 bg-rose-400' : 'w-1.5 bg-rose-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectRoleMapping;
