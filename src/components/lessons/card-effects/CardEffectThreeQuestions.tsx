import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, Layers, Target, FileSpreadsheet } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectThreeQuestions: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "As três perguntas mágicas!",
  subtitle = "O que acompanhar, com que detalhe e o que ver no final"
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

  const questions = [
    { num: 1, question: "O que acompanhar?", icon: Search, color: "from-amber-400 to-orange-500" },
    { num: 2, question: "Com que detalhe?", icon: Layers, color: "from-blue-400 to-indigo-500" },
    { num: 3, question: "O que ver no final?", icon: Target, color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Três cartões aparecem com números */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 sm:gap-6"
          >
            {questions.map((q, i) => (
              <motion.div
                key={q.num}
                className={`w-20 sm:w-28 h-28 sm:h-40 rounded-xl bg-gradient-to-br ${q.color} shadow-lg flex items-center justify-center`}
                initial={{ y: 50, opacity: 0, rotateY: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.2, type: "spring" }}
              >
                <span className="text-4xl sm:text-6xl font-bold text-white">{q.num}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cena 2: Primeiro cartão gira revelando pergunta */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 sm:gap-6"
          >
            {questions.map((q, i) => (
              <motion.div
                key={q.num}
                className={`w-20 sm:w-28 h-28 sm:h-40 rounded-xl bg-gradient-to-br ${q.color} shadow-lg flex flex-col items-center justify-center p-2 sm:p-3`}
                initial={{ rotateY: i === 0 ? 90 : 0 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: i === 0 ? 0.3 : 0 }}
              >
                {i === 0 ? (
                  <>
                    <q.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-white text-center">{q.question}</p>
                  </>
                ) : (
                  <span className="text-4xl sm:text-6xl font-bold text-white">{q.num}</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cena 3: Segundo e terceiro giram */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 sm:gap-6"
          >
            {questions.map((q, i) => (
              <motion.div
                key={q.num}
                className={`w-20 sm:w-28 h-28 sm:h-40 rounded-xl bg-gradient-to-br ${q.color} shadow-lg flex flex-col items-center justify-center p-2 sm:p-3`}
                initial={{ rotateY: i > 0 ? 90 : 0 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: i > 0 ? i * 0.3 : 0 }}
              >
                <q.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2" />
                <p className="text-xs sm:text-sm font-medium text-white text-center">{q.question}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cena 4: Cartões se alinham acima de planilha */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            <motion.div 
              className="flex gap-2 sm:gap-4"
              initial={{ y: 0 }}
              animate={{ y: -10 }}
              transition={{ delay: 0.3 }}
            >
              {questions.map((q, i) => (
                <motion.div
                  key={q.num}
                  className={`w-16 sm:w-24 h-20 sm:h-28 rounded-lg bg-gradient-to-br ${q.color} shadow-lg flex flex-col items-center justify-center p-2`}
                  initial={{ scale: 1 }}
                  animate={{ scale: 0.9 }}
                  transition={{ delay: 0.2 }}
                >
                  <q.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-1" />
                  <p className="text-[10px] sm:text-xs font-medium text-white text-center leading-tight">{q.question}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="w-2 h-6 bg-gradient-to-b from-amber-400 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />

            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-56 sm:w-72"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Sua planilha</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-5 border border-dashed border-slate-300 dark:border-slate-600 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  />
                ))}
              </div>
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
              currentScene === i ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectThreeQuestions;
