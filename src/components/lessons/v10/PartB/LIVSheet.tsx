import React, { useState } from 'react';
import type { V10Liv, V10Warning } from '../../../../types/v10.types';

interface LIVSheetProps {
  isOpen: boolean;
  onClose: () => void;
  liv: V10Liv;
  warnings: V10Warning | null;
  onAskLiv: (question: string) => void;
}

type OptionKey = 'tip' | 'analogy' | 'sos' | null;

interface OptionItem {
  key: OptionKey;
  icon: string;
  title: string;
  subtitle: string;
}

const OPTIONS: OptionItem[] = [
  {
    key: 'tip',
    icon: '\u{1F4A1}',
    title: 'Dica rápida',
    subtitle: 'Uma dica curta para este passo',
  },
  {
    key: 'analogy',
    icon: '\u{1F504}',
    title: 'Explica diferente',
    subtitle: 'Uma analogia para entender melhor',
  },
  {
    key: 'sos',
    icon: '\u{1F198}',
    title: 'Perguntar à LIV',
    subtitle: 'Ajuda detalhada da LIV',
  },
];

const LIVSheet: React.FC<LIVSheetProps> = ({
  isOpen,
  onClose,
  liv,
  warnings,
  onAskLiv,
}) => {
  const [expanded, setExpanded] = useState<OptionKey>(null);

  const handleClose = () => {
    setExpanded(null);
    onClose();
  };

  const handleOptionClick = (key: OptionKey) => {
    setExpanded(key);
    if (key === 'sos') {
      onAskLiv(liv.sos);
    }
  };

  const getContent = (key: OptionKey): string => {
    switch (key) {
      case 'tip':
        return liv.tip;
      case 'analogy':
        return liv.analogy;
      case 'sos':
        return liv.sos;
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        display: isOpen ? 'flex' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      className="fixed inset-0 z-50 flex-col justify-end"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="LIV Assistente"
    >
      {/* Sheet */}
      <div
        className="w-full max-w-[420px] mx-auto rounded-t-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#1E1B2E', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Title row */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <span className="text-xl">&#x1F916;</span>
          <span className="text-base font-bold text-white">LIV</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Ajuda
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Back button when expanded */}
          {expanded !== null && (
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="flex items-center gap-1.5 mb-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors min-h-[44px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Voltar</span>
            </button>
          )}

          {/* Option items or expanded content */}
          {expanded === null ? (
            <div className="flex flex-col gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleOptionClick(opt.key)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left min-h-[44px]"
                >
                  <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-lg">
                    {opt.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white">
                      {opt.title}
                    </span>
                    <span className="text-xs text-white/50">{opt.subtitle}</span>
                  </div>
                  <svg
                    className="shrink-0 ml-auto w-4 h-4 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-1 py-2 rounded-xl bg-white/5">
              <p className="text-sm text-white/80 leading-relaxed px-3 py-2">
                {getContent(expanded)}
              </p>
            </div>
          )}

          {/* Warnings section (always visible when not expanded) */}
          {expanded === null && warnings && (
            <div className="mt-4 flex flex-col gap-3">
              {/* Warning card */}
              {warnings.warn && (
                <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#x26A0;</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Aviso
                    </span>
                    <span className="text-sm text-white/70">
                      {warnings.warn}
                    </span>
                  </div>
                </div>
              )}

              {/* IF/THEN card */}
              {warnings.ift && (
                <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    {warnings.ift.tag}
                  </span>
                  <p className="text-sm text-white/70">{warnings.ift.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Ação:
                    </span>
                    <span className="text-xs text-white/60">
                      {warnings.ift.act}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LIVSheet;
