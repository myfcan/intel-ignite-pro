import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, AlertCircle, Sparkles, CheckCircle, HelpCircle, Lightbulb, ArrowRight, Target } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectFearBreaker: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 36,
  title = "A trava da planilha!",
  subtitle = "Do medo da tela em branco ao primeiro passo guiado"
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

  const fearWords = ["medo de errar", "bagunça", "e se eu apagar?"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* FASE 1: ELEMENTOS EMPILHADOS (Cenas 0-5) */}
        
        {/* Cena 0: Planilha vazia em close */}
        {currentScene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96"
              animate={{ boxShadow: ["0 0 20px rgba(100,150,255,0.2)", "0 0 40px rgba(100,150,255,0.4)", "0 0 20px rgba(100,150,255,0.2)"] }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
            >
              <div className="grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-8 sm:h-10 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 * scale }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute top-6 left-6 w-0.5 h-6 bg-blue-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8 * scale, repeat: Infinity }}
              />
            </motion.div>
            <FileSpreadsheet className="w-10 h-10 text-slate-400" />
          </motion.div>
        )}

        {/* Cena 1: Primeira palavra de medo */}
        {currentScene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="px-6 py-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium shadow-lg"
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <AlertCircle className="inline w-5 h-5 mr-2" />
              {fearWords[0]}
            </motion.div>
            <HelpCircle className="w-8 h-8 text-red-400 animate-pulse" />
          </motion.div>
        )}

        {/* Cena 2: Segunda palavra de medo */}
        {currentScene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="px-6 py-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium shadow-lg opacity-50"
            >
              <AlertCircle className="inline w-4 h-4 mr-2" />
              {fearWords[0]}
            </motion.div>
            <motion.div
              className="px-6 py-3 bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg font-bold shadow-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <AlertCircle className="inline w-5 h-5 mr-2" />
              {fearWords[1]}
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Terceira palavra de medo */}
        {currentScene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            {fearWords.map((word, i) => (
              <motion.div
                key={word}
                className={`px-5 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium shadow-lg ${i === 2 ? 'ring-2 ring-red-400' : 'opacity-60'}`}
                initial={i === 2 ? { opacity: 0, x: -30 } : {}}
                animate={i === 2 ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i === 2 ? 0.2 * scale : 0 }}
              >
                <AlertCircle className="inline w-4 h-4 mr-2" />
                {word}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cena 4: Todos os medos juntos - caos */}
        {currentScene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64"
          >
            {fearWords.map((word, i) => (
              <motion.div
                key={word}
                className="absolute px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm shadow-lg"
                animate={{ 
                  x: [0, Math.sin(i * 2) * 15, 0],
                  y: [0, Math.cos(i * 2) * 10, 0],
                  rotate: [0, (i - 1) * 5, 0]
                }}
                transition={{ duration: 2 * scale, repeat: Infinity }}
                style={{
                  top: `${20 + i * 25}%`,
                  left: `${10 + i * 20}%`,
                }}
              >
                <AlertCircle className="inline w-4 h-4 mr-1" />
                {word}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cena 5: Palavras começam a desaparecer */}
        {currentScene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64 flex items-center justify-center"
          >
            {fearWords.map((word, i) => (
              <motion.div
                key={word}
                className="absolute px-4 py-2 bg-red-100/50 dark:bg-red-900/30 text-red-400 rounded-lg font-medium text-sm"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  scale: 0.5,
                  y: -30 + i * 10,
                  rotate: (i - 1) * 20
                }}
                transition={{ delay: i * 0.2 * scale, duration: 0.5 * scale }}
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${20 + i * 15}%`,
                }}
              >
                {word}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 * scale }}
            >
              <Sparkles className="w-16 h-16 text-amber-400" />
            </motion.div>
          </motion.div>
        )}

        {/* FASE 2: TELA LIMPA (Cenas 6-10) */}

        {/* Cena 6: Luz dourada - transformação */}
        {currentScene === 6 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ["0 0 0 rgba(251,191,36,0)", "0 0 60px rgba(251,191,36,0.6)", "0 0 0 rgba(251,191,36,0)"]
              }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
            >
              <Lightbulb className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              className="text-lg font-medium text-amber-600 dark:text-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 * scale }}
            >
              Hora de transformar!
            </motion.p>
          </motion.div>
        )}

        {/* Cena 7: Seta de transição */}
        {currentScene === 7 && (
          <motion.div
            key="scene7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-8"
          >
            <motion.div className="text-center opacity-50">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Medo</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: 'spring' }}
            >
              <ArrowRight className="w-10 h-10 text-blue-500" />
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 * scale }}
            >
              <Target className="w-10 h-10 text-green-500 mx-auto" />
              <p className="text-xs text-green-600 mt-2">Clareza</p>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 8: Planilha com colunas aparecendo */}
        {currentScene === 8 && (
          <motion.div
            key="scene8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6"
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Data", "Categoria", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded font-medium text-xs sm:text-sm text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 * scale }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-8 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 * scale + i * 0.05 * scale }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 9: Planilha organizada brilhando */}
        {currentScene === 9 && (
          <motion.div
            key="scene9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border-2 border-green-400"
              animate={{ boxShadow: ["0 0 20px rgba(34,197,94,0.2)", "0 0 40px rgba(34,197,94,0.4)", "0 0 20px rgba(34,197,94,0.2)"] }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Data", "Categoria", "Valor"].map((col) => (
                  <div
                    key={col}
                    className="px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded font-medium text-xs sm:text-sm text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["01/03", "Mercado", "R$ 150", "02/03", "Uber", "R$ 32"].map((val, i) => (
                  <motion.div
                    key={i}
                    className="h-8 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 border border-green-200 dark:border-green-700 rounded bg-green-50 dark:bg-green-900/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 * scale }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final de sucesso */}
        {currentScene === 10 && (
          <motion.div
            key="scene10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 * scale }}
              className="text-center"
            >
              <p className="text-lg font-bold text-green-600 dark:text-green-400">Pronto para começar!</p>
              <p className="text-sm text-slate-500 mt-1">Do medo à clareza em poucos passos</p>
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
              currentScene === i ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectFearBreaker;
