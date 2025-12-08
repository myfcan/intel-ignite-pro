import { motion, AnimatePresence } from "framer-motion";
import { Store, Sparkles, Image, Star, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectBakeryTransformationProps {
  isActive?: boolean;
}

export const CardEffectBakeryTransformation = ({ isActive = false }: CardEffectBakeryTransformationProps) => {
  const [scene, setScene] = useState(0);
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

    const delays = [0, 2500, 5000, 7500, 10000, 13000];
    delays.forEach((delay, index) => {
      if (index < 5) {
        timersRef.current.push(setTimeout(() => setScene(index + 1), delay));
      }
    });

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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-900 to-yellow-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Animated glow */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 60%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
        <AnimatePresence mode="wait">
          {/* Scene 1: Padaria antiga */}
          {scene >= 1 && (
            <motion.div
              key="bakery-old"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scene === 1 ? 1 : 0.3, y: 0, scale: scene === 1 ? 1 : 0.8 }}
              className="absolute top-20"
            >
              <div className="flex items-center gap-3 bg-amber-900/40 px-6 py-3 rounded-xl border border-amber-700/30">
                <Store className="w-8 h-8 text-amber-400" />
                <div className="text-left">
                  <p className="text-amber-200 font-semibold">Padaria do Zé</p>
                  <p className="text-amber-400/70 text-sm">Mesma de sempre...</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 2: Cartaz antigo vs novo */}
          {scene >= 2 && (
            <motion.div
              key="poster-compare"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-6 items-center"
            >
              {/* Cartaz antigo */}
              <motion.div
                animate={{ opacity: scene === 2 ? 1 : 0.4 }}
                className="w-32 h-40 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center p-3"
              >
                <div className="w-full h-4 bg-gray-600 rounded mb-2" />
                <div className="w-3/4 h-3 bg-gray-600 rounded mb-2" />
                <div className="w-full h-16 bg-gray-600/50 rounded" />
                <p className="text-gray-500 text-xs mt-2">Antes</p>
              </motion.div>

              {/* Seta */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, 5, 0] }}
                transition={{ x: { repeat: Infinity, duration: 1 } }}
              >
                <Zap className="w-8 h-8 text-yellow-400" />
              </motion.div>

              {/* Cartaz novo */}
              <motion.div
                animate={{ 
                  opacity: 1,
                  boxShadow: scene >= 3 ? '0 0 30px rgba(251, 191, 36, 0.4)' : 'none'
                }}
                className="w-32 h-40 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="w-full h-4 bg-white/90 rounded mb-2" />
                <div className="w-3/4 h-3 bg-white/70 rounded mb-2" />
                <div className="w-full h-16 bg-white/20 rounded flex items-center justify-center">
                  <Image className="w-8 h-8 text-white/80" />
                </div>
                <p className="text-white text-xs mt-2 font-medium">Depois</p>
                {scene >= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                  >
                    <Star className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Scene 3: Revelação */}
          {scene >= 3 && (
            <motion.div
              key="revelation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32"
            >
              <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-4 rounded-xl border border-purple-400/30 backdrop-blur-sm">
                <p className="text-white font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Feito com I.A. em minutos!
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  Por uma jovem de 14 anos
                </p>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Conclusão */}
          {scene >= 4 && (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-amber-300 font-semibold">
                O mundo não esperou ninguém estar pronto
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-amber-400' : 'bg-amber-800'}`}
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
        <span className="text-amber-300 text-xs font-medium">Transformação</span>
      </motion.div>
    </div>
  );
};
