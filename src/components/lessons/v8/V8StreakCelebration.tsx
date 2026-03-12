import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface V8StreakCelebrationProps {
  streakDays: number;
  open: boolean;
  onClose: () => void;
}

export const V8StreakCelebration = ({ streakDays, open, onClose }: V8StreakCelebrationProps) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981"],
        zIndex: 9999,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card rounded-3xl shadow-2xl border border-border/50 p-8 max-w-sm w-full text-center overflow-hidden"
          >
            {/* Decorative rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-24 bg-gradient-to-t from-amber-400/30 to-transparent rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: "bottom center",
                  transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                }}
                animate={{ opacity: [0.2, 0.6, 0.2], scaleY: [0.8, 1.1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}

            {/* Flame icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 flex items-center justify-center mb-4"
            >
              <Flame className="w-10 h-10 text-amber-500" />
            </motion.div>

            {/* Big streak number */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.35, stiffness: 180 }}
              className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 leading-none mb-2"
            >
              {streakDays}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-bold text-foreground mb-1"
            >
              {streakDays === 1 ? "dia de aprendizado!" : "dias consecutivos!"}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mb-6"
            >
              Brilhante! Continue assim e conquiste novas patentes. 🔥
            </motion.p>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
            >
              Continuar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
