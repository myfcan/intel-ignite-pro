import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, Image, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectVisualCreator: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Dando cara ao seu conteúdo",
  subtitle = "Capas, imagens e elementos visuais"
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

  const ebooks = [
    { title: 'eBook 1', color: 'from-purple-400 to-purple-600' },
    { title: 'eBook 2', color: 'from-blue-400 to-blue-600' },
    { title: 'eBook 3', color: 'from-pink-400 to-pink-600' },
  ];

  const thumbnails = [
    { title: 'Aula 1', color: 'from-red-400 to-red-600' },
    { title: 'Aula 2', color: 'from-orange-400 to-orange-600' },
    { title: 'Aula 3', color: 'from-yellow-400 to-yellow-600' },
  ];

  const cards = [
    { color: 'from-green-400 to-green-600' },
    { color: 'from-teal-400 to-teal-600' },
    { color: 'from-cyan-400 to-cyan-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-950 dark:to-rose-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 sm:gap-4"
            >
              {ebooks.map((ebook, i) => (
                <motion.div
                  key={ebook.title}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className={`w-20 h-28 sm:w-24 sm:h-32 bg-gradient-to-br ${ebook.color} rounded-lg shadow-xl flex flex-col items-center justify-center`}
                >
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" />
                  <span className="text-xs font-bold text-white">{ebook.title}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 sm:gap-4"
            >
              {thumbnails.map((thumb, i) => (
                <motion.div
                  key={thumb.title}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className={`relative w-24 h-16 sm:w-28 sm:h-20 bg-gradient-to-br ${thumb.color} rounded-lg shadow-xl flex items-center justify-center`}
                >
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="bg-black/50 rounded px-1">
                      <span className="text-xs text-white">{thumb.title}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 sm:gap-4"
            >
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className={`w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br ${card.color} rounded-xl shadow-xl flex items-center justify-center`}
                >
                  <Image className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Carousel effect with all items */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-sm">
                {[...ebooks, ...thumbnails.slice(0, 2)].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-br ${item.color} rounded-lg shadow-lg flex items-center justify-center`}
                  >
                    {i < 3 ? (
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Sparkles indicating generation */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    x: (i - 2) * 40,
                    y: [0, -20, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute top-0 left-1/2"
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </motion.div>
              ))}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-rose-500" />
                Geração rápida em tempo real
              </motion.p>
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
              i === currentScene ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectVisualCreator;
