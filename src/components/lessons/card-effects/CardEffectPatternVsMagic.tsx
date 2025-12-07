import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wand2, Binary, Brain, Sparkles, ArrowRight } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectPatternVsMagic = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-3 sm:mb-4">
          <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          <span className="text-purple-300 text-xs sm:text-sm font-medium">Desmistificando</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          <span className="text-pink-400">Magia</span> ou <span className="text-cyan-400">Padrões</span>?
        </h2>
      </motion.div>

      {/* Visual Comparison - Layout responsivo */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
        <div className="w-full max-w-md flex items-center justify-between gap-2 sm:gap-4">
          {/* Magic Side (Myth) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: phase >= 1 ? 1 : 0.3, 
              scale: phase >= 1 ? 1 : 0.8,
              filter: phase >= 3 ? 'blur(2px) grayscale(0.5)' : 'none'
            }}
            className="relative flex-1"
          >
            <div className="p-3 sm:p-4 md:p-6 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
              <motion.div
                animate={phase < 3 ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-pink-400 mx-auto mb-2 sm:mb-3" />
              </motion.div>
              <h3 className="text-pink-400 font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">"Magia"</h3>
              <p className="text-pink-300/60 text-[10px] sm:text-xs">Mito popular</p>
            </div>
            
            {phase >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-2xl sm:text-3xl md:text-4xl font-bold">✗</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Center Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            className="flex-shrink-0"
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white/60" />
            </motion.div>
          </motion.div>

          {/* Pattern Side (Reality) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: phase >= 2 ? 1 : 0.3, 
              scale: phase >= 2 ? 1 : 0.8,
              filter: phase >= 3 ? 'none' : 'grayscale(0.3)'
            }}
            className="relative flex-1"
          >
            <motion.div 
              className="p-3 sm:p-4 md:p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"
              animate={phase >= 3 ? { 
                boxShadow: ['0 0 0px #06b6d4', '0 0 20px #06b6d4', '0 0 0px #06b6d4']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Binary className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-cyan-400 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-cyan-400 font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">Padrões</h3>
              <p className="text-cyan-300/60 text-[10px] sm:text-xs">Realidade científica</p>
            </motion.div>

            {phase >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base md:text-lg">✓</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Explanation */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-1 sm:mb-2" />
          <p className="text-white font-semibold text-sm sm:text-base">I.A. reconhece padrões em dados</p>
          <p className="text-cyan-300 text-[10px] sm:text-xs md:text-sm">Não é mágica - é matemática e estatística avançada</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-purple-400' : 'bg-purple-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
