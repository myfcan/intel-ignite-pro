import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Layers, MessageSquare, Sparkles, Cpu, Zap, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectToolOrchestrator: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Ferramentas de texto como aliadas",
  subtitle = "Modelos de linguagem organizando suas ideias"
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

  const modules = ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
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
        className="text-center mb-6 sm:mb-8 z-10 relative"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-blue-200">{subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {currentScene <= 2 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Keyboard */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-2xl shadow-blue-500/20 border border-blue-500/30"
              >
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        backgroundColor: i === 3 || i === 5 || i === 7
                          ? ['#374151', '#3B82F6', '#374151']
                          : '#374151'
                      }}
                      transition={{ duration: 0.3, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-700 shadow-inner"
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-700 shadow-inner" />
                  ))}
                </div>
              </motion.div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 flex items-center gap-2"
              >
                <Keyboard className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-200">Digitando poucas frases...</span>
              </motion.div>
            </motion.div>
          )}

          {currentScene >= 3 && currentScene <= 5 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Computer screen with modules */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-60 h-44 sm:w-72 sm:h-52 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-blue-500/30 border-4 border-blue-500/40 p-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-blue-200">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <p className="mt-5 text-sm text-blue-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Módulos surgindo na tela
              </p>
            </motion.div>
          )}

          {currentScene >= 6 && currentScene <= 8 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Screen with modules */}
              <div className="w-60 h-44 sm:w-72 sm:h-52 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-blue-500/30 border-4 border-blue-500/40 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((module) => (
                    <div
                      key={module}
                      className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-blue-200">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating chat bubbles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: (i - 1) * 70,
                    y: -25 + i * 15
                  }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className="absolute"
                  style={{ top: 25, left: '50%' }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-2.5 shadow-lg shadow-blue-500/40">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}

              <p className="mt-6 text-sm text-blue-200">Balões de conversa flutuando</p>
            </motion.div>
          )}

          {currentScene >= 9 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Screen with modules and chat */}
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 50px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-60 h-44 sm:w-72 sm:h-52 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border-4 border-blue-400 p-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module}
                      animate={{ 
                        borderColor: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0.5)']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/50 rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <Layers className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-200">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Chat bubbles and sparkles */}
              <div className="absolute inset-0 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -12, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute"
                    style={{ 
                      top: `${30 + i * 15}%`, 
                      left: `${20 + i * 20}%` 
                    }}
                  >
                    {i % 2 === 0 ? (
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-6 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/40"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-blue-200">Diálogo com I.A. completo</span>
              </motion.div>
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
              i <= currentScene ? 'bg-blue-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-blue-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/40"
      >
        <span className="text-blue-200 text-xs font-medium">Ferramentas</span>
      </motion.div>
    </div>
  );
};

export default CardEffectToolOrchestrator;
