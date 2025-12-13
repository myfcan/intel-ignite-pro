import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileSpreadsheet, Wand2, ThumbsUp, Sparkles, Zap, CheckCircle, ArrowRight, Settings } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectAiAssistant: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 36,
  title = "A I.A. como assistente de planilhas!",
  subtitle = "Ela cuida da parte chata, você decide"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const BASE_DURATION = 36;
  const scale = useMemo(() => (duration || BASE_DURATION) / BASE_DURATION, [duration]);
  const sceneDuration = ((duration || BASE_DURATION) * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
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
        {/* FASE 1: ELEMENTOS EMPILHADOS (Cenas 0-5) */}
        
        {/* Cena 0: Avatar de I.A. aparece */}
        {currentScene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 * scale }}
            >
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <motion.p
              className="text-purple-600 dark:text-purple-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 * scale }}
            >
              Sua assistente de planilhas
            </motion.p>
          </motion.div>
        )}

        {/* Cena 1: I.A. ao lado de planilha vazia */}
        {currentScene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 sm:gap-8"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-48 sm:w-64"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 * scale }}
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

        {/* Cena 2: Avatar aponta para células */}
        {currentScene === 2 && (
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
                transition={{ duration: 1 * scale, repeat: Infinity }}
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
                    transition={{ duration: 1.5 * scale, repeat: Infinity, delay: i * 0.2 * scale }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cena 3: Primeira coluna nomeada */}
        {currentScene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Settings className="w-4 h-4 text-purple-500 animate-spin" style={{ animationDuration: '2s' }} />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Organizando...</span>
              </motion.div>
            </div>
            
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-64 sm:w-80">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <motion.div
                  className="px-2 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs sm:text-sm font-medium text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Data
                </motion.div>
                <div className="h-8 border border-dashed border-slate-300 dark:border-slate-600 rounded" />
                <div className="h-8 border border-dashed border-slate-300 dark:border-slate-600 rounded" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Segunda e terceira colunas */}
        {currentScene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-64 sm:w-80">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {columns.map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-2 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs sm:text-sm font-medium text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 * scale }}
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
                    transition={{ delay: 1 * scale + i * 0.05 * scale }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 5: Dados sendo preenchidos */}
        {currentScene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-64 sm:w-80">
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 * scale }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-purple-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 * scale }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Preenchendo automaticamente...</span>
            </motion.div>
          </motion.div>
        )}

        {/* FASE 2: TELA LIMPA (Cenas 6-10) */}

        {/* Cena 6: Avatar satisfeito */}
        {currentScene === 6 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5 * scale, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 * scale, type: "spring" }}
              >
                <ThumbsUp className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
            <p className="text-purple-600 dark:text-purple-400 font-medium">Pronto para ajudar!</p>
          </motion.div>
        )}

        {/* Cena 7: Você + I.A. */}
        {currentScene === 7 && (
          <motion.div
            key="scene7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-6"
          >
            <motion.div
              className="text-center"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Você decide</p>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 * scale }}
            >
              <ArrowRight className="w-6 h-6 text-purple-400" />
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 * scale }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">I.A. organiza</p>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 8: Planilha completa */}
        {currentScene === 8 && (
          <motion.div
            key="scene8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-64 sm:w-80 border-2 border-purple-400"
              animate={{ 
                boxShadow: ["0 0 0 rgba(168,85,247,0)", "0 0 20px rgba(168,85,247,0.3)", "0 0 0 rgba(168,85,247,0)"]
              }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
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
              <div className="space-y-1">
                {[
                  ["01/03", "Mercado", "R$ 150"],
                  ["02/03", "Uber", "R$ 32"],
                  ["03/03", "Lazer", "R$ 80"],
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-3 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 * scale }}
                  >
                    {row.map((cell, j) => (
                      <div key={j} className="text-xs text-slate-600 dark:text-slate-300 text-center py-1 bg-slate-50 dark:bg-slate-700 rounded">
                        {cell}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 9: Check de sucesso */}
        {currentScene === 9 && (
          <motion.div
            key="scene9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.p
              className="text-green-600 dark:text-green-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 * scale }}
            >
              Planilha organizada!
            </motion.p>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {currentScene === 10 && (
          <motion.div
            key="scene10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 * scale }}
            >
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">Você ajusta, a I.A. organiza!</p>
              <p className="text-sm text-slate-500 mt-1">Parceria perfeita ✨</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[...Array(totalScenes)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              currentScene === i ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAiAssistant;
