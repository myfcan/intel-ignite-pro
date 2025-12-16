// V7PhaseGamification - Final gamification and CTA phase
// Features: Achievements, XP reveal, next steps, confetti

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  unlocked: boolean;
}

interface V7PhaseGamificationProps {
  achievements: Achievement[];
  xpEarned: number;
  levelName: string;
  nextLessonTitle?: string;
  nextLessonCountdown?: string;
  sceneIndex: number;
  onContinue?: () => void;
  onSchedule?: () => void;
}

const CONFETTI_COLORS = ['#f093fb', '#f5576c', '#4ecdc4', '#667eea', '#ffd93d', '#ff6b6b'];

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityY: number;
  velocityX: number;
}

export const V7PhaseGamification = ({
  achievements,
  xpEarned,
  levelName,
  nextLessonTitle,
  nextLessonCountdown,
  sceneIndex,
  onContinue,
  onSchedule,
}: V7PhaseGamificationProps) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  // Scene progression
  useEffect(() => {
    if (sceneIndex >= 0) {
      setShowAchievements(true);
      launchConfetti();
    }
    if (sceneIndex >= 1) setShowXP(true);
    if (sceneIndex >= 2) setShowNextSteps(true);
  }, [sceneIndex]);

  // Animate XP count
  useEffect(() => {
    if (showXP) {
      let current = 0;
      const increment = Math.ceil(xpEarned / 40);
      const interval = setInterval(() => {
        current += increment;
        if (current >= xpEarned) {
          setAnimatedXP(xpEarned);
          clearInterval(interval);
        } else {
          setAnimatedXP(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showXP, xpEarned]);

  // Launch confetti
  const launchConfetti = () => {
    const newConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      velocityY: 2 + Math.random() * 3,
      velocityX: (Math.random() - 0.5) * 2,
    }));
    setConfetti(newConfetti);
  };

  // Animate confetti
  useEffect(() => {
    if (confetti.length === 0) return;
    
    const interval = setInterval(() => {
      setConfetti(prev => 
        prev
          .map(c => ({
            ...c,
            y: c.y + c.velocityY,
            x: c.x + c.velocityX,
            rotation: c.rotation + 5,
          }))
          .filter(c => c.y < 110)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [confetti.length]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            transform: `rotate(${c.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      <div className="w-full max-w-2xl text-center relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.span 
            className="text-6xl sm:text-7xl block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            🎊
          </motion.span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            PARABÉNS!
          </h2>
        </motion.div>

        {/* Achievements */}
        <AnimatePresence>
          {showAchievements && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-white/60 text-sm mb-4 uppercase tracking-wider">
                Conquistas Desbloqueadas
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {achievements.filter(a => a.unlocked).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-green-400">✅</span>
                    <span className="text-white/90 text-sm">{achievement.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP and Level */}
        <AnimatePresence>
          {showXP && (
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-white/60 text-sm mb-1">XP Ganho</div>
                <motion.div 
                  className="text-3xl sm:text-4xl font-bold text-purple-400"
                  style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
                >
                  +{animatedXP}
                </motion.div>
              </motion.div>
              
              <motion.div
                className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-white/60 text-sm mb-1">Nível</div>
                <motion.div 
                  className="text-xl sm:text-2xl font-bold text-cyan-400"
                  style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}
                >
                  {levelName}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Steps */}
        <AnimatePresence>
          {showNextSteps && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {nextLessonTitle && (
                <div className="mb-6 p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="text-white/60 text-sm mb-2">Próxima Aula</div>
                  <div className="text-lg sm:text-xl font-bold text-white mb-2">
                    {nextLessonTitle}
                  </div>
                  {nextLessonCountdown && (
                    <div className="text-cyan-400 font-mono">
                      Disponível em: {nextLessonCountdown}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onSchedule && (
                  <motion.button
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-full font-medium"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSchedule}
                  >
                    🔔 Agendar Lembrete
                  </motion.button>
                )}
                
                {onContinue && (
                  <motion.button
                    className="px-8 py-3 text-white rounded-full font-bold relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10">🚀 COMEÇAR AGORA</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default V7PhaseGamification;
