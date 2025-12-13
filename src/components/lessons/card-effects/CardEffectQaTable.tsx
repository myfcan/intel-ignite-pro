import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, DollarSign, Home, Table, HelpCircle, Lightbulb } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectQaTable: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Planilha como perguntas e respostas!",
  subtitle = "Cada linha é uma situação real, não só números"
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

  const tableRows = [
    { text: "Compra no mercado", icon: ShoppingCart, color: "text-emerald-600" },
    { text: "Venda do dia", icon: DollarSign, color: "text-blue-600" },
    { text: "Pagamento de aluguel", icon: Home, color: "text-amber-600" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Primeira linha surge */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
            >
              <motion.div
                className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-l-4 border-emerald-500"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
                <span className="font-medium text-slate-700 dark:text-slate-200">Compra no mercado</span>
              </motion.div>
            </motion.div>
            <Table className="w-10 h-10 text-emerald-500" />
          </motion.div>
        )}

        {/* Cena 2: Mais linhas aparecem */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96 space-y-2">
              {tableRows.map((row, i) => (
                <motion.div
                  key={row.text}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-emerald-500"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                >
                  <row.icon className={`w-5 h-5 ${row.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{row.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Perguntas e Respostas conectadas */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-700 dark:text-purple-300">PERGUNTAS</span>
            </motion.div>
            
            <motion.div 
              className="w-1 h-20 bg-gradient-to-b from-purple-400 to-teal-400"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 }}
            />
            
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 sm:p-4 w-64 sm:w-80 space-y-2">
              {tableRows.map((row, i) => (
                <div
                  key={row.text}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded text-sm"
                >
                  <row.icon className={`w-4 h-4 ${row.color}`} />
                  <span className="text-slate-600 dark:text-slate-300">{row.text}</span>
                </div>
              ))}
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/50 rounded-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Lightbulb className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-teal-700 dark:text-teal-300">RESPOSTAS</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Zoom em uma linha */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-emerald-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <motion.div
                className="flex items-center gap-4"
                animate={{ boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.4)", "0 0 0 rgba(16,185,129,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">Compra no mercado</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Situação → Informação organizada</p>
                </div>
              </motion.div>
            </motion.div>
            <motion.p
              className="text-center text-emerald-600 dark:text-emerald-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Cada linha conta uma história real ✨
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
              currentScene === i ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectQaTable;
