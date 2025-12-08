import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Shuffle, ArrowRight, CheckCircle, XCircle, Zap, Clock, Target } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectTrendVsChange = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 9;
  const sceneTime = (duration * 1000) / totalScenes;

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);

    for (let i = 1; i < totalScenes; i++) {
      const timer = setTimeout(() => {
        setScene(i);
        if (i === totalScenes - 1) {
          loopCountRef.current += 1;
          if (loopCountRef.current < maxLoops) {
            const restartTimer = setTimeout(() => startAnimation(), sceneTime);
            timersRef.current.push(restartTimer);
          }
        }
      }, i * sceneTime);
      timersRef.current.push(timer);
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return () => clearTimers();
  }, [isActive]);

  const trendItems = ["Surge rápido", "Muita promessa", "Pode desaparecer", "Modinha passageira"];
  const realItems = ["Transforma processos", "Cria novos mercados", "Veio para ficar", "Impacto duradouro"];

  const examples = [
    { trend: "Fidget Spinner", real: "Smartphones", icon: TrendingUp },
    { trend: "Google Glass v1", real: "Cloud Computing", icon: Zap },
    { trend: "Segway", real: "E-commerce", icon: Target },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 sm:p-6 md:p-8 flex flex-col">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-amber-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-3 sm:mb-4">
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="text-amber-300 text-xs sm:text-sm font-medium">Análise Crítica</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          <span className="text-amber-400">Tendência</span> vs <span className="text-emerald-400">Mudança Real</span>
        </h2>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Scene 0-4: Comparison Grid */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
            >
              {/* Trend Side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: scene >= 1 ? 1 : 0.3, x: scene >= 1 ? 0 : -30 }}
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
                      animate={{ opacity: scene >= 2 ? 1 : 0, x: scene >= 2 ? 0 : -20 }}
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
                animate={{ opacity: scene >= 1 ? 1 : 0.3, x: scene >= 1 ? 0 : 30 }}
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
                      animate={{ opacity: scene >= 3 ? 1 : 0, x: scene >= 3 ? 0 : 20 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-emerald-500/5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-emerald-200 text-[10px] sm:text-xs md:text-sm leading-tight">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 5: Examples Carousel */}
          {scene === 5 && (
            <motion.div
              key="examples"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <h3 className="text-lg font-bold text-white mb-6">Exemplos Históricos:</h3>
              <div className="space-y-4 w-full max-w-md">
                {examples.map((ex, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.3 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-300 text-sm">{ex.trend}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-300 text-sm">{ex.real}</span>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scene 6: Time Test */}
          {scene === 6 && (
            <motion.div
              key="timetest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex items-center justify-center mb-6"
              >
                <Clock className="w-12 h-12 text-amber-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">O Teste do Tempo</h3>
              <p className="text-amber-300 text-center max-w-sm">
                Mudanças reais resistem ao tempo e transformam indústrias inteiras
              </p>
            </motion.div>
          )}

          {/* Scene 7: AI Verdict */}
          {scene === 7 && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(16, 185, 129, 0.3)', '0 0 50px rgba(16, 185, 129, 0.6)', '0 0 0px rgba(16, 185, 129, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-6"
              >
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">I.A. = Mudança Real</h3>
              <p className="text-white/80 text-center">Não é modinha, é transformação estrutural</p>
            </motion.div>
          )}

          {/* Scene 8: Final Conclusion */}
          {scene >= 8 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(245, 158, 11, 0.3)', '0 0 40px rgba(245, 158, 11, 0.5)', '0 0 0px rgba(245, 158, 11, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-emerald-500/20 border border-white/10 text-center max-w-md"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-amber-400 font-bold text-lg">Tendência</span>
                  <ArrowRight className="w-6 h-6 text-white" />
                  <span className="text-emerald-400 font-bold text-lg">I.A. é Mudança Real</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Quem entender isso primeiro, terá vantagem competitiva
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-amber-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
