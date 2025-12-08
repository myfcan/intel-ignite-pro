import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, ThumbsUp, Film, Music, BookOpen, ShoppingBag, Star, Brain, Zap, Target } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectRecommendationEngine = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 9;
  const sceneTime = (duration * 1000) / totalScenes;

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);

    for (let i = 1; i < totalScenes; i++) {
      const timer = setTimeout(() => {
        setScene(i);
        if (i === totalScenes - 1) {
          loopCountRef.current += 1;
          if (loopCountRef.current < maxLoops) {
            const restartTimer = setTimeout(() => startAnimation(), sceneTime);
            timersRef.current.push(restartTimer);
          }
        }
      }, i * sceneTime);
      timersRef.current.push(timer);
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

  const recommendations = [
    { icon: Film, name: "Filme", match: "95%", color: "#E50914" },
    { icon: Music, name: "Música", match: "88%", color: "#1DB954" },
    { icon: BookOpen, name: "Livro", match: "92%", color: "#FF9F00" },
    { icon: ShoppingBag, name: "Produto", match: "87%", color: "#FF6B00" },
  ];

  const steps = [
    { icon: Brain, text: "Coleta dados", color: "text-pink-400" },
    { icon: Target, text: "Identifica padrões", color: "text-fuchsia-400" },
    { icon: Sparkles, text: "Gera recomendação", color: "text-purple-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 p-4 sm:p-6 md:p-8 flex flex-col">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-pink-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30 mb-4">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-pink-300 text-sm font-medium">Motor de Recomendação</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Como a I.A. <span className="text-pink-400">Recomenda</span> para Você
        </h2>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {/* Scene 0-1: User Profile */}
          {scene >= 0 && scene <= 1 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-white text-2xl">👤</span>
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Seu Perfil</p>
                  <p className="text-pink-300 text-sm">Histórico + Preferências</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 2: Process Steps */}
          {scene === 2 && (
            <motion.div
              key="steps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-lg font-bold text-white mb-6">Como funciona:</h3>
              <div className="flex items-center gap-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.3 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      <p className="text-white text-xs text-center">{step.text}</p>
                      {idx < steps.length - 1 && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: idx * 0.3 + 0.2 }}
                          className="absolute h-0.5 w-8 bg-pink-500/50 left-full top-1/2 -translate-y-1/2"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Scene 3-5: Recommendations Grid */}
          {scene >= 3 && scene <= 5 && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto"
              >
                {recommendations.map((item, idx) => {
                  const Icon = item.icon;
                  const shouldShow = scene >= Math.floor(idx / 2) + 3;
                  const isActiveItem = scene === Math.floor(idx / 2) + 3;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: shouldShow ? 1 : 0.3,
                        scale: shouldShow ? 1 : 0.8
                      }}
                      transition={{ delay: (idx % 2) * 0.1 }}
                      className="relative p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <motion.div
                        animate={isActiveItem ? { 
                          boxShadow: [`0 0 0px ${item.color}`, `0 0 20px ${item.color}`, `0 0 0px ${item.color}`]
                        } : {}}
                        transition={{ duration: 0.5, repeat: isActiveItem ? Infinity : 0 }}
                        className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </motion.div>
                      <p className="text-white text-sm text-center font-medium">{item.name}</p>
                      
                      {shouldShow && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-1 mt-2"
                        >
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">{item.match}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Scene 6: Accuracy Stats */}
          {scene === 6 && (
            <motion.div
              key="accuracy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-32 h-32 rounded-full bg-pink-500/20 border-4 border-pink-500 flex items-center justify-center mb-6"
              >
                <div className="text-center">
                  <p className="text-4xl font-bold text-pink-400">90%</p>
                  <p className="text-pink-300 text-xs">Precisão</p>
                </div>
              </motion.div>
              <p className="text-white text-center">Quanto mais você usa, mais preciso fica!</p>
            </motion.div>
          )}

          {/* Scene 7: Learning Cycle */}
          {scene === 7 && (
            <motion.div
              key="cycle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="relative w-48 h-48"
              >
                {['Uso', 'Dados', 'Análise', 'Melhoria'].map((label, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center"
                    style={{
                      left: `${50 + 40 * Math.cos((idx * Math.PI * 2) / 4 - Math.PI / 2)}%`,
                      top: `${50 + 40 * Math.sin((idx * Math.PI * 2) / 4 - Math.PI / 2)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-pink-300 text-xs font-medium">{label}</span>
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-white mt-4 text-center">Ciclo de aprendizado contínuo</p>
            </motion.div>
          )}

          {/* Scene 8: Final Insight */}
          {scene >= 8 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(236, 72, 153, 0.3)', '0 0 40px rgba(236, 72, 153, 0.6)', '0 0 0px rgba(236, 72, 153, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-center max-w-md"
              >
                <ThumbsUp className="w-10 h-10 text-pink-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Personalização em tempo real!</h3>
                <p className="text-pink-300 text-sm">
                  A I.A. aprende suas preferências e melhora a cada interação
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-pink-400' : 'bg-pink-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
