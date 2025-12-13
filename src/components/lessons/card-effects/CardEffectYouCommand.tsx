import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Type, Send, FileSpreadsheet } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectYouCommand: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Agora é com você!",
  subtitle = "Seu primeiro comando para a planilha nascer"
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

  const promptTemplate = "Crie uma planilha de [tipo] para acompanhar [objetivo] durante [período]";
  const filledPrompt = "Crie uma planilha de despesas para acompanhar gastos mensais durante janeiro";

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Teclado em destaque aparece */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Keyboard className="w-16 h-16 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-4" />
              <div className="grid grid-cols-10 gap-1">
                {['Q','W','E','R','T','Y','U','I','O','P'].map((key, i) => (
                  <motion.div
                    key={key}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {key}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <p className="text-sm text-orange-600 dark:text-orange-400">Pronto para digitar...</p>
          </motion.div>
        )}

        {/* Cena 2: Mãos digitando informações dentro de colchetes */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Type className="w-10 h-10 text-orange-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-72 sm:w-96"
            >
              <p className="text-xs text-slate-500 mb-2">Modelo:</p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Crie uma planilha de{' '}
                  <motion.span
                    className="inline-block bg-orange-200 dark:bg-orange-800 px-1 rounded"
                    animate={{ backgroundColor: ["#fed7aa", "#fdba74", "#fed7aa"] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    [tipo]
                  </motion.span>
                  {' '}para acompanhar{' '}
                  <motion.span
                    className="inline-block bg-orange-200 dark:bg-orange-800 px-1 rounded"
                    animate={{ backgroundColor: ["#fed7aa", "#fdba74", "#fed7aa"] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  >
                    [objetivo]
                  </motion.span>
                  {' '}durante{' '}
                  <motion.span
                    className="inline-block bg-orange-200 dark:bg-orange-800 px-1 rounded"
                    animate={{ backgroundColor: ["#fed7aa", "#fdba74", "#fed7aa"] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                  >
                    [período]
                  </motion.span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Prompt completo formado com colchetes preenchidos */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-72 sm:w-96"
            >
              <p className="text-xs text-slate-500 mb-2">Seu prompt completo:</p>
              <motion.div 
                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-2 border-green-400"
                animate={{ 
                  boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 15px rgba(34,197,94,0.3)", "0 0 0 rgba(34,197,94,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Crie uma planilha de{' '}
                  <span className="font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1 rounded">
                    despesas
                  </span>
                  {' '}para acompanhar{' '}
                  <span className="font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1 rounded">
                    gastos mensais
                  </span>
                  {' '}durante{' '}
                  <span className="font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1 rounded">
                    janeiro
                  </span>
                </p>
              </motion.div>
            </motion.div>
            <motion.p
              className="text-sm text-green-600 dark:text-green-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Prompt pronto! ✅
            </motion.p>
          </motion.div>
        )}

        {/* Cena 4: Prompt enviado ao chat, transição para planilha pronta */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2"
                initial={{ x: 0 }}
                animate={{ x: 30, opacity: [1, 0] }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Send className="w-5 h-5 text-green-600" />
              </motion.div>
            </div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 w-64 sm:w-80 border-2 border-orange-400"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Sua planilha</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {["Data", "Categoria", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded text-xs font-medium text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-5 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 + i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
            
            <motion.p
              className="text-sm text-orange-600 dark:text-orange-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Planilha criada com sucesso! 🎉
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
              currentScene === i ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectYouCommand;
