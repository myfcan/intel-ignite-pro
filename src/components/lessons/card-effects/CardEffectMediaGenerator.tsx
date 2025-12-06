import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Image, Film, Music, FileText, Wand2, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectMediaGenerator = ({ isActive = true, duration = 15 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [generatingType, setGeneratingType] = useState(0);
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

  useEffect(() => {
    if (phase >= 2 && phase < 4) {
      const typeInterval = setInterval(() => {
        setGeneratingType(prev => (prev + 1) % 4);
      }, 800);
      return () => clearInterval(typeInterval);
    }
  }, [phase]);

  const mediaTypes = [
    { icon: FileText, name: "Texto", color: "#3b82f6", example: "\"Escreva um artigo sobre...\"" },
    { icon: Image, name: "Imagem", color: "#22c55e", example: "\"Crie uma foto de...\"" },
    { icon: Film, name: "Vídeo", color: "#a855f7", example: "\"Gere um vídeo curto...\"" },
    { icon: Music, name: "Áudio", color: "#f59e0b", example: "\"Produza uma música...\"" },
  ];

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
          <Wand2 className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Gerador de Mídia</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          I.A. <span className="text-cyan-400">Cria</span> Qualquer Mídia
        </h2>
      </motion.div>

      {/* Generator Interface */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0.3, y: phase >= 1 ? 0 : 20 }}
          className="w-full max-w-md p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-white font-medium">Seu Prompt</span>
          </div>
          
          {phase >= 2 && phase < 4 && (
            <motion.p
              key={generatingType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm italic"
            >
              {mediaTypes[generatingType].example}
            </motion.p>
          )}
        </motion.div>

        {/* Arrow */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-cyan-400 text-2xl"
            >
              ⚡
            </motion.div>
          </motion.div>
        )}

        {/* Output Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {mediaTypes.map((type, idx) => {
            const Icon = type.icon;
            const isGenerating = phase >= 2 && phase < 4 && generatingType === idx;
            const isComplete = phase >= 4;
            
            return (
              <motion.div
                key={idx}
                className="p-4 rounded-xl border text-center"
                style={{ 
                  backgroundColor: isComplete ? `${type.color}20` : 'transparent',
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
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: isGenerating || isComplete ? type.color : '#6b7280' }} />
                </motion.div>
                <p className="font-medium" style={{ color: isGenerating || isComplete ? type.color : '#9ca3af' }}>
                  {type.name}
                </p>
                
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 inline-block px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: type.color, color: 'white' }}
                  >
                    PRONTO!
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

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
