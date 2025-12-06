import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Rocket, Globe, Smartphone, Zap, Star, TrendingUp } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectGameChangers = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const gameChangers = [
    { name: "Internet", year: "1990s", icon: Globe, color: "#3b82f6" },
    { name: "Smartphones", year: "2007", icon: Smartphone, color: "#22c55e" },
    { name: "I.A. Generativa", year: "2022+", icon: Zap, color: "#a855f7" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
          <Rocket className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Mudanças de Jogo</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Tecnologias que <span className="text-blue-400">Transformaram</span> o Mundo
        </h2>
      </motion.div>

      {/* Timeline */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Timeline Line */}
          <motion.div 
            className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 1 }}
          />

          {/* Game Changers */}
          <div className="space-y-8">
            {gameChangers.map((item, idx) => {
              const Icon = item.icon;
              const shouldShow = phase >= idx + 1;
              const isActive = phase === idx + 1;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  animate={{ 
                    opacity: shouldShow ? 1 : 0.3,
                    x: shouldShow ? 0 : (idx % 2 === 0 ? -50 : 50)
                  }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${idx % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <motion.div
                      className="inline-block p-4 rounded-xl"
                      style={{ backgroundColor: `${item.color}20` }}
                      animate={isActive ? { 
                        boxShadow: [`0 0 0px ${item.color}`, `0 0 30px ${item.color}`, `0 0 0px ${item.color}`]
                      } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon className="w-8 h-8 mb-2 mx-auto" style={{ color: item.color }} />
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.year}</p>
                    </motion.div>
                  </div>

                  {/* Center Dot */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2"
                    style={{ borderColor: item.color, backgroundColor: shouldShow ? item.color : 'transparent' }}
                    animate={isActive ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                  />

                  <div className="flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {phase >= totalPhases - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-center"
        >
          <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Você está vivendo a próxima revolução!</p>
          <p className="text-purple-300 text-sm">I.A. é a mudança de jogo da nossa geração</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-blue-400' : 'bg-blue-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
