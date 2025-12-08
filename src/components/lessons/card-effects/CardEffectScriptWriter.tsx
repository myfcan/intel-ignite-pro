import { motion, AnimatePresence } from "framer-motion";
import { Video, FileText, User, Sparkles, Play, ListOrdered, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectScriptWriterProps {
  isActive?: boolean;
}

export const CardEffectScriptWriter = ({ isActive = false }: CardEffectScriptWriterProps) => {
  const [scene, setScene] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const scriptSteps = [
    { icon: "🎬", label: "Abertura" },
    { icon: "💡", label: "Exemplo" },
    { icon: "📝", label: "Desenvolvimento" },
    { icon: "✨", label: "Fechamento" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveStep(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    
    // Script steps animation
    timersRef.current.push(setTimeout(() => setActiveStep(1), 4000));
    timersRef.current.push(setTimeout(() => setActiveStep(2), 5500));
    timersRef.current.push(setTimeout(() => setActiveStep(3), 7000));
    timersRef.current.push(setTimeout(() => setActiveStep(4), 8500));
    
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
      setActiveStep(0);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-red-950 to-orange-950">
      {/* Video frame background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-64 h-40 border-4 border-white rounded-lg" />
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
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-rose-300 font-semibold">Roteirista de Apoio</p>
              <p className="text-rose-400/60 text-xs">Assistiu muitos vídeos</p>
            </motion.div>
          )}

          {/* Scene 2: Input + AI + Output */}
          {scene >= 2 && (
            <motion.div
              key="process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Input description */}
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300 text-xs font-medium">Descreve para I.A.:</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>📌 Tema do vídeo</p>
                  <p>👥 Público-alvo</p>
                  <p>🎯 Objetivo</p>
                </div>
              </div>

              {/* Script output */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-rose-900/50 to-orange-900/50 p-4 rounded-xl border border-rose-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ListOrdered className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300 text-sm font-medium">Esqueleto Fácil de Gravar</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {scriptSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.3 }}
                      animate={{ 
                        opacity: activeStep > i ? 1 : 0.3,
                        scale: activeStep === i + 1 ? 1.05 : 1
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        activeStep > i ? 'bg-rose-800/40 border border-rose-500/30' : 'bg-gray-800/30'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span className={`text-xs ${activeStep > i ? 'text-rose-200' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 3: Result */}
          {scene >= 3 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 flex items-center gap-3 bg-green-900/30 px-5 py-3 rounded-xl border border-green-500/30"
            >
              <Play className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Pronto para gravar!</span>
              <Sparkles className="w-4 h-4 text-green-400" />
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
              <p className="text-rose-400/70 text-sm text-center">
                I.A. como "roteirista de apoio"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-rose-400' : 'bg-rose-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-rose-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-rose-400/30"
      >
        <span className="text-rose-300 text-xs font-medium">Exemplo 3</span>
      </motion.div>
    </div>
  );
};
