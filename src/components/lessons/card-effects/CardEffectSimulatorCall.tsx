import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ArrowRight, Sparkles, Play } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectSimulatorCall: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Simulador guiado!",
  subtitle = "Você escolhe o tipo de planilha e o pedido é montado"
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

  const steps = [
    { num: 1, label: "Tipo", icon: "📋" },
    { num: 2, label: "O quê", icon: "🎯" },
    { num: 3, label: "Período", icon: "📅" },
    { num: 4, label: "Resultado", icon: "✨" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Painel com 4 passos numerados */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <LayoutGrid className="w-10 h-10 text-amber-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-lg sm:text-xl">
                      {step.icon}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                      {step.num}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">{step.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Passos 1 e 2 destacados */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6"
            >
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex flex-col items-center gap-2"
                    animate={i < 2 ? { 
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 0.5, delay: i * 0.3 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                        i < 2 ? 'bg-amber-200 dark:bg-amber-800 ring-2 ring-amber-400' : 'bg-amber-100 dark:bg-amber-900/50'
                      }`}
                      animate={i < 2 ? {
                        boxShadow: ["0 0 0 rgba(245,158,11,0)", "0 0 15px rgba(245,158,11,0.5)", "0 0 0 rgba(245,158,11,0)"]
                      } : {}}
                      transition={{ duration: 1, repeat: i < 2 ? Infinity : 0, delay: i * 0.3 }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                    }`}>
                      {step.num}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">{step.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.p
              className="text-sm text-amber-600 dark:text-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Escolha o tipo e o que acompanhar...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 3: Passos 3 e 4 destacados */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6"
            >
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex flex-col items-center gap-2"
                    animate={i >= 2 ? { 
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 0.5, delay: (i - 2) * 0.3 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                        i >= 2 ? 'bg-amber-200 dark:bg-amber-800 ring-2 ring-amber-400' : 'bg-green-100 dark:bg-green-900/50'
                      }`}
                      animate={i >= 2 ? {
                        boxShadow: ["0 0 0 rgba(245,158,11,0)", "0 0 15px rgba(245,158,11,0.5)", "0 0 0 rgba(245,158,11,0)"]
                      } : {}}
                      transition={{ duration: 1, repeat: i >= 2 ? Infinity : 0, delay: (i - 2) * 0.3 }}
                    >
                      {i < 2 ? '✅' : step.icon}
                    </motion.div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 2 ? 'bg-green-500 text-white' : i >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-200'
                    }`}>
                      {i < 2 ? '✓' : step.num}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">{step.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.p
              className="text-sm text-amber-600 dark:text-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Defina período e resultado esperado...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 4: Botão "Gerar prompt" com brilho */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6"
            >
              <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
                {steps.map((step, i) => (
                  <div key={step.num} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-lg sm:text-xl">
                      ✅
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">{step.label}</span>
                  </div>
                ))}
              </div>
              
              <motion.button
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                animate={{ 
                  boxShadow: ["0 0 0 rgba(245,158,11,0)", "0 0 25px rgba(245,158,11,0.6)", "0 0 0 rgba(245,158,11,0)"]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-5 h-5" />
                Gerar prompt
                <Play className="w-4 h-4" />
              </motion.button>
            </motion.div>
            
            <motion.p
              className="text-sm text-amber-600 dark:text-amber-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Clique e veja a mágica acontecer! ✨
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
              currentScene === i ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectSimulatorCall;
