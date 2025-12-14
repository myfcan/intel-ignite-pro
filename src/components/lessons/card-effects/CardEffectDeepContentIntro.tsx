import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Twitter, Linkedin, BookOpen, Users } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectDeepContentIntro: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Conteúdo que fica, não que desaparece",
  subtitle = "Por que ir além dos posts rápidos"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneDuration = ((duration || 14) * 1000) / 4;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const posts = [
    { icon: Instagram, color: 'text-pink-500' },
    { icon: Twitter, color: 'text-blue-400' },
    { icon: Linkedin, color: 'text-blue-600' },
    { icon: Instagram, color: 'text-purple-500' },
    { icon: Twitter, color: 'text-cyan-400' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 z-10"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            >
              {posts.map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ 
                    x: [0, -300],
                    opacity: [1, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-md"
                >
                  <post.icon className={`w-5 h-5 ${post.color}`} />
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                </motion.div>
              ))}
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Timeline rolando rápido...</p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 sm:p-8 shadow-2xl"
              >
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 text-center">
                Conteúdo profundo permanece
              </p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 shadow-2xl mb-4"
              >
                <BookOpen className="w-12 h-12 text-white" />
              </motion.div>
              <div className="flex gap-2 flex-wrap justify-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Pessoas se aproximam</p>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              <div className="relative">
                <motion.div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 shadow-2xl">
                  <BookOpen className="w-12 h-12 text-white" />
                </motion.div>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    style={{
                      position: 'absolute',
                      top: -20 + i * 30,
                      left: i % 2 === 0 ? -60 : 80,
                    }}
                    className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <Users className="w-4 h-4 text-purple-500" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300 text-center">
                Interagindo com conteúdo de valor
              </p>
              
              {/* Fading posts in background */}
              <div className="absolute inset-0 -z-10 opacity-20">
                {posts.slice(0, 3).map((post, i) => (
                  <motion.div
                    key={i}
                    animate={{ x: [-100, -400], opacity: [0.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute"
                    style={{ top: 20 + i * 40, left: 100 }}
                  >
                    <post.icon className={`w-4 h-4 ${post.color}`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentScene ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectDeepContentIntro;
