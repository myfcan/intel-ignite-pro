import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, FileText, CheckCircle, Lightbulb, Heart, Zap } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectObjectiveFocus({
  isActive = true,
  title = "Foco em objetivos claros",
  subtitle = "Cada aula precisa de uma meta definida."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-950 dark:to-green-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Ficha de aula com campo de título */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="relative"
              >
                {/* Ficha de aula */}
                <div className="w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
                  {/* Campo de título no topo */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Conteúdo da ficha */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="space-y-3"
                  >
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-4/6" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Ícone de alvo aparece ao lado do título */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Ficha de aula */}
                <div className="w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-4/6" />
                  </div>
                </div>

                {/* Alvo com seta */}
                <motion.div
                  initial={{ scale: 0, x: -100 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="absolute -top-8 -right-8"
                >
                  <div className="relative">
                    {/* Alvo */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                      <Target className="w-12 h-12 text-white" />
                    </div>

                    {/* Seta se aproximando */}
                    <motion.div
                      initial={{ x: -60, y: -60, rotate: -45 }}
                      animate={{ x: 0, y: 0, rotate: 45 }}
                      transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-12 h-1 bg-amber-500 rounded-full" style={{ transformOrigin: 'left' }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-amber-500 border-y-4 border-y-transparent" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Seta acerta alvo e aparecem três bullets */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Ficha de aula */}
                <div className="w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>

                  {/* Três bullets */}
                  <div className="space-y-4 mt-8">
                    {[
                      { icon: Lightbulb, text: 'Entender', color: 'from-blue-500 to-cyan-500', delay: 0.3 },
                      { icon: Heart, text: 'Sentir', color: 'from-pink-500 to-rose-500', delay: 0.6 },
                      { icon: Zap, text: 'Conseguir fazer', color: 'from-amber-500 to-orange-500', delay: 0.9 }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: item.delay, type: 'spring' }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Alvo acertado */}
                <div className="absolute -top-8 -right-8">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800"
                    >
                      <Target className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Ondas de impacto */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.5,
                          repeat: Infinity
                        }}
                        className="absolute inset-0 border-4 border-green-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Ficha ganha check verde */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                {/* Ficha de aula */}
                <div className="relative w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border-2 border-green-500 dark:border-green-600">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>

                  {/* Três bullets */}
                  <div className="space-y-4 mt-8">
                    {[
                      { icon: Lightbulb, text: 'Entender', color: 'from-blue-500 to-cyan-500' },
                      { icon: Heart, text: 'Sentir', color: 'from-pink-500 to-rose-500' },
                      { icon: Zap, text: 'Conseguir fazer', color: 'from-amber-500 to-orange-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Brilho de fundo */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl"
                  />
                </div>

                {/* Check verde grande */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6"
                >
                  <div className="relative">
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                    />

                    {/* Check */}
                    <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                      <CheckCircle className="w-16 h-16 text-white" />
                    </div>

                    {/* Partículas */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          x: Math.cos(i * 60 * Math.PI / 180) * 40,
                          y: Math.sin(i * 60 * Math.PI / 180) * 40
                        }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5 + i * 0.1,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                      />
                    ))}
                  </div>
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
                ? 'bg-green-600 dark:bg-green-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
