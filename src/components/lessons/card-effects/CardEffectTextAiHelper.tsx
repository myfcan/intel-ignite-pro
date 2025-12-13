import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileText, Layers, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectTextAiHelper({
  isActive = true,
  title = "Assistente de Texto IA",
  subtitle = "Crie o esqueleto do seu conteúdo rapidamente."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-950 dark:to-cyan-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Caixa de chat com pessoa digitando */}
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
                className="relative w-96 h-80"
              >
                {/* Chat box */}
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Assistente IA
                      </h4>
                      <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="flex-1 flex flex-col justify-end">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                    >
                      {/* Texto sendo digitado */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.8, duration: 2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          Crie um esqueleto para meu curso sobre produtividade...
                        </p>
                      </motion.div>

                      {/* Cursor piscando */}
                      <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-3 bg-cyan-500 ml-1"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Esqueleto de módulos surge abaixo */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-6"
            >
              {/* Chat box menor */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 0.8, x: -100 }}
                transition={{ duration: 0.6 }}
                className="relative w-80 h-64"
              >
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                        Assistente IA
                      </h4>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300">
                    Crie um esqueleto para meu curso sobre produtividade...
                  </div>
                </div>
              </motion.div>

              {/* Módulos surgindo */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="flex flex-col gap-3"
              >
                {[
                  { title: 'Módulo 1', subtitle: 'Fundamentos', color: 'from-blue-500 to-cyan-500' },
                  { title: 'Módulo 2', subtitle: 'Prática', color: 'from-purple-500 to-pink-500' },
                  { title: 'Módulo 3', subtitle: 'Avançado', color: 'from-amber-500 to-orange-500' },
                ].map((module, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.2, type: 'spring' }}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border border-slate-200 dark:border-slate-700 w-64"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {module.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {module.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Cena 3: Trechos do esqueleto ficam destacados */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col gap-3">
                {[
                  { title: 'Módulo 1', subtitle: 'Fundamentos', color: 'from-blue-500 to-cyan-500', highlight: true },
                  { title: 'Módulo 2', subtitle: 'Prática', color: 'from-purple-500 to-pink-500', highlight: false },
                  { title: 'Módulo 3', subtitle: 'Avançado', color: 'from-amber-500 to-orange-500', highlight: true },
                ].map((module, idx) => (
                  <motion.div
                    key={idx}
                    animate={module.highlight ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '0 8px 16px rgba(59, 130, 246, 0.4)',
                        '0 4px 6px rgba(0, 0, 0, 0.1)'
                      ]
                    } : {}}
                    transition={module.highlight ? {
                      duration: 2,
                      delay: idx * 0.5,
                      repeat: Infinity
                    } : {}}
                    className={`relative flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border-2 w-96 ${
                      module.highlight
                        ? 'border-blue-400 dark:border-blue-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        {module.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {module.subtitle}
                      </p>
                      {/* Conteúdo expandido */}
                      <div className="space-y-1.5">
                        <div className={`h-1.5 rounded ${
                          module.highlight
                            ? 'bg-blue-200 dark:bg-blue-900/30'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                        <div className={`h-1.5 rounded w-4/5 ${
                          module.highlight
                            ? 'bg-blue-200 dark:bg-blue-900/30'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                        <div className={`h-1.5 rounded w-3/5 ${
                          module.highlight
                            ? 'bg-blue-200 dark:bg-blue-900/30'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                      </div>
                    </div>

                    {/* Ícone de revisão */}
                    {module.highlight && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.5, type: 'spring' }}
                        className="absolute -top-2 -right-2"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 4: Check indicando versão base pronta */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Esqueleto completo */}
                <div className="flex flex-col gap-3">
                  {[
                    { title: 'Módulo 1', subtitle: 'Fundamentos', color: 'from-blue-500 to-cyan-500' },
                    { title: 'Módulo 2', subtitle: 'Prática', color: 'from-purple-500 to-pink-500' },
                    { title: 'Módulo 3', subtitle: 'Avançado', color: 'from-amber-500 to-orange-500' },
                  ].map((module, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border-2 border-green-300 dark:border-green-700 w-96"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          {module.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {module.subtitle}
                        </p>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded" />
                          <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded w-4/5" />
                          <div className="h-1.5 bg-green-200 dark:bg-green-900/30 rounded w-3/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Check grande */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -bottom-8 -right-8"
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

                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full border border-green-400 dark:border-green-600">
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                          Versão Base Pronta
                        </span>
                      </div>
                    </motion.div>

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
                ? 'bg-cyan-600 dark:bg-cyan-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
