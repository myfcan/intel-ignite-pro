import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Eye, Shield, Brain } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectHypeDetector = ({ isActive = true, duration = 28 }: CardEffectProps) => {
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

  const hypeItems = [
    { text: "IA vai substituir todos!", icon: AlertCircle, isHype: true },
    { text: "Assistente para tarefas", icon: CheckCircle, isHype: false },
    { text: "IA é magia!", icon: AlertCircle, isHype: true },
    { text: "Ferramenta que aprende", icon: CheckCircle, isHype: false },
  ];

  const insightCards = [
    { icon: Eye, text: "Observe com critério", color: "text-violet-400" },
    { icon: Shield, text: "Proteja-se do hype", color: "text-emerald-400" },
    { icon: Brain, text: "Pense com clareza", color: "text-amber-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 p-4 sm:p-6 md:p-8 flex flex-col">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-violet-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-4">
          <Target className="w-4 h-4 text-violet-400" />
          <span className="text-violet-300 text-sm font-medium">Detector de Hype</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Separando <span className="text-violet-400">Realidade</span> do Hype
        </h2>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Scene 0-4: Scanner Area with items */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <div className="grid grid-cols-2 gap-4 h-full">
                {hypeItems.map((item, idx) => {
                  const Icon = item.icon;
                  const shouldShow = scene >= idx;
                  const isScanning = scene === idx;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: shouldShow ? 1 : 0.3,
                        scale: shouldShow ? 1 : 0.8,
                        borderColor: isScanning ? (item.isHype ? '#ef4444' : '#22c55e') : 'transparent'
                      }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        item.isHype 
                          ? 'bg-red-500/10' 
                          : 'bg-green-500/10'
                      }`}
                    >
                      {isScanning && (
                        <motion.div 
                          className="absolute inset-0 rounded-xl"
                          animate={{ 
                            boxShadow: [
                              `0 0 0px ${item.isHype ? '#ef4444' : '#22c55e'}40`,
                              `0 0 30px ${item.isHype ? '#ef4444' : '#22c55e'}60`,
                              `0 0 0px ${item.isHype ? '#ef4444' : '#22c55e'}40`
                            ]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 ${item.isHype ? 'text-red-400' : 'text-green-400'}`} />
                        <div>
                          <p className="text-white font-medium text-sm">{item.text}</p>
                          <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                            item.isHype 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {item.isHype ? 'HYPE' : 'REAL'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Scanning Line */}
              {scene < 4 && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          )}

          {/* Scene 5: Analysis Complete */}
          {scene === 5 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-violet-500/20 border-2 border-violet-500 flex items-center justify-center mb-6"
              >
                <Zap className="w-12 h-12 text-violet-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Análise Completa!</h3>
              <p className="text-violet-300 text-center">Agora você sabe diferenciar hype de realidade</p>
            </motion.div>
          )}

          {/* Scene 6: Insight Cards */}
          {scene === 6 && (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Suas Ferramentas:</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {insightCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${card.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{card.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Scene 7: Stats */}
          {scene === 7 && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="grid grid-cols-2 gap-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-4xl font-bold text-red-400">50%</p>
                  <p className="text-red-300 text-sm mt-2">Era Hype</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30"
                >
                  <p className="text-4xl font-bold text-green-400">50%</p>
                  <p className="text-green-300 text-sm mt-2">Era Real</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Scene 8: Final Message */}
          {scene >= 8 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.6)', '0 0 0px rgba(139, 92, 246, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-center max-w-md"
              >
                <Target className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Detector Ativado!</h3>
                <p className="text-violet-300">
                  Você agora tem a habilidade de identificar o que realmente importa na revolução da I.A.
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-violet-400' : 'bg-violet-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
