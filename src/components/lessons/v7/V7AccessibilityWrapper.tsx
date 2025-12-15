// src/components/lessons/v7/V7AccessibilityWrapper.tsx
// Accessibility wrapper with ARIA labels, keyboard navigation, and screen reader support

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7AccessibilityWrapperProps {
  children: React.ReactNode;
  lessonTitle: string;
  currentActTitle: string;
  currentActIndex: number;
  totalActs: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onNextAct: () => void;
  onPreviousAct: () => void;
  onVolumeChange: (volume: number) => void;
  volume: number;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: ('ctrl' | 'alt' | 'shift')[];
}

export const V7AccessibilityWrapper = ({
  children,
  lessonTitle,
  currentActTitle,
  currentActIndex,
  totalActs,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
  onNextAct,
  onPreviousAct,
  onVolumeChange,
  volume,
}: V7AccessibilityWrapperProps) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      description: 'Reproduzir/Pausar',
      action: () => {
        if (isPlaying) {
          onPause();
          announce('Pausado');
        } else {
          onPlay();
          announce('Reproduzindo');
        }
      },
    },
    {
      key: 'ArrowRight',
      description: 'Avançar 10 segundos',
      action: () => {
        const newTime = Math.min(currentTime + 10, duration);
        onSeek(newTime);
        announce(`Avançado para ${formatTime(newTime)}`);
      },
    },
    {
      key: 'ArrowLeft',
      description: 'Retroceder 10 segundos',
      action: () => {
        const newTime = Math.max(currentTime - 10, 0);
        onSeek(newTime);
        announce(`Retrocedido para ${formatTime(newTime)}`);
      },
    },
    {
      key: 'ArrowUp',
      description: 'Aumentar volume',
      action: () => {
        const newVolume = Math.min(volume + 0.1, 1);
        onVolumeChange(newVolume);
        announce(`Volume: ${Math.round(newVolume * 100)}%`);
      },
    },
    {
      key: 'ArrowDown',
      description: 'Diminuir volume',
      action: () => {
        const newVolume = Math.max(volume - 0.1, 0);
        onVolumeChange(newVolume);
        announce(`Volume: ${Math.round(newVolume * 100)}%`);
      },
    },
    {
      key: 'n',
      description: 'Próximo ato',
      action: () => {
        if (currentActIndex < totalActs - 1) {
          onNextAct();
          announce(`Próximo ato: ${currentActIndex + 2} de ${totalActs}`);
        }
      },
    },
    {
      key: 'p',
      description: 'Ato anterior',
      action: () => {
        if (currentActIndex > 0) {
          onPreviousAct();
          announce(`Ato anterior: ${currentActIndex} de ${totalActs}`);
        }
      },
    },
    {
      key: 'm',
      description: 'Mutar/Desmutar',
      action: () => {
        if (volume > 0) {
          onVolumeChange(0);
          announce('Áudio mutado');
        } else {
          onVolumeChange(1);
          announce('Áudio desmutado');
        }
      },
    },
    {
      key: 'f',
      description: 'Tela cheia',
      action: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          announce('Saiu da tela cheia');
        } else {
          containerRef.current?.requestFullscreen();
          announce('Modo tela cheia');
        }
      },
    },
    {
      key: '?',
      description: 'Mostrar atalhos',
      action: () => {
        setShowShortcuts((prev) => !prev);
      },
    },
    {
      key: 'Escape',
      description: 'Fechar modais',
      action: () => {
        setShowShortcuts(false);
      },
    },
  ];

  // Number keys for seeking percentage
  for (let i = 0; i <= 9; i++) {
    shortcuts.push({
      key: i.toString(),
      description: `Ir para ${i * 10}% da aula`,
      action: () => {
        const newTime = (duration * i) / 10;
        onSeek(newTime);
        announce(`Indo para ${i * 10}% - ${formatTime(newTime)}`);
      },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} minuto${mins !== 1 ? 's' : ''} e ${secs} segundo${secs !== 1 ? 's' : ''}`;
  };

  const formatTimeShort = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // KEYBOARD HANDLER
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focused on input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find((s) => {
        if (s.key !== e.key) return false;
        if (s.modifiers) {
          const hasCtrl = s.modifiers.includes('ctrl') === e.ctrlKey;
          const hasAlt = s.modifiers.includes('alt') === e.altKey;
          const hasShift = s.modifiers.includes('shift') === e.shiftKey;
          return hasCtrl && hasAlt && hasShift;
        }
        return true;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isPlaying, currentTime, volume, currentActIndex]);

  // Announce act changes
  useEffect(() => {
    announce(`Ato ${currentActIndex + 1} de ${totalActs}: ${currentActTitle}`);
  }, [currentActIndex, currentActTitle, totalActs, announce]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className="v7-accessibility-wrapper relative w-full h-full"
      role="application"
      aria-label={`Aula interativa: ${lessonTitle}`}
      aria-describedby="v7-lesson-description"
    >
      {/* Screen reader only description */}
      <div id="v7-lesson-description" className="sr-only">
        <p>
          Esta é uma aula interativa com {totalActs} atos. 
          Use as teclas de seta para navegar, Espaço para reproduzir ou pausar, 
          e a tecla de interrogação para ver todos os atalhos disponíveis.
        </p>
        <p>
          Ato atual: {currentActIndex + 1} de {totalActs} - {currentActTitle}.
          Tempo: {formatTimeShort(currentTime)} de {formatTimeShort(duration)}.
        </p>
      </div>

      {/* Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Skip links */}
      <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50">
        <a
          href="#v7-main-content"
          className="bg-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
        >
          Pular para o conteúdo principal
        </a>
        <a
          href="#v7-controls"
          className="bg-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white ml-2"
        >
          Pular para os controles
        </a>
      </div>

      {/* Main content */}
      <div id="v7-main-content" tabIndex={-1}>
        {children}
      </div>

      {/* Keyboard shortcuts help modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-label="Atalhos de teclado"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Atalhos de Teclado</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-gray-400 hover:text-white p-2"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Playback shortcuts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Reprodução</h3>
                  <ShortcutRow keyLabel="Espaço" description="Reproduzir/Pausar" />
                  <ShortcutRow keyLabel="←" description="Retroceder 10s" />
                  <ShortcutRow keyLabel="→" description="Avançar 10s" />
                  <ShortcutRow keyLabel="0-9" description="Ir para 0-90% da aula" />
                </div>

                <div className="border-t border-gray-700 my-4" />

                {/* Navigation shortcuts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Navegação</h3>
                  <ShortcutRow keyLabel="N" description="Próximo ato" />
                  <ShortcutRow keyLabel="P" description="Ato anterior" />
                </div>

                <div className="border-t border-gray-700 my-4" />

                {/* Volume shortcuts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Volume</h3>
                  <ShortcutRow keyLabel="↑" description="Aumentar volume" />
                  <ShortcutRow keyLabel="↓" description="Diminuir volume" />
                  <ShortcutRow keyLabel="M" description="Mutar/Desmutar" />
                </div>

                <div className="border-t border-gray-700 my-4" />

                {/* Other shortcuts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Outros</h3>
                  <ShortcutRow keyLabel="F" description="Tela cheia" />
                  <ShortcutRow keyLabel="?" description="Mostrar atalhos" />
                  <ShortcutRow keyLabel="Esc" description="Fechar modais" />
                </div>
              </div>

              <p className="text-gray-500 text-xs mt-6 text-center">
                Pressione Esc ou ? para fechar este painel
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut hint button (visible on desktop) */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="hidden lg:flex absolute top-4 right-4 z-40 items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
        aria-label="Ver atalhos de teclado"
      >
        <kbd className="bg-gray-700 px-2 py-0.5 rounded text-xs">?</kbd>
        <span>Atalhos</span>
      </button>
    </div>
  );
};

// ============================================================================
// SHORTCUT ROW COMPONENT
// ============================================================================

const ShortcutRow = ({ keyLabel, description }: { keyLabel: string; description: string }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-gray-300 text-sm">{description}</span>
    <kbd className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-mono min-w-[32px] text-center">
      {keyLabel}
    </kbd>
  </div>
);

// ============================================================================
// SCREEN READER ONLY STYLES
// ============================================================================

// Add these styles to your global CSS or Tailwind config:
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }
