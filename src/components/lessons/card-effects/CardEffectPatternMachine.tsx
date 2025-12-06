import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Cpu, Grid3X3, Eye, CheckCircle, Layers } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectPatternMachine = ({ isActive = true, duration = 15 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const maxLoops = 2;
  const totalPhases = 5;
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
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Máquina de Padrões</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          I.A. <span className="text-cyan-400">Reconhece</span> Padrões
        </h2>
      </motion.div>

      {/* Pattern Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.3, scale: phase >= 1 ? 1 : 0.8 }}
            className="grid grid-cols-4 gap-2"
          >
            {Array.from({ length: 12 }).map((_, idx) => {
              const isHighlighted = highlightedCells.includes(idx);
              const isPattern = phase >= 4 && [0, 5, 10, 3, 6, 9].includes(idx);
              
              return (
                <motion.div
                  key={idx}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
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
                      <CheckCircle className="w-6 h-6 text-green-400" />
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
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Eye className="w-8 h-8 text-cyan-400" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Result */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
        >
          <div className="flex items-center gap-3 justify-center">
            <Layers className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-semibold">Padrão Identificado!</p>
              <p className="text-green-300 text-sm">I.A. encontra conexões invisíveis aos humanos</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-cyan-400' : 'bg-cyan-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
