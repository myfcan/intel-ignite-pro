import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mic, Video, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectMediaExpander: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Quando o conteúdo ganha voz e movimento",
  subtitle = "Transformando texto em vídeo e áudio"
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

  // Waveform bars
  const waveformBars = Array(20).fill(0).map(() => Math.random() * 100);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 z-10"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Text paragraph */}
              <motion.div
                className="w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/5" />
                  </div>
                </div>
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Parágrafo de texto</p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Waveform */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-56 sm:w-64 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-xl p-4 flex items-center justify-center gap-0.5"
              >
                {waveformBars.map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [height * 0.3, height * 0.8, height * 0.3]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                    className="w-1.5 sm:w-2 bg-white/80 rounded-full"
                    style={{ height: `${height * 0.5}%` }}
                  />
                ))}
              </motion.div>
              <div className="flex items-center gap-2 mt-4">
                <Mic className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Transformando em áudio</span>
              </div>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Video player */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative w-56 sm:w-64 h-36 sm:h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl overflow-hidden"
              >
                {/* Video thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-blue-600/50" />
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 rounded-full flex items-center justify-center"
                  >
                    <div className="w-0 h-0 border-l-[16px] border-l-purple-600 border-y-[10px] border-y-transparent ml-1" />
                  </motion.div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 2 }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </motion.div>
              <div className="flex items-center gap-2 mt-4">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Transformando em vídeo</span>
              </div>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Text in center with audio and video connected */}
              <div className="relative flex items-center gap-4 sm:gap-6">
                {/* Audio icon */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>

                {/* Center text */}
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: ['0 0 0 0 rgba(147, 51, 234, 0)', '0 0 20px 5px rgba(147, 51, 234, 0.3)', '0 0 0 0 rgba(147, 51, 234, 0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-xl shadow-xl flex items-center justify-center border-2 border-purple-400"
                  >
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
                  </motion.div>

                  {/* Connection lines */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-1/2 -left-4 w-4 h-0.5 bg-purple-400 origin-right"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-1/2 -right-4 w-4 h-0.5 bg-purple-400 origin-left"
                  />
                </div>

                {/* Video icon */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 text-purple-500" />
                Reaproveitamento completo
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentScene ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectMediaExpander;
