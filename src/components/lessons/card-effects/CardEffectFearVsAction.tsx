import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Rocket, Brain, ArrowRight, X, Check, Lightbulb } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectFearVsActionProps {
  isActive?: boolean;
}

export const CardEffectFearVsAction = ({ isActive = false }: CardEffectFearVsActionProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const fears = [
    "Isso é complicado demais",
    "Vai acabar com os empregos",
    "Prefiro fazer do jeito antigo"
  ];

  const actions = [
    "Testei uma coisa simples",
    "Vi que funciona",
    "Agora ajudo outras pessoas"
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 3500));
    timersRef.current.push(setTimeout(() => setScene(3), 7000));
    timersRef.current.push(setTimeout(() => setScene(4), 10500));
    timersRef.current.push(setTimeout(() => setScene(5), 13000));

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
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      {/* Split background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-gradient-to-br from-red-950 via-red-900 to-orange-950" />
        <div className="w-1/2 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950" />
      </div>

      {/* Center divider */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-x-1/2"
      />

      <div className="relative z-10 flex h-full">
        {/* Left side: Fear */}
        <div className="w-1/2 flex flex-col items-center justify-center p-4">
          <AnimatePresence>
            {scene >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-red-300 font-bold text-lg mb-4">MEDO</h4>
                
                <div className="space-y-2">
                  {fears.map((fear, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.3 }}
                      className="flex items-center gap-2 bg-red-900/30 px-3 py-2 rounded-lg"
                    >
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-200 text-xs">{fear}</span>
                    </motion.div>
                  ))}
                </div>

                {scene >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-red-400 text-sm"
                  >
                    Resultado: <span className="font-bold">Paralisia</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side: Action */}
        <div className="w-1/2 flex flex-col items-center justify-center p-4">
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-emerald-300 font-bold text-lg mb-4">AÇÃO</h4>
                
                <div className="space-y-2">
                  {actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.3 }}
                      className="flex items-center gap-2 bg-emerald-900/30 px-3 py-2 rounded-lg"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-emerald-200 text-xs">{action}</span>
                    </motion.div>
                  ))}
                </div>

                {scene >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-emerald-400 text-sm"
                  >
                    Resultado: <span className="font-bold">Crescimento</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center insight */}
      <AnimatePresence>
        {scene >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">A diferença está na primeira ação</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-white' : 'bg-white/30'}`}
            animate={{ scale: scene === s ? 1.3 : 1 }}
          />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20"
      >
        <span className="text-white text-xs font-medium">VS</span>
      </motion.div>
    </div>
  );
};
