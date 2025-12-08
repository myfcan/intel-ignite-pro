import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Smartphone, Music, ShoppingCart, Navigation, MessageCircle, Heart, MapPin, Zap, CheckCircle } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectEverydayAi = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 10;
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

  const dailyApps = [
    { name: "Spotify", icon: Music, color: "#1DB954", desc: "Recomenda músicas" },
    { name: "Netflix", icon: Heart, color: "#E50914", desc: "Sugere filmes" },
    { name: "Waze", icon: Navigation, color: "#33CCFF", desc: "Otimiza rotas" },
    { name: "Amazon", icon: ShoppingCart, color: "#FF9900", desc: "Produtos para você" },
    { name: "WhatsApp", icon: MessageCircle, color: "#25D366", desc: "Respostas rápidas" },
  ];

  const insights = [
    "Você usa I.A. sem perceber",
    "Toda recomendação é I.A.",
    "Rotas otimizadas = I.A.",
    "Feeds personalizados = I.A."
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-slate-900 p-4 sm:p-6 md:p-8 flex flex-col">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-3 sm:mb-4">
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          <span className="text-blue-300 text-xs sm:text-sm font-medium">I.A. no Dia a Dia</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          Você já <span className="text-blue-400">usa I.A.</span> todo dia!
        </h2>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Scene 0-2: Map Phase */}
          {scene >= 0 && scene <= 2 && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Phone Frame with Map */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-48 h-72 md:w-56 md:h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-2 border-4 border-slate-700 relative overflow-hidden"
              >
                <div className="w-full h-full bg-slate-900 rounded-2xl p-3 overflow-hidden relative">
                  {/* Mini Map Container */}
                  <div className="relative w-full h-full rounded-xl bg-slate-800/80 overflow-hidden border border-slate-700">
                    {/* Map Grid Lines */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(6)].map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full h-px bg-slate-500" style={{ top: `${(i + 1) * 14}%` }} />
                      ))}
                      {[...Array(6)].map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full w-px bg-slate-500" style={{ left: `${(i + 1) * 14}%` }} />
                      ))}
                    </div>

                    {/* Animated Route Path */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.path
                        d="M 15 85 Q 25 70 35 60 Q 50 45 55 35 Q 65 20 85 15"
                        stroke="#33CCFF"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M 15 85 Q 25 70 35 60 Q 50 45 55 35 Q 65 20 85 15"
                        stroke="#33CCFF"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />
                    </svg>

                    {/* Start Point */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-4 left-4"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </motion.div>

                    {/* End Point with Pin */}
                    <motion.div
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 2, type: "spring", stiffness: 200 }}
                      className="absolute top-3 right-4"
                    >
                      <MapPin className="w-7 h-7 text-red-500 drop-shadow-lg" />
                    </motion.div>

                    {/* Moving Dot */}
                    <motion.div
                      className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                      initial={{ left: "12%", bottom: "80%" }}
                      animate={{ 
                        left: ["12%", "30%", "50%", "60%", "82%"],
                        bottom: ["80%", "55%", "40%", "28%", "12%"]
                      }}
                      transition={{ duration: 2.5, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Map Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">Rota otimizada por I.A.</span>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 3-6: Apps Grid Phase */}
          {scene >= 3 && scene <= 6 && (
            <motion.div
              key="apps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-56 h-80 md:w-64 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-2 border-4 border-slate-700"
              >
                <div className="w-full h-full bg-slate-900 rounded-2xl p-4 overflow-hidden">
                  <div className="grid grid-cols-3 gap-3">
                    {dailyApps.map((app, idx) => {
                      const Icon = app.icon;
                      const appScene = idx + 3;
                      const shouldShow = scene >= appScene;
                      const isActiveApp = scene === appScene;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: shouldShow ? 1 : 0, scale: shouldShow ? 1 : 0 }}
                          className="relative"
                        >
                          <motion.div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                            style={{ backgroundColor: `${app.color}30` }}
                            animate={isActiveApp ? { 
                              boxShadow: [`0 0 0px ${app.color}`, `0 0 20px ${app.color}`, `0 0 0px ${app.color}`]
                            } : {}}
                            transition={{ duration: 0.5, repeat: isActiveApp ? Infinity : 0 }}
                          >
                            <Icon className="w-6 h-6" style={{ color: app.color }} />
                          </motion.div>
                          <p className="text-white/60 text-[10px] text-center mt-1 truncate">{app.name}</p>
                          
                          {shouldShow && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                            >
                              <span className="text-[8px] text-white font-bold">IA</span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Current app description */}
                  {scene >= 4 && scene <= 6 && (
                    <motion.div
                      key={scene}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-2 rounded-lg bg-white/5 text-center"
                    >
                      <p className="text-white/80 text-xs">{dailyApps[Math.min(scene - 3, dailyApps.length - 1)]?.desc}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 7: Insights List */}
          {scene === 7 && (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-6">O que você aprendeu:</h3>
              <div className="space-y-3 w-full max-w-sm">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-white text-sm">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scene 8: Stats */}
          {scene === 8 && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center"
                >
                  <p className="text-3xl font-bold text-blue-400">5+</p>
                  <p className="text-blue-300 text-sm mt-1">Apps com I.A.</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-center"
                >
                  <p className="text-3xl font-bold text-green-400">24h</p>
                  <p className="text-green-300 text-sm mt-1">Por dia</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Scene 9: Final Message */}
          {scene >= 9 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.6)', '0 0 0px rgba(59, 130, 246, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center max-w-md"
              >
                <Zap className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">I.A. já faz parte da sua vida!</h3>
                <p className="text-blue-300 text-sm">
                  Recomendações, rotas, traduções... tudo é I.A. trabalhando para você
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating AI indicators */}
      {scene >= 4 && scene <= 6 && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                x: Math.sin(i * 2) * 50,
                y: -50 - i * 20
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              className="absolute left-1/2 top-1/2 text-blue-400 text-2xl z-20"
            >
              🤖
            </motion.div>
          ))}
        </>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= scene ? 'bg-blue-400' : 'bg-blue-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
