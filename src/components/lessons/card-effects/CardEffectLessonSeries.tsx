import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, CheckCircle, Award } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectLessonSeries({
  isActive = true,
  title = "Série de Aulas",
  subtitle = "Construa uma jornada de aprendizado completa."
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

  const lessons = [
    { number: 1, color: 'from-blue-500 to-cyan-500' },
    { number: 2, color: 'from-purple-500 to-pink-500' },
    { number: 3, color: 'from-amber-500 to-orange-500' },
    { number: 4, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Blocos verticais numerados */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-end gap-4">
                {lessons.map((lesson, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: idx * 0.2,
                      type: 'spring',
                      stiffness: 150
                    }}
                    className="flex flex-col items-center gap-3"
                  >
                    {/* Número da aula */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.2 + 0.3, type: 'spring' }}
                      className={`w-16 h-16 bg-gradient-to-br ${lesson.color} rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {lesson.number}
                      </span>
                    </motion.div>

                    {/* Bloco */}
                    <div className="w-20 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-3 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Aula {lesson.number}
                      </span>
                      <div className="flex-1 w-full space-y-2">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 2: Seta percorre os blocos */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-end gap-4">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${lesson.color} rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800`}>
                      <span className="text-2xl font-bold text-white">
                        {lesson.number}
                      </span>
                    </div>

                    <div className="w-20 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-3 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Aula {lesson.number}
                      </span>
                      <div className="flex-1 w-full space-y-2">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Seta animada */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: [0, 96, 192, 288] }}
                  transition={{
                    duration: 3,
                    times: [0, 0.33, 0.66, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute -top-12 left-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    <div className="w-0 h-0 border-l-8 border-l-indigo-500 border-y-6 border-y-transparent" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Ícones de insight aparecem */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-end gap-4">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center gap-3"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${lesson.color} rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800`}>
                      <span className="text-2xl font-bold text-white">
                        {lesson.number}
                      </span>
                    </div>

                    <div className="w-20 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-3 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Aula {lesson.number}
                      </span>
                      <div className="flex-1 w-full space-y-2">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                    </div>

                    {/* Insight */}
                    <motion.div
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.3,
                        type: 'spring',
                        stiffness: 200
                      }}
                      className="absolute -top-4 -right-4"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          delay: idx * 0.3 + 0.5,
                          repeat: Infinity
                        }}
                        className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-xl flex items-center justify-center border-2 border-white dark:border-slate-800"
                      >
                        <Lightbulb className="w-5 h-5 text-white" fill="white" />
                      </motion.div>

                      {/* Raios de luz */}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            delay: idx * 0.3 + 0.8 + i * 0.2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-yellow-400"
                          style={{
                            transformOrigin: 'bottom',
                            transform: `rotate(${i * 90}deg) translateY(-12px)`
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 4: Selo de conclusão conectando todas as aulas */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-end gap-4">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center gap-3"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${lesson.color} rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800`}>
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>

                    <div className="w-20 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-green-400 dark:border-green-600 p-3 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                        Aula {lesson.number}
                      </span>
                      <div className="flex-1 w-full space-y-2">
                        <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded" />
                        <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded w-3/4" />
                        <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded w-1/2" />
                      </div>
                    </div>

                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-xl flex items-center justify-center border-2 border-white dark:border-slate-800 absolute -top-4 -right-4">
                      <Lightbulb className="w-5 h-5 text-white" fill="white" />
                    </div>
                  </div>
                ))}

                {/* Linha conectando */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-amber-500 to-green-500 rounded-full"
                  style={{ zIndex: -1 }}
                />

                {/* Selo de conclusão */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.5, type: 'spring', stiffness: 150 }}
                  className="absolute -top-24 left-1/2 -translate-x-1/2"
                >
                  <div className="relative">
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                    />

                    {/* Selo */}
                    <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                      <Award className="w-14 h-14 text-white" />
                    </div>

                    {/* Raios */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          delay: 2 + i * 0.1,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute w-1 h-10 bg-green-400"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'bottom',
                          transform: `rotate(${i * 45}deg) translateY(-48px)`
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
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
                ? 'bg-indigo-600 dark:bg-indigo-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
