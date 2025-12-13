import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Eye, CheckCircle, Sparkles, XCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectPanelDecision: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Decidindo com seu próprio painel!",
  subtitle = "Menos achismo, mais clareza nos números"
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Painel simples com gráficos e números */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <LayoutDashboard className="w-10 h-10 text-slate-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6 w-72 sm:w-96"
            >
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-4">Seu Painel</p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Vendas", value: "R$ 4.5k", color: "text-green-600" },
                  { label: "Gastos", value: "R$ 2.1k", color: "text-red-500" },
                  { label: "Lucro", value: "R$ 2.4k", color: "text-blue-600" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-end justify-around p-2">
                {[40, 65, 45, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-4 bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Pessoa observa o painel */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6 w-72 sm:w-96"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Eye className="w-5 h-5 text-slate-500" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Analisando...</p>
                  <p className="text-xs text-slate-500">Números do mês</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Vendas", value: "R$ 4.5k", color: "text-green-600" },
                  { label: "Gastos", value: "R$ 2.1k", color: "text-red-500" },
                  { label: "Lucro", value: "R$ 2.4k", color: "text-blue-600" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Duas opções flutuando */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-64 sm:w-72 opacity-70"
            >
              <div className="text-center">
                <LayoutDashboard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Seu painel</p>
              </div>
            </motion.div>
            
            <div className="flex gap-4">
              <motion.div
                className="bg-red-100 dark:bg-red-900/30 rounded-xl p-4 border-2 border-red-300 dark:border-red-700 w-32 sm:w-40"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-center text-red-700 dark:text-red-400 font-medium">Decidir no achismo</p>
              </motion.div>
              
              <motion.div
                className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4 border-2 border-green-300 dark:border-green-700 w-32 sm:w-40"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-center text-green-700 dark:text-green-400 font-medium">Decidir com dados</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Cena 4: "Decidir com dados" selecionada com brilho */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6 w-72 sm:w-96 border-2 border-green-400"
              animate={{ 
                boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 30px rgba(34,197,94,0.4)", "0 0 0 rgba(34,197,94,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Decisão com dados!</p>
                  <p className="text-xs text-slate-500">Confiança nos números</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Vendas", value: "R$ 4.5k", color: "text-green-600" },
                  { label: "Gastos", value: "R$ 2.1k", color: "text-red-500" },
                  { label: "Lucro", value: "R$ 2.4k", color: "text-blue-600" },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label} 
                    className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    animate={{ 
                      boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 10px rgba(34,197,94,0.3)", "0 0 0 rgba(34,197,94,0)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-green-600 dark:text-green-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm">Clareza para decidir melhor! ✨</span>
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
              currentScene === i ? 'bg-slate-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectPanelDecision;
