import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Award, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectCoreDecisions({
  isActive = true,
  title = "As 3 decisões que destravam tudo",
  subtitle = "Tema, público e promessa."
}: CardEffectProps) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, 3500);

    return () => clearInterval(timer);
  }, [isActive]);

  if (!isActive) return null;

  const decisions = [
    { icon: Target, label: 'Tema', color: 'from-violet-500 to-purple-600' },
    { icon: Users, label: 'Público', color: 'from-blue-500 to-indigo-600' },
    { icon: Award, label: 'Promessa', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-slate-950 dark:to-violet-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Scene Container */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Cena 1: Três círculos vazios */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex gap-12">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: i * 0.3,
                      type: 'spring',
                      stiffness: 150
                    }}
                    className="w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-600 border-dashed shadow-lg bg-white/50 dark:bg-slate-800/50"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 2: Palavras aparecem dentro dos círculos */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex gap-12">
                {decisions.map((decision, i) => (
                  <div key={i} className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-600 shadow-lg bg-white dark:bg-slate-800 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.5 + i * 0.3,
                          type: 'spring',
                          stiffness: 200
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${decision.color} flex items-center justify-center shadow-md`}>
                          <decision.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {decision.label}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 3: Linhas conectam formando triângulo */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg className="absolute w-full h-full" style={{ maxWidth: '600px', maxHeight: '400px' }}>
                {/* Linhas do triângulo */}
                <motion.line
                  x1="30%"
                  y1="50%"
                  x2="50%"
                  y2="50%"
                  stroke="url(#gradient1)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2="70%"
                  y2="50%"
                  stroke="url(#gradient2)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
                <motion.line
                  x1="30%"
                  y1="50%"
                  x2="50%"
                  y2="30%"
                  stroke="url(#gradient3)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                />
                <motion.line
                  x1="50%"
                  y1="30%"
                  x2="70%"
                  y2="50%"
                  stroke="url(#gradient4)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                />

                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex gap-12 relative z-10">
                {decisions.map((decision, i) => (
                  <div key={i} className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-600 shadow-lg bg-white dark:bg-slate-800 flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${decision.color} flex items-center justify-center shadow-md`}>
                          <decision.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {decision.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 4: Ícone de curso/livro no centro do triângulo */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Linhas do triângulo */}
              <svg className="absolute w-full h-full opacity-30" style={{ maxWidth: '600px', maxHeight: '400px' }}>
                <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="#8b5cf6" strokeWidth="3" />
                <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="#3b82f6" strokeWidth="3" />
                <line x1="30%" y1="50%" x2="50%" y2="30%" stroke="#f59e0b" strokeWidth="3" />
                <line x1="50%" y1="30%" x2="70%" y2="50%" stroke="#f59e0b" strokeWidth="3" />
              </svg>

              <div className="flex gap-12 relative z-10">
                {decisions.map((decision, i) => (
                  <div key={i} className="relative opacity-60">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-600 shadow-lg bg-white dark:bg-slate-800 flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${decision.color} flex items-center justify-center shadow-md`}>
                          <decision.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {decision.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ícone central brilhando */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.5,
                  type: 'spring',
                  stiffness: 150,
                  damping: 10
                }}
                className="absolute z-20"
              >
                <div className="relative">
                  {/* Brilho pulsante */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-violet-400 to-amber-400 rounded-2xl blur-2xl"
                  />

                  {/* Card/Livro */}
                  <div className="relative w-28 h-36 bg-gradient-to-br from-violet-600 via-blue-600 to-amber-600 rounded-2xl shadow-2xl p-4 flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                    <BookOpen className="w-12 h-12 text-white mb-2" />
                    <div className="w-full h-1 bg-white/40 mb-1" />
                    <div className="w-3/4 h-1 bg-white/40 mb-1" />
                    <div className="w-full h-1 bg-white/40" />
                  </div>

                  {/* Partículas ao redor */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 50],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: 1 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="absolute w-2 h-2 bg-gradient-to-br from-violet-400 to-amber-400 rounded-full"
                      style={{ left: '50%', top: '50%' }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scene indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2, 3].map((scene) => (
          <div
            key={scene}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === scene
                ? 'bg-violet-600 dark:bg-violet-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
