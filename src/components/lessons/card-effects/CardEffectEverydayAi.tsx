import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Smartphone, Music, ShoppingCart, Navigation, MessageCircle, Heart } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectEverydayAi = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 2;
  const totalPhases = 7;
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">I.A. no Dia a Dia</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Você já <span className="text-blue-400">usa I.A.</span> todo dia!
        </h2>
      </motion.div>

      {/* Phone with Apps */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Phone Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.3, y: phase >= 1 ? 0 : 30 }}
            className="w-48 h-80 md:w-56 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-2 border-4 border-slate-700 relative overflow-hidden"
          >
            {/* Screen */}
            <div className="w-full h-full bg-slate-900 rounded-2xl p-4 overflow-hidden">
              {/* Apps Grid */}
              <div className="grid grid-cols-3 gap-3">
                {dailyApps.map((app, idx) => {
                  const Icon = app.icon;
                  const shouldShow = phase >= Math.floor(idx / 2) + 1;
                  const isActive = phase === Math.floor(idx / 2) + 1;
                  
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
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                        style={{ backgroundColor: `${app.color}30` }}
                        animate={isActive ? { 
                          boxShadow: [`0 0 0px ${app.color}`, `0 0 20px ${app.color}`, `0 0 0px ${app.color}`]
                        } : {}}
                        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                      >
                        <Icon className="w-6 h-6" style={{ color: app.color }} />
                      </motion.div>
                      <p className="text-white/60 text-[10px] text-center mt-1 truncate">{app.name}</p>
                      
                      {/* AI Badge */}
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
              {phase >= 2 && phase < totalPhases && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-2 rounded-lg bg-white/5 text-center"
                >
                  <p className="text-white/80 text-xs">{dailyApps[Math.min(phase - 1, dailyApps.length - 1)]?.desc}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Floating AI indicators */}
          {phase >= 3 && (
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
                  className="absolute left-1/2 top-1/2 text-blue-400 text-2xl"
                >
                  🤖
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Insight */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"
        >
          <p className="text-white font-semibold">I.A. já faz parte da sua vida!</p>
          <p className="text-blue-300 text-sm">Recomendações, rotas, traduções... tudo é I.A.</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-blue-400' : 'bg-blue-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
