import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Crown, Gem, ChevronRight, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { OnboardingCTA } from './OnboardingCTA';

interface MobileQuickStatsProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
  missionsContent?: React.ReactNode;
  quickAccessContent?: React.ReactNode;
  continueContent?: React.ReactNode;
  accessCount?: number;
  activeTrail?: { id: string; title: string } | null;
  hasProgress?: boolean;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const getMotivationalLine = (streak: number) => {
  if (streak >= 7) return 'Sua consistência está incrível! 🔥';
  if (streak >= 3) return 'Você está construindo um hábito poderoso!';
  if (streak > 0) return 'Continue assim, cada dia conta!';
  return 'Comece sua sequência hoje!';
};

export const MobileQuickStats = ({ streakDays, userName, isLoading = false, missionsContent, quickAccessContent, continueContent, accessCount = 99, activeTrail, hasProgress = false }: MobileQuickStatsProps) => {
  const navigate = useNavigate();
  const [missionsOpen, setMissionsOpen] = useState(false);
  const streakPercent = Math.min((streakDays / 30) * 100, 100);
  const greeting = getGreeting();

  return (
    <div className="lg:hidden flex flex-col gap-4 mb-6">

      {/* ═══════════════════════════════════════════════
          GREETING CARD — Glassmorphism + Gradient
          Inspired by Duolingo/Headspace welcome patterns
         ═══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(258 90% 62%) 0%, hsl(239 84% 60%) 50%, hsl(220 70% 55%) 100%)',
          boxShadow: '0 8px 32px -4px hsl(258 90% 62% / 0.35), 0 2px 8px -2px hsl(0 0% 0% / 0.1)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(38 92% 60% / 0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(180 70% 60% / 0.15) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 px-5 py-5">
          {/* Greeting row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.15em] mb-0.5">
                {greeting}
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">
                {userName} <span className="inline-block ml-0.5">👋</span>
              </h2>
            </div>
            {/* Streak badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-white font-bold text-sm">{streakDays}</span>
            </div>
          </div>

          {/* Motivational line */}
          <p className="text-white/70 text-[12px] leading-relaxed mb-4">
            {getMotivationalLine(streakDays)}
          </p>

          {/* Streak progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                Meta 30 dias
              </span>
              <span className="text-white/80 text-[11px] font-bold">
                {Math.round(streakPercent)}%
              </span>
            </div>
            <div
              className="h-[6px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.12)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 92% 60%), hsl(24 95% 55%), hsl(350 80% 60%))',
                  boxShadow: '0 0 12px hsl(38 92% 60% / 0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${streakPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Dynamic CTA for first 5 accesses */}
          {accessCount < 5 && (
            <OnboardingCTA activeTrail={activeTrail} hasProgress={hasProgress} />
          )}

          {/* Quick action pills — hidden during first 5 accesses */}
          {accessCount >= 5 && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/leaderboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.96]"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                Ranking
              </button>
              <button
                onClick={() => navigate('/achievements')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.96]"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Gem className="w-3.5 h-3.5 text-purple-200" />
                Conquistas
              </button>
              <button
                onClick={() => {
                  const trailsSection = document.getElementById('suas-trilhas');
                  trailsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold ml-auto transition-all active:scale-[0.96]"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                Estudar
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          QUICK ACCESS (slot)
         ═══════════════════════════════════════════════ */}
      {quickAccessContent}

      {/* ═══════════════════════════════════════════════
          COLLAPSIBLE DAILY MISSIONS
         ═══════════════════════════════════════════════ */}
      <motion.div
        id="tour-missions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid hsl(220 13% 91% / 0.8)',
          boxShadow: '0 2px 12px hsl(0 0% 0% / 0.04), 0 1px 3px hsl(0 0% 0% / 0.03)',
        }}
      >
        {/* Collapsed header — always visible */}
        <button
          onClick={() => setMissionsOpen(prev => !prev)}
          className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
          style={{ background: missionsOpen ? 'hsl(239 84% 67% / 0.03)' : 'transparent' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(258 90% 66%))',
              boxShadow: '0 2px 8px hsl(239 84% 67% / 0.3)',
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-[13px] font-bold block" style={{ color: 'hsl(215 25% 9%)' }}>
              Missões Diárias
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md mr-1"
            style={{
              background: 'hsl(158 64% 52% / 0.1)',
              border: '1px solid hsl(158 64% 52% / 0.15)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(158 64% 52%)' }} />
            <span className="text-[9px] font-bold" style={{ color: 'hsl(158 64% 42%)' }}>HOJE</span>
          </div>
          <motion.div
            animate={{ rotate: missionsOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" style={{ color: 'hsl(215 16% 47%)' }} />
          </motion.div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {missionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1">
                {missionsContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          CONTINUE LEARNING (slot)
         ═══════════════════════════════════════════════ */}
      {continueContent}
    </div>
  );
};
