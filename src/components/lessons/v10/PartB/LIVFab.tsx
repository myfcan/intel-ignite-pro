import React from 'react';
import { List } from 'lucide-react';
import livAvatarImg from '@/assets/liv-avatar.png';

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
      <div className="absolute z-50 right-4 bottom-[8.5rem] flex flex-col items-center gap-3">
        {/* LivAvatar — pulsing indicator */}
        <div className="relative">
          {/* Speaking ripple rings — positioned relative to avatar */}
          {isIntense && (
            <>
              <span
                className="absolute -inset-1 rounded-full pointer-events-none"
                style={{ animation: 'liv-speak-ring 1.9s ease-out infinite', border: '2px solid rgba(99, 102, 241, 0.42)' }}
              />
              <span
                className="absolute -inset-1 rounded-full pointer-events-none"
                style={{ animation: 'liv-speak-ring 1.9s ease-out 0.7s infinite', border: '2px solid rgba(99, 102, 241, 0.24)' }}
              />
            </>
          )}
          <button
            type="button"
            onClick={onClick}
            className="relative w-16 h-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-transform active:scale-90"
            style={{
              animation: isIntense
                ? 'liv-fab-pulse-intense 0.6s ease-in-out infinite'
                : 'liv-fab-pulse 2s ease-in-out infinite',
              boxShadow: isIntense
                ? '0 0 20px rgba(16, 185, 129, 0.45), 0 6px 12px -2px rgba(0, 0, 0, 0.15)'
                : '0 0 16px rgba(139, 92, 246, 0.35), 0 6px 12px -2px rgba(0, 0, 0, 0.15)',
            }}
            aria-label="Abrir assistente LIV"
          >
            <img src={livAvatarImg} alt="Liv" className="w-full h-full object-cover" />
          </button>
        </div>

        {/* Gradient menu button — opens LIVSheet */}
        <button
          type="button"
          onClick={onClick}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          style={{
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            boxShadow: '0 0 14px rgba(139, 92, 246, 0.3), 0 8px 16px -4px rgba(0, 0, 0, 0.2)',
          }}
          aria-label="Abrir menu LIV"
        >
          <List size={24} className="text-white" strokeWidth={2.5} />

          {/* Badge — warning dot or step number */}
          {hasWarnings ? (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-[10px] font-black text-[#1E1B2E]"
              style={{ animation: 'liv-status-pulse 2s ease-in-out infinite' }}
            >
              !
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-purple-600 shadow-sm">
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
        @keyframes liv-fab-pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(139, 92, 246, 0.35), 0 6px 12px -2px rgba(0, 0, 0, 0.15); transform: scale(1); }
          50% { box-shadow: 0 0 24px rgba(139, 92, 246, 0.55), 0 6px 12px -2px rgba(0, 0, 0, 0.15); transform: scale(1.04); }
        }
        @keyframes liv-fab-pulse-intense {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.45), 0 6px 12px -2px rgba(0, 0, 0, 0.15); transform: scale(1); }
          50% { box-shadow: 0 0 26px rgba(16, 185, 129, 0.55), 0 6px 12px -2px rgba(0, 0, 0, 0.15); transform: scale(1.04); }
        }
        @keyframes liv-speak-ring {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default LIVFab;
