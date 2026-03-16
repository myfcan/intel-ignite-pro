import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { LivAvatar } from '@/components/LivAvatar';

export type LivPulseMode = 'normal' | 'intense';

interface LIVFabProps {
  hasWarnings: boolean;
  onClick: () => void;
  pulseMode?: LivPulseMode;
  stepNumber?: number;
}

function useResponsivePosition() {
  const [pos, setPos] = useState({ avatarRight: 44, buttonRight: 50, avatarBottom: 175, buttonBottom: 124 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setPos({ avatarRight: 80, buttonRight: 86, avatarBottom: 185, buttonBottom: 134 });
      } else if (w >= 768) {
        setPos({ avatarRight: 68, buttonRight: 74, avatarBottom: 180, buttonBottom: 129 });
      } else if (w >= 480) {
        setPos({ avatarRight: 56, buttonRight: 62, avatarBottom: 175, buttonBottom: 124 });
      } else {
        setPos({ avatarRight: 44, buttonRight: 50, avatarBottom: 175, buttonBottom: 124 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return pos;
}

const LIVFab: React.FC<LIVFabProps> = ({ hasWarnings, onClick, pulseMode = 'normal', stepNumber = 1 }) => {
  const isIntense = pulseMode === 'intense';
  const pos = useResponsivePosition();

  return (
    <>
      {/* LivAvatar — pulsing indicator */}
      <button
        type="button"
        onClick={onClick}
        className="fixed z-[9999] w-14 h-14 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-full transition-transform active:scale-90"
        style={{
          right: pos.avatarRight,
          bottom: pos.avatarBottom,
          animation: isIntense
            ? 'liv-pulse-intense 0.6s ease-in-out infinite'
            : 'liv-pulse 2s ease-in-out infinite',
        }}
        aria-label="Abrir assistente LIV"
      >
        <LivAvatar size="small" showHalo={false} enableHover={false} animate={false} />
      </button>

      {/* Gradient menu button — opens LIVSheet */}
      <button
        type="button"
        onClick={onClick}
        className="fixed z-[9999] w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        style={{
          right: pos.buttonRight,
          bottom: pos.buttonBottom,
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
