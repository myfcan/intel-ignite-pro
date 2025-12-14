import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Table, TrendingDown, AlertTriangle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectFinanceExample: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Exemplo real: finanças pessoais!",
  subtitle = "Do 'não sei para onde vai' ao controle mês a mês"
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

  const expenses = [
    { desc: "Mercado", value: "R$ 450", alert: false },
    { desc: "Restaurante", value: "R$ 280", alert: false },
    { desc: "Uber", value: "R$ 150", alert: true },
    { desc: "Streaming", value: "R$ 55", alert: false },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Extrato confuso com gastos */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Receipt className="w-10 h-10 text-red-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-64 sm:w-80"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <p className="text-xs text-slate-500 mb-3">Extrato confuso...</p>
              <div className="space-y-2">
                {["R$ 45,90", "R$ 127,50", "R$ 89,00", "R$ 234,99", "R$ 15,00"].map((val, i) => (
                  <motion.div
                    key={i}
                    className="flex justify-between items-center px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-xs text-slate-400">???</span>
                    <span className="text-sm font-medium text-red-600">{val}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Transforma em planilha organizada */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Table className="w-10 h-10 text-emerald-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Data", "Descrição", "Categoria", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-1 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] sm:text-xs font-medium text-center"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="space-y-1">
                {expenses.map((exp, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-4 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                  >
                    <div className="text-[10px] text-slate-500 text-center">01/03</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 text-center truncate">{exp.desc}</div>
                    <div className="text-[10px] text-slate-500 text-center">Pessoal</div>
                    <div className="text-[10px] font-medium text-slate-700 dark:text-slate-200 text-center">{exp.value}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Barra de limite de gastos */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
            >
              {/* Barra de limite */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Gastos do mês</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">R$ 935 / R$ 1.500</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "62%" }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0%</span>
                  <span className="text-amber-600 font-medium">62% usado</span>
                  <span>100%</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {["Data", "Desc", "Cat", "Valor"].map((col) => (
                  <div key={col} className="text-center font-medium text-slate-500">{col}</div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-amber-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm">Acompanhe seu limite!</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Alerta quando limite ultrapassado */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
            >
              {/* Barra de limite ULTRAPASSADO */}
              <motion.div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Gastos do mês</span>
                  <motion.span 
                    className="font-bold text-red-600"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    R$ 1.680 / R$ 1.500
                  </motion.span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    initial={{ width: "62%" }}
                    animate={{ width: "112%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700"
                animate={{ 
                  boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 15px rgba(239,68,68,0.4)", "0 0 0 rgba(239,68,68,0)"]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Limite ultrapassado!</p>
                  <p className="text-xs text-red-600 dark:text-red-500">R$ 180 acima do planejado</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.p
              className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Alertas automáticos ajudam você a não perder o controle 🎯
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
              currentScene === i ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectFinanceExample;
