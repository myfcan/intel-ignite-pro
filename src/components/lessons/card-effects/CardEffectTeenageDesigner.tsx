import { motion, AnimatePresence } from "framer-motion";
import { User, Wand2, Palette, CheckCircle, Sparkles, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectTeenageDesignerProps {
  isActive?: boolean;
}

export const CardEffectTeenageDesigner = ({ isActive = false }: CardEffectTeenageDesignerProps) => {
  const [scene, setScene] = useState(0);
  const [typingText, setTypingText] = useState("");
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const fullText = "Quero um cartaz bonito para a padaria do meu pai...";

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setTypingText("");

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2000));
    
    // Typing effect
    timersRef.current.push(setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypingText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
      timersRef.current.push(setTimeout(() => clearInterval(typeInterval), 3000));
    }, 2500));

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
      setTypingText("");
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-950 via-purple-950 to-indigo-950">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-400/30 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
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
          {/* Scene 1: Teenager avatar */}
          {scene >= 1 && (
            <motion.div
              key="teen"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-16"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full px-2 py-0.5"
                >
                  <span className="text-xs font-bold text-yellow-900">14</span>
                </motion.div>
              </div>
              <p className="text-pink-300 text-sm mt-2 text-center">Filha do Zé</p>
            </motion.div>
          )}

          {/* Scene 2: Typing prompt */}
          {scene >= 2 && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 max-w-sm border border-purple-500/30"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-purple-300 text-sm font-medium mb-1">Pedido para I.A.:</p>
                  <p className="text-white text-sm">
                    {typingText}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-0.5 h-4 bg-purple-400 ml-1 align-middle"
                    />
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 3: AI Processing */}
          {scene >= 3 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="relative"
              >
                <Wand2 className="w-12 h-12 text-purple-400" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Scene 4: Result */}
          {scene >= 4 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-32"
            >
              <div className="relative">
                <div className="w-40 h-52 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-lg shadow-2xl flex flex-col items-center justify-center p-4">
                  <Palette className="w-10 h-10 text-white mb-2" />
                  <div className="w-full h-3 bg-white/90 rounded mb-2" />
                  <div className="w-3/4 h-2 bg-white/70 rounded mb-3" />
                  <div className="w-full h-20 bg-white/20 rounded" />
                  <Sparkles className="w-6 h-6 text-yellow-200 absolute -top-2 -right-2" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 rounded-full p-2"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Scene 5: Conclusion */}
          {scene >= 5 && (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-8"
            >
              <p className="text-pink-300 font-semibold text-center">
                "Designer oficial" do bairro
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-pink-400' : 'bg-pink-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-pink-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-pink-400/30"
      >
        <span className="text-pink-300 text-xs font-medium">Criadora</span>
      </motion.div>
    </div>
  );
};
