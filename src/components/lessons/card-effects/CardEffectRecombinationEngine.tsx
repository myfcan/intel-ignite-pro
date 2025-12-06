import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Shuffle, Puzzle, Layers, Sparkles, ArrowRight } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectRecombinationEngine = ({ isActive = true, duration = 15 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
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

  const pieces = [
    { text: "Estilo", color: "#3b82f6" },
    { text: "Tom", color: "#22c55e" },
    { text: "Contexto", color: "#a855f7" },
    { text: "Formato", color: "#f59e0b" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 mb-4">
          <Shuffle className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300 text-sm font-medium">Motor de Recombinação</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          I.A. <span className="text-orange-400">Recombina</span> Padrões
        </h2>
      </motion.div>

      {/* Recombination Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-lg">
          {/* Input Pieces */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.3 }}
            className="flex flex-wrap gap-3 justify-center mb-8"
          >
            {pieces.map((piece, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: phase >= 1 ? 1 : 0,
                  scale: phase >= 1 ? 1 : 0,
                  x: phase >= 2 ? 0 : (idx - 1.5) * 20,
                  y: phase >= 2 ? 0 : Math.sin(idx) * 10
                }}
                transition={{ delay: idx * 0.1 }}
                className="px-4 py-2 rounded-lg border flex items-center gap-2"
                style={{ 
                  backgroundColor: `${piece.color}20`,
                  borderColor: piece.color
                }}
              >
                <Puzzle className="w-4 h-4" style={{ color: piece.color }} />
                <span className="font-medium" style={{ color: piece.color }}>{piece.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Processing */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center mb-8"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center border border-orange-500/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Shuffle className="w-10 h-10 text-orange-400" />
              </motion.div>
              
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <span className="text-orange-300 text-sm">Recombinando padrões</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Output */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/50"
                animate={{ 
                  boxShadow: ['0 0 0px #f97316', '0 0 30px #f97316', '0 0 0px #f97316']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <p className="text-white font-bold text-center text-lg">Novo Conteúdo!</p>
                <p className="text-orange-300 text-sm text-center">Único e original</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Explanation */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center"
        >
          <p className="text-white font-semibold">I.A. não "copia" - ela RECOMBINA!</p>
          <p className="text-orange-300 text-sm">Mistura padrões de forma nova e criativa</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-orange-400' : 'bg-orange-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
