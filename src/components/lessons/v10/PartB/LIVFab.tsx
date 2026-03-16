import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { LivAvatar } from '@/components/LivAvatar';

export type LivPulseMode = 'normal' | 'intense';

interface LIVFabProps {
  hasWarnings: boolean;
  onClick: () => void;
  pulseMode?: LivPulseMode;
}

const LIVFab: React.FC<LIVFabProps> = ({ hasWarnings, onClick, pulseMode = 'normal' }) => {
  const isIntense = pulseMode === 'intense';

  return (
    <>
      {/* LivAvatar — play/pause toggle */}
      <button
        type="button"
        onClick={onTogglePlay}
        className="fixed z-[9999] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-full transition-transform active:scale-90"
        style={{
          right: pos.avatarRight,
          bottom: pos.avatarBottom,
        }}
        aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
      >
        {/* Gradient pulsing ring */}
        <span
          className="rounded-full flex items-center justify-center w-full h-full"
          style={{
            padding: 3,
            background: isIntense
              ? 'linear-gradient(135deg, #10B981, #34D399)'
              : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            animation: isIntense
              ? 'liv-pulse-intense 0.6s ease-in-out infinite'
              : 'liv-pulse 2s ease-in-out infinite',
          }}
        >
          <span className="w-full h-full rounded-full bg-[#1E1B2E] flex items-center justify-center text-xl">
            &#x1F916;
          </span>
        </span>
      </button>

      {/* Gradient menu button — opens LIVSheet */}
      <button
        type="button"
        onClick={onOpenSheet}
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
