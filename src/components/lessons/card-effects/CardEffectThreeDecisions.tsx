import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Users, Target, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectThreeDecisions: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Três decisões que destravam tudo",
  subtitle = "Tema, público e promessa"
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

  const cards = [
    { label: 'Tema', icon: Lightbulb, color: 'from-yellow-400 to-orange-500' },
    { label: 'Público', icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: 'Promessa', icon: Target, color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-950 dark:to-green-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              {cards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="w-24 h-32 sm:w-28 sm:h-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
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
              {cards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`w-24 h-32 sm:w-28 sm:h-36 bg-gradient-to-br ${card.color} rounded-xl shadow-lg flex flex-col items-center justify-center gap-2`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                  >
                    <card.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold text-white">{card.label}</span>
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
              className="relative"
            >
              <div className="flex gap-3 sm:gap-4 mb-8">
                {cards.map((card, i) => (
                  <div
                    key={card.label}
                    className={`w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br ${card.color} rounded-xl shadow-lg flex flex-col items-center justify-center gap-1`}
                  >
                    <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    <span className="text-xs font-bold text-white">{card.label}</span>
                  </div>
                ))}
              </div>

              {/* Lines connecting to center */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 0 }}>
                {cards.map((_, i) => (
                  <motion.line
                    key={i}
                    x1={`${25 + i * 25}%`}
                    y1="60%"
                    x2="50%"
                    y2="90%"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-400"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                  />
                ))}
              </svg>

              {/* Central card placeholder */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg flex items-center justify-center border-2 border-dashed border-slate-400"
              >
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
              </motion.div>
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
              <div className="flex gap-3 sm:gap-4 mb-6">
                {cards.map((card) => (
                  <div
                    key={card.label}
                    className={`w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-br ${card.color} rounded-xl shadow-lg flex flex-col items-center justify-center gap-1`}
                  >
                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="text-xs font-bold text-white">{card.label}</span>
                  </div>
                ))}
              </div>

              {/* Lines */}
              <svg className="absolute w-full h-24 top-20 sm:top-24" viewBox="0 0 200 60">
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d={`M ${40 + i * 60} 0 Q 100 30 100 50`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-400"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                ))}
              </svg>

              {/* Central course title */}
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mt-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-6 py-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-sm sm:text-base">Seu Curso</span>
                </div>
              </motion.div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Mapa mental completo</p>
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
              i === currentScene ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectThreeDecisions;
