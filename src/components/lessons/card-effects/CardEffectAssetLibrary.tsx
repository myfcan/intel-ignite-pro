import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, FileText, Clock, Sparkles, TrendingUp, Coins } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectAssetLibrary: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Sua biblioteca de ativos digitais",
  subtitle = "Conteúdo que trabalha por você"
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

  const assets = [
    { icon: BookOpen, label: 'Cursos', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59, 130, 246, 0.5)' },
    { icon: Video, label: 'Aulas', color: 'from-rose-500 to-pink-500', glow: 'rgba(244, 63, 94, 0.5)' },
    { icon: FileText, label: 'PDFs', color: 'from-emerald-500 to-green-500', glow: 'rgba(16, 185, 129, 0.5)' },
    { icon: BookOpen, label: 'eBooks', color: 'from-violet-500 to-purple-500', glow: 'rgba(139, 92, 246, 0.5)' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-teal-950 via-emerald-950 to-cyan-950">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-teal-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-500/25 rounded-full blur-3xl"
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
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-400/40 rounded-full"
            style={{
              left: `${8 + (i * 8)}%`,
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
        <p className="text-sm sm:text-base text-teal-200">{subtitle}</p>
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
              {/* Empty shelves */}
              <div className="space-y-4">
                {[0, 1].map((row) => (
                  <motion.div
                    key={row}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: row * 0.2 }}
                    className="w-64 sm:w-72 h-20 sm:h-24 bg-gradient-to-b from-teal-800/40 to-teal-900/40 rounded-xl shadow-xl border border-teal-500/30 backdrop-blur-sm"
                  />
                ))}
              </div>
              <p className="mt-5 text-sm text-teal-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Estantes surgindo...
              </p>
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
              {/* Shelves with items */}
              <div className="space-y-4">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="w-64 sm:w-72 h-20 sm:h-24 bg-gradient-to-b from-teal-800/40 to-teal-900/40 rounded-xl shadow-xl border border-teal-500/30 backdrop-blur-sm flex items-end justify-center gap-3 pb-2 px-3"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <motion.div
                        key={asset.label}
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: (row * 2 + i) * 0.15, type: 'spring' }}
                        className={`w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-br ${asset.color} rounded-xl shadow-lg flex flex-col items-center justify-center`}
                        style={{ boxShadow: `0 0 20px ${asset.glow}` }}
                      >
                        <asset.icon className="w-6 h-6 text-white" />
                        <span className="text-[10px] text-white/90 mt-0.5">{asset.label}</span>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-teal-200">Preenchendo estantes</p>
            </motion.div>
          )}

          {currentScene >= 6 && currentScene <= 8 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Shelves with items and clocks appearing */}
              <div className="space-y-4">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="relative w-64 sm:w-72 h-20 sm:h-24 bg-gradient-to-b from-teal-800/40 to-teal-900/40 rounded-xl shadow-xl border border-teal-500/30 backdrop-blur-sm flex items-end justify-center gap-3 pb-2 px-3"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <div key={asset.label} className="relative">
                        <div className={`w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-br ${asset.color} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
                          <asset.icon className="w-6 h-6 text-white" />
                          <span className="text-[10px] text-white/90 mt-0.5">{asset.label}</span>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: (row * 2 + i) * 0.2, type: 'spring' }}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
                        >
                          <Clock className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-teal-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Gerando valor continuamente
              </p>
            </motion.div>
          )}

          {currentScene >= 9 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Shelves with animated clocks */}
              <div className="space-y-4">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="relative w-64 sm:w-72 h-20 sm:h-24 bg-gradient-to-b from-teal-800/40 to-teal-900/40 rounded-xl shadow-xl border border-teal-500/30 backdrop-blur-sm flex items-end justify-center gap-3 pb-2 px-3"
                  >
                    {assets.slice(row * 2, row * 2 + 2).map((asset, i) => (
                      <motion.div
                        key={asset.label}
                        animate={{ 
                          boxShadow: [`0 0 10px ${asset.glow}`, `0 0 30px ${asset.glow}`, `0 0 10px ${asset.glow}`]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: (row * 2 + i) * 0.3 }}
                        className="relative"
                      >
                        <div className={`w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-br ${asset.color} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
                          <asset.icon className="w-6 h-6 text-white" />
                          <span className="text-[10px] text-white/90 mt-0.5">{asset.label}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
                        >
                          <Clock className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center gap-3 bg-teal-500/20 px-5 py-3 rounded-xl border border-teal-400/40"
              >
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-teal-100">Valor contínuo ao longo do tempo</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
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
              i <= currentScene ? 'bg-teal-400 w-4' : 'bg-white/20 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-teal-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-teal-400/40"
      >
        <span className="text-teal-200 text-xs font-medium">Biblioteca</span>
      </motion.div>
    </div>
  );
};

export default CardEffectAssetLibrary;
