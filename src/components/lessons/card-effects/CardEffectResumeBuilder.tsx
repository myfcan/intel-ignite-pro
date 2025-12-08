import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, Wand2, Sparkles, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectResumeBuilderProps {
  isActive?: boolean;
}

export const CardEffectResumeBuilder = ({ isActive = false }: CardEffectResumeBuilderProps) => {
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setProgress(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    
    // Progress animation
    timersRef.current.push(setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        setProgress(Math.min(p, 100));
        if (p >= 100) clearInterval(interval);
      }, 80);
    }, 3000));

    timersRef.current.push(setTimeout(() => setScene(3), 6000));
    timersRef.current.push(setTimeout(() => setScene(4), 9000));
    timersRef.current.push(setTimeout(() => setScene(5), 12000));

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
      setProgress(0);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950">
      {/* Background effect */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"
            style={{
              left: `${20 + (i % 3) * 30}%`,
              top: `${15 + Math.floor(i / 3) * 40}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Character */}
          {scene >= 1 && (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-blue-300 font-semibold">Rapaz do Currículo</p>
              <p className="text-blue-400/60 text-xs">Sempre ajudou amigos</p>
            </motion.div>
          )}

          {/* Scene 2: Process */}
          {scene >= 2 && (
            <motion.div
              key="process"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              {/* Input */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <p className="text-gray-400 text-xs mb-2">Dados do Cliente</p>
                <div className="space-y-1.5">
                  <div className="h-2 w-24 bg-gray-700 rounded" />
                  <div className="h-2 w-20 bg-gray-700 rounded" />
                  <div className="h-2 w-28 bg-gray-700 rounded" />
                </div>
              </div>

              {/* AI Processing */}
              <motion.div
                animate={{ rotate: progress < 100 ? 360 : 0 }}
                transition={{ repeat: progress < 100 ? Infinity : 0, duration: 1 }}
              >
                <div className="relative">
                  <Wand2 className="w-8 h-8 text-indigo-400" />
                  {progress > 0 && progress < 100 && (
                    <motion.div
                      className="absolute inset-0 bg-indigo-500/30 rounded-full blur-lg"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Output */}
              <motion.div
                animate={{ 
                  opacity: progress >= 100 ? 1 : 0.5,
                  scale: progress >= 100 ? 1 : 0.95
                }}
                className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-4 rounded-xl border border-blue-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <p className="text-blue-300 text-xs font-medium">Currículo Pro</p>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-28 bg-blue-600/50 rounded" />
                  <div className="h-2 w-24 bg-blue-600/40 rounded" />
                  <div className="h-2 w-32 bg-blue-600/30 rounded" />
                </div>
                {progress >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 mt-2 text-green-400"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs">Pronto!</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Scene 3: Time */}
          {scene >= 3 && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 flex items-center gap-3 bg-green-900/30 px-5 py-3 rounded-xl border border-green-500/30"
            >
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Em poucos minutos</span>
              <Sparkles className="w-4 h-4 text-green-400" />
            </motion.div>
          )}

          {/* Scene 4: Comparison */}
          {scene >= 4 && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-20 text-center"
            >
              <p className="text-blue-300 text-sm">
                Melhor que modelo pronto de internet
              </p>
            </motion.div>
          )}

          {/* Scene 5: Key insight */}
          {scene >= 5 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-blue-400/70 text-sm flex items-center gap-2">
                O que já sabia + I.A. = Serviço melhor
                <ArrowRight className="w-4 h-4" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-blue-400' : 'bg-blue-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/30"
      >
        <span className="text-blue-300 text-xs font-medium">Exemplo 1</span>
      </motion.div>
    </div>
  );
};
