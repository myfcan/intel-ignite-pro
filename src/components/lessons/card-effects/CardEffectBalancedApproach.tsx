import { motion, AnimatePresence } from "framer-motion";
import { Scale, XCircle, AlertTriangle, CheckCircle, Brain, Sparkles, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectBalancedApproachProps {
  isActive?: boolean;
}

export const CardEffectBalancedApproach = ({ isActive = false }: CardEffectBalancedApproachProps) => {
  const [scene, setScene] = useState(0);
  const [activeApproach, setActiveApproach] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const approaches = [
    { 
      icon: XCircle, 
      label: "Ignora", 
      detail: "Modo difícil",
      color: "red",
      status: "wrong"
    },
    { 
      icon: AlertTriangle, 
      label: "Exagera", 
      detail: "Acha que faz tudo sozinha",
      color: "yellow",
      status: "caution"
    },
    { 
      icon: CheckCircle, 
      label: "Equilibra", 
      detail: "Usa como apoio",
      color: "green",
      status: "correct"
    }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveApproach(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    timersRef.current.push(setTimeout(() => setActiveApproach(0), 3500));
    timersRef.current.push(setTimeout(() => setActiveApproach(1), 5500));
    timersRef.current.push(setTimeout(() => setActiveApproach(2), 7500));
    timersRef.current.push(setTimeout(() => setScene(3), 10500));
    timersRef.current.push(setTimeout(() => setScene(4), 13000));

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), 15000));
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveApproach(null);
    }
    return () => clearTimers();
  }, [isActive]);

  const getColorClasses = (color: string, status: string) => {
    if (status === 'wrong') return { bg: 'bg-red-900/40', border: 'border-red-500/40', icon: 'text-red-400', text: 'text-red-300' };
    if (status === 'caution') return { bg: 'bg-yellow-900/40', border: 'border-yellow-500/40', icon: 'text-yellow-400', text: 'text-yellow-300' };
    return { bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', icon: 'text-emerald-400', text: 'text-emerald-300' };
  };

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950">
      {/* Balance animation */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2"
        animate={scene >= 1 ? { rotate: [-5, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: scene < 3 ? Infinity : 0 }}
      >
        <Scale className="w-12 h-12 text-gray-600" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Title */}
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-10 text-center"
            >
              <h3 className="text-gray-300 text-xl font-bold">
                Três Abordagens
              </h3>
              <p className="text-gray-500 text-sm mt-1">Diante da I.A.</p>
            </motion.div>
          )}

          {/* Scene 2: Approaches */}
          {scene >= 2 && (
            <motion.div
              key="approaches"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              {approaches.map((approach, i) => {
                const Icon = approach.icon;
                const colors = getColorClasses(approach.color, approach.status);
                const isActive = activeApproach !== null && activeApproach >= i;
                const isCurrent = activeApproach === i;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isCurrent ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-28 ${
                      isActive ? `${colors.bg} ${colors.border}` : 'bg-gray-900/30 border-gray-800/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-white/10' : 'bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? colors.icon : 'text-gray-600'}`} />
                    </div>
                    <p className={`font-semibold text-sm ${isActive ? colors.text : 'text-gray-500'}`}>
                      {approach.label}
                    </p>
                    <p className={`text-xs text-center mt-1 ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                      {approach.detail}
                    </p>
                    
                    {isActive && approach.status === 'correct' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2"
                      >
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Scene 3: Winner highlight */}
          {scene >= 3 && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-emerald-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-emerald-500/30"
            >
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-300 font-medium">
                  Pensar melhor, produzir mais rápido
                </p>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Insight */}
          {scene >= 4 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Ajudar pessoas de forma concreta
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-gray-400' : 'bg-gray-800'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-gray-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-400/30"
      >
        <span className="text-gray-300 text-xs font-medium">Equilíbrio</span>
      </motion.div>
    </div>
  );
};
