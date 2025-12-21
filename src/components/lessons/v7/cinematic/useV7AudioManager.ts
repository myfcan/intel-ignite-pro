// V7 Audio Manager - Sistema de áudio inteligente com fade in/out
// Suporta: narração principal, áudio ambiente, áudio contextual para interações

import { useState, useRef, useCallback, useEffect } from 'react';

interface ContextualLoop {
  triggerAfter: number;
  text: string;
  volume: number;
  loop?: boolean;
}

interface AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {
    mainVolume: number;
    ambientVolume: number;
    contextualLoops?: ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}

interface UseV7AudioManagerProps {
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export const useV7AudioManager = ({
  onTimeUpdate,
  onEnded
}: UseV7AudioManagerProps = {}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Refs
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contextualTimersRef = useRef<NodeJS.Timeout[]>([]);
  const savedVolumeRef = useRef<number>(0.8);
  const savedTimeRef = useRef<number>(0);

  // Initialize audio elements
  useEffect(() => {
    if (!mainAudioRef.current) {
      mainAudioRef.current = new Audio();
      mainAudioRef.current.preload = 'auto';
    }

    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio();
      ambientAudioRef.current.preload = 'auto';
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.2;
    }

    const audio = mainAudioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onEnded]);

  // Load audio
  const loadAudio = useCallback((url: string) => {
    if (mainAudioRef.current) {
      mainAudioRef.current.src = url;
      mainAudioRef.current.load();
    }
  }, []);

