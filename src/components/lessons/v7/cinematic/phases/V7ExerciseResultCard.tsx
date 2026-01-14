/**
 * V7ExerciseResultCard - Card de resultado do exercício V7
 * Mostra percentual de acerto, conquistas e botão para ver recompensas
 */

import { motion } from 'framer-motion';
import { CheckCircle, Trophy, Award, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useV7SoundEffects } from '../useV7SoundEffects';

interface V7ExerciseResultCardProps {
  lessonTitle: string;
  score: number;
  total: number;
  onViewRewards: () => void;
  onExit?: () => void;
}

export const V7ExerciseResultCard = ({
  lessonTitle,
  score,
  total,
  onViewRewards,
  onExit
}: V7ExerciseResultCardProps) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const percentage = Math.round((score / total) * 100);
  
  // Sound effects
  const { playSound } = useV7SoundEffects(0.6, true);

  useEffect(() => {
    // ✅ Delay para garantir que AudioContext seja desbloqueado
    const initSounds = async () => {
      // Play success/reveal sound on mount
      await playSound('success');
    };
    
    // Pequeno delay para interação do usuário
    const soundTimeout = setTimeout(initSounds, 100);
    
    // Animar percentual com som de count-up
    const duration = 1500;
    const start = Date.now();
    let lastTick = 0;
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newPercent = Math.round(percentage * eased);
      
      // Play tick sound every 10%
      if (Math.floor(newPercent / 10) > lastTick) {
        lastTick = Math.floor(newPercent / 10);
        playSound('count-up');
      }
      
      setAnimatedPercent(newPercent);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // ✅ Play completion sound at end
        if (percentage >= 70) {
          playSound('quiz-correct');
        }
      }
    };
    
    requestAnimationFrame(animate);

    // Confetti ao carregar
    if (percentage >= 70) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999
        });
        
        // ✅ Som de celebração com confetti
        playSound('completion');
      }, 500);
    }
    
    return () => clearTimeout(soundTimeout);
  }, [percentage, playSound]);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreBg = () => {
    if (percentage >= 80) return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    if (percentage >= 60) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* ✅ Exit Button - Top Left */}
      {onExit && (
        <motion.button
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[200] w-10 h-10 sm:w-12 sm:h-12 
                     rounded-full bg-black/40 backdrop-blur-sm border border-white/10
                     flex items-center justify-center text-white/60 hover:text-white 
                     hover:bg-black/60 hover:border-white/20 transition-all duration-200"
          onClick={() => {
            playSound('click-soft');
            onExit();
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}

      <motion.div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Check icon at top */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 bg-white flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-slate-800" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <span className="text-2xl">🎉</span>
            Parabéns!
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-center text-slate-500 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Você completou a aula
        </motion.p>

        {/* Lesson title */}
        <motion.h3
          className="text-center text-lg font-bold text-indigo-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {lessonTitle}
        </motion.h3>

        {/* Score card */}
        <motion.div
          className={`bg-gradient-to-br ${getScoreBg()} rounded-xl p-4 mb-4 border`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center text-slate-600 text-sm font-medium uppercase tracking-wide mb-2">
            Desempenho de Exercícios
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor()}`}>
                {animatedPercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">de acerto</div>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor()}`}>
                {score}/{total}
              </div>
              <div className="text-xs text-slate-500 mt-1">corretas</div>
            </div>
          </div>
        </motion.div>

        {/* Achievement badge */}
        <motion.div
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="font-bold text-amber-700">Aula Dominada</div>
            <div className="text-sm text-amber-600/80">Conteúdo concluído com sucesso</div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={() => {
            playSound('click-confirm');
            onViewRewards();
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          Ver Recompensas
        </motion.button>
      </motion.div>
    </div>
  );
};

export default V7ExerciseResultCard;
