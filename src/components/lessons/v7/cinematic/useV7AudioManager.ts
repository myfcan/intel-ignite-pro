// V7 Audio Manager - Sistema de áudio inteligente com fade in/out
// Suporta: narração principal, áudio ambiente, áudio contextual para interações
// ✅ V7-v2.1: Sistema de estados de interação + feedback sonoro

import { useState, useRef, useCallback, useEffect } from 'react';

// 🆕 Sistema de estados de interação
export type InteractionState =
  | 'idle'         // Não está em interação
  | 'waiting'      // Aguardando primeira ação
  | 'thinking'     // Usuário interagiu mas não completou
  | 'stuck'        // Passou do soft timeout
  | 'struggling'   // Passou do medium timeout
  | 'abandoned';   // Vai ser auto-completado

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

// 🆕 Tipos de efeitos sonoros
export type SoundEffectType =
  | 'click'        // Clique em opção
  | 'select'       // Seleção confirmada
  | 'success'      // Acerto/conclusão
  | 'error'        // Erro
  | 'hint'         // Hint aparecendo
  | 'timeout'      // Timeout warning
  | 'whoosh'       // Transição
  | 'reveal';      // Revelação

interface UseV7AudioManagerProps {
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onStateChange?: (state: InteractionState) => void;
}

export const useV7AudioManager = ({
  onTimeUpdate,
  onEnded,
  onStateChange
}: UseV7AudioManagerProps = {}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');

  // Refs
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contextualTimersRef = useRef<NodeJS.Timeout[]>([]);
  const savedVolumeRef = useRef<number>(0.8);
  const savedTimeRef = useRef<number>(0);

  // 🆕 Refs para efeitos sonoros (pré-carregados)
  const soundEffectsRef = useRef<Map<SoundEffectType, HTMLAudioElement>>(new Map());

  // 🆕 Inicializar efeitos sonoros
  useEffect(() => {
    const effects: [SoundEffectType, string][] = [
      ['click', '/sounds/click.mp3'],
      ['select', '/sounds/select.mp3'],
      ['success', '/sounds/success.mp3'],
      ['error', '/sounds/error.mp3'],
      ['hint', '/sounds/hint.mp3'],
      ['timeout', '/sounds/timeout.mp3'],
      ['whoosh', '/sounds/whoosh.mp3'],
      ['reveal', '/sounds/reveal.mp3'],
    ];

    effects.forEach(([type, url]) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.5;
      // Fallback para som vazio se arquivo não existir
      audio.src = url;
      audio.onerror = () => {
        console.log(`[V7AudioManager] Sound effect "${type}" not found, using fallback`);
      };
      soundEffectsRef.current.set(type, audio);
    });

    return () => {
      soundEffectsRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      soundEffectsRef.current.clear();
    };
  }, []);

  // 🆕 Tocar efeito sonoro
  const playSoundEffect = useCallback((effect: SoundEffectType, volumeOverride?: number) => {
    const audio = soundEffectsRef.current.get(effect);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volumeOverride ?? 0.5;
      audio.play().catch(() => {
        // Ignorar erros silenciosamente (autoplay blocked, etc)
      });
      console.log(`[V7AudioManager] 🔊 Sound effect: ${effect}`);
    }
  }, []);

  // 🆕 Atualizar estado de interação com callback
  const updateInteractionState = useCallback((newState: InteractionState) => {
    setInteractionState(newState);
    onStateChange?.(newState);
    console.log(`[V7AudioManager] 🎮 Interaction state: ${newState}`);

    // Ajustar volume baseado no estado
    if (mainAudioRef.current && isInteracting) {
      switch (newState) {
        case 'waiting':
          fadeToVolume(0.15, 300);
          break;
        case 'thinking':
          fadeToVolume(0.10, 200);
          break;
        case 'stuck':
          fadeToVolume(0.08, 200);
          playSoundEffect('hint', 0.3);
          break;
        case 'struggling':
          fadeToVolume(0.05, 200);
          break;
        case 'abandoned':
          playSoundEffect('timeout', 0.4);
          break;
      }
    }
  }, [onStateChange, isInteracting]);

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
    updateInteractionState('waiting');
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
  }, [pauseWithFade, fadeToVolume, updateInteractionState]);

  // 🎬 END INTERACTION - Finaliza modo interação
  const endInteraction = useCallback(async (behavior: AudioBehavior) => {
    // Limpar timers contextuais
    contextualTimersRef.current.forEach(timer => clearTimeout(timer));
    contextualTimersRef.current = [];

    // Tocar som de sucesso
    playSoundEffect('success', 0.4);

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
    updateInteractionState('idle');
    console.log('[V7AudioManager] 🎬 Interação finalizada:', behavior.onComplete);
  }, [resumeWithFade, fadeToVolume, volume, playSoundEffect, updateInteractionState]);

  // 🗣️ SPEAK TEXT - Fala texto usando Web Speech API (para loops contextuais)
  const speakText = useCallback((text: string, volume: number = 0.5): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar se Web Speech API está disponível
      if (!('speechSynthesis' in window)) {
        console.warn('[V7AudioManager] Web Speech API não disponível');
        resolve();
        return;
      }

      // Cancelar qualquer fala anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // Velocidade um pouco mais lenta para reflexão
      utterance.pitch = 1.0;
      utterance.volume = volume;

      // Tentar usar voz feminina portuguesa se disponível
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v =>
        v.lang.startsWith('pt') && v.name.toLowerCase().includes('female')
      ) || voices.find(v => v.lang.startsWith('pt'));

      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        console.log(`[V7AudioManager] 🗣️ Falou: "${text}"`);
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('[V7AudioManager] Erro TTS:', e);
        resolve(); // Não rejeita, apenas continua
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // 🛑 STOP SPEECH - Para qualquer fala em andamento
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // 💬 START CONTEXTUAL LOOPS - Inicia áudios contextuais durante interação
  const startContextualLoops = useCallback((loops: ContextualLoop[]) => {
    loops.forEach((loop) => {
      const timer = setTimeout(() => {
        // ✅ Agora fala o texto usando Web Speech API!
        speakText(loop.text, loop.volume);
        console.log(`[V7AudioManager] 💬 Contextual loop triggered: "${loop.text}"`);
      }, loop.triggerAfter * 1000);

      contextualTimersRef.current.push(timer);
    });
  }, [speakText]);

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
      // Parar qualquer fala em andamento
      stopSpeech();
      if (mainAudioRef.current) {
        mainAudioRef.current.pause();
        mainAudioRef.current.src = '';
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = '';
      }
    };
  }, [stopSpeech]);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isInteracting,
    interactionState,

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

    // 🆕 Contextual loops (TTS)
    speakText,
    stopSpeech,
    startContextualLoops,

    // 🆕 Interaction state management
    updateInteractionState,
    playSoundEffect,

    // Helpers
    formatTime,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };
};