  // 🎵 FADE TO VOLUME - Transição suave de volume
  const fadeToVolume = useCallback((
    targetVolume: number,
    duration: number = 500
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (!mainAudioRef.current) {
        resolve();
        return;
      }

      const startVolume = mainAudioRef.current.volume;
      const volumeDiff = targetVolume - startVolume;
      const steps = 20;
      const stepDuration = duration / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Easing function para transição mais suave
        const eased = 1 - Math.pow(1 - progress, 3);
        const newVolume = startVolume + (volumeDiff * eased);

        if (mainAudioRef.current) {
          mainAudioRef.current.volume = Math.max(0, Math.min(1, newVolume));
        }

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          resolve();
        }
      }, stepDuration);
    });
  }, []);

  // 🔇 PAUSE WITH FADE - Pausa com fade out suave
  const pauseWithFade = useCallback(async (fadeDuration: number = 300) => {
    if (!mainAudioRef.current) return;

    savedVolumeRef.current = mainAudioRef.current.volume;
    savedTimeRef.current = mainAudioRef.current.currentTime;

    await fadeToVolume(0, fadeDuration);
    mainAudioRef.current.pause();

    console.log('[V7AudioManager] 🔇 Pausado com fade');
  }, [fadeToVolume]);

  // 🔊 RESUME WITH FADE - Resume com fade in suave
  const resumeWithFade = useCallback(async (fadeDuration: number = 500) => {
    if (!mainAudioRef.current) return;

    mainAudioRef.current.volume = 0;
    await mainAudioRef.current.play();
    await fadeToVolume(savedVolumeRef.current || volume, fadeDuration);

    console.log('[V7AudioManager] 🔊 Retomado com fade');
  }, [fadeToVolume, volume]);

  // 🎭 START INTERACTION - Inicia modo interação com comportamento de áudio específico
  const startInteraction = useCallback(async (behavior: AudioBehavior) => {
    setIsInteracting(true);
    savedTimeRef.current = mainAudioRef.current?.currentTime || 0;

    switch (behavior.onStart) {
      case 'pause':
        await pauseWithFade(200);
        break;

      case 'fadeToBackground':
        await fadeToVolume(behavior.duringInteraction.mainVolume, 500);
        break;

      case 'switch':
        await fadeToVolume(behavior.duringInteraction.mainVolume, 300);
        // Iniciar loops contextuais
        if (behavior.duringInteraction.contextualLoops) {
          startContextualLoops(behavior.duringInteraction.contextualLoops);
        }
        break;

      case 'continue':
      default:
        // Não faz nada
        break;
    }

    // Ajustar áudio ambiente
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = behavior.duringInteraction.ambientVolume;
    }

    console.log('[V7AudioManager] 🎭 Interação iniciada:', behavior.onStart);
  }, [pauseWithFade, fadeToVolume]);

  // 🎬 END INTERACTION - Finaliza modo interação
  const endInteraction = useCallback(async (behavior: AudioBehavior) => {
    // Limpar timers contextuais
    contextualTimersRef.current.forEach(timer => clearTimeout(timer));
    contextualTimersRef.current = [];

    switch (behavior.onComplete) {
      case 'resume':
        await resumeWithFade(500);
        break;

      case 'fadeIn':
        if (mainAudioRef.current && mainAudioRef.current.paused) {
          await mainAudioRef.current.play();
        }
        await fadeToVolume(savedVolumeRef.current || volume, 500);
        break;

      case 'next':
        // Não retoma, espera próximo act
        break;
    }

    // Restaurar áudio ambiente
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = 0.2;
    }

    setIsInteracting(false);
    console.log('[V7AudioManager] 🎬 Interação finalizada:', behavior.onComplete);
  }, [resumeWithFade, fadeToVolume, volume]);

  // 💬 START CONTEXTUAL LOOPS - Inicia áudios contextuais durante interação
  const startContextualLoops = useCallback((loops: ContextualLoop[]) => {
    loops.forEach((loop, index) => {
      const timer = setTimeout(() => {
        // Aqui você pode implementar TTS ou tocar áudio pré-gravado
        console.log(`[V7AudioManager] 💬 Contextual: "${loop.text}"`);
        // TODO: Integrar com TTS para falar o texto
      }, loop.triggerAfter * 1000);

      contextualTimersRef.current.push(timer);
    });
  }, []);

  // Play básico
  const play = useCallback(async () => {
    if (mainAudioRef.current) {
      try {
        await mainAudioRef.current.play();
      } catch (error) {
        console.error('[V7AudioManager] Erro ao tocar:', error);
      }
    }
  }, []);

  // Pause básico
  const pause = useCallback(() => {
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Set volume
  const setVolume = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setVolumeState(clampedValue);
    if (mainAudioRef.current && !isInteracting) {
      mainAudioRef.current.volume = isMuted ? 0 : clampedValue;
    }
  }, [isMuted, isInteracting]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (mainAudioRef.current) {
        mainAudioRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      contextualTimersRef.current.forEach(timer => clearTimeout(timer));
      if (mainAudioRef.current) {
        mainAudioRef.current.pause();
        mainAudioRef.current.src = '';
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = '';
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isInteracting,

    // Basic actions
    loadAudio,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,

    // 🆕 Smart audio actions
    fadeToVolume,
    pauseWithFade,
    resumeWithFade,
    startInteraction,
    endInteraction,

    // Helpers
    formatTime,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };
};

// Comportamentos padrão para cada tipo de interação
export const DEFAULT_AUDIO_BEHAVIORS: Record<string, AudioBehavior> = {
  quiz: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.15,
      ambientVolume: 0.4,
      contextualLoops: [
        { triggerAfter: 7, text: 'Pense com calma...', volume: 0.4 },
        { triggerAfter: 15, text: 'Qual opção mais combina com você?', volume: 0.4 },
        { triggerAfter: 25, text: 'Tome seu tempo...', volume: 0.3 }
      ]
    },
    onComplete: 'fadeIn'
  },

  playground: {
    onStart: 'pause',
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0.3,
      contextualLoops: []
    },
    onComplete: 'resume'
  },

  checkboxes: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.3,
      ambientVolume: 0.3,
      contextualLoops: []
    },
    onComplete: 'fadeIn'
  },

  cta: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.2,
      ambientVolume: 0.4,
      contextualLoops: [
        { triggerAfter: 5, text: 'A escolha é sua...', volume: 0.3 }
      ]
    },
    onComplete: 'next'
  }
};
