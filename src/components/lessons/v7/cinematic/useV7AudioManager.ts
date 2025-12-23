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

// ✅ FASE 2: Contextual loops agora suportam URLs de áudio ElevenLabs
interface ContextualLoop {
  triggerAfter: number;
  text: string;         // Texto para log (não mais usado para TTS!)
  volume: number;
  loop?: boolean;
  audioUrl?: string;    // ✅ URL do áudio ElevenLabs (opcional)
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
  // ✅ V7-v2 FIX: NÃO ajusta volume aqui! O quiz/playground controla pause/resume diretamente
  const updateInteractionState = useCallback((newState: InteractionState) => {
    setInteractionState(newState);
    onStateChange?.(newState);
    console.log(`[V7AudioManager] 🎮 Interaction state: ${newState}`);

    // ✅ APENAS efeitos sonoros, SEM ajuste de volume (quiz controla isso)
    switch (newState) {
      case 'stuck':
        playSoundEffect('hint', 0.3);
        break;
      case 'abandoned':
        playSoundEffect('timeout', 0.4);
        break;
      // waiting, thinking, struggling: NÃO mexe no volume!
    }
  }, [onStateChange, playSoundEffect]);

  // Refs para callbacks (evita re-registro de listeners)
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndedRef = useRef(onEnded);
  
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);
  
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Initialize audio elements - SEM dependências externas!
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
      onTimeUpdateRef.current?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };

    // ✅ CRITICAL: Estes listeners sincronizam isPlaying com o estado REAL do áudio HTML
    const handlePlay = () => {
      console.log('[V7AudioManager] 🔊 HTML Audio Event: PLAY');
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log('[V7AudioManager] 🔇 HTML Audio Event: PAUSE');
      setIsPlaying(false);
    };

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
  }, []); // ✅ SEM dependências - listeners estáveis

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

  // ✅ FASE 2: Ref para áudio contextual (ElevenLabs)
  const contextualAudioRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 PLAY CONTEXTUAL AUDIO - Toca áudio ElevenLabs pré-gravado (NÃO voz robô!)
  const playContextualAudio = useCallback((audioUrl: string, volumeLevel: number = 0.5): Promise<void> => {
    return new Promise((resolve) => {
      // Parar áudio contextual anterior se existir
      if (contextualAudioRef.current) {
        contextualAudioRef.current.pause();
        contextualAudioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audio.volume = volumeLevel;
      contextualAudioRef.current = audio;

      audio.onended = () => {
        console.log(`[V7AudioManager] 🎵 Contextual audio finished: ${audioUrl}`);
        contextualAudioRef.current = null;
        resolve();
      };

      audio.onerror = (e) => {
        console.error('[V7AudioManager] ❌ Erro ao tocar áudio contextual:', e);
        contextualAudioRef.current = null;
        resolve();
      };

      audio.play().catch((e) => {
        console.error('[V7AudioManager] ❌ Não conseguiu tocar áudio contextual:', e);
        resolve();
      });

      console.log(`[V7AudioManager] 🎵 Playing contextual audio: ${audioUrl}`);
    });
  }, []);

  // 🛑 STOP CONTEXTUAL AUDIO - Para áudio contextual em andamento
  const stopContextualAudio = useCallback(() => {
    if (contextualAudioRef.current) {
      contextualAudioRef.current.pause();
      contextualAudioRef.current = null;
      console.log('[V7AudioManager] 🛑 Contextual audio stopped');
    }
  }, []);

  // ❌ FASE 2: REMOVIDO speakText (voz robô do browser)
  // A função agora apenas loga - NÃO usa mais Web Speech API!
  const speakText = useCallback((text: string, volume: number = 0.5): Promise<void> => {
    // ✅ DESABILITADO: Não usa mais voz robô!
    console.log(`[V7AudioManager] 📝 Contextual hint (text only, no TTS): "${text}"`);
    // TODO: Quando tiver URLs de áudio ElevenLabs, usar playContextualAudio() aqui
    return Promise.resolve();
  }, []);

  // 🛑 STOP SPEECH - Agora para áudio contextual (não mais Web Speech)
  const stopSpeech = useCallback(() => {
    stopContextualAudio();
  }, [stopContextualAudio]);

  // 💬 START CONTEXTUAL LOOPS - ✅ FASE 2: Suporta URLs de áudio ElevenLabs
  const startContextualLoops = useCallback((loops: ContextualLoop[]) => {
    loops.forEach((loop) => {
      const timer = setTimeout(() => {
        // ✅ FASE 2: Se tiver URL de áudio, usa ElevenLabs; senão, apenas loga
        if (loop.audioUrl) {
          playContextualAudio(loop.audioUrl, loop.volume);
        } else {
          // Apenas loga - NÃO usa voz robô!
          console.log(`[V7AudioManager] 💬 Contextual hint (no audio): "${loop.text}"`);
        }
      }, loop.triggerAfter * 1000);

      contextualTimersRef.current.push(timer);
    });
  }, [playContextualAudio]);

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

  // Toggle play/pause - ✅ V7-v17: NÃO bloqueia mais durante interação
  const togglePlayPause = useCallback(() => {
    // ✅ V7-v17 FIX: Permitir toggle mesmo durante interação!
    // O bloqueio total estava causando o player "travar"
    // Usuário PRECISA poder dar play/pause manualmente
    if (isInteracting) {
      console.log('[V7AudioManager] ⚠️ Toggle durante interação - permitindo para não travar');
    }
    
    if (isPlaying) {
      pause();
    } else {
      // ✅ V7-v17: Restaurar volume se estava em 0 (de fade out)
      if (mainAudioRef.current && mainAudioRef.current.volume < 0.1) {
        mainAudioRef.current.volume = savedVolumeRef.current || volume;
        console.log('[V7AudioManager] 🔊 Restaurando volume para', savedVolumeRef.current || volume);
      }
      play();
    }
  }, [isPlaying, isInteracting, play, pause, volume]);

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

  // ✅ V7-v17: Reset interaction state completo (for navigation back)
  const resetInteraction = useCallback(() => {
    setIsInteracting(false);
    setInteractionState('idle');
    // Clear any pending contextual timers
    contextualTimersRef.current.forEach(timer => clearTimeout(timer));
    contextualTimersRef.current = [];
    // ✅ V7-v17: Restaurar volume se estava em 0 (de fade out)
    if (mainAudioRef.current && mainAudioRef.current.volume < 0.1) {
      mainAudioRef.current.volume = savedVolumeRef.current || volume;
      console.log('[V7AudioManager] 🔊 Restaurando volume:', savedVolumeRef.current || volume);
    }
    console.log('[V7AudioManager] 🔄 Interaction state reset (completo)');
  }, [volume]);

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
    resetInteraction, // ✅ V7-v16: Reset interaction state

    // ✅ FASE 2: Contextual audio (ElevenLabs, não mais voz robô!)
    playContextualAudio,
    stopContextualAudio,
    speakText,        // Mantido para compatibilidade, mas não usa TTS
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
