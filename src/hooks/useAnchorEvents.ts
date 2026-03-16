import { useEffect, useRef, useCallback } from 'react';
import type { StepAnchor } from '@/types/v10.types';

export interface AnchorHandlers {
  onPontosAtencao: () => void;
  onConfirmacao: () => void;
  onTrocaFrame: () => void;
  onTrocaFerramenta: () => void;
}

/**
 * useAnchorEvents — Listens to audio timeupdate and fires visual events
 * when the playback reaches anchor timestamps.
 *
 * Phase 1: skeleton (structure only, no logic yet)
 * Phase 3: full implementation with timeupdate listener
 */
export function useAnchorEvents(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  anchors: StepAnchor[],
  handlers: AnchorHandlers,
) {
  const firedRef = useRef<Set<string>>(new Set());

  // Reset fired anchors when the anchor list changes (new step)
  useEffect(() => {
    firedRef.current = new Set();
  }, [anchors]);

  const fireAllAnchors = useCallback(() => {
    for (const anchor of anchors) {
      const key = `${anchor.anchor_type}_${anchor.timestamp_seconds}`;
      if (!firedRef.current.has(key)) {
        firedRef.current.add(key);
        switch (anchor.anchor_type) {
          case 'pontos_atencao': handlers.onPontosAtencao(); break;
          case 'confirmacao': handlers.onConfirmacao(); break;
          case 'troca_frame': handlers.onTrocaFrame(); break;
          case 'troca_ferramenta': handlers.onTrocaFerramenta(); break;
        }
      }
    }
  }, [anchors, handlers]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !anchors.length) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;

      for (const anchor of anchors) {
        const key = `${anchor.anchor_type}_${anchor.timestamp_seconds}`;

        if (currentTime >= anchor.timestamp_seconds && !firedRef.current.has(key)) {
          firedRef.current.add(key);

          switch (anchor.anchor_type) {
            case 'pontos_atencao': handlers.onPontosAtencao(); break;
            case 'confirmacao': handlers.onConfirmacao(); break;
            case 'troca_frame': handlers.onTrocaFrame(); break;
            case 'troca_ferramenta': handlers.onTrocaFerramenta(); break;
          }
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [audioRef, anchors, handlers]);

  return { fireAllAnchors };
}
