import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PlayerHeaderProps {
  lessonTitle: string;
  progressPercent: number;
  phases: string[];
  currentPhase: number;
  onBack: () => void;
  onExit?: () => void;
}

const GRADIENT = 'linear-gradient(135deg, #6366F1, #8B5CF6)';

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  lessonTitle,
  progressPercent,
  phases,
  currentPhase,
  onBack,
  onExit,
}) => {
  const [showExitModal, setShowExitModal] = useState(false);

  return (
    <>
      <div
        className="shrink-0 w-full px-4 pt-3 pb-2"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Top row: back button + title + exit button */}
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white"
            style={{ background: GRADIENT }}
            aria-label="Voltar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-500">
              AILIV
            </span>
            <span className="text-sm font-semibold text-gray-800 truncate">
              {lessonTitle}
            </span>
          </div>

          {onExit && (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Sair da aula"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              background: GRADIENT,
            }}
          />
        </div>

        {/* Phase dots */}
        {phases.length > 0 && (
          <div className="flex items-center gap-1.5">
            {phases.map((phase, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentPhase
                      ? 'bg-indigo-500'
                      : i === currentPhase
                        ? 'bg-indigo-400 ring-2 ring-indigo-200'
                        : 'bg-gray-300'
                  }`}
                />
                <span
                  className={`text-[9px] font-medium ${
                    i <= currentPhase ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                >
                  {phase}
                </span>
                {i < phases.length - 1 && (
                  <div
                    className={`w-3 h-px ${
                      i < currentPhase ? 'bg-indigo-400' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exit confirmation modal */}
      <AlertDialog open={showExitModal} onOpenChange={setShowExitModal}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">
              Sair da aula?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-500">
              Seu progresso foi salvo automaticamente. Você poderá continuar de onde parou a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel className="w-full rounded-xl border-gray-200 text-gray-700 font-medium">
              Continuar aula
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onExit?.()}
              className="w-full rounded-xl font-medium"
              style={{ background: GRADIENT }}
            >
              Sair da aula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlayerHeader;
