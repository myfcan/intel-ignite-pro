import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Image, Film, Music, FileText, Wand2, Sparkles, Zap } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectMediaGenerator = ({ isActive = true, duration = 18 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [generatingType, setGeneratingType] = useState(0);
  const maxLoops = 2;
  const totalPhases = 6;
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

  useEffect(() => {
    if (phase >= 2 && phase < 4) {
      const typeInterval = setInterval(() => {
        setGeneratingType(prev => (prev + 1) % 4);
      }, 800);
      return () => clearInterval(typeInterval);
    }
  }, [phase]);

  const mediaTypes = [
    { icon: FileText, name: "Texto", color: "#3b82f6" },
    { icon: Image, name: "Imagem", color: "#22c55e" },
    { icon: Film, name: "Vídeo", color: "#a855f7" },
    { icon: Music, name: "Áudio", color: "#f59e0b" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] sm:min-h-[520px] h-[65vh] max-h-[650px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-3">
          <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <span className="text-cyan-300 text-xs sm:text-sm font-medium">Gerador de Mídia</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          I.A. <span className="text-cyan-400">Cria</span> Qualquer Mídia
        </h2>
      </motion.div>

      {/* Generator Interface */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4">
        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0.3, y: phase >= 1 ? 0 : 20 }}
          className="w-full max-w-sm p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </div>
            <span className="text-white font-medium text-sm sm:text-base">Seu Prompt</span>
          </div>
        </motion.div>

        {/* Arrow */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </motion.div>
          </motion.div>
        )}

        {/* Output Grid - 2x2 compacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-sm"
        >
          {mediaTypes.map((type, idx) => {
            const Icon = type.icon;
            const isGenerating = phase >= 2 && phase < 4 && generatingType === idx;
            const isComplete = phase >= 4;
            
            return (
              <motion.div
                key={idx}
                className="p-3 sm:p-4 rounded-xl border text-center"
                style={{ 
                  backgroundColor: isComplete ? `${type.color}15` : 'rgba(255,255,255,0.02)',
                  borderColor: isGenerating || isComplete ? type.color : 'rgba(255,255,255,0.1)'
                }}
                animate={isGenerating ? { 
                  boxShadow: [`0 0 0px ${type.color}`, `0 0 20px ${type.color}`, `0 0 0px ${type.color}`]
                } : {}}
                transition={{ duration: 0.3, repeat: isGenerating ? Infinity : 0 }}
              >
                <motion.div
                  animate={isGenerating ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
                  className="inline-block"
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1.5 sm:mb-2" style={{ color: isGenerating || isComplete ? type.color : '#6b7280' }} />
                </motion.div>
                <p className="font-medium text-sm sm:text-base" style={{ color: isGenerating || isComplete ? type.color : '#9ca3af' }}>
                  {type.name}
                </p>
                
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1.5 sm:mt-2 inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold"
                    style={{ backgroundColor: type.color, color: 'white' }}
                  >
                    PRONTO!
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Final insight */}
        {phase >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm p-3 sm:p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"
          >
            <p className="text-white font-semibold text-sm sm:text-base">Um prompt, infinitas possibilidades</p>
            <p className="text-cyan-300 text-xs sm:text-sm">Você define o que criar, I.A. executa</p>
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
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
