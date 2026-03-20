import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { V10UserStreak } from '../../../../types/v10.types';

interface GamificationPageProps {
  isActive: boolean;
  badgeIcon: string | null;
  badgeName: string | null;
  xpReward: number;
  streak: V10UserStreak | null;
  onShare: () => void;
  onNextLesson: () => void;
}

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/**
 * GamificationPage (C3) — Badge + XP + Streak.
 *
 * Shows badge with glow, XP pill, weekly streak view, share button with confetti.
 */
export const GamificationPage: React.FC<GamificationPageProps> = ({
  isActive,
  badgeIcon,
  badgeName,
  xpReward,
  streak,
  onShare,
  onNextLesson,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAutoFired = useRef(false);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startConfetti = () => {
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    setShowConfetti(true);
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 3500);
  };

  // Auto-fire confetti when C3 becomes active
  useEffect(() => {
    if (isActive && !hasAutoFired.current) {
      hasAutoFired.current = true;
      startConfetti();
    }
  }, [isActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  const handleShare = () => {
    startConfetti();
    onShare();
  };

  // Determine which days of the week are filled based on streak
  const currentStreak = streak?.current_streak ?? 0;
  const todayIndex = new Date().getDay();
  // Sunday = 0 in JS, map to our array where S=0 is Segunda (Monday)
  // Our array: S(seg)=0, T(ter)=1, Q(qua)=2, Q(qui)=3, S(sex)=4, S(sab)=5, D(dom)=6
  const mappedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  const getFilledDays = (): boolean[] => {
    const filled = Array(7).fill(false) as boolean[];
    for (let i = 0; i < Math.min(currentStreak, 7); i++) {
      const dayIdx = (mappedToday - i + 7) % 7;
      filled[dayIdx] = true;
    }
    return filled;
  };

  const filledDays = getFilledDays();

  return (
    <div
      className="flex-col items-center w-full min-h-full px-6 py-10 relative"
      style={{ display: isActive ? 'flex' : 'none' }}
    >
      <Confetti isActive={showConfetti} />

      <style>{`
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        .badge-glow {
          animation: badge-glow 2s ease-in-out infinite;
        }
        @keyframes xp-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .xp-pop {
          animation: xp-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Badge circle */}
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4 badge-glow"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        <span className="text-3xl">{badgeIcon ?? '\u2B50'}</span>
      </div>

      {/* Tag */}
      <span
        className="text-xs font-bold tracking-widest uppercase mb-3"
        style={{ color: '#34D399' }}
      >
        Badge desbloqueado
      </span>

      {/* Badge name */}
      <h2
        className="text-white font-bold text-center mb-3"
        style={{ fontSize: 22 }}
      >
        {badgeName ?? 'Conquista'}
      </h2>

      {/* XP pill */}
      <div
        className="rounded-full px-4 py-1.5 mb-8 xp-pop"
        style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}
      >
        <span className="text-sm font-bold" style={{ color: '#34D399' }}>
          +{xpReward} XP
        </span>
      </div>

      {/* Streak section */}
      {streak && (
        <div className="w-full max-w-[340px] mb-8">
          {/* Weekly view */}
          <div className="flex items-center justify-between gap-1 mb-3 px-2">
            {WEEK_LABELS.map((label, index) => {
              const isFilled = filledDays[index];
              const isToday = index === mappedToday;
              return (
                <div key={index} className="flex flex-col items-center gap-1.5">
                  <span className="text-white/40 text-xs font-medium">{label}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isToday
                        ? '#6366F1'
                        : isFilled
                        ? '#34D399'
                        : 'rgba(255,255,255,0.08)',
                      color: isFilled || isToday ? '#0F0B1E' : 'rgba(255,255,255,0.3)',
                      boxShadow: isToday ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'none',
                    }}
                  >
                    {isFilled || isToday ? '\u2713' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Streak counter */}
          <p className="text-center text-white/70 text-sm">
            {'\uD83D\uDD25'} {currentStreak} dias seguidos
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Share button */}
      <button
        type="button"
        onClick={handleShare}
        className="w-full max-w-[340px] min-h-[44px] py-3 rounded-xl text-white font-medium text-sm border border-white/20 bg-transparent mb-3 transition-colors hover:bg-white/5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        {'\uD83C\uDF89'} Compartilhar conquista
      </button>

      {/* Next lesson button */}
      <button
        type="button"
        onClick={onNextLesson}
        className="w-full max-w-[340px] min-h-[44px] py-3 rounded-xl font-semibold text-base transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400"
        style={{ backgroundColor: '#34D399', color: '#0F0B1E' }}
      >
        {'Pr\u00F3xima aula \u2192'}
      </button>

      {/* Dots navigation */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366F1' }} />
      </div>
    </div>
  );
};
