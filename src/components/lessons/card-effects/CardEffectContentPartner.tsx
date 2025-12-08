import { motion, AnimatePresence } from "framer-motion";
import { Users, Bot, Handshake, MessageSquare, Sparkles, Heart, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectContentPartnerProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectContentPartner = ({ isActive = false, duration }: CardEffectContentPartnerProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const baseSceneDuration = 3000;
  const totalScenes = 11;
  const baseTotalDuration = baseSceneDuration * totalScenes;
  const scaleFactor = duration ? (duration * 1000) / baseTotalDuration : 1;
  const sceneDuration = baseSceneDuration * scaleFactor;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);

    for (let i = 1; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => setScene(i), sceneDuration * i));
    }

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), sceneDuration * (totalScenes + 1)));
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
  }, [isActive, duration]);

  const partnerBenefits = [
    { icon: MessageSquare, text: "Brainstorm infinito", color: "text-blue-400" },
    { icon: Zap, text: "Respostas instantâneas", color: "text-yellow-400" },
    { icon: Heart, text: "Sempre disponível", color: "text-pink-400" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950" />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center"
                >
                  <Users className="w-8 h-8 text-blue-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Handshake className="w-8 h-8 text-purple-400" />
                </motion.div>
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-16 h-16 bg-purple-800/50 rounded-full flex items-center justify-center"
                >
                  <Bot className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Seu Parceiro de Conteúdo
              </motion.h3>

              <div className="space-y-3 w-full">
                {partnerBenefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20"
                  >
                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    <span className="text-white text-sm sm:text-base">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <span className="text-blue-300 text-sm">24/7, sem julgamento, sem pressa</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Bot className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-400">Sempre pronta</h3>
              <p className="text-blue-300 mt-2">para te ajudar</p>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="flex flex-col gap-3 mb-6">
                {["Preciso de ideias para post", "Revisa esse texto?", "Me ajuda com legenda"].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className={`${i % 2 === 0 ? 'self-start' : 'self-end'} bg-white/10 px-4 py-2 rounded-2xl max-w-xs`}
                  >
                    <span className="text-white text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-indigo-400">Conversa natural</h3>
            </motion.div>
          )}

          {scene === 7 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 20px rgba(236,72,153,0.3)", "0 0 60px rgba(236,72,153,0.6)", "0 0 20px rgba(236,72,153,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-400">Sem julgamento</h3>
              <p className="text-pink-300 mt-2">Pergunte o que quiser</p>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                💬
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Brainstorm ilimitado</h3>
              <p className="text-purple-300 mt-2">Quantas ideias você precisar</p>
            </motion.div>
          )}

          {scene === 9 && (
            <motion.div
              key="scene9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-6 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-4xl"
                >
                  🌙
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl text-white"
                >
                  ou
                </motion.span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-4xl"
                >
                  ☀️
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-indigo-400">3h da manhã ou meio-dia</h3>
              <p className="text-indigo-300 mt-2">Disponível quando você precisa</p>
            </motion.div>
          )}

          {scene >= 10 && (
            <motion.div
              key="scene10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 30px rgba(99,102,241,0.3)", "0 0 60px rgba(99,102,241,0.5)", "0 0 30px rgba(99,102,241,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400">Parceria que funciona</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="relative z-10 flex justify-center gap-2 mt-4 pb-6">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${scene >= i + 1 ? 'bg-white' : 'bg-white/30'}`}
            animate={{ scale: scene === i + 1 ? 1.3 : 1 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-indigo-700/50"
      >
        <span className="text-indigo-300 text-xs font-medium">Parceria</span>
      </motion.div>
    </div>
  );
};
