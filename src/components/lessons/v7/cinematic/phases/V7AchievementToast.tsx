/**
 * V7AchievementToast - Toast animado para mostrar achievements conquistados
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import type { PromptAchievement } from '@/hooks/usePromptAchievements';

interface V7AchievementToastProps {
  achievements: PromptAchievement[];
  onClose: () => void;
}

export const V7AchievementToast = ({ achievements, onClose }: V7AchievementToastProps) => {
  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-md w-full mx-4"
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-orange-500/30 rounded-2xl blur-xl"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-yellow-500/50 rounded-2xl p-6 overflow-hidden">
            {/* Sparkles animation */}
            <motion.div
              className="absolute top-2 right-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="p-3 bg-yellow-500/20 rounded-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Trophy className="w-8 h-8 text-yellow-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {achievements.length === 1 ? 'Achievement Desbloqueado!' : `${achievements.length} Achievements!`}
                </h3>
                <p className="text-yellow-400/80 text-sm">Parabéns pelo seu progresso!</p>
              </div>
            </div>

            {/* Achievements list */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className="text-3xl">{achievement.emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{achievement.name}</div>
                    <div className="text-white/60 text-sm">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-bold">+{achievement.xpReward} XP</div>
                    <div className="text-yellow-400 text-xs">+{achievement.coinsReward} 🪙</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total rewards */}
            <motion.div
              className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-white/60 text-sm">Total de recompensas:</span>
              <div className="flex items-center gap-4">
                <span className="text-green-400 font-bold">
                  +{achievements.reduce((sum, a) => sum + a.xpReward, 0)} XP
                </span>
                <span className="text-yellow-400 font-bold">
                  +{achievements.reduce((sum, a) => sum + a.coinsReward, 0)} 🪙
                </span>
              </div>
            </motion.div>

            {/* Close button */}
            <motion.button
              className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
            >
              Continuar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default V7AchievementToast;
