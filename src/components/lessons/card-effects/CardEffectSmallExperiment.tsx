import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, CheckCircle, FileText, Lightbulb, Sparkles, Target, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectSmallExperimentProps {
  isActive?: boolean;
}

export const CardEffectSmallExperiment = ({ isActive = false }: CardEffectSmallExperimentProps) => {
  const [scene, setScene] = useState(0);
  const [activeResult, setActiveResult] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const results = [
    { icon: FileText, label: "Um texto melhor" },
    { icon: Lightbulb, label: "Uma explicação mais clara" },
    { icon: Target, label: "Um material mais organizado" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveResult(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    timersRef.current.push(setTimeout(() => setActiveResult(0), 4000));
    timersRef.current.push(setTimeout(() => setActiveResult(1), 5500));
    timersRef.current.push(setTimeout(() => setActiveResult(2), 7000));
    timersRef.current.push(setTimeout(() => setScene(3), 9500));
    timersRef.current.push(setTimeout(() => setScene(4), 12500));

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
      setActiveResult(null);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-lime-950 via-green-950 to-emerald-950">
      {/* Bubbling effect */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-lime-400/20 rounded-full"
            style={{
              left: `${20 + (i * 7)}%`,
              bottom: '10%',
            }}
            animate={{
              y: [0, -200, -400],
              opacity: [0.5, 0.8, 0],
              scale: [1, 1.2, 0.5]
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Flask */}
          {scene >= 1 && (
            <motion.div
              key="flask"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-12"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-lime-600 to-green-700 rounded-full flex items-center justify-center">
                  <FlaskConical className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-lime-500/30 rounded-full blur-xl"
                />
              </div>
              <p className="text-lime-300 text-lg font-bold text-center mt-3">
                Pequeno Experimento
              </p>
              <p className="text-lime-400/70 text-xs text-center">Bem-feito</p>
            </motion.div>
          )}

          {/* Scene 2: Results */}
          {scene >= 2 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3 mt-8"
            >
              <p className="text-lime-300 text-sm text-center mb-2">
                Teste uma ajuda real:
              </p>
              
              {results.map((result, i) => {
                const Icon = result.icon;
                const isActive = activeResult !== null && activeResult >= i;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: activeResult === i ? 1.03 : 1
                    }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 px-5 py-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-lime-900/40 border-lime-500/40' 
                        : 'bg-gray-900/30 border-gray-700/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-lime-700/50' : 'bg-gray-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-lime-400' : 'text-gray-500'}`} />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-lime-300' : 'text-gray-400'}`}>
                      {result.label}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle className="w-5 h-5 text-lime-400" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Scene 3: Origin */}
          {scene >= 3 && (
            <motion.div
              key="origin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-lime-900/40 backdrop-blur-sm px-5 py-3 rounded-xl border border-lime-500/30"
            >
              <p className="text-lime-300 font-medium text-center">
                É assim que as oportunidades começam
              </p>
            </motion.div>
          )}

          {/* Scene 4: CTA */}
          {scene >= 4 && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-lime-400/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Com um pequeno experimento bem-feito
                <ArrowRight className="w-4 h-4" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-lime-400' : 'bg-lime-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-lime-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-lime-400/30"
      >
        <span className="text-lime-300 text-xs font-medium">Ação</span>
      </motion.div>
    </div>
  );
};
