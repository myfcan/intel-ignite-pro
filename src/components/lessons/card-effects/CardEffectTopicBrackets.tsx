import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brackets, Hash, Tag, List, FileText, CheckCircle, Sparkles, ArrowRight, Folder, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectTopicBrackets: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
  const [scene, setScene] = useState(1);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => Math.max(0.8, Math.min(1.5, duration / 36)), [duration]);
  const sceneTime = 3000 * scale;

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    for (let i = 1; i <= 12; i++) {
      timerRef.current.push(setTimeout(() => setScene(i), (i - 1) * sceneTime));
    }
    timerRef.current.push(setTimeout(() => startAnimation(), 12 * sceneTime));
  };

  useEffect(() => {
    if (isActive) startAnimation();
    else { clearTimers(); setScene(1); }
    return clearTimers;
  }, [isActive]);

  const topics = [
    { icon: Hash, label: 'Tópico Principal', color: '#8B5CF6' },
    { icon: Tag, label: 'Subtópicos', color: '#06B6D4' },
    { icon: List, label: 'Pontos-Chave', color: '#10B981' },
    { icon: FileText, label: 'Conteúdo Base', color: '#F59E0B' },
  ];

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl text-emerald-400 font-mono"
            style={{ 
              left: `${Math.random() * 90}%`, 
              top: `${Math.random() * 90}%` 
            }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          >
            {i % 2 === 0 ? '[' : ']'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md sm:max-w-2xl px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {scene <= 6 ? (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 sm:gap-4 w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: scene >= 1 ? 1 : 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
              >
                <Brackets className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                [Tópicos] Entre Colchetes
              </motion.h2>

              <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {topics.map((topic, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      x: scene >= idx + 3 ? 0 : -30 
                    }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-emerald-400/30"
                  >
                    <span className="text-emerald-400 font-mono text-lg">[</span>
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${topic.color}30` }}
                    >
                      <topic.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: topic.color }} />
                    </div>
                    <p className="text-xs sm:text-sm text-white flex-1">{topic.label}</p>
                    <span className="text-emerald-400 font-mono text-lg">]</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 sm:gap-6 w-full"
            >
              {scene === 7 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-mono">
                    <span className="text-emerald-400">[</span>
                    <Hash className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    <span className="text-emerald-400">]</span>
                  </div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-3">Organizando Tópicos</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                  {['Módulo 1', 'Módulo 2', 'Módulo 3'].map((mod, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-2 bg-emerald-500/20 rounded-lg px-4 py-2"
                    >
                      <Folder className="w-5 h-5 text-emerald-400" />
                      <span className="text-white text-sm">{mod}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-300 ml-auto" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
                    [ ]
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Estrutura Clara</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Brackets, Tag, BookOpen].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center border border-emerald-400/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 sm:p-6 text-center"
                >
                  <List className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm sm:text-base">Tópicos Organizados</p>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="flex items-center justify-center gap-1 mb-3">
                    <motion.span
                      animate={{ x: [-5, 0, -5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl text-emerald-400 font-mono"
                    >
                      [
                    </motion.span>
                    <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-400" />
                    <motion.span
                      animate={{ x: [5, 0, 5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl text-emerald-400 font-mono"
                    >
                      ]
                    </motion.span>
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white">Colchetes Completos!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-1.5 mt-6 sm:mt-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i + 1 === scene ? 'bg-emerald-400 scale-125' : i + 1 < scene ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-emerald-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">[Tópicos]</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectTopicBrackets;