// ✅ V7-v2 FIX: Comportamentos padrão CORRETOS para cada tipo de interação
// Quiz/Playground = PAUSAR narração (não apenas baixar volume!)
// CTA = Continuar normal (não pausa)
export const DEFAULT_AUDIO_BEHAVIORS: Record<string, AudioBehavior> = {
  quiz: {
    onStart: 'pause',           // ✅ CORRIGIDO: PAUSA a narração (não fadeToBackground!)
    duringInteraction: {
      mainVolume: 0,            // ✅ CORRIGIDO: Volume ZERO (narração pausada)
      ambientVolume: 0.3,       // Música ambiente continua baixinha
      contextualLoops: [        // Loops contextuais (visual hints por enquanto)
        { triggerAfter: 7, text: 'Pense com calma...', volume: 0.4 },
        { triggerAfter: 15, text: 'Qual opção mais combina com você?', volume: 0.4 },
        { triggerAfter: 25, text: 'Tome seu tempo...', volume: 0.3 }
      ]
    },
    onComplete: 'resume'        // ✅ CORRIGIDO: RETOMA de onde parou
  },

  playground: {
    onStart: 'pause',           // PAUSA total (digitação precisa de silêncio)
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0,         // Silêncio total para playground
      contextualLoops: []
    },
    onComplete: 'resume'
  },

  checkboxes: {
    onStart: 'fadeToBackground', // Checkboxes são rápidos, só baixa volume
    duringInteraction: {
      mainVolume: 0.2,
      ambientVolume: 0.3,
      contextualLoops: []
    },
    onComplete: 'fadeIn'
  },

  cta: {
    onStart: 'continue',        // ✅ CTA continua normal (não pausa!)
    duringInteraction: {
      mainVolume: 1.0,          // ✅ Volume total (CTA não interrompe)
      ambientVolume: 0.4,
      contextualLoops: []       // Sem loops contextuais para CTA
    },
    onComplete: 'next'          // ✅ FIX: Continua para próximo (era 'continue' inválido)
  }
};
