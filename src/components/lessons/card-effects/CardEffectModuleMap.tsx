import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectModuleMap({
  isActive = true,
  title = "Mapa de módulos",
  subtitle = "Seu conhecimento em etapas claras."
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-teal-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Linha horizontal com marcadores vazios */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-center gap-16">
                {/* Linha de conexão */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5 }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-teal-300 to-teal-500 dark:from-teal-700 dark:to-teal-500"
                  style={{ transformOrigin: 'left' }}
                />

                {/* Marcadores vazios */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3 + i * 0.2,
                      type: 'spring',
                      stiffness: 200
                    }}
                    className="relative z-10"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-teal-400 dark:border-teal-600 border-dashed bg-white dark:bg-slate-800 shadow-lg" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 2: Marcadores ganham rótulos */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-center gap-16">
                {/* Linha de conexão */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-teal-300 to-teal-500 dark:from-teal-700 dark:to-teal-500" />

                {/* Marcadores com labels */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-teal-400 dark:border-teal-600 bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: i * 0.3,
                          type: 'spring'
                        }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center"
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.3 }}
                      className="mt-3 text-center"
                    >
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        Módulo {i}
                      </span>
                    </motion.div>
                  </div>
                ))}

                {/* Setas entre módulos */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`arrow-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.2 }}
                    className="absolute z-5"
                    style={{ left: `${25 + i * 25}%` }}
                  >
                    <ChevronRight className="w-6 h-6 text-teal-500 dark:text-teal-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 3: Bullets aparecem abaixo de cada módulo */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-start gap-16">
                {/* Linha de conexão */}
                <div className="absolute left-0 right-0 top-8 h-1 bg-gradient-to-r from-teal-300 to-teal-500 dark:from-teal-700 dark:to-teal-500" />

                {/* Módulos com bullets */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-teal-400 dark:border-teal-600 bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="mt-3 text-center mb-3">
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        Módulo {i}
                      </span>
                    </div>

                    {/* Bullets */}
                    <div className="space-y-2">
                      {[0, 1, 2].map((j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.5 + i * 0.3 + j * 0.1
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-500" />
                          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 4: Zoom out mostrando jornada completa */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="relative"
              >
                <div className="relative flex items-start gap-12">
                  {/* Linha de conexão com gradiente animado */}
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute left-0 right-0 top-8 h-1.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #5eead4, #14b8a6, #0d9488, #14b8a6, #5eead4)',
                      backgroundSize: '200% 100%'
                    }}
                  />

                  {/* Módulos */}
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(94, 234, 212, 0)',
                            '0 0 0 8px rgba(94, 234, 212, 0.2)',
                            '0 0 0 0 rgba(94, 234, 212, 0)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.5,
                          repeat: Infinity
                        }}
                        className="w-16 h-16 rounded-full border-4 border-teal-400 dark:border-teal-600 bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>

                      <div className="mt-2 mb-2 text-center">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          Módulo {i}
                        </span>
                      </div>

                      {/* Bullets menores */}
                      <div className="space-y-1">
                        {[0, 1, 2].map((j) => (
                          <div
                            key={j}
                            className="flex items-center gap-1"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400/70 dark:bg-teal-500/70" />
                            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Texto de jornada */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 text-center"
                >
                  <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    Jornada do aluno
                  </span>
                </motion.div>
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
                ? 'bg-teal-600 dark:bg-teal-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
