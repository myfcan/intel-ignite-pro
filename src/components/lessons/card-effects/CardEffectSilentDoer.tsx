import { motion, AnimatePresence } from "framer-motion";
import { User, Wrench, DollarSign, Sparkles, Eye, CheckCircle2, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectSilentDoerProps {
  isActive?: boolean;
}

export const CardEffectSilentDoer = ({ isActive = false }: CardEffectSilentDoerProps) => {
  const [scene, setScene] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const tasks = [
    { icon: "📝", label: "Um texto" },
    { icon: "🎨", label: "Uma arte" },
    { icon: "📊", label: "Uma planilha" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setTasksDone(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    
    // Tasks animation
    timersRef.current.push(setTimeout(() => setTasksDone(1), 4000));
    timersRef.current.push(setTimeout(() => setTasksDone(2), 5500));
    timersRef.current.push(setTimeout(() => setTasksDone(3), 7000));
    
    timersRef.current.push(setTimeout(() => setScene(3), 9000));
    timersRef.current.push(setTimeout(() => setScene(4), 12000));

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
      setTasksDone(0);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950">
      {/* Subtle floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-indigo-400/20 rounded-full"
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${25 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Silent Avatar */}
          {scene >= 1 && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-16"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5"
                >
                  <Eye className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <p className="text-indigo-300 text-sm mt-2 text-center font-medium">O Fazedor Silencioso</p>
              <p className="text-indigo-400/60 text-xs text-center">"Quase não fala nada"</p>
            </motion.div>
          )}

          {/* Scene 2: Tasks */}
          {scene >= 2 && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              {tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: tasksDone > i ? 1 : 0.4, 
                    y: 0,
                    scale: tasksDone === i + 1 ? 1.1 : 1
                  }}
                  transition={{ delay: i * 0.2 }}
                  className={`relative flex flex-col items-center p-4 rounded-xl transition-all ${
                    tasksDone > i 
                      ? 'bg-indigo-600/30 border border-indigo-400/40' 
                      : 'bg-gray-800/30 border border-gray-700/30'
                  }`}
                >
                  <span className="text-3xl mb-2">{task.icon}</span>
                  <span className={`text-sm ${tasksDone > i ? 'text-indigo-300' : 'text-gray-500'}`}>
                    {task.label}
                  </span>
                  {tasksDone > i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Scene 3: Result */}
          {scene >= 3 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32"
            >
              <div className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 px-6 py-4 rounded-xl border border-green-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-green-200 font-bold text-lg flex items-center gap-2">
                      Sendo Pago
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </p>
                    <p className="text-green-300/70 text-sm">
                      Por algo que antes nem sabia que existia
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Key insight */}
          {scene >= 4 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-indigo-300 font-semibold text-center flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Errando e ajustando, começou pequeno
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-indigo-400' : 'bg-indigo-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-indigo-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-indigo-400/30"
      >
        <span className="text-indigo-300 text-xs font-medium">Tipo 3</span>
      </motion.div>
    </div>
  );
};
