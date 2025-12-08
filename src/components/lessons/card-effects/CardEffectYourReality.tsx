import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Lightbulb, HelpCircle, ArrowRight, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectYourRealityProps {
  isActive?: boolean;
}

export const CardEffectYourReality = ({ isActive = false }: CardEffectYourRealityProps) => {
  const [scene, setScene] = useState(0);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const helpAreas = [
    { icon: "📊", label: "Organizar algo" },
    { icon: "💬", label: "Explicar alguma coisa" },
    { icon: "✍️", label: "Escrever ou revisar" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setPulseIndex(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    
    // Pulse through items
    timersRef.current.push(setTimeout(() => setPulseIndex(0), 4000));
    timersRef.current.push(setTimeout(() => setPulseIndex(1), 5500));
    timersRef.current.push(setTimeout(() => setPulseIndex(2), 7000));
    
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
      setPulseIndex(null);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-sky-950 via-blue-950 to-indigo-950">
      {/* Radar effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-64 h-64 rounded-full border border-sky-500/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full border border-sky-500/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Title */}
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 text-center"
            >
              <div className="w-14 h-14 bg-sky-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-sky-400" />
              </div>
              <h3 className="text-sky-300 text-xl font-bold">Sua Vez de Olhar</h3>
              <p className="text-sky-400/70 text-sm mt-1">Para o seu mundo</p>
            </motion.div>
          )}

          {/* Scene 2: Help areas */}
          {scene >= 2 && (
            <motion.div
              key="areas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <p className="text-sky-300 text-sm text-center mb-2">
                Pessoas próximas pedem ajuda para:
              </p>
              
              {helpAreas.map((area, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: pulseIndex === i ? 1.05 : 1
                  }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center gap-4 px-5 py-3 rounded-xl border transition-all ${
                    pulseIndex !== null && pulseIndex >= i
                      ? 'bg-sky-900/40 border-sky-500/40'
                      : 'bg-gray-900/30 border-gray-700/30'
                  }`}
                >
                  <span className="text-2xl">{area.icon}</span>
                  <span className={`font-medium ${
                    pulseIndex !== null && pulseIndex >= i ? 'text-sky-300' : 'text-gray-400'
                  }`}>
                    {area.label}
                  </span>
                  {pulseIndex !== null && pulseIndex >= i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <HelpCircle className="w-5 h-5 text-sky-400" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Scene 3: Question */}
          {scene >= 3 && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-sky-900/40 backdrop-blur-sm px-6 py-4 rounded-xl border border-sky-500/30"
            >
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-sky-400" />
                <p className="text-sky-300 font-medium">
                  Como a I.A. pode facilitar?
                </p>
              </div>
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
              <p className="text-sky-400/70 text-sm flex items-center gap-2">
                Escolha uma situação específica
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
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-sky-400' : 'bg-sky-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-sky-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-sky-400/30"
      >
        <span className="text-sky-300 text-xs font-medium">Reflexão</span>
      </motion.div>
    </div>
  );
};
