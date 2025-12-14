import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckSquare, Repeat, Sparkles, Zap, Bell } from 'lucide-react';

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
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene(prev => (prev + 1) % totalScenes);
    }, sceneTime);
    return () => clearInterval(timer);
  }, [isActive, sceneTime]);

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-lime-950 via-green-950 to-emerald-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-lime-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-500/25 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-lime-400/40 rounded-full"
            style={{
              left: `${10 + (i * 9)}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-8, 8, -8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 z-10 relative"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-lime-200">{subtitle}</p>
      </motion.div>

      <div className="relative flex-1 w-full max-w-md flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {/* Cena 1: Calendário semanal aparece */}
          {currentScene <= 2 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center shadow-lg shadow-lime-500/40"
              >
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl shadow-2xl shadow-lime-500/20 p-5 sm:p-6 backdrop-blur-sm border border-lime-500/30"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-sm text-lime-200 mb-4 text-center">Sua semana</p>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => (
                    <motion.div
                      key={day}
                      className="flex flex-col items-center gap-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="text-[10px] text-lime-300/70">{day}</span>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-700/50 border border-lime-500/30" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Horário em destaque (segunda, 8h) */}
          {currentScene >= 3 && currentScene <= 5 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div 
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl shadow-2xl shadow-lime-500/20 p-5 sm:p-6 backdrop-blur-sm border border-lime-500/30"
              >
                <p className="text-sm text-lime-200 mb-4 text-center">Sua semana</p>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-lime-300/70">{day}</span>
                      <motion.div 
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                          i === 0 
                            ? 'bg-gradient-to-br from-lime-500/40 to-green-500/40 border-2 border-lime-400' 
                            : 'bg-slate-700/50 border border-lime-500/30'
                        }`}
                        animate={i === 0 ? {
                          boxShadow: ["0 0 10px rgba(163,230,53,0.3)", "0 0 30px rgba(163,230,53,0.6)", "0 0 10px rgba(163,230,53,0.3)"]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {i === 0 && <Clock className="w-4 h-4 text-lime-300" />}
                      </motion.div>
                    </div>
                  ))}
                </div>
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2 text-lime-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-sm">Segunda, 8h da manhã</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 3: Lembrete com checkbox sendo marcado */}
          {currentScene >= 6 && currentScene <= 8 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div 
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl shadow-2xl shadow-lime-500/20 p-5 sm:p-6 w-72 sm:w-80 backdrop-blur-sm border border-lime-500/30"
              >
                <motion.div
                  className="bg-gradient-to-br from-lime-500/20 to-green-500/20 rounded-xl p-4 border border-lime-400/50"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-7 h-7 rounded-lg border-2 border-lime-400 flex items-center justify-center bg-slate-800/50"
                      animate={{ backgroundColor: ["rgba(30, 41, 59, 0.5)", "#84cc16", "#84cc16"] }}
                      transition={{ delay: 1, duration: 0.3 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <CheckSquare className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>
                    <div>
                      <p className="font-medium text-white text-sm">Atualizar planilha agora</p>
                      <p className="text-xs text-lime-300/70">Segunda, 8:00</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="text-center text-xs text-lime-300 mt-4 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Lembrete semanal configurado!
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 4: Planilha se atualiza rapidamente */}
          {currentScene >= 9 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div 
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl shadow-2xl shadow-lime-500/20 p-5 w-68 sm:w-80 backdrop-blur-sm border border-lime-500/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Repeat className="w-5 h-5 text-lime-400" />
                  </motion.div>
                  <span className="text-sm font-medium text-white">Atualização rápida</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {["Data", "Cat.", "Valor"].map((col) => (
                    <div
                      key={col}
                      className="px-2 py-1.5 bg-gradient-to-br from-lime-500/30 to-green-500/30 text-lime-200 rounded-lg text-xs font-medium text-center border border-lime-400/30"
                    >
                      {col}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1.5">
                  {[
                    ["05/03", "Mercado", "R$ 180"],
                    ["06/03", "Uber", "R$ 32"],
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      className="grid grid-cols-3 gap-2 bg-lime-500/10 rounded-lg p-1.5 border border-lime-500/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.3 }}
                    >
                      {row.map((cell, j) => (
                        <div key={j} className="text-xs text-lime-100 text-center">
                          {cell}
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm bg-emerald-500/20 py-2 rounded-lg border border-emerald-400/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="font-medium">Atualizado em 2 minutos!</span>
                </motion.div>
              </motion.div>
              
              <motion.p
                className="text-sm text-lime-300 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Poucos minutos por semana = controle total
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentScene ? 'bg-lime-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-lime-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-lime-400/40"
      >
        <span className="text-lime-200 text-xs font-medium">Hábito</span>
      </motion.div>
    </div>
  );
};

export default CardEffectHabitBuilder;
