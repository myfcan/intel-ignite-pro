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

interface ExitButtonProps {
  onExit: () => void;
}

const GRADIENT = 'linear-gradient(135deg, #6366F1, #8B5CF6)';

/**
 * Shared exit button (X) + confirmation modal for all V10 lesson parts.
 * Renders a fixed top-right X button over dark backgrounds.
 */
export const ExitButton: React.FC<ExitButtonProps> = ({ onExit }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Sair da aula"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">
              Sair da aula?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Seu progresso foi salvo automaticamente. Você poderá continuar de onde parou a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel className="w-full rounded-xl border-border text-foreground font-medium">
              Continuar aula
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onExit()}
              className="w-full rounded-xl font-medium text-white"
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
