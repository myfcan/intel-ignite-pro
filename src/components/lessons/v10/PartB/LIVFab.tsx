import React from 'react';
import { List } from 'lucide-react';
import { LivAvatar } from '@/components/LivAvatar';

export type LivPulseMode = 'normal' | 'intense';

interface LIVFabProps {
  hasWarnings: boolean;
  onClick: () => void;
  pulseMode?: LivPulseMode;
  stepNumber?: number;
}

const LIVFab: React.FC<LIVFabProps> = ({ hasWarnings, onClick, pulseMode = 'normal', stepNumber = 1 }) => {
  const isIntense = pulseMode === 'intense';

  return (
    <>
      {/* FAB stack — avatar + menu button, vertically grouped with proper spacing */}
      <div className="absolute z-50 right-4 bottom-[5.5rem] flex flex-col items-center gap-2">
        {/* LivAvatar — pulsing indicator */}
        <button
          type="button"
          onClick={onClick}
          className="w-14 h-14 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-full transition-transform active:scale-90"
          style={{
            animation: isIntense
              ? 'liv-pulse-intense 0.6s ease-in-out infinite'
              : 'liv-pulse 2s ease-in-out infinite',
          }}
          aria-label="Abrir assistente LIV"
        >
          <LivAvatar size="small" showHalo={false} enableHover={false} animate={false} className="pt-0 scale-[0.72]" />
        </button>

        {/* Gradient menu button — opens LIVSheet */}
        <button
          type="button"
          onClick={onClick}
          className="relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          style={{
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
          }}
          aria-label="Abrir menu LIV"
        >
          <List size={20} className="text-white" strokeWidth={2.5} />

          {/* Badge — warning dot or step number */}
          {hasWarnings ? (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center text-[9px] font-black text-[#1E1B2E]"
              style={{ animation: 'liv-status-pulse 2s ease-in-out infinite' }}
            >
              !
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-purple-600">
              {stepNumber}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes liv-status-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
        }
        @keyframes liv-pulse-intense {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); transform: scale(1); }
          50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); transform: scale(1.08); }
        }
      `}</style>
    </>
  );
};

export default LIVFab;
