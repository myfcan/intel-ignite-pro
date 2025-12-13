import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileSpreadsheet, Wand2, ThumbsUp, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectAiAssistant: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "A I.A. como assistente de planilhas!",
  subtitle = "Ela cuida da parte chata, você decide"
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

  const columns = ["Data", "Categoria", "Valor"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Avatar de I.A. aparece ao lado de planilha vazia */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 sm:gap-8"
          >
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-48 sm:w-64"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">Planilha vazia</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-6 border border-dashed border-slate-300 dark:border-slate-600 rounded" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Avatar aponta para células vazias */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 sm:gap-8"
          >
            <motion.div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <motion.div
                className="absolute -right-2 top-1/2"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Wand2 className="w-6 h-6 text-purple-500" />
              </motion.div>
            </motion.div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-48 sm:w-64">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="h-6 border border-dashed border-slate-300 dark:border-slate-600 rounded"
                    animate={i < 3 ? { 
                      borderColor: ["#d1d5db", "#a855f7", "#d1d5db"],
                      boxShadow: ["0 0 0 rgba(168,85,247,0)", "0 0 10px rgba(168,85,247,0.5)", "0 0 0 rgba(168,85,247,0)"]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cena 3: Colunas recebem nomes automaticamente */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Organizando...</span>
              </motion.div>
            </div>
            
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-64 sm:w-80">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {columns.map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-2 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs sm:text-sm font-medium text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.4 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-6 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Avatar faz gesto de ok */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <motion.div 
                className="relative"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <ThumbsUp className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-64 sm:w-80"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                {columns.map((col) => (
                  <div
                    key={col}
                    className="px-2 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs sm:text-sm font-medium text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["01/03", "Mercado", "R$ 150"].map((val, i) => (
                  <motion.div
                    key={i}
                    className="h-6 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.p
              className="text-purple-600 dark:text-purple-400 font-medium text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Você ajusta, a I.A. organiza! ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === i ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAiAssistant;
