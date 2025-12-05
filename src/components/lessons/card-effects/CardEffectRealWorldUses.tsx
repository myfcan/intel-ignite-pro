import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, ShoppingBag, Video, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectRealWorldUsesProps {
  isActive?: boolean;
}

export const CardEffectRealWorldUses = ({ isActive = false }: CardEffectRealWorldUsesProps) => {
  const [scene, setScene] = useState(0);
  const [activeUse, setActiveUse] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const uses = [
    { 
      icon: UtensilsCrossed, 
      label: "Cardápios", 
      detail: "Bonitos para restaurantes",
      color: "orange"
    },
    { 
      icon: ShoppingBag, 
      label: "Descrições", 
      detail: "De produtos para lojistas",
      color: "blue"
    },
    { 
      icon: Video, 
      label: "Roteiros", 
      detail: "Para vídeos de redes sociais",
      color: "pink"
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
    setActiveUse(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2000));
    timersRef.current.push(setTimeout(() => setActiveUse(0), 3000));
    timersRef.current.push(setTimeout(() => setActiveUse(1), 5000));
    timersRef.current.push(setTimeout(() => setActiveUse(2), 7000));
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
      setActiveUse(null);
    }
    return () => clearTimers();
  }, [isActive]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      orange: { bg: 'bg-orange-900/40', border: 'border-orange-500/40', text: 'text-orange-300', icon: 'text-orange-400' },
      blue: { bg: 'bg-blue-900/40', border: 'border-blue-500/40', text: 'text-blue-300', icon: 'text-blue-400' },
      pink: { bg: 'bg-pink-900/40', border: 'border-pink-500/40', text: 'text-pink-300', icon: 'text-pink-400' }
    };
    return colors[color];
  };

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-teal-950 to-emerald-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 3px 3px, currentColor 1.5px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Animated glow */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(20, 184, 166, 0.2) 0%, transparent 60%)'
        }}
      />

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
              <h3 className="text-teal-300 text-xl font-bold flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                O Que Dá Para Fazer
              </h3>
              <p className="text-teal-400/70 text-sm mt-1">Com I.A. no Mundo Real</p>
            </motion.div>
          )}

          {/* Scene 2: Use cases */}
          {scene >= 2 && (
            <motion.div
              key="uses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 w-full max-w-md"
            >
              {uses.map((use, i) => {
                const Icon = use.icon;
                const colors = getColorClasses(use.color);
                const isActive = activeUse !== null && activeUse >= i;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: activeUse === i ? 1.02 : 1
                    }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isActive ? `${colors.bg} ${colors.border}` : 'bg-gray-900/30 border-gray-700/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/10' : 'bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? colors.icon : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isActive ? colors.text : 'text-gray-400'}`}>
                        {use.label}
                      </p>
                      <p className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                        {use.detail}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle className={`w-6 h-6 ${colors.icon}`} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Scene 3: Summary */}
          {scene >= 3 && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-teal-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-teal-500/30"
            >
              <p className="text-teal-300 font-medium text-center">
                Pessoas comuns já estão fazendo isso
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
              <p className="text-teal-400/70 text-sm text-center flex items-center gap-2">
                Veja três exemplos rápidos
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
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-teal-400' : 'bg-teal-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-teal-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-teal-400/30"
      >
        <span className="text-teal-300 text-xs font-medium">Aplicações</span>
      </motion.div>
    </div>
  );
};
