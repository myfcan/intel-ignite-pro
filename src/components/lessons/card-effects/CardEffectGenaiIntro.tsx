import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, PenTool, Image, MessageSquare, Music, Zap } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectGenaiIntro = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
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

  const genaiTypes = [
    { icon: PenTool, name: "Texto", example: "Artigos, e-mails, histórias", color: "#3b82f6" },
    { icon: Image, name: "Imagens", example: "Artes, fotos, designs", color: "#22c55e" },
    { icon: MessageSquare, name: "Conversas", example: "Chatbots, assistentes", color: "#a855f7" },
    { icon: Music, name: "Áudio", example: "Músicas, vozes, podcasts", color: "#f59e0b" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">I.A. Generativa</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          O que é <span className="text-purple-400">I.A. Generativa</span>?
        </h2>
      </motion.div>

      {/* Central Orb */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Main Orb */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: phase >= 1 ? 1 : 0.5, opacity: phase >= 1 ? 1 : 0 }}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center border border-purple-500/50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-purple-400" />
            </motion.div>
            
            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: ['0 0 0px #a855f7', '0 0 60px #a855f7', '0 0 0px #a855f7']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbiting Types */}
          {genaiTypes.map((item, idx) => {
            const Icon = item.icon;
            const angle = (idx * 90 - 45) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const shouldShow = phase >= idx + 1;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: shouldShow ? 1 : 0,
                  scale: shouldShow ? 1 : 0,
                  x: shouldShow ? x : 0,
                  y: shouldShow ? y : 0
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  className="p-3 rounded-xl text-center"
                  style={{ backgroundColor: `${item.color}20`, borderColor: `${item.color}40` }}
                  animate={shouldShow ? { 
                    boxShadow: [`0 0 0px ${item.color}`, `0 0 15px ${item.color}`, `0 0 0px ${item.color}`]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="text-xs font-medium" style={{ color: item.color }}>{item.name}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center"
        >
          <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-white font-semibold">I.A. que CRIA conteúdo novo</p>
          <p className="text-purple-300 text-sm">Textos, imagens, áudios, vídeos - tudo do zero!</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-purple-400' : 'bg-purple-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
