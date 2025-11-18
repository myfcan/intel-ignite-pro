import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface MissionCompletionAnimationProps {
  missionTitle: string;
  rewardValue: number;
  onComplete: () => void;
}

export function MissionCompletionAnimation({ 
  missionTitle, 
  rewardValue,
  onComplete 
}: MissionCompletionAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Celebration sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKjl771hGwU7k9nzxXkpBSh+zPLaizsKGGS57OihUBELTKXh8bllHAU2jdXxz3wlBSl6yu/fjTkIGGC37OmlUREMTKPi8bllHAU1i9Txz34mBSl4yO/gjzsIHGG56+qjUBELSqHf8LtnHgU5kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBELS6Pf8LxmHQU4kdXx0HwmBSl4yO/gjzsIHGG56+qjUBEL');
    audio.volume = 0.3;
    audio.play().catch(() => {});

    // Confetti burst
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Auto-hide animation after 3 seconds
    const timeout = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => {
            setShowAnimation(false);
            setTimeout(onComplete, 300);
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring",
              damping: 15,
              stiffness: 200 
            }}
            className="relative max-w-md w-full mx-4"
          >
            {/* Floating stars */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.cos(i * 45 * Math.PI / 180) * 150,
                    y: Math.sin(i * 45 * Math.PI / 180) * 150,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute top-1/2 left-1/2"
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </motion.div>
              ))}
            </div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl border-2 border-primary/50 shadow-2xl shadow-primary/30 p-8 overflow-hidden">
              {/* Animated background glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl"
              />

              <div className="relative z-10 text-center space-y-6">
                {/* Trophy icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.2
                  }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="relative bg-gradient-to-br from-primary to-accent p-6 rounded-full shadow-lg shadow-primary/50"
                    >
                      <Trophy className="w-16 h-16 text-primary-foreground" />
                    </motion.div>
                    
                    {/* Sparkles around trophy */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          rotate: 360
                        }}
                        transition={{
                          duration: 1.5,
                          delay: 0.3 + i * 0.2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute"
                        style={{
                          top: i % 2 === 0 ? '-10%' : '90%',
                          left: i < 2 ? '-10%' : '90%'
                        }}
                      >
                        <Sparkles className="w-8 h-8 text-primary" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Missão Concluída! 🎉
                  </h2>
                  <p className="text-lg text-foreground font-semibold">
                    {missionTitle}
                  </p>
                </motion.div>

                {/* Reward */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.6,
                    type: "spring",
                    damping: 10
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full border border-primary/50"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">+{rewardValue}</span>
                  <span className="text-sm text-muted-foreground">pontos</span>
                </motion.div>

                {/* Tap to continue hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-sm text-muted-foreground"
                >
                  Toque para continuar
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
