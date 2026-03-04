import { useState, useEffect, useCallback } from "react";

/**
 * useAudioFirstLock — Audio-First UX hook for V8 exercises in "listen" mode.
 * Locks interactions until the narration audio finishes playing.
 * 
 * @param audioUrl - The audio URL for the exercise narration
 * @param isActiveAudio - Whether this component should play audio (listen mode + active)
 * @returns { audioLocked, onAudioEnded } — lock state and callback to pass to V8AudioPlayer's onEnded
 */
export function useAudioFirstLock(
  audioUrl: string | undefined | null,
  isActiveAudio: boolean
) {
  const shouldLock = isActiveAudio && !!audioUrl;
  const [audioLocked, setAudioLocked] = useState(shouldLock);

  // Reset lock when audioUrl or active state changes
  useEffect(() => {
    setAudioLocked(shouldLock);
  }, [shouldLock]);

  const onAudioEnded = useCallback(() => {
    setAudioLocked(false);
  }, []);

  return { audioLocked, onAudioEnded };
}
