import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, ArrowRight, CheckCircle, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectStartFromZero: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 21,
  title = "Sempre começando do zero… ou não",
  subtitle = "Da postagem solta ao caminho contínuo"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 7;
  const sceneDuration = ((duration || 21) * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const modules = ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Módulo 5'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
          {/* Cena 1: Post solto sendo digitado */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  className="w-48 h-64 sm:w-56 sm:h-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1 h-6 bg-blue-500"
                  />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-3 -left-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full"
                >
                  <span className="text-xs text-blue-600 dark:text-blue-400">Post #47</span>
                </motion.div>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Mais um post solto...</p>
            </motion.div>
          )}

          {/* Cena 2: Lixeira - apagando e recomeçando */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1], scale: [1, 0.95, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="w-48 h-64 sm:w-56 sm:h-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-red-200 dark:border-red-700/50 flex items-center justify-center"
                >
                  <RefreshCw className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-4 -right-4"
                >
                  <Trash2 className="w-8 h-8 text-red-400" />
                </motion.div>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Apagando e recomeçando...</p>
            </motion.div>
          )}

          {/* Cena 3: Problema - posts sem conexão */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0, rotate: Math.random() * 10 - 5 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="w-16 h-20 sm:w-20 sm:h-24 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                  >
                    <FileText className="w-6 h-6 text-slate-400" />
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex items-center gap-2 text-amber-500"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Peças isoladas, sem trilha</span>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 4: Blocos começando a se alinhar */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              {modules.slice(0, 3).map((module, i) => (
                <motion.div
                  key={module}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{module}</span>
                  </div>
                </motion.div>
              ))}
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Blocos se alinhando...</p>
            </motion.div>
          )}

          {/* Cena 5: Trilha se formando - todos os módulos */}
          {currentScene === 4 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col gap-1">
                {modules.map((module, i) => (
                  <motion.div
                    key={module}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.15 + 0.2 }}
                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {i + 1}
                    </motion.div>
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{module}</span>
                    </div>
                    {i < modules.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                      >
                        <ArrowRight className="w-4 h-4 text-blue-400 rotate-90" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Trilha se formando</p>
            </motion.div>
          )}

          {/* Cena 6: Corredor de progresso horizontal */}
          {currentScene === 5 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-hidden">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className="text-xs mt-1 text-slate-600 dark:text-slate-400">{i + 1}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute top-5 sm:top-6 left-8 right-8 h-1 bg-gradient-to-r from-blue-400 to-blue-600 -z-10 origin-left"
                />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300"
              >
                Corredor iluminado de progresso
              </motion.p>
            </motion.div>
          )}

          {/* Cena 7: Resultado final - conteúdo profundo */}
          {currentScene === 6 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className="w-56 h-40 sm:w-64 sm:h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-2xl flex flex-col items-center justify-center p-4">
                  <Sparkles className="w-10 h-10 text-white mb-2" />
                  <span className="text-white font-bold text-lg text-center">Conteúdo Profundo</span>
                  <span className="text-blue-100 text-sm mt-1">Trilha completa</span>
                </div>
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                      '0 0 0 20px rgba(59, 130, 246, 0.2)',
                      '0 0 0 0 rgba(59, 130, 246, 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-slate-600 dark:text-slate-300"
              >
                De posts soltos a patrimônio organizado
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
              i === currentScene ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectStartFromZero;
