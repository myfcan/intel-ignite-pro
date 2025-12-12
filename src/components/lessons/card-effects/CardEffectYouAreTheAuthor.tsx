import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Monitor, CheckCircle, XCircle, FileText, PenTool } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectYouAreTheAuthor({
  isActive = true,
  title = "Você é o autor",
  subtitle = "IA sugere, você decide."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Avatar em frente ao computador com sugestões da IA */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Avatar */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* Olhar para a tela */}
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-8 -right-8 w-2 h-2 bg-emerald-500 rounded-full"
                />
              </motion.div>

              {/* Tela com sugestões */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="w-80 h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 border-8 border-slate-700">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="ml-2 text-xs text-slate-400">Sugestões IA</span>
                  </div>

                  {/* Sugestões */}
                  <div className="space-y-3">
                    {[
                      { color: 'from-blue-500 to-cyan-500', label: 'Sugestão 1' },
                      { color: 'from-purple-500 to-pink-500', label: 'Sugestão 2' },
                      { color: 'from-amber-500 to-orange-500', label: 'Sugestão 3' },
                      { color: 'from-green-500 to-emerald-500', label: 'Sugestão 4' },
                    ].map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.2 }}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 bg-gradient-to-br ${suggestion.color} rounded flex items-center justify-center`}>
                            <FileText className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-slate-300">{suggestion.label}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-slate-600 rounded" />
                          <div className="h-1 bg-slate-600 rounded w-3/4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Sugestões arrastadas para Aprovar/Descartar */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex gap-8">
                {/* Área Aprovar */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-48 h-80 bg-green-100 dark:bg-green-900/20 rounded-2xl border-2 border-dashed border-green-500 dark:border-green-600 p-4 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Aprovar
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[
                      { color: 'from-blue-500 to-cyan-500', delay: 0.5 },
                      { color: 'from-green-500 to-emerald-500', delay: 1.0 },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: 100, y: -100, opacity: 0, scale: 0.5 }}
                        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{
                          delay: item.delay,
                          type: 'spring',
                          stiffness: 150
                        }}
                        className="bg-white dark:bg-slate-800 rounded-lg p-2 border-2 border-green-400 dark:border-green-600 shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 bg-gradient-to-br ${item.color} rounded flex items-center justify-center`}>
                            <FileText className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Área Descartar */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-48 h-80 bg-red-100 dark:bg-red-900/20 rounded-2xl border-2 border-dashed border-red-500 dark:border-red-600 p-4 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                      Descartar
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[
                      { color: 'from-purple-500 to-pink-500', delay: 0.7 },
                      { color: 'from-amber-500 to-orange-500', delay: 1.2 },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -100, y: -100, opacity: 0, scale: 0.5 }}
                        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{
                          delay: item.delay,
                          type: 'spring',
                          stiffness: 150
                        }}
                        className="bg-white dark:bg-slate-800 rounded-lg p-2 border-2 border-red-400 dark:border-red-600 shadow-lg opacity-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 bg-gradient-to-br ${item.color} rounded flex items-center justify-center`}>
                            <FileText className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Conteúdo aprovado se organiza em fluxo */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Sumário */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-emerald-400 dark:border-emerald-600 p-6 w-96"
                >
                  <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-4">
                    Estrutura Final
                  </h4>

                  {/* Módulos organizados */}
                  <div className="space-y-3">
                    {[
                      { title: 'Módulo 1', color: 'from-blue-500 to-cyan-500' },
                      { title: 'Módulo 2', color: 'from-green-500 to-emerald-500' },
                    ].map((module, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.3, type: 'spring' }}
                        className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center`}>
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {module.title}
                          </span>
                        </div>
                        <div className="ml-11 space-y-1.5">
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Setas conectando */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="absolute left-8 top-24 w-0.5 bg-emerald-400 rounded-full"
                    style={{ height: '40%' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Avatar assina digitalmente */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Documento final */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-emerald-500 dark:border-emerald-600 p-6 w-96">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      Estrutura Final
                    </h4>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Módulo 1', color: 'from-blue-500 to-cyan-500' },
                      { title: 'Módulo 2', color: 'from-green-500 to-emerald-500' },
                    ].map((module, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center`}>
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                            {module.title}
                          </span>
                        </div>
                        <div className="ml-11 space-y-1.5">
                          <div className="h-1.5 bg-emerald-200 dark:bg-emerald-900/40 rounded" />
                          <div className="h-1.5 bg-emerald-200 dark:bg-emerald-900/40 rounded w-5/6" />
                          <div className="h-1.5 bg-emerald-200 dark:bg-emerald-900/40 rounded w-4/6" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assinatura */}
                  <div className="border-t-2 border-emerald-200 dark:border-emerald-800 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Autor</p>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            Você
                          </p>
                        </div>
                      </div>

                      {/* Assinatura animada */}
                      <motion.div
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1.5 }}
                        className="relative"
                      >
                        <svg width="80" height="40" viewBox="0 0 80 40">
                          <motion.path
                            d="M 10 30 Q 20 10, 30 30 T 50 30 Q 60 20, 70 30"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-emerald-600 dark:text-emerald-400"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.8, duration: 1.5 }}
                          />
                        </svg>
                        <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute -top-1 right-0" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Badge de autoria */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 2, type: 'spring' }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 rounded-full border-2 border-emerald-500 dark:border-emerald-600 shadow-lg">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Autoria Humana
                    </span>
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
                ? 'bg-emerald-600 dark:bg-emerald-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
