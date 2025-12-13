import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, LineChart, DollarSign, Clock } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectPatternVision: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Enxergando padrões!",
  subtitle = "Meses, produtos e dias que contam a história"
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

  const dataPoints = [
    { x: 10, y: 70 },
    { x: 25, y: 45 },
    { x: 40, y: 60 },
    { x: 55, y: 30 },
    { x: 70, y: 50 },
    { x: 85, y: 25 },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Pontos de dados caóticos */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4"
          >
            <LineChart className="absolute top-2 left-2 w-5 h-5 text-sky-500" />
            <svg className="w-full h-full" viewBox="0 0 100 80">
              {dataPoints.map((point, i) => (
                <motion.circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#38bdf8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    cx: [point.x, point.x + Math.random() * 10 - 5, point.x],
                    cy: [point.y, point.y + Math.random() * 10 - 5, point.y]
                  }}
                  transition={{ 
                    delay: i * 0.1,
                    cx: { duration: 2, repeat: Infinity },
                    cy: { duration: 2, repeat: Infinity, delay: 0.5 }
                  }}
                />
              ))}
            </svg>
            <motion.p
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Dados sem conexão...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 2: Linhas de tendência surgem */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4"
          >
            <LineChart className="absolute top-2 left-2 w-5 h-5 text-sky-500" />
            <svg className="w-full h-full" viewBox="0 0 100 80">
              {/* Pontos */}
              {dataPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#38bdf8"
                />
              ))}
              {/* Linha de tendência surgindo */}
              <motion.path
                d={`M ${dataPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            <motion.p
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-indigo-600 dark:text-indigo-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Conexões aparecendo...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 3: Curvas de subida e queda claras */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4"
          >
            <svg className="w-full h-full" viewBox="0 0 100 80">
              {/* Área de alta */}
              <motion.path
                d="M 10 50 Q 30 20 50 35"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
              {/* Área de queda */}
              <motion.path
                d="M 50 35 Q 70 50 90 60"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              {/* Marcadores */}
              <motion.circle
                cx="30"
                cy="30"
                r="6"
                fill="#22c55e"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
              />
              <motion.text x="30" y="20" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">
                <motion.tspan initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  +32%
                </motion.tspan>
              </motion.text>
              <motion.circle
                cx="75"
                cy="55"
                r="6"
                fill="#ef4444"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 }}
              />
              <motion.text x="75" y="68" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">
                <motion.tspan initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  -18%
                </motion.tspan>
              </motion.text>
            </svg>
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <span className="text-green-600">📈 Alta</span>
              <span className="text-red-600">📉 Queda</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Ícones destacando trechos importantes */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-56 sm:h-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4"
          >
            <svg className="w-full h-40" viewBox="0 0 100 60">
              {/* Linha de tendência */}
              <path
                d="M 10 40 Q 25 20 45 30 T 90 45"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              />
              {/* Pontos */}
              <circle cx="25" cy="25" r="4" fill="#22c55e" />
              <circle cx="60" cy="35" r="4" fill="#f59e0b" />
              <circle cx="85" cy="45" r="4" fill="#6366f1" />
            </svg>
            
            <div className="flex justify-around mt-2">
              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[10px] text-slate-500">Lucro</span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] text-slate-500">Tempo</span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] text-slate-500">Produtiv.</span>
              </motion.div>
            </div>
            
            <motion.p
              className="text-center text-sm text-sky-600 dark:text-sky-400 font-medium mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Padrões revelados nos seus dados! ✨
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
              currentScene === i ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectPatternVision;
