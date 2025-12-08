import { motion, AnimatePresence } from "framer-motion";
import { Users, User, Briefcase, GraduationCap, Calculator, Sparkles, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectHelpNetworkProps {
  isActive?: boolean;
}

export const CardEffectHelpNetwork = ({ isActive = false }: CardEffectHelpNetworkProps) => {
  const [scene, setScene] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const networkNodes = [
    { icon: Calculator, label: "Amigo perdido nas contas", position: "top-24 left-1/4" },
    { icon: Briefcase, label: "Parente com negócio", position: "top-32 right-1/4" },
    { icon: GraduationCap, label: "Alguém organizando estudos", position: "bottom-40 left-1/3" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveNode(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    timersRef.current.push(setTimeout(() => setActiveNode(0), 3500));
    timersRef.current.push(setTimeout(() => setActiveNode(1), 5500));
    timersRef.current.push(setTimeout(() => setActiveNode(2), 7500));
    timersRef.current.push(setTimeout(() => setScene(3), 10000));
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
      setActiveNode(null);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950">
      {/* Connection lines background */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {scene >= 2 && (
          <>
            <motion.line
              x1="50%" y1="50%" x2="25%" y2="20%"
              stroke="url(#lineGradient)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.line
              x1="50%" y1="50%" x2="75%" y2="25%"
              stroke="url(#lineGradient)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <motion.line
              x1="50%" y1="50%" x2="33%" y2="75%"
              stroke="url(#lineGradient)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </>
        )}
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Center YOU */}
          {scene >= 1 && (
            <motion.div
              key="center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <User className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-2 rounded-full border-2 border-amber-400/30"
              />
              <p className="text-amber-300 text-sm font-medium text-center mt-2">VOCÊ</p>
            </motion.div>
          )}

          {/* Scene 2: Network nodes */}
          {scene >= 2 && networkNodes.map((node, i) => {
            const Icon = node.icon;
            const isActive = activeNode !== null && activeNode >= i;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeNode === i ? 1.1 : 1
                }}
                transition={{ delay: i * 0.3 }}
                className={`absolute ${node.position}`}
              >
                <div className={`flex flex-col items-center ${
                  isActive ? '' : 'opacity-50'
                }`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-lg shadow-amber-500/30' 
                      : 'bg-gray-800'
                  }`}>
                    <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <p className={`text-xs text-center mt-2 max-w-24 ${
                    isActive ? 'text-amber-300' : 'text-gray-500'
                  }`}>
                    {node.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <Heart className="w-4 h-4 text-red-400" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Scene 3: Insight */}
          {scene >= 3 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-24 bg-amber-900/40 backdrop-blur-sm px-5 py-3 rounded-xl border border-amber-500/30"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 font-medium">
                  Oportunidades ao seu redor
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
              <p className="text-amber-400/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quem você pode ajudar hoje?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-amber-400' : 'bg-amber-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400/30"
      >
        <span className="text-amber-300 text-xs font-medium">Rede</span>
      </motion.div>
    </div>
  );
};
