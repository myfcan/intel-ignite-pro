// useV7SoundEffects - Game-style sound effects for V7 cinematic experience
// Fun, juicy, Duolingo/Candy-Crush-inspired synthesized sounds
// Uses Web Audio API with rich harmonics, arpeggios, and filter sweeps

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
  | "letter-reveal"
  | "snap-success"
  | "snap-error"
  | "streak-bonus"
  | "level-up"
  | "combo-hit"
  | "timer-tick"
  | "timer-buzzer";

interface SoundConfig {
  volume: number;
  pitch?: number;
}

// ============================================================================
// GAME-STYLE SOUND PRIMITIVES
// ============================================================================

/** Play a note with ADSR envelope for musical quality */
const playNote = (
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  vol: number,
  delay: number = 0,
  detune: number = 0
) => {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (detune) osc.detune.setValueAtTime(detune, t);
  
  // ADSR: quick attack, sustain, smooth release
  const attack = Math.min(0.015, duration * 0.1);
  const release = Math.min(0.08, duration * 0.4);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + attack);
  gain.gain.setValueAtTime(vol, t + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.01);
};

/** Play a chord (multiple notes at once) */
const playChord = (
  ctx: AudioContext,
  freqs: number[],
  duration: number,
  type: OscillatorType,
  vol: number,
  delay: number = 0
) => {
  const perNote = vol / Math.sqrt(freqs.length);
  freqs.forEach(f => playNote(ctx, f, duration, type, perNote, delay));
};

/** Play an arpeggio (notes in sequence) */
const playArpeggio = (
  ctx: AudioContext,
  freqs: number[],
  noteLen: number,
  gap: number,
  type: OscillatorType,
  vol: number,
  startDelay: number = 0
) => {
  freqs.forEach((f, i) => {
    playNote(ctx, f, noteLen, type, vol, startDelay + i * gap);
  });
};

/** Filtered noise burst (whoosh, impact, etc) */
const playNoise = (
  ctx: AudioContext,
  duration: number,
  vol: number,
  filterFreqStart: number,
  filterFreqEnd: number,
  filterType: BiquadFilterType = "bandpass",
  delay: number = 0
) => {
  const t = ctx.currentTime + delay;
  const bufLen = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  filter.type = filterType;
  filter.Q.setValueAtTime(2, t);
  filter.frequency.setValueAtTime(filterFreqStart, t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(filterFreqEnd, 20), t + duration);
  
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  src.buffer = buf;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + duration + 0.01);
};

/** Pitch sweep (rising/falling tone) */
const playSweep = (
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  duration: number,
  type: OscillatorType,
  vol: number,
  delay: number = 0
) => {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.01);
};

// ============================================================================
// SHARED AUDIO CONTEXT (persists across component mounts/unmounts)
// ============================================================================

let sharedAudioContext: AudioContext | null = null;
let sharedAudioContextUsers = 0;

function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
}

// ============================================================================
// HOOK
// ============================================================================

