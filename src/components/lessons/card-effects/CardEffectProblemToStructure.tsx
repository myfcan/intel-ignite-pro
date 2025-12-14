import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, Table, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectProblemToStructure: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Você fala, a I.A. monta!",
  subtitle = "Do texto simples à planilha pronta para usar"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [typedText, setTypedText] = useState("");
  const sceneDuration = ((duration || 14) * 1000) / 4;
  
  const fullText = "Quero acompanhar minhas despesas do mês…";

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  useEffect(() => {
    if (currentScene === 1 && isActive) {
      setTypedText("");
      let index = 0;
      const typeTimer = setInterval(() => {
        if (index < fullText.length) {
          setTypedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeTimer);
        }
      }, 60);
      return () => clearInterval(typeTimer);
    }
  }, [currentScene, isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Campo de texto vazio aparece */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <MessageSquare className="w-12 h-12 text-green-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-72 sm:w-96"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="h-20 sm:h-24 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg flex items-center justify-center">
                <motion.div
                  className="w-0.5 h-6 bg-green-500"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
              <p className="text-center text-sm text-slate-500 mt-3">Digite o que você quer organizar...</p>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Frase sendo digitada */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-72 sm:w-96"
            >
              <div className="min-h-20 sm:min-h-24 border-2 border-green-400 dark:border-green-600 rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200">
                  {typedText}
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-green-500 ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Texto se transforma em planilha */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <motion.div 
                className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 max-w-32 sm:max-w-40"
                animate={{ opacity: [1, 0.5], x: [0, -20] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="text-xs text-slate-600 dark:text-slate-300 line-through">despesas do mês…</p>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <ArrowRight className="w-8 h-8 text-green-500" />
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Table className="w-8 h-8 text-green-600 mb-2" />
                <div className="grid grid-cols-3 gap-1">
                  {["Data", "Cat.", "Valor"].map((col, i) => (
                    <motion.div
                      key={col}
                      className="px-1 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-[10px] font-medium text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.15 }}
                    >
                      {col}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Transformando...</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Antes/Depois */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
          >
            {/* Antes */}
            <motion.div
              className="text-center"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <p className="text-xs text-slate-500 mb-2">ANTES</p>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 w-36 sm:w-40 opacity-60">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">"Quero acompanhar minhas despesas..."</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <ArrowRight className="w-8 h-8 text-green-500" />
            </motion.div>

            {/* Depois */}
            <motion.div
              className="text-center"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-green-600 mb-2 font-medium">DEPOIS</p>
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 w-40 sm:w-48 border-2 border-green-400"
                animate={{ boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.3)", "0 0 0 rgba(34,197,94,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {["Data", "Categoria", "Valor"].map((col) => (
                    <div
                      key={col}
                      className="px-1 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-[9px] font-medium text-center"
                    >
                      {col}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700" />
                  ))}
                </div>
              </motion.div>
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
              currentScene === i ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectProblemToStructure;
