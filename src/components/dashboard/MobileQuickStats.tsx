import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Crown, Gem, ChevronRight } from 'lucide-react';
import { MissoesDiarias } from '@/components/gamification/MissoesDiarias';

interface MobileQuickStatsProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
}

export const MobileQuickStats = ({ streakDays, userName, isLoading = false }: MobileQuickStatsProps) => {
  const navigate = useNavigate();
  const streakPercent = Math.min((streakDays / 30) * 100, 100);

  return (
    <div className="lg:hidden flex flex-col gap-3 mb-6">
      {/* ═══ STREAK STRIP ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid hsl(220 13% 91%)',
          boxShadow: '0 1px 3px hsl(0 0% 0% / 0.04), 0 4px 12px hsl(0 0% 0% / 0.03)',
        }}
      >
        {/* Top accent */}
        <div
          className="h-[3px]"
          style={{ background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(16 85% 55%), hsl(38 92% 50%))' }}
        />

        <div className="px-4 py-3.5">
          {/* Streak row */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(24 95% 53%), hsl(16 85% 55%))',
                boxShadow: '0 4px 12px hsl(24 95% 53% / 0.3)',
              }}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold leading-none" style={{ color: 'hsl(215 25% 9%)' }}>
                  {streakDays}
                </span>
                <span className="text-xs font-medium" style={{ color: 'hsl(215 16% 47%)' }}>
                  dias de sequência
                </span>
                <div
                  className="px-2 py-0.5 rounded-md text-[9px] font-bold ml-auto"
                  style={{
                    background: 'hsl(158 64% 52% / 0.1)',
                    color: 'hsl(158 64% 42%)',
                  }}
                >
                  🔥 Ativo
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'hsl(220 14% 96%)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(38 92% 50%))',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${streakPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                <span className="text-[10px] font-medium flex-shrink-0" style={{ color: 'hsl(215 16% 47%)' }}>
                  {Math.round(streakPercent)}% de 30d
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ RANKING + CONQUISTAS pills ═══ */}
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 transition-all active:scale-[0.97]"
          style={{
            background: '#FFFFFF',
            border: '1px solid hsl(220 13% 91%)',
            boxShadow: '0 1px 3px hsl(0 0% 0% / 0.04)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(28 80% 52%))', boxShadow: '0 2px 8px hsl(38 92% 50% / 0.25)' }}
          >
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-[12px] font-bold block" style={{ color: 'hsl(215 25% 9%)' }}>Ranking</span>
            <span className="text-[10px]" style={{ color: 'hsl(215 16% 47%)' }}>Global</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-30" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 transition-all active:scale-[0.97]"
          style={{
            background: '#FFFFFF',
            border: '1px solid hsl(220 13% 91%)',
            boxShadow: '0 1px 3px hsl(0 0% 0% / 0.04)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(270 76% 70%))', boxShadow: '0 2px 8px hsl(258 90% 66% / 0.25)' }}
          >
            <Gem className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-[12px] font-bold block" style={{ color: 'hsl(215 25% 9%)' }}>Conquistas</span>
            <span className="text-[10px]" style={{ color: 'hsl(215 16% 47%)' }}>Badges</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-30" />
        </motion.button>
      </div>

      {/* ═══ MISSÕES DIÁRIAS compactas ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl"
        style={{
          background: '#FFFFFF',
          border: '1px solid hsl(220 13% 91%)',
          boxShadow: '0 1px 3px hsl(0 0% 0% / 0.04), 0 4px 12px hsl(0 0% 0% / 0.03)',
        }}
      >
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[13px]" style={{ color: 'hsl(215 25% 9%)' }}>
              Missões Diárias
            </h3>
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{
                background: 'hsl(239 84% 67% / 0.06)',
                border: '1px solid hsl(239 84% 67% / 0.1)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'hsl(158 64% 52%)' }}
              />
              <span className="text-[9px] font-bold" style={{ color: 'hsl(239 84% 55%)' }}>HOJE</span>
            </div>
          </div>
          <MissoesDiarias compact />
        </div>
      </motion.div>
    </div>
  );
};
