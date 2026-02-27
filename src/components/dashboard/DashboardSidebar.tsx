import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Zap, Crown, Gem } from 'lucide-react';
import { MissoesDiarias } from '@/components/gamification/MissoesDiarias';

interface DashboardSidebarProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
}

const cardStyle = {
  background: 'hsl(0 0% 100%)',
  border: '1px solid hsl(220 13% 91%)',
  boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.03)',
};

export const DashboardSidebar = ({ streakDays, userName, isLoading = false }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const streakPercentToGoal = Math.min((streakDays / 30) * 100, 100);

  return (
    <div className="flex flex-col gap-4">
      {/* ════════ STREAK CARD - Light premium ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl relative overflow-hidden"
        style={cardStyle}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, hsl(239 84% 67%), hsl(258 90% 66%), hsl(330 81% 60%))' }}
        />

        <div className="p-5 pt-6">
        {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(24 95% 53%), hsl(16 85% 55%))',
                    boxShadow: '0 4px 12px hsl(24 95% 53% / 0.3)',
                  }}
                >
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'hsl(215 16% 47%)' }}>
                    Sequência Ativa
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold leading-none" style={{ color: 'hsl(215 25% 9%)' }}>{streakDays}</span>
                    <span className="text-xs font-medium" style={{ color: 'hsl(215 16% 47%)' }}>dias</span>
                  </div>
                </div>
              </div>
              <div
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                style={{
                  background: 'hsl(158 64% 52% / 0.1)',
                  color: 'hsl(158 64% 42%)',
                  border: '1px solid hsl(158 64% 52% / 0.15)',
                }}
              >
                🔥 Ativo
              </div>
            </div>

          {/* Descrição do card */}
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'hsl(215 16% 47%)' }}>
            Manter uma sequência diária acelera seu aprendizado e desbloqueia recompensas.
          </p>

          {/* Progress toward goal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium" style={{ color: 'hsl(215 16% 47%)' }}>
                Meta: 30 dias
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'hsl(215 25% 9%)' }}>
                {Math.round(streakPercentToGoal)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'hsl(220 14% 96%)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(239 84% 67%), hsl(258 90% 66%))',
                  boxShadow: '0 0 8px hsl(239 84% 67% / 0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${streakPercentToGoal}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Motivational */}
          <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'hsl(215 16% 47%)' }}>
            {streakDays > 0
              ? `${userName}, sua consistência está acima de 92% dos usuários. Continue assim!`
              : 'Complete uma aula hoje para iniciar sua sequência e ganhar XP bônus.'}
          </p>

          {/* CTA */}
          <button
            onClick={() => {
              const trailsSection = document.getElementById('suas-trilhas');
              trailsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-3 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(258 90% 66%))',
              color: 'white',
              boxShadow: '0 4px 12px hsl(239 84% 67% / 0.25)',
            }}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Continue sua Jornada</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          </button>
        </div>
      </motion.div>

      {/* ════════ RANKING + CONQUISTAS ════════ */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          onClick={() => navigate('/leaderboard')}
          className="cursor-pointer rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all hover:-translate-y-1 group"
          style={cardStyle}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(28 80% 52%))', boxShadow: '0 4px 12px hsl(38 92% 50% / 0.25)' }}
          >
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-[13px]" style={{ color: 'hsl(215 25% 9%)' }}>Ranking</h3>
            <p className="text-[11px]" style={{ color: 'hsl(215 16% 47%)' }}>Global</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          onClick={() => navigate('/achievements')}
          className="cursor-pointer rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all hover:-translate-y-1 group"
          style={cardStyle}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(270 76% 70%))', boxShadow: '0 4px 12px hsl(258 90% 66% / 0.25)' }}
          >
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-[13px]" style={{ color: 'hsl(215 25% 9%)' }}>Conquistas</h3>
            <p className="text-[11px]" style={{ color: 'hsl(215 16% 47%)' }}>Badges</p>
          </div>
        </motion.div>
      </div>

      {/* ════════ MISSÕES DIÁRIAS ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl"
        style={cardStyle}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(215 25% 9%)' }}>
              Missões Diárias
            </h3>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: 'hsl(239 84% 67% / 0.06)',
                border: '1px solid hsl(239 84% 67% / 0.1)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'hsl(158 64% 52%)' }}
              />
              <span className="text-[10px] font-bold" style={{ color: 'hsl(239 84% 55%)' }}>HOJE</span>
            </div>
          </div>
          <MissoesDiarias compact />
        </div>
      </motion.div>
    </div>
  );
};
