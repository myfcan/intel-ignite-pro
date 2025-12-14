import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Table, Zap, Link } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectToolCombo: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "As duas peças principais!",
  subtitle = "Chat de I.A. + planilha trabalhando juntos"
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Chat de I.A. de um lado, planilha vazia do outro */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-6 sm:gap-12"
          >
            {/* Chat */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-4 w-32 sm:w-40"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-teal-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Chat I.A.</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
              </div>
            </motion.div>

            {/* Planilha */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-4 w-32 sm:w-40"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Table className="w-5 h-5 text-cyan-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Planilha</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-4 border border-dashed border-slate-300 dark:border-slate-600 rounded" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Prompt curto aparece no chat */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-6 sm:gap-12"
          >
            {/* Chat com prompt */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-4 w-36 sm:w-48"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-teal-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Chat I.A.</span>
              </div>
              <motion.div
                className="bg-teal-100 dark:bg-teal-900/50 rounded-lg p-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-[10px] sm:text-xs text-teal-800 dark:text-teal-200">
                  "Crie uma planilha de despesas com data, categoria e valor"
                </p>
              </motion.div>
            </motion.div>

            {/* Planilha vazia */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-4 w-32 sm:w-40 opacity-50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Table className="w-5 h-5 text-cyan-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Planilha</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-4 border border-dashed border-slate-300 dark:border-slate-600 rounded" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Linha de energia liga chat à planilha */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 sm:gap-8"
          >
            {/* Chat */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 w-28 sm:w-36"
            >
              <MessageSquare className="w-6 h-6 text-teal-500 mx-auto" />
            </motion.div>

            {/* Linha de energia */}
            <motion.div
              className="relative flex items-center"
            >
              <motion.div
                className="h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400"
                animate={{ x: [0, 80, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Zap className="w-6 h-6 text-amber-500" />
              </motion.div>
            </motion.div>

            {/* Planilha */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 w-28 sm:w-36"
              animate={{ 
                boxShadow: ["0 0 0 rgba(6,182,212,0)", "0 0 20px rgba(6,182,212,0.5)", "0 0 0 rgba(6,182,212,0)"]
              }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              <Table className="w-6 h-6 text-cyan-500 mx-auto" />
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Colunas preenchidas automaticamente */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-8">
              {/* Chat pequeno */}
              <motion.div className="bg-teal-100 dark:bg-teal-900/50 rounded-lg p-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </motion.div>
              
              <Link className="w-5 h-5 text-slate-400" />
              
              {/* Planilha preenchida */}
              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 w-64 sm:w-80 border-2 border-cyan-400"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {["Data", "Categoria", "Valor"].map((col, i) => (
                    <motion.div
                      key={col}
                      className="px-2 py-1.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      {col}
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-1">
                  {[
                    ["01/03", "Alimentação", "R$ 150"],
                    ["02/03", "Transporte", "R$ 45"],
                    ["03/03", "Lazer", "R$ 80"],
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      className="grid grid-cols-3 gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.2 }}
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
            </div>
            
            <motion.p
              className="text-sm text-teal-600 dark:text-teal-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Parceria perfeita! 🤝
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
              currentScene === i ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectToolCombo;
