import React from 'react';

interface LIVFabProps {
  hasWarnings: boolean;
  onClick: () => void;
}

const LIVFab: React.FC<LIVFabProps> = ({ hasWarnings, onClick }) => {
  return (
    <div className="absolute bottom-28 right-4 z-30 w-[52px] h-[52px]">
      <button
        type="button"
        onClick={onClick}
        className="w-full h-full flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        aria-label="Abrir assistente LIV"
      >
        {/* Gradient pulsing ring */}
        <span
          className="rounded-full flex items-center justify-center w-full h-full"
          style={{
            padding: 3,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            animation: 'liv-pulse 2s ease-in-out infinite',
          }}
        >
          <span className="w-full h-full rounded-full bg-[#1E1B2E] flex items-center justify-center text-xl">
            &#x1F916;
          </span>
        </span>
      </button>

      {/* Green dot indicator — top-right of the FAB */}
      {hasWarnings && (
        <span
          className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1E1B2E]"
          style={{ display: 'block', marginTop: -48, marginLeft: 38 }}
        />
      )}

      <style>{`
        @keyframes liv-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }
      `}</style>
    </div>
  );
};

export default LIVFab;
