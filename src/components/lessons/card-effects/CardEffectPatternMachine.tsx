import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Cpu, Grid3X3, Eye, CheckCircle, Layers, Sparkles, Brain, Target, Zap } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectPatternMachine = ({ isActive = true, duration = 21 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const maxLoops = 2;
  const totalPhases = 7;
  const phaseTime = (duration * 1000) / totalPhases;

  useEffect(() => {
    if (!isActive || loopCount >= maxLoops) return;
    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev >= totalPhases - 1) {
          setLoopCount(l => l + 1);
          return 0;
        }
        return prev + 1;
      });
    }, phaseTime);
    return () => clearInterval(interval);
  }, [isActive, loopCount, phaseTime]);

  // Pattern recognition simulation
  useEffect(() => {
    if (phase >= 2 && phase < 4) {
      const patternInterval = setInterval(() => {
        const pattern = [0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11];
        const currentIdx = Math.floor(Math.random() * pattern.length);
        setHighlightedCells(prev => {
          const next = [...prev, pattern[currentIdx]];
          return next.slice(-4);
        });
      }, 300);
      return () => clearInterval(patternInterval);
    }
  }, [phase]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-3 sm:mb-4">
          <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <span className="text-cyan-300 text-xs sm:text-sm font-medium">Máquina de Padrões</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          I.A. <span className="text-cyan-400">Reconhece</span> Padrões
        </h2>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Phase 1-4: Pattern Grid */}
          {phase >= 0 && phase < 5 && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              {/* Grid */}
              <motion.div
                animate={{ opacity: phase >= 1 ? 1 : 0.3 }}
                className="grid grid-cols-4 gap-1.5 sm:gap-2"
              >
                {Array.from({ length: 12 }).map((_, idx) => {
                  const isHighlighted = highlightedCells.includes(idx);
                  const isPattern = phase >= 4 && [0, 5, 10, 3, 6, 9].includes(idx);
                  
                  return (
                    <motion.div
                      key={idx}
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isPattern 
                          ? 'bg-green-500/30 border-green-500' 
                          : isHighlighted 
                            ? 'bg-cyan-500/30 border-cyan-500' 
                            : 'bg-white/5 border-white/10'
                      }`}
                      animate={isHighlighted || isPattern ? { 
                        boxShadow: [`0 0 0px ${isPattern ? '#22c55e' : '#06b6d4'}`, `0 0 15px ${isPattern ? '#22c55e' : '#06b6d4'}`, `0 0 0px ${isPattern ? '#22c55e' : '#06b6d4'}`]
                      } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isPattern && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Scanning overlay */}
              {phase >= 2 && phase < 4 && (
                <motion.div
                  className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg"
                  animate={{ 
                    boxShadow: ['inset 0 0 20px #06b6d440', 'inset 0 0 40px #06b6d460', 'inset 0 0 20px #06b6d440']
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              {/* Eye scanning animation */}
              {phase >= 2 && phase < 4 && (
                <motion.div
                  className="absolute -top-10 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </motion.div>
              )}

              {/* Pattern Found Label */}
              {phase === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40"
                >
                  <Layers className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Padrão Identificado!</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 5: How It Works - Conexões */}
          {phase === 5 && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mb-4"
                animate={{ 
                  boxShadow: ['0 0 0px #a855f7', '0 0 30px #a855f7', '0 0 0px #a855f7']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Conexões Invisíveis
              </h3>
              <p className="text-purple-300 text-sm sm:text-base max-w-xs">
                A I.A. encontra relações em milhões de dados que humanos jamais perceberiam
              </p>

              {/* Visual connections */}
              <div className="flex items-center gap-3 mt-4">
                {[Target, Zap, Sparkles].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6 text-purple-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 6: Final Insight */}
          {phase === 6 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-green-500/20 border-2 border-cyan-500/50 flex items-center justify-center mb-5"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ['0 0 0px #06b6d4', '0 0 40px #06b6d4', '0 0 0px #06b6d4']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400" />
              </motion.div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Você Direciona, <span className="text-cyan-400">I.A. Processa</span>
              </h3>
              
              <p className="text-gray-300 text-sm sm:text-base max-w-sm mb-4">
                Enquanto a I.A. reconhece padrões em segundos, você decide como usar essa inteligência
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/30 to-green-500/30 border border-cyan-500/50"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold text-sm sm:text-base">Humano + I.A. = Superpoder</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-cyan-400' : 'bg-cyan-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
