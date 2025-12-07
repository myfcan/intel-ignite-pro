import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Smartphone, Music, ShoppingCart, Navigation, MessageCircle, Heart, MapPin } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectEverydayAi = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 2;
  const totalPhases = 8; // Adicionamos 1 fase para o mapa
  const phaseTime = (duration * 1000) / totalPhases;

  useEffect(() => {
    if (!isActive || loopCount >= maxLoops) return;
    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev >= totalPhases - 1) {
          setLoopCount(l => l + 1);
          return 0;
        }
        return prev + 1;
      });
    }, phaseTime);
    return () => clearInterval(interval);
  }, [isActive, loopCount, phaseTime]);

  const dailyApps = [
    { name: "Spotify", icon: Music, color: "#1DB954", desc: "Recomenda músicas" },
    { name: "Netflix", icon: Heart, color: "#E50914", desc: "Sugere filmes" },
    { name: "Waze", icon: Navigation, color: "#33CCFF", desc: "Otimiza rotas" },
    { name: "Amazon", icon: ShoppingCart, color: "#FF9900", desc: "Produtos para você" },
    { name: "WhatsApp", icon: MessageCircle, color: "#25D366", desc: "Respostas rápidas" },
  ];

  // Fase 1: Mini-mapa com rota sendo traçada
  const showMapPhase = phase >= 1 && phase <= 2;
  // Fase 2+: Apps aparecem
  const showAppsPhase = phase >= 2;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-slate-900 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
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
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Phone Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.3, y: phase >= 1 ? 0 : 30 }}
            className="w-48 h-80 md:w-56 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-2 border-4 border-slate-700 relative overflow-hidden"
          >
            {/* Screen */}
            <div className="w-full h-full bg-slate-900 rounded-2xl p-3 sm:p-4 overflow-hidden relative">
              
              {/* FASE 1: Mini-mapa com rota */}
              {showMapPhase && !showAppsPhase && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-3 flex flex-col items-center justify-center"
                >
                  {/* Mini Map Container */}
                  <div className="relative w-full h-40 sm:h-48 rounded-xl bg-slate-800/80 overflow-hidden border border-slate-700">
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
                      {/* Glow effect */}
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
                      className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4"
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </motion.div>

                    {/* End Point with Pin */}
                    <motion.div
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 2, type: "spring", stiffness: 200 }}
                      className="absolute top-2 right-3 sm:top-3 sm:right-4"
                    >
                      <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 drop-shadow-lg" />
                    </motion.div>

                    {/* Moving Car/Dot along path */}
                    <motion.div
                      className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                      initial={{ left: "12%", bottom: "80%" }}
                      animate={{ 
                        left: ["12%", "30%", "50%", "60%", "82%"],
                        bottom: ["80%", "55%", "40%", "28%", "12%"]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1]
                      }}
                    />
                  </div>

                  {/* Map Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 text-xs font-medium">Rota otimizada por I.A.</span>
                  </motion.div>
                </motion.div>
              )}

              {/* FASE 2+: Apps Grid */}
              {showAppsPhase && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {dailyApps.map((app, idx) => {
                      const Icon = app.icon;
                      const appPhase = Math.floor(idx / 2) + 2; // Começar da fase 2
                      const shouldShow = phase >= appPhase;
                      const isActiveApp = phase === appPhase;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: shouldShow ? 1 : 0,
                            scale: shouldShow ? 1 : 0
                          }}
                          transition={{ delay: (idx % 2) * 0.1 }}
                          className="relative"
                        >
                          <motion.div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto"
                            style={{ backgroundColor: `${app.color}30` }}
                            animate={isActiveApp ? { 
                              boxShadow: [`0 0 0px ${app.color}`, `0 0 20px ${app.color}`, `0 0 0px ${app.color}`]
                            } : {}}
                            transition={{ duration: 0.5, repeat: isActiveApp ? Infinity : 0 }}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: app.color }} />
                          </motion.div>
                          <p className="text-white/60 text-[9px] sm:text-[10px] text-center mt-1 truncate">{app.name}</p>
                          
                          {/* AI Badge */}
                          {shouldShow && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-0 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center"
                            >
                              <span className="text-[6px] sm:text-[8px] text-white font-bold">IA</span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Current app description */}
                  {phase >= 3 && phase < totalPhases && (
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 sm:mt-4 p-2 rounded-lg bg-white/5 text-center"
                    >
                      <p className="text-white/80 text-[10px] sm:text-xs">{dailyApps[Math.min(phase - 2, dailyApps.length - 1)]?.desc}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Floating AI indicators */}
          {phase >= 4 && (
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
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.5 
                  }}
                  className="absolute left-1/2 top-1/2 text-blue-400 text-xl sm:text-2xl"
                >
                  🤖
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Insight */}
      {phase >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"
        >
          <p className="text-white font-semibold text-sm sm:text-base">I.A. já faz parte da sua vida!</p>
          <p className="text-blue-300 text-xs sm:text-sm">Recomendações, rotas, traduções... tudo é I.A.</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-blue-400' : 'bg-blue-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
