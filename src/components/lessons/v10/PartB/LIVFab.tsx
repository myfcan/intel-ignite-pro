import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { LivAvatar } from '@/components/LivAvatar';

interface LIVFabProps {
  hasWarnings: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenSheet: () => void;
  stepNumber: number;
}

/** Responsive positioning hook matching V5 MobileSectionDrawer pattern */
function useResponsivePosition() {
  const [pos, setPos] = useState({ avatarRight: 24, buttonRight: 31, avatarBottom: 160, buttonBottom: 104 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setPos({ avatarRight: 50, buttonRight: 57, avatarBottom: 175, buttonBottom: 119 });
      } else if (w >= 768) {
        setPos({ avatarRight: 38, buttonRight: 45, avatarBottom: 170, buttonBottom: 114 });
      } else if (w >= 480) {
        setPos({ avatarRight: 26, buttonRight: 33, avatarBottom: 165, buttonBottom: 109 });
      } else {
        setPos({ avatarRight: 14, buttonRight: 21, avatarBottom: 165, buttonBottom: 109 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return pos;
}

const LIVFab: React.FC<LIVFabProps> = ({
  hasWarnings,
  isPlaying,
  onTogglePlay,
  onOpenSheet,
  stepNumber,
}) => {
  const pos = useResponsivePosition();

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
        <div className="relative">
          <LivAvatar
            size="small"
            state={isPlaying ? 'speaking' : 'idle'}
            theme="automacoes"
            animate={false}
            enableHover={false}
            showHalo={false}
            className={!isPlaying ? 'grayscale opacity-70' : ''}
          />
          {/* Status dot — top-left of avatar */}
          <span
            className={`absolute top-0 left-0 w-3 h-3 rounded-full border-2 border-[#1E1B2E] ${
              isPlaying
                ? 'bg-emerald-400'
                : 'bg-white/30'
            }`}
            style={isPlaying ? { animation: 'liv-status-pulse 2s ease-in-out infinite' } : undefined}
          />
        </div>
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
      `}</style>
    </>
  );
};

export default LIVFab;
