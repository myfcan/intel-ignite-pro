import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, BookOpen, Wrench, Rocket, ArrowRight, Sparkles, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectPracticePreviewProps {
  isActive?: boolean;
}

export const CardEffectPracticePreview = ({ isActive = false }: CardEffectPracticePreviewProps) => {
  const [scene, setScene] = useState(0);
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const previewItems = [
    { icon: BookOpen, label: "Prompts" },
    { icon: Wrench, label: "Estruturas" },
    { icon: Play, label: "Exercícios" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveItem(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    timersRef.current.push(setTimeout(() => setActiveItem(0), 4000));
    timersRef.current.push(setTimeout(() => setActiveItem(1), 5500));
    timersRef.current.push(setTimeout(() => setActiveItem(2), 7000));
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
      setActiveItem(null);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-sky-950 to-blue-950">
      {/* Forward-moving particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${5 + (i * 6)}%`,
              top: `${20 + (i % 5) * 15}%`,
            }}
            animate={{
              x: [0, 100, 200],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + (i % 2),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Light bulb */}
          {scene >= 1 && (
            <motion.div
              key="light"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: ['0 0 20px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(34, 211, 238, 0.5)', '0 0 20px rgba(34, 211, 238, 0.3)']
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-full flex items-center justify-center"
                >
                  <Lightbulb className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <p className="text-cyan-300 text-lg font-bold text-center mt-3">
                Objetivo Desta Aula
              </p>
              <p className="text-cyan-400/70 text-xs text-center">Acender uma luz</p>
            </motion.div>
          )}

          {/* Scene 2: What's coming */}
          {scene >= 2 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-cyan-300 text-sm mb-4">Nas próximas aulas:</p>
              
              <div className="flex gap-4">
                {previewItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = activeItem !== null && activeItem >= i;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: activeItem === i ? 1.1 : 1
                      }}
                      transition={{ delay: i * 0.15 }}
                      className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-cyan-900/40 border-cyan-500/40' 
                          : 'bg-gray-900/30 border-gray-700/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isActive ? 'bg-cyan-700/50' : 'bg-gray-800'
                      }`}>
                        <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                      </div>
                      <p className={`text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-gray-500'}`}>
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Scene 3: Approach */}
          {scene >= 3 && (
            <motion.div
              key="approach"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-cyan-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <p className="text-cyan-300 font-medium">
                  Começando pequeno, mas inteligente
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
              <p className="text-cyan-400/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Existem oportunidades reais ao seu redor
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
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-cyan-400' : 'bg-cyan-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-cyan-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cyan-400/30"
      >
        <span className="text-cyan-300 text-xs font-medium">Preview</span>
      </motion.div>
    </div>
  );
};