export const useV7SoundEffects = (masterVolume: number = 0.5, enabled: boolean = true) => {
  const isUnlockedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    return getSharedAudioContext();
  }, []);

  const unlockAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('[useV7SoundEffects] Failed to resume AudioContext:', e);
      }
    }
    isUnlockedRef.current = true;
  }, [getAudioContext]);

  const playSound = useCallback(async (type: SoundType, config?: Partial<SoundConfig>) => {
    if (!enabled) return;
    
    const ctx = getAudioContext();
    
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
        isUnlockedRef.current = true;
      } catch (e) {
        return;
      }
    }

    const v = (config?.volume ?? 1) * masterVolume;

    switch (type) {
      // ────────────────────────────────────────────────────────
      // UI FEEDBACK
      // ────────────────────────────────────────────────────────
      case "click-soft":
        // Soft pop — like tapping a bubble
        playNote(ctx, 1400, 0.06, "sine", v * 0.25);
        playNote(ctx, 2100, 0.04, "sine", v * 0.12, 0.01);
        break;

      case "click-confirm":
        // Satisfying double-pop with rising pitch (Duolingo-style)
        playNote(ctx, 880, 0.06, "sine", v * 0.3);
        playNote(ctx, 1320, 0.08, "sine", v * 0.35, 0.06);
        playNote(ctx, 1760, 0.04, "triangle", v * 0.15, 0.06);
        break;

      case "progress-tick":
        // Xylophone tick
        playNote(ctx, 2400 + Math.random() * 400, 0.04, "sine", v * 0.15);
        playNote(ctx, 4800 + Math.random() * 400, 0.03, "sine", v * 0.06, 0.01);
        break;

      case "count-up":
        // Coin-counter tick (game score style)
        const tickFreq = 1800 + Math.random() * 600;
        playNote(ctx, tickFreq, 0.03, "square", v * 0.08);
        playNote(ctx, tickFreq * 2, 0.02, "sine", v * 0.06, 0.005);
        break;

      // ────────────────────────────────────────────────────────
      // TRANSITIONS
      // ────────────────────────────────────────────────────────
      case "transition-whoosh":
        // Sweeping whoosh with rising filter
        playNoise(ctx, 0.35, v * 0.25, 400, 4000, "bandpass");
        playSweep(ctx, 200, 800, 0.25, "sine", v * 0.1, 0.05);
        break;

      case "transition-dramatic":
        // Cinematic boom + sub bass
        playNote(ctx, 55, 1.0, "sine", v * 0.5);
        playNote(ctx, 110, 0.6, "triangle", v * 0.3, 0.02);
        playNoise(ctx, 0.4, v * 0.2, 200, 50, "lowpass");
        // Shimmer on top
        playNote(ctx, 880, 0.3, "sine", v * 0.08, 0.1);
        playNote(ctx, 1320, 0.25, "sine", v * 0.05, 0.15);
        break;

      case "dramatic-hit":
        // Impact + reverse reverb feel
        playNote(ctx, 40, 0.8, "sine", v * 0.6);
        playNote(ctx, 80, 0.6, "triangle", v * 0.35);
        playNoise(ctx, 0.3, v * 0.3, 600, 60, "lowpass");
        // Sparkle tail
        playArpeggio(ctx, [1200, 1600, 2000], 0.08, 0.04, "sine", v * 0.1, 0.2);
        break;

      // ────────────────────────────────────────────────────────
      // QUIZ & EXERCISES
      // ────────────────────────────────────────────────────────
      case "quiz-correct":
        // 🎮 Game-style "CORRECT!" — bright major arpeggio + sparkle
        // C5 → E5 → G5 → C6 fast arpeggio
        playArpeggio(ctx, [523, 659, 784, 1047], 0.1, 0.07, "sine", v * 0.35);
        // Harmonic shimmer
        playNote(ctx, 1047, 0.2, "triangle", v * 0.15, 0.28);
        playNote(ctx, 1568, 0.15, "sine", v * 0.1, 0.3);
        // Tiny sparkle noise
        playNoise(ctx, 0.15, v * 0.08, 3000, 6000, "highpass", 0.25);
        break;

      case "quiz-wrong":
        // 🎮 Game-style "wrong" — short descending minor 2nd, not harsh
        playNote(ctx, 370, 0.15, "triangle", v * 0.25);
        playNote(ctx, 311, 0.2, "triangle", v * 0.2, 0.08);
        // Subtle wobble
        playSweep(ctx, 250, 180, 0.2, "sine", v * 0.08, 0.12);
        break;

      case "success":
        // 🏆 Level-up style ascending chord burst
        // Power chord: C → E → G (major triad, simultaneous)
        playChord(ctx, [523, 659, 784], 0.2, "sine", v * 0.35);
        // Then octave jump
        playChord(ctx, [784, 1047, 1320], 0.25, "sine", v * 0.3, 0.15);
        // Sparkle
        playNoise(ctx, 0.15, v * 0.06, 4000, 8000, "highpass", 0.2);
        break;

      case "error":
        // Gentle "nope" — two descending notes, not aggressive
        playNote(ctx, 440, 0.12, "triangle", v * 0.2);
        playNote(ctx, 349, 0.18, "triangle", v * 0.18, 0.1);
        break;

      // ────────────────────────────────────────────────────────
      // REVEALS & SPECIAL MOMENTS
      // ────────────────────────────────────────────────────────
      case "reveal":
        // ✨ Magic chest opening — rising shimmer + chord bloom
        playSweep(ctx, 200, 1200, 0.4, "sine", v * 0.15);
        playArpeggio(ctx, [440, 554, 659, 880], 0.12, 0.08, "sine", v * 0.2, 0.1);
        playNoise(ctx, 0.3, v * 0.08, 2000, 6000, "highpass", 0.15);
        // Final shimmer chord
        playChord(ctx, [880, 1100, 1320], 0.3, "triangle", v * 0.15, 0.35);
        break;

      case "letter-reveal":
        // 🔤 Typewriter + magic sparkle per letter
        const basePitch = config?.pitch ?? 1;
        const lf = 600 + basePitch * 150;
        playNote(ctx, lf, 0.08, "sine", v * 0.3);
        playNote(ctx, lf * 1.5, 0.06, "triangle", v * 0.15, 0.02);
        playNote(ctx, lf * 2.5, 0.04, "sine", v * 0.08, 0.04);
        break;

      case "completion":
        // 🎊 Grand fanfare — triumphant game completion
        // Opening chord (C major)
        playChord(ctx, [262, 330, 392], 0.25, "sine", v * 0.3);
        // Rising to G major
        playChord(ctx, [392, 494, 587], 0.25, "sine", v * 0.3, 0.2);
        // Climax: C major octave up
        playChord(ctx, [523, 659, 784, 1047], 0.4, "sine", v * 0.35, 0.4);
        // Sparkle trail
        playArpeggio(ctx, [1047, 1320, 1568, 2093], 0.08, 0.05, "triangle", v * 0.12, 0.6);
        // Shimmering noise
        playNoise(ctx, 0.4, v * 0.06, 3000, 8000, "highpass", 0.5);
        // Sub bass for weight
        playNote(ctx, 65, 0.8, "sine", v * 0.2, 0.4);
        break;

      // ────────────────────────────────────────────────────────
      // DRAG & DROP
      // ────────────────────────────────────────────────────────
      case "snap-success":
        // 🧩 Satisfying snap-in — pop + ascending sparkle
        // Impact pop
        playNote(ctx, 400, 0.04, "sine", v * 0.4);
        playNote(ctx, 800, 0.03, "sine", v * 0.2, 0.01);
        // Ascending confirmation sparkle
        playArpeggio(ctx, [880, 1100, 1320, 1760], 0.06, 0.03, "sine", v * 0.25, 0.03);
        // Tiny celebration noise
        playNoise(ctx, 0.1, v * 0.05, 4000, 8000, "highpass", 0.12);
        break;

      case "snap-error":
        // 🧩 Soft reject — gentle "bump back" feel
        playNote(ctx, 250, 0.08, "triangle", v * 0.2);
        playNote(ctx, 200, 0.1, "triangle", v * 0.15, 0.04);
        playNoise(ctx, 0.06, v * 0.08, 200, 100, "lowpass", 0.02);
        break;

      // ────────────────────────────────────────────────────────
      // AMBIENT
      // ────────────────────────────────────────────────────────
      case "ambient-low":
        // Warm pad — fifth interval for depth
        playNote(ctx, 65, 2.5, "sine", v * 0.04);
        playNote(ctx, 98, 2.0, "sine", v * 0.025, 0.3);
        break;

      // ────────────────────────────────────────────────────────
      // GAMIFICATION SPECIALS
      // ────────────────────────────────────────────────────────
      case "streak-bonus":
        // 🔥 Streak fire — rising power chord + sizzle
        playSweep(ctx, 300, 600, 0.15, "sawtooth", v * 0.15);
        playArpeggio(ctx, [523, 659, 784, 1047, 1320], 0.08, 0.05, "sine", v * 0.3, 0.05);
        playChord(ctx, [1047, 1320, 1568], 0.3, "triangle", v * 0.2, 0.3);
        playNoise(ctx, 0.25, v * 0.1, 3000, 8000, "highpass", 0.15);
        // Sub thump for impact
        playNote(ctx, 80, 0.4, "sine", v * 0.25, 0.05);
        break;

      case "level-up":
        // 🏅 Epic rank up — heroic fanfare with brass feel
        // Brass-like opening (stacked fifths)
        playChord(ctx, [262, 330, 392], 0.3, "sawtooth", v * 0.15);
        playChord(ctx, [392, 494, 587], 0.3, "sawtooth", v * 0.15, 0.25);
        // Triumphant peak — major chord octave up
        playChord(ctx, [523, 659, 784, 1047], 0.5, "sine", v * 0.3, 0.5);
        // Descending sparkle trail
        playArpeggio(ctx, [2093, 1568, 1320, 1047], 0.1, 0.06, "triangle", v * 0.12, 0.75);
        // Grand shimmer
        playNoise(ctx, 0.5, v * 0.08, 4000, 10000, "highpass", 0.6);
        // Deep foundation
        playNote(ctx, 65, 1.2, "sine", v * 0.2, 0.5);
        playNote(ctx, 131, 0.8, "sine", v * 0.12, 0.5);
        break;

      case "combo-hit":
        // ⚡ Combo multiplier — punchy hit + electric zap
        // Sharp attack
        playNote(ctx, 600, 0.04, "square", v * 0.3);
        playNote(ctx, 1200, 0.03, "square", v * 0.15, 0.01);
        // Electric zap sweep
        playSweep(ctx, 2000, 400, 0.12, "sawtooth", v * 0.12, 0.02);
        // Quick ascending confirmation
        playArpeggio(ctx, [800, 1000, 1400], 0.05, 0.03, "sine", v * 0.2, 0.04);
        // Tiny noise burst
        playNoise(ctx, 0.06, v * 0.1, 2000, 5000, "bandpass", 0.02);
        break;

      // ────────────────────────────────────────────────────────
      // TIMED QUIZ
      // ────────────────────────────────────────────────────────
      case "timer-tick": {
        // 🕐 Clock tick — pitch/volume controlled by config
        const tickPitch = config?.pitch ?? 1;
        const tickF = 1800 * tickPitch;
        playNote(ctx, tickF, 0.035, "sine", v * 0.2);
        playNote(ctx, tickF * 2, 0.025, "triangle", v * 0.08, 0.008);
        break;
      }

      case "timer-buzzer":
        // ⏰ Timeout buzzer — descending sawtooth sweep + noise burst
        playSweep(ctx, 800, 200, 0.3, "sawtooth", v * 0.2);
        playNote(ctx, 150, 0.25, "triangle", v * 0.15, 0.05);
        playNoise(ctx, 0.2, v * 0.12, 400, 80, "lowpass", 0.05);
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

  // Track shared context usage (don't close on unmount - sounds need to finish)
  useEffect(() => {
    sharedAudioContextUsers++;
    return () => {
      sharedAudioContextUsers--;
      // Only close if no more users after a delay (let sounds finish)
      if (sharedAudioContextUsers <= 0) {
        setTimeout(() => {
          if (sharedAudioContextUsers <= 0 && sharedAudioContext && sharedAudioContext.state !== 'closed') {
            sharedAudioContext.close();
            sharedAudioContext = null;
          }
        }, 5000); // 5s delay to let any playing sounds finish
      }
    };
  }, []);

  return {
    playSound,
    unlockAudio,
  };
};
