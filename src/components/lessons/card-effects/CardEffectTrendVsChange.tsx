import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, Shuffle, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectTrendVsChange = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const trendItems = ["Surge rápido", "Muita promessa", "Pode desaparecer", "Modinha passageira"];
  const realItems = ["Transforma processos", "Cria novos mercados", "Veio para ficar", "Impacto duradouro"];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-3 sm:mb-4">
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="text-amber-300 text-xs sm:text-sm font-medium">Análise Crítica</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          <span className="text-amber-400">Tendência</span> vs <span className="text-emerald-400">Mudança Real</span>
        </h2>
      </motion.div>

      {/* Comparison - Grid responsivo */}
      <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Trend Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: phase >= 1 ? 1 : 0.3, x: phase >= 1 ? 0 : -30 }}
          className="flex flex-col min-w-0"
        >
          <div className="p-2.5 sm:p-3 md:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2 sm:mb-3 md:mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-400 mx-auto mb-1 sm:mb-2" />
            <h3 className="text-amber-400 font-bold text-center text-xs sm:text-sm md:text-base">TENDÊNCIA</h3>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 flex-1">
            {trendItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : -20 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-amber-500/5"
              >
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500/60 flex-shrink-0" />
                <span className="text-amber-200/80 text-[10px] sm:text-xs md:text-sm leading-tight">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Real Change Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: phase >= 1 ? 1 : 0.3, x: phase >= 1 ? 0 : 30 }}
          className="flex flex-col min-w-0"
        >
          <div className="p-2.5 sm:p-3 md:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2 sm:mb-3 md:mb-4">
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400 mx-auto mb-1 sm:mb-2" />
            <h3 className="text-emerald-400 font-bold text-center text-xs sm:text-sm md:text-base">MUDANÇA REAL</h3>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 flex-1">
            {realItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: phase >= 3 ? 1 : 0, x: phase >= 3 ? 0 : 20 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-emerald-500/5"
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-200 text-[10px] sm:text-xs md:text-sm leading-tight">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Arrow and Conclusion */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-transparent to-emerald-500/20 border border-white/10 text-center"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2 flex-wrap">
            <span className="text-amber-400 font-bold text-xs sm:text-sm md:text-base">Tendência</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            <span className="text-emerald-400 font-bold text-xs sm:text-sm md:text-base">I.A. é Mudança Real</span>
          </div>
          <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm">I.A. não é modinha - é transformação estrutural</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-amber-400' : 'bg-amber-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
