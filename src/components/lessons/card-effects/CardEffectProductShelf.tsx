import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Monitor, FileVideo, User, FileText, CheckSquare } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectProductShelf({
  isActive = true,
  title = "Prateleira de Produtos",
  subtitle = "Organize suas aulas em uma jornada completa."
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
    { title: 'Aula 01', duration: '12min' },
    { title: 'Aula 02', duration: '15min' },
    { title: 'Aula 03', duration: '18min' },
    { title: 'Aula 04', duration: '10min' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Tela de computador com ícone de play */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, rotateY: -20 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 1 }}
                className="relative"
              >
                {/* Monitor */}
                <div className="relative w-96 h-64">
                  {/* Tela */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 border-8 border-slate-700">
                    {/* Ícone de play central */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-xl flex items-center justify-center"
                      >
                        <Play className="w-12 h-12 text-white ml-1" fill="white" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Base do monitor */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-700 rounded-b-lg" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-2 bg-slate-600 rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Cards de aula aparecem ao lado como playlist */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Monitor */}
              <div className="relative w-72 h-48">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 border-8 border-slate-700">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-xl flex items-center justify-center mx-auto mt-8">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-slate-700 rounded-b-lg" />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-600 rounded-full" />
              </div>

              {/* Playlist */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2"
              >
                {lessons.map((lesson, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.15 }}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border border-slate-200 dark:border-slate-700 w-48"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
                      <FileVideo className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lesson.duration}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Cena 3: Play pressionado e barra de progresso avança */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Monitor com vídeo tocando */}
              <div className="relative w-72 h-48">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 border-8 border-slate-700 overflow-hidden">
                  {/* Simulação de vídeo */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-lg flex items-center justify-center"
                  >
                    <Monitor className="w-16 h-16 text-blue-400/50" />
                  </motion.div>

                  {/* Barra de progresso */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-slate-700 rounded-b-lg" />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-600 rounded-full" />
              </div>

              {/* Playlist com primeira aula destacada */}
              <div className="flex flex-col gap-2">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg p-3 shadow-lg w-48 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-blue-400'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                      idx === 0
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      <FileVideo className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${
                        idx === 0 ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {lesson.title}
                      </p>
                      <p className={`text-xs ${
                        idx === 0 ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 4: Avatar aluno assistindo com ícones de anotações */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Monitor */}
              <div className="relative w-72 h-48">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 border-8 border-slate-700">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-lg flex items-center justify-center">
                    <Monitor className="w-16 h-16 text-blue-400/50" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-full h-1.5 bg-slate-700 rounded-full">
                      <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-slate-700 rounded-b-lg" />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-600 rounded-full" />

                {/* Avatar aluno */}
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="absolute -bottom-16 -left-16"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>

              {/* Anotações surgindo */}
              <div className="relative">
                {[
                  { icon: FileText, color: 'from-purple-500 to-pink-500', delay: 0.5, x: 0, y: -40 },
                  { icon: CheckSquare, color: 'from-green-500 to-emerald-500', delay: 0.8, x: 60, y: -20 },
                  { icon: FileText, color: 'from-blue-500 to-cyan-500', delay: 1.1, x: 30, y: 20 },
                ].map((note, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: note.x,
                      y: note.y
                    }}
                    transition={{
                      delay: note.delay,
                      type: 'spring',
                      stiffness: 200
                    }}
                    className="absolute"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${note.color} rounded-xl shadow-lg flex items-center justify-center transform rotate-${idx * 5}`}>
                      <note.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Partículas */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        delay: note.delay + 0.5,
                        repeat: Infinity
                      }}
                      className="absolute inset-0 bg-white/50 rounded-xl blur-md"
                    />
                  </motion.div>
                ))}
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
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
