import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useAudioFirstLock — Audio-First UX hook for V8 exercises in "listen" mode.
 * Locks interactions until the narration audio finishes playing.
 * Returns `justUnlocked` for a 1.5s window after unlock for visual feedback.
 */
export function useAudioFirstLock(
  audioUrl: string | undefined | null,
  isActiveAudio: boolean
) {
  const shouldLock = isActiveAudio && !!audioUrl;
  const [audioLocked, setAudioLocked] = useState(shouldLock);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset lock when audioUrl or active state changes
  useEffect(() => {
    setAudioLocked(shouldLock);
    setJustUnlocked(false);
  }, [shouldLock]);

  // Cleanup timer
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const onAudioEnded = useCallback(() => {
    setAudioLocked(false);
    setJustUnlocked(true);
    timerRef.current = setTimeout(() => setJustUnlocked(false), 1500);
  }, []);

  return { audioLocked, justUnlocked, onAudioEnded };
}
