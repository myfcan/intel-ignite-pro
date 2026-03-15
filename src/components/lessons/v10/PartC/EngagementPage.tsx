import React from 'react';

interface EngagementPageProps {
  isActive: boolean;
  lessonTitle: string;
  stats: { steps: number; minutes: number; code: boolean };
  onContinue: () => void;
}

/**
 * EngagementPage (C2) — Emotional engagement screen.
 *
 * Large emoji with pop animation, stats row, highlight card.
 */
export const EngagementPage: React.FC<EngagementPageProps> = ({
  isActive,
  lessonTitle,
  stats,
  onContinue,
}) => {
  return (
    <div
      className="flex-col items-center w-full min-h-full px-6 py-10"
      style={{ display: isActive ? 'flex' : 'none' }}
    >
      <style>{`
        @keyframes emoji-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .emoji-pop {
          animation: emoji-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Emoji */}
      <div className="text-6xl mb-6 emoji-pop" role="img" aria-label="rocket">
        {'\uD83D\uDE80'}
      </div>

      {/* Title */}
      <h2
        className="text-white font-bold text-center mb-2"
        style={{ fontSize: 28 }}
      >
        Isso foi incr&#237;vel.
      </h2>

      {/* Subtitle */}
      <p className="text-white/50 text-sm text-center mb-8 max-w-[300px] leading-relaxed">
        Voc&#234; completou todos os passos e dominou um novo conceito. Isso &#233; progresso real.
      </p>

      {/* Highlight card with gradient border */}
      <div
        className="w-full max-w-[340px] rounded-xl p-[1px] mb-8"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        <div
          className="rounded-xl px-5 py-4"
          style={{ backgroundColor: '#1A1530' }}
        >
          <p className="text-white text-sm leading-relaxed">
            Voc&#234; aprendeu a criar <span className="text-indigo-400 font-semibold">{lessonTitle}</span> do zero, passo a passo, sem escrever c&#243;digo.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="w-full max-w-[340px] grid grid-cols-3 gap-3 mb-8">
        <div className="flex flex-col items-center rounded-xl py-3 bg-white/5">
          <span className="text-white font-bold text-lg">{stats.steps}</span>
          <span className="text-white/40 text-xs mt-0.5">passos</span>
        </div>
        <div className="flex flex-col items-center rounded-xl py-3 bg-white/5">
          <span className="text-white font-bold text-lg">{stats.minutes}</span>
          <span className="text-white/40 text-xs mt-0.5">minutos</span>
        </div>
        <div className="flex flex-col items-center rounded-xl py-3 bg-white/5">
          <span className="text-white font-bold text-lg">0</span>
          <span className="text-white/40 text-xs mt-0.5">c&#243;digo</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dots navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366F1' }} />
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-[340px] min-h-[44px] py-3 rounded-xl text-white font-semibold text-base transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        Ver minha conquista
      </button>
    </div>
  );
};
