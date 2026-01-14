// useV7SoundEffects - Contextual sound effects for V7 cinematic experience
// Provides: transition sounds, UI feedback, ambient, and dramatic effects

import { useCallback, useRef, useEffect } from "react";

type SoundType = 
  | "transition-whoosh"
  | "transition-dramatic"
  | "click-soft"
  | "click-confirm"
  | "success"
  | "error"
  | "reveal"
  | "count-up"
  | "ambient-low"
  | "dramatic-hit"
  | "quiz-correct"
  | "quiz-wrong"
  | "progress-tick"
  | "completion"
  | "letter-reveal";

interface SoundConfig {
  volume: number;
  pitch?: number;
}

// Web Audio API-based sound synthesis (no external files needed)
const createOscillatorSound = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3
): void => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const createNoiseSound = (
  ctx: AudioContext,
  duration: number,
  volume: number = 0.1
): void => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  source.start();
  source.stop(ctx.currentTime + duration);
};

export const useV7SoundEffects = (masterVolume: number = 0.5, enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isUnlockedRef = useRef(false);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Unlock audio on user interaction
  const unlockAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
        console.log('[useV7SoundEffects] ✅ AudioContext resumed');
      } catch (e) {
        console.warn('[useV7SoundEffects] Failed to resume AudioContext:', e);
      }
    }
    isUnlockedRef.current = true;
  }, [getAudioContext]);

  // Play synthesized sounds - with auto-resume
  const playSound = useCallback(async (type: SoundType, config?: Partial<SoundConfig>) => {
    if (!enabled) return;
    
    const ctx = getAudioContext();
    
    // ✅ Auto-resume if suspended (fixes sound not playing issue)
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
        isUnlockedRef.current = true;
        console.log('[useV7SoundEffects] ✅ Auto-resumed AudioContext for sound:', type);
      } catch (e) {
        console.warn('[useV7SoundEffects] ⚠️ Cannot resume AudioContext:', e);
        return;
      }
    }

    const volume = (config?.volume ?? 1) * masterVolume;

    switch (type) {
      case "transition-whoosh":
        // Sweeping whoosh sound
        createNoiseSound(ctx, 0.4, volume * 0.3);
        createOscillatorSound(ctx, 200, 0.3, "sine", volume * 0.2);
        break;

      case "transition-dramatic":
        // Deep dramatic hit
        createOscillatorSound(ctx, 80, 0.8, "sine", volume * 0.5);
        createOscillatorSound(ctx, 160, 0.5, "triangle", volume * 0.3);
        createNoiseSound(ctx, 0.3, volume * 0.2);
        break;

      case "click-soft":
        createOscillatorSound(ctx, 800, 0.05, "sine", volume * 0.2);
        break;

      case "click-confirm":
        createOscillatorSound(ctx, 600, 0.08, "sine", volume * 0.3);
        setTimeout(() => {
          createOscillatorSound(ctx, 900, 0.08, "sine", volume * 0.3);
        }, 50);
        break;

      case "success":
        // Ascending tones
        createOscillatorSound(ctx, 523, 0.15, "sine", volume * 0.3);
        setTimeout(() => createOscillatorSound(ctx, 659, 0.15, "sine", volume * 0.3), 100);
        setTimeout(() => createOscillatorSound(ctx, 784, 0.2, "sine", volume * 0.4), 200);
        break;

      case "error":
        // Descending tones
        createOscillatorSound(ctx, 400, 0.2, "sawtooth", volume * 0.2);
        setTimeout(() => createOscillatorSound(ctx, 300, 0.3, "sawtooth", volume * 0.2), 150);
        break;

      case "reveal":
        // Magic reveal sound
        createOscillatorSound(ctx, 300, 0.5, "sine", volume * 0.2);
        createOscillatorSound(ctx, 450, 0.4, "sine", volume * 0.15);
        createOscillatorSound(ctx, 600, 0.3, "sine", volume * 0.1);
        createNoiseSound(ctx, 0.2, volume * 0.1);
        break;

      case "count-up":
        // Quick tick for counting
        createOscillatorSound(ctx, 1200 + Math.random() * 200, 0.03, "sine", volume * 0.15);
        break;

      case "ambient-low":
        // Low ambient hum
        createOscillatorSound(ctx, 60, 2, "sine", volume * 0.05);
        break;

      case "dramatic-hit":
        // Big dramatic impact
        createOscillatorSound(ctx, 50, 1, "sine", volume * 0.6);
        createOscillatorSound(ctx, 100, 0.8, "triangle", volume * 0.4);
        createNoiseSound(ctx, 0.5, volume * 0.3);
        break;

      case "quiz-correct":
        // Happy correct answer
        createOscillatorSound(ctx, 523, 0.1, "sine", volume * 0.3);
        setTimeout(() => createOscillatorSound(ctx, 659, 0.1, "sine", volume * 0.3), 80);
        setTimeout(() => createOscillatorSound(ctx, 784, 0.15, "sine", volume * 0.4), 160);
        setTimeout(() => createOscillatorSound(ctx, 1047, 0.2, "sine", volume * 0.5), 240);
        break;

      case "quiz-wrong":
        // Wrong answer buzz
        createOscillatorSound(ctx, 200, 0.3, "sawtooth", volume * 0.15);
        createOscillatorSound(ctx, 150, 0.4, "sawtooth", volume * 0.1);
        break;

      case "progress-tick":
        createOscillatorSound(ctx, 1000, 0.02, "sine", volume * 0.1);
        break;

      case "completion":
        // Grand completion fanfare
        createOscillatorSound(ctx, 523, 0.2, "sine", volume * 0.3);
        setTimeout(() => {
          createOscillatorSound(ctx, 659, 0.2, "sine", volume * 0.3);
          createOscillatorSound(ctx, 784, 0.3, "sine", volume * 0.35);
        }, 150);
        setTimeout(() => {
          createOscillatorSound(ctx, 1047, 0.4, "sine", volume * 0.4);
          createNoiseSound(ctx, 0.2, volume * 0.1);
        }, 300);
        break;

      case "letter-reveal":
        // Magical letter reveal - ascending sparkle
        const basePitch = config?.pitch ?? 1;
        const letterFreq = 400 + (basePitch * 100); // Higher pitch for later letters
        createOscillatorSound(ctx, letterFreq, 0.15, "sine", volume * 0.35);
        createOscillatorSound(ctx, letterFreq * 1.5, 0.12, "triangle", volume * 0.2);
        setTimeout(() => {
          createOscillatorSound(ctx, letterFreq * 2, 0.1, "sine", volume * 0.15);
        }, 50);
        break;
    }
  }, [enabled, masterVolume, getAudioContext]);

  // Auto-unlock on first interaction
  useEffect(() => {
    const handler = () => unlockAudio();
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [unlockAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    unlockAudio,
  };
};
