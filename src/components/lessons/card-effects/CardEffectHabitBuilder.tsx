import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckSquare, Repeat } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectHabitBuilder: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Transformando em hábito!",
  subtitle = "Um pequeno ritual para manter tudo em dia"
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

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Calendário semanal aparece */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Calendar className="w-10 h-10 text-lime-500" />
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">Sua semana</p>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => (
                  <motion.div
                    key={day}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-[10px] text-slate-500">{day}</span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Horário em destaque (segunda, 8h) */}
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
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">Sua semana</p>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500">{day}</span>
                    <motion.div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                        i === 0 
                          ? 'bg-lime-200 dark:bg-lime-800 border-2 border-lime-400' 
                          : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                      }`}
                      animate={i === 0 ? {
                        boxShadow: ["0 0 0 rgba(163,230,53,0)", "0 0 20px rgba(163,230,53,0.5)", "0 0 0 rgba(163,230,53,0)"]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {i === 0 && <Clock className="w-4 h-4 text-lime-600" />}
                    </motion.div>
                  </div>
                ))}
              </div>
              <motion.div
                className="mt-4 flex items-center justify-center gap-2 text-lime-600 dark:text-lime-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Segunda, 8h da manhã</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Lembrete com checkbox sendo marcado */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 w-72 sm:w-80"
            >
              <motion.div
                className="bg-lime-100 dark:bg-lime-900/30 rounded-lg p-4 border border-lime-300 dark:border-lime-700"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-6 h-6 rounded border-2 border-lime-500 flex items-center justify-center bg-white dark:bg-slate-800"
                    animate={{ backgroundColor: ["#ffffff", "#a3e635", "#a3e635"] }}
                    transition={{ delay: 1, duration: 0.3 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <CheckSquare className="w-4 h-4 text-lime-700" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Atualizar planilha agora</p>
                    <p className="text-xs text-slate-500">Segunda, 8:00</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.p
                className="text-center text-xs text-slate-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                ⏰ Lembrete semanal configurado!
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Planilha se atualiza rapidamente */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 w-64 sm:w-80"
            >
              <div className="flex items-center gap-2 mb-3">
                <Repeat className="w-5 h-5 text-lime-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Atualização rápida</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                {["Data", "Cat.", "Valor"].map((col) => (
                  <div
                    key={col}
                    className="px-2 py-1 bg-lime-100 dark:bg-lime-900/50 text-lime-700 dark:text-lime-300 rounded text-xs font-medium text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              
              <div className="space-y-1">
                {[
                  ["05/03", "Mercado", "R$ 180"],
                  ["06/03", "Uber", "R$ 32"],
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-3 gap-2 bg-lime-50 dark:bg-lime-900/20 rounded p-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.3 }}
                  >
                    {row.map((cell, j) => (
                      <div key={j} className="text-xs text-slate-600 dark:text-slate-300 text-center">
                        {cell}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">Atualizado em 2 minutos!</span>
              </motion.div>
            </motion.div>
            
            <motion.p
              className="text-sm text-lime-600 dark:text-lime-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Poucos minutos por semana = controle total 💪
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
              currentScene === i ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectHabitBuilder;
