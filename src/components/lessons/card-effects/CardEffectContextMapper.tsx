import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Map, MapPin, Navigation, Compass, Route, Layers, Target, Eye, CheckCircle, Zap, Globe } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectContextMapper = ({ isActive = true, duration = 33 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 11;
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

  const contexts = [
    { icon: Globe, text: "Seu mercado/indústria", color: "text-blue-400" },
    { icon: Target, text: "Seu objetivo específico", color: "text-emerald-400" },
    { icon: Layers, text: "Seus recursos disponíveis", color: "text-violet-400" },
  ];

  const mapElements = [
    { icon: MapPin, text: "Ponto A", color: "text-red-400" },
    { icon: Route, text: "Caminho", color: "text-amber-400" },
    { icon: Navigation, text: "Destino", color: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
          <Map className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Mapeador de Contexto</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          <span className="text-blue-400">Mapeie</span> Seu Contexto
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Context Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {contexts.map((context, idx) => {
                const Icon = context.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : -30,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${context.color}`} />
                    </motion.div>
                    <p className="text-white font-medium">{context.text}</p>
                    {scene >= idx + 1 && (
                      <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                    )}
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-blue-300 text-lg font-medium">Mapa construído!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects (Scenes 5-10) */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="relative w-48 h-48">
                {/* Map Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
                  {[...Array(9)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-blue-500/20 rounded"
                    />
                  ))}
                </div>
                {/* Animated Path */}
                <motion.div
                  className="absolute top-4 left-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <MapPin className="w-8 h-8 text-red-400" />
                </motion.div>
                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                >
                  <Navigation className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <svg className="absolute inset-0 w-full h-full">
                  <motion.path
                    d="M 30 30 Q 96 96 160 160"
                    stroke="rgba(59, 130, 246, 0.5)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mt-6">Traçando Rota</h3>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Elementos do Mapa</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {mapElements.map((el, idx) => {
                  const Icon = el.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${el.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{el.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {scene === 7 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Compass className="w-32 h-32 text-blue-400/50" />
              </motion.div>
              <motion.div
                className="absolute"
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2 h-16 bg-gradient-to-b from-red-500 to-transparent rounded-full" />
              </motion.div>
              <p className="text-white text-lg mt-6">Calibrando Direção</p>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="space-y-4 w-full max-w-sm">
                {['Mercado', 'Objetivo', 'Recursos'].map((layer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className="p-3 rounded-lg bg-gradient-to-r from-blue-500/30 to-violet-500/30 border border-blue-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{layer}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {scene === 9 && (
            <motion.div
              key="scene9"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <Eye className="w-16 h-16 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Visão Clara</h3>
              <p className="text-blue-300 text-center max-w-sm">Contexto bem mapeado gera respostas precisas</p>
            </motion.div>
          )}

          {scene >= 10 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.6)', '0 0 0px rgba(59, 130, 246, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center max-w-md"
              >
                <Map className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Mapa Completo!</h3>
                <p className="text-blue-300">
                  Com seu contexto mapeado, a IA sabe exatamente onde você está e para onde quer ir
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-blue-400' : 'bg-blue-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
