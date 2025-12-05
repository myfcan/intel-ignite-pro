import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Users, Trophy, Clock, TrendingUp, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectFirstMoverAdvantageProps {
  isActive?: boolean;
}

export const CardEffectFirstMoverAdvantage = ({ isActive = false }: CardEffectFirstMoverAdvantageProps) => {
  const [scene, setScene] = useState(0);
  const [raceProgress, setRaceProgress] = useState(0);
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
    setRaceProgress(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    
    // Race animation
    timersRef.current.push(setTimeout(() => {
      let progress = 0;
      const raceInterval = setInterval(() => {
        progress += 2;
        setRaceProgress(Math.min(progress, 100));
        if (progress >= 100) clearInterval(raceInterval);
      }, 50);
    }, 3000));

    timersRef.current.push(setTimeout(() => setScene(3), 6500));
    timersRef.current.push(setTimeout(() => setScene(4), 9500));

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
      setRaceProgress(0);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      {/* Racing lines background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent w-full"
            style={{ top: `${20 + i * 15}%` }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Title */}
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-16 text-center"
            >
              <h3 className="text-emerald-300 text-xl font-bold flex items-center gap-2 justify-center">
                <TrendingUp className="w-6 h-6" />
                Quem Testou Primeiro
              </h3>
              <p className="text-emerald-400/70 text-sm mt-1">Saiu na frente</p>
            </motion.div>
          )}

          {/* Scene 2: Race Track */}
          {scene >= 2 && (
            <motion.div
              key="race"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md"
            >
              {/* Track 1: First Mover */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-emerald-300 font-medium">Testou Primeiro</span>
                </div>
                <div className="h-3 bg-emerald-900/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    style={{ width: `${raceProgress}%` }}
                  />
                </div>
              </div>

              {/* Track 2: Waiting */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-gray-400 font-medium">Esperando "Estar Pronto"</span>
                </div>
                <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-600 rounded-full"
                    style={{ width: `${Math.min(raceProgress * 0.3, 30)}%` }}
                  />
                </div>
              </div>

              {/* Track 3: Not Started */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-gray-500 font-medium">Ainda Achando Distante</span>
                </div>
                <div className="h-3 bg-gray-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-700 rounded-full w-[5%]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 3: Winner */}
          {scene >= 3 && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
              className="absolute right-8 top-1/2 -translate-y-1/2"
            >
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full p-4 shadow-lg shadow-yellow-500/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-center mt-2"
              >
                <Zap className="w-5 h-5 text-yellow-400 mx-auto" />
              </motion.div>
            </motion.div>
          )}

          {/* Scene 4: Conclusion */}
          {scene >= 4 && (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-16 bg-emerald-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-emerald-500/30"
            >
              <p className="text-emerald-300 font-semibold text-center">
                O mundo não esperou ninguém
              </p>
              <p className="text-emerald-400/70 text-sm text-center mt-1">
                Quem testou primeiro, saiu na frente
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-emerald-400' : 'bg-emerald-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-400/30"
      >
        <span className="text-emerald-300 text-xs font-medium">Vantagem</span>
      </motion.div>
    </div>
  );
};
