import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Layers, Users, Heart, Star, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectMemoryStack: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 19,
  title = "Memória acumulada do seu conhecimento",
  subtitle = "Quando o conteúdo vira patrimônio"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 6;
  const sceneDuration = ((duration || 19) * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const stackItems = [
    { icon: BookOpen, color: 'from-indigo-400 to-indigo-600' },
    { icon: Layers, color: 'from-purple-400 to-purple-600' },
    { icon: BookOpen, color: 'from-blue-400 to-blue-600' },
    { icon: Layers, color: 'from-violet-400 to-violet-600' },
    { icon: BookOpen, color: 'from-indigo-500 to-purple-600' },
  ];

  const avatars = [
    { badge: Heart, color: 'text-pink-500' },
    { badge: Star, color: 'text-yellow-500' },
    { badge: CheckCircle, color: 'text-green-500' },
    { badge: Heart, color: 'text-red-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
          {/* Cena 1: Primeiros blocos empilhando */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {stackItems.slice(0, 2).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.4, type: 'spring', bounce: 0.4 }}
                    style={{ marginTop: i > 0 ? -20 : 0 }}
                    className={`w-20 h-16 sm:w-24 sm:h-20 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Empilhando conhecimento...</p>
            </motion.div>
          )}

          {/* Cena 2: Pilha crescendo com mais blocos */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {stackItems.slice(0, 4).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: i < 2 ? 0 : 100, opacity: i < 2 ? 1 : 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i < 2 ? 0 : (i - 2) * 0.3, type: 'spring', bounce: 0.3 }}
                    style={{ marginTop: i > 0 ? -20 : 0 }}
                    className={`w-20 h-16 sm:w-24 sm:h-20 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Pilha crescendo...</p>
            </motion.div>
          )}

          {/* Cena 3: Tempo passando - relógio */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  {stackItems.map((item, i) => (
                    <div
                      key={i}
                      style={{ marginTop: i > 0 ? -20 : 0 }}
                      className={`w-16 h-12 sm:w-20 sm:h-16 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                    >
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  ))}
                </div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-xs mt-2 text-slate-500"
                  >
                    Tempo passa...
                  </motion.span>
                </motion.div>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Conteúdo permanece</p>
            </motion.div>
          )}

          {/* Cena 4: Pessoas chegando */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 sm:gap-8"
            >
              <div className="flex flex-col items-center">
                {avatars.slice(0, 2).map((avatar, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2"
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                ))}
              </div>

              <div className="relative">
                {stackItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ marginTop: i > 0 ? -20 : 0 }}
                    className={`w-16 h-12 sm:w-20 sm:h-16 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center">
                {avatars.slice(2).map((avatar, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2"
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 5: Pessoas com badges de engajamento */}
          {currentScene === 4 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 sm:gap-8"
            >
              <div className="flex flex-col items-center">
                {avatars.slice(0, 2).map((avatar, i) => (
                  <div key={i} className="relative mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: i * 0.2, type: 'spring' }}
                      className="absolute -top-2 -right-2"
                    >
                      <avatar.badge className={`w-5 h-5 ${avatar.color}`} />
                    </motion.div>
                  </div>
                ))}
              </div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                {stackItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ marginTop: i > 0 ? -20 : 0 }}
                    className={`w-16 h-12 sm:w-20 sm:h-16 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                ))}
              </motion.div>

              <div className="flex flex-col items-center">
                {avatars.slice(2).map((avatar, i) => (
                  <div key={i} className="relative mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.2, type: 'spring' }}
                      className="absolute -top-2 -right-2"
                    >
                      <avatar.badge className={`w-5 h-5 ${avatar.color}`} />
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 6: Resultado - patrimônio com valor crescendo */}
          {currentScene === 5 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  {stackItems.map((item, i) => (
                    <div
                      key={i}
                      style={{ marginTop: i > 0 ? -20 : 0 }}
                      className={`w-16 h-12 sm:w-20 sm:h-16 rounded-lg bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center`}
                    >
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  ))}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl px-4 py-3 shadow-xl"
                >
                  <span className="text-white font-bold text-sm">PATRIMÔNIO</span>
                  <div className="text-indigo-100 text-xs mt-1">Valor acumulado</div>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-sm text-slate-600 dark:text-slate-300 text-center"
              >
                Conteúdo que trabalha por você
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentScene ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectMemoryStack;
