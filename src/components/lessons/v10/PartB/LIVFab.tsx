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
      <div className="absolute z-50 right-4 bottom-[5.5rem] flex flex-col items-center gap-3">
        {/* LivAvatar — pulsing indicator */}
        <button
          type="button"
          onClick={onClick}
          className="w-12 h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-transform active:scale-90 shadow-md"
          style={{
            animation: isIntense
              ? 'liv-fab-pulse-intense 0.6s ease-in-out infinite'
              : 'liv-fab-pulse 2s ease-in-out infinite',
            boxShadow: isIntense
              ? '0 0 16px rgba(16, 185, 129, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              : '0 0 12px rgba(139, 92, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          aria-label="Abrir assistente LIV"
        >
          <LivAvatar size="small" showHalo={false} enableHover={false} animate={false} className="pt-0 scale-[0.65]" />
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
        @keyframes liv-fab-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(139, 92, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: scale(1); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: scale(1.04); }
        }
        @keyframes liv-fab-pulse-intense {
          0%, 100% { box-shadow: 0 0 16px rgba(16, 185, 129, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: scale(1); }
          50% { box-shadow: 0 0 24px rgba(16, 185, 129, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: scale(1.08); }
        }
      `}</style>
    </>
  );
};

export default LIVFab;
