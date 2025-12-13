import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectEbookCreator({
  isActive = true,
  title = "Criador de eBooks",
  subtitle = "Transforme conhecimento em produto digital."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Páginas soltas voando na tela */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: -100,
                    rotate: Math.random() * 90 - 45,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.cos(i * 45 * Math.PI / 180) * 120,
                    y: Math.sin(i * 45 * Math.PI / 180) * 80,
                    rotate: Math.random() * 360,
                    opacity: 1
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    type: 'spring'
                  }}
                  className="absolute"
                >
                  <div className="w-20 h-28 bg-white dark:bg-slate-700 rounded-lg shadow-xl p-3 border border-slate-200 dark:border-slate-600">
                    <FileText className="w-4 h-4 text-purple-500 mb-2" />
                    <div className="space-y-1">
                      <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded" />
                      <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
                      <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-1/2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cena 2: Páginas se alinham e formam livro */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Páginas se empilhando */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.cos(i * 60 * Math.PI / 180) * 100,
                      y: Math.sin(i * 60 * Math.PI / 180) * 80,
                      rotate: Math.random() * 45,
                      opacity: 1
                    }}
                    animate={{
                      x: -i * 2,
                      y: -i * 2,
                      rotate: 0,
                      opacity: 1
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.15,
                      type: 'spring',
                      stiffness: 100
                    }}
                    className="absolute"
                    style={{
                      zIndex: 6 - i
                    }}
                  >
                    <div className="w-48 h-64 bg-white dark:bg-slate-700 rounded-lg shadow-xl p-4 border border-slate-200 dark:border-slate-600">
                      <div className="space-y-2">
                        <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded" />
                        <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded w-5/6" />
                        <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded w-4/6" />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Capa surgindo */}
                <motion.div
                  initial={{ scale: 0, rotateY: -90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
                  className="relative z-10"
                >
                  <div className="w-48 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl border-4 border-white dark:border-slate-800" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Capa recebe título e subtítulo */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Páginas ao fundo */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-48 h-64 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600"
                    style={{
                      right: -6 - i * 2,
                      top: -6 - i * 2,
                      zIndex: -i
                    }}
                  />
                ))}

                {/* Capa com título */}
                <motion.div
                  animate={{ rotateY: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative z-10 w-48 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-white dark:border-slate-800"
                >
                  {/* Ícone */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <BookOpen className="w-12 h-12 text-white mb-6" />
                  </motion.div>

                  {/* Título */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-white/90 rounded" />
                      <div className="h-3 w-28 bg-white/90 rounded" />
                    </div>
                  </motion.div>

                  {/* Subtítulo */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="h-1.5 w-24 bg-white/70 rounded" />
                      <div className="h-1.5 w-20 bg-white/70 rounded" />
                    </div>
                  </motion.div>

                  {/* Borda decorativa */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.8 }}
                    className="absolute inset-4 border-2 border-white/30 rounded"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Livro na prateleira com brilho */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Prateleira */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '400px' }}
                  transition={{ duration: 0.8 }}
                  className="absolute bottom-0 h-3 bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 rounded-full shadow-lg"
                />

                {/* Outros materiais na prateleira */}
                <div className="flex items-end gap-4 pb-4">
                  {/* Material 1 */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 0.8 }}
                    className="w-32 h-44 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg border-2 border-white dark:border-slate-800"
                  />

                  {/* Livro principal (destaque) */}
                  <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="relative"
                  >
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-2 bg-purple-400 rounded-lg blur-xl"
                    />

                    {/* Livro */}
                    <div className="relative w-48 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                      <BookOpen className="w-12 h-12 text-white mb-6" />
                      <div className="space-y-2 mb-4">
                        <div className="h-3 w-32 bg-white/90 rounded" />
                        <div className="h-3 w-28 bg-white/90 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-24 bg-white/70 rounded" />
                        <div className="h-1.5 w-20 bg-white/70 rounded" />
                      </div>
                      <div className="absolute inset-4 border-2 border-white/30 rounded" />
                    </div>

                    {/* Sparkles */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: Math.cos(i * 72 * Math.PI / 180) * 30,
                          y: Math.sin(i * 72 * Math.PI / 180) * 30
                        }}
                        transition={{
                          duration: 2,
                          delay: 1.5 + i * 0.2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute top-1/2 left-1/2"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Material 2 */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 1.2 }}
                    className="w-32 h-40 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg border-2 border-white dark:border-slate-800"
                  />
                </div>
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
                ? 'bg-purple-600 dark:bg-purple-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
