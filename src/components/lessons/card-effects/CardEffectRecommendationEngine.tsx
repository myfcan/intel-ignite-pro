import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, ThumbsUp, Film, Music, BookOpen, ShoppingBag, Star } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectRecommendationEngine = ({ isActive = true, duration = 28 }: CardEffectProps) => {
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

  const recommendations = [
    { icon: Film, name: "Filme", match: "95%", color: "#E50914" },
    { icon: Music, name: "Música", match: "88%", color: "#1DB954" },
    { icon: BookOpen, name: "Livro", match: "92%", color: "#FF9F00" },
    { icon: ShoppingBag, name: "Produto", match: "87%", color: "#FF6B00" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30 mb-4">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-pink-300 text-sm font-medium">Motor de Recomendação</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Como a I.A. <span className="text-pink-400">Recomenda</span> para Você
        </h2>
      </motion.div>

      {/* Recommendation Flow */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: phase >= 1 ? 1 : 0.3, scale: phase >= 1 ? 1 : 0.8 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center">
            <span className="text-white text-xl">👤</span>
          </div>
          <div>
            <p className="text-white font-medium">Seu Perfil</p>
            <p className="text-pink-300 text-sm">Histórico + Preferências</p>
          </div>
          <motion.div
            animate={phase >= 1 ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-pink-400" />
          </motion.div>
        </motion.div>

        {/* Processing Arrow */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-0.5 h-8 bg-gradient-to-b from-pink-500 to-fuchsia-500" />
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-pink-400"
            >
              ▼
            </motion.div>
          </motion.div>
        )}

        {/* Recommendations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
          className="grid grid-cols-2 gap-3 w-full max-w-sm"
        >
          {recommendations.map((item, idx) => {
            const Icon = item.icon;
            const shouldShow = phase >= Math.floor(idx / 2) + 2;
            const isActive = phase === Math.floor(idx / 2) + 2;
            
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
                  animate={isActive ? { 
                    boxShadow: [`0 0 0px ${item.color}`, `0 0 20px ${item.color}`, `0 0 0px ${item.color}`]
                  } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
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
      </div>

      {/* Insight */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center"
        >
          <ThumbsUp className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-white font-medium text-sm">Personalização em tempo real!</p>
          <p className="text-pink-300 text-xs">I.A. aprende suas preferências</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-2 pb-2">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-pink-400' : 'bg-pink-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
