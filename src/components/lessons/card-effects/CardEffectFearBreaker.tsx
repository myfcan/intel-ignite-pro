import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectFearBreaker: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "A trava da planilha!",
  subtitle = "Do medo da tela em branco ao primeiro passo guiado"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneDuration = ((duration || 14) * 1000) / 4;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const fearWords = ["medo de errar", "bagunça", "e se eu apagar?"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Planilha vazia em close */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96"
              animate={{ boxShadow: ["0 0 20px rgba(100,150,255,0.2)", "0 0 40px rgba(100,150,255,0.4)", "0 0 20px rgba(100,150,255,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-8 sm:h-10 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute top-6 left-6 w-0.5 h-6 bg-blue-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>
            <FileSpreadsheet className="w-10 h-10 text-slate-400" />
          </motion.div>
        )}

        {/* Cena 2: Palavras negativas surgem */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center gap-6"
          >
            <div className="relative w-72 sm:w-96 h-48 sm:h-64">
              {fearWords.map((word, i) => (
                <motion.div
                  key={word}
                  className="absolute px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm sm:text-base shadow-lg"
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    x: [0, Math.sin(i * 2) * 10, 0],
                  }}
                  transition={{ 
                    delay: i * 0.3,
                    x: { duration: 2, repeat: Infinity }
                  }}
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${10 + i * 20}%`,
                  }}
                >
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  {word}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cena 3: Palavras se desfazem */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center gap-6"
          >
            <div className="relative w-72 sm:w-96 h-48 sm:h-64">
              {fearWords.map((word, i) => (
                <motion.div
                  key={word}
                  className="absolute flex gap-1"
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${10 + i * 20}%`,
                  }}
                >
                  {word.split('').map((char, j) => (
                    <motion.span
                      key={j}
                      className="text-red-400 font-medium"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ 
                        opacity: 0, 
                        y: -50 + Math.random() * 100,
                        x: Math.random() * 100 - 50,
                        rotate: Math.random() * 360,
                        scale: 0
                      }}
                      transition={{ delay: j * 0.05 + i * 0.2, duration: 0.8 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              ))}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <Sparkles className="w-16 h-16 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Cena 4: Planilha organizada */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6"
              animate={{ boxShadow: ["0 0 20px rgba(34,197,94,0.2)", "0 0 40px rgba(34,197,94,0.3)", "0 0 20px rgba(34,197,94,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Data", "Categoria", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded font-medium text-xs sm:text-sm text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-8 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Pronto para começar!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === i ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectFearBreaker;
