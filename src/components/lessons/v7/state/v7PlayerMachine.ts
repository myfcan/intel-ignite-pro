// V7 Player State Machine - XState v5 implementation
// ✅ Level 4: Formal state machine for the V7 cinematic player
// Replaces scattered useState/useEffect logic with predictable state transitions

import { setup, assign } from 'xstate';
import type { V7LessonScript, V7Phase } from '../cinematic/phases/V7PhaseController';

// ============================================================================
// CONTEXT: All data that flows through the machine
// ============================================================================

export interface V7PlayerContext {
  // Script & phases
  script: V7LessonScript | null;
  scaledScript: V7LessonScript | null;
  
  // Phase tracking
  currentPhaseIndex: number;
  currentSceneIndex: number;
  lockedPhaseIndex: number | null;
  
  // Time tracking
  currentTime: number;
  internalTime: number;
  audioDuration: number;
  
  // Audio state
  hasAudio: boolean;
  isAudioLoaded: boolean;
  isMuted: boolean;
  volume: number;
  
  // Interaction state
  interactionComplete: boolean;
  selectedQuizOptions: string[];
  playgroundResult: Record<string, unknown> | null;
  
  // Feedback state
  feedbackAudioUrl: string | null;
  isPlayingFeedbackAudio: boolean;
  
  // UI state
  showControls: boolean;
  showTransitionParticles: boolean;
  transitionParticleColor: 'cyan' | 'gold' | 'emerald' | 'purple';
  
  // Navigation state
  isNavigatingBack: boolean;
  
  // Error state
  error: string | null;
}

// ============================================================================
// EVENTS: All possible events the machine can receive
// ============================================================================

export type V7PlayerEvent =
  // Lifecycle events
  | { type: 'LOAD_SCRIPT'; script: V7LessonScript }
  | { type: 'AUDIO_LOADED'; duration: number }
  | { type: 'AUDIO_ERROR'; error: string }
  | { type: 'LOADING_COMPLETE' }
  
  // Playback events
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY_PAUSE' }
  | { type: 'SEEK'; time: number }
  | { type: 'TIME_UPDATE'; time: number }
  | { type: 'AUDIO_ENDED' }
  
  // Navigation events
  | { type: 'GO_TO_NEXT_PHASE' }
  | { type: 'GO_TO_PREVIOUS_PHASE' }
  | { type: 'GO_TO_PHASE'; index: number }
  | { type: 'SKIP_TO_PLAYGROUND' }
  
  // Interaction events
  | { type: 'ANCHOR_PAUSE' }
  | { type: 'ANCHOR_RESUME' }
  | { type: 'LOCK_PHASE'; index: number }
  | { type: 'UNLOCK_PHASE' }
  | { type: 'QUIZ_COMPLETE'; selectedIds: string[] }
  | { type: 'PLAYGROUND_COMPLETE'; result?: Record<string, unknown> }
  | { type: 'CTA_CHOICE'; choice: 'negative' | 'positive' }
  | { type: 'SECRET_REVEAL_COMPLETE' }
  
  // Feedback events
  | { type: 'PLAY_FEEDBACK_AUDIO'; url: string }
  | { type: 'FEEDBACK_AUDIO_ENDED' }
  | { type: 'FEEDBACK_AUDIO_ERROR' }
  
  // UI events
  | { type: 'SHOW_CONTROLS' }
  | { type: 'HIDE_CONTROLS' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TRIGGER_PARTICLES'; color: 'cyan' | 'gold' | 'emerald' | 'purple' }
  | { type: 'PARTICLES_COMPLETE' }
  
  // Completion events
  | { type: 'LESSON_COMPLETE' }
  | { type: 'EXIT' };

// ============================================================================
// INITIAL CONTEXT
// ============================================================================

const initialContext: V7PlayerContext = {
  script: null,
  scaledScript: null,
  currentPhaseIndex: 0,
  currentSceneIndex: 0,
  lockedPhaseIndex: null,
  currentTime: 0,
  internalTime: 0,
  audioDuration: 0,
  hasAudio: false,
  isAudioLoaded: false,
  isMuted: false,
  volume: 1,
  interactionComplete: false,
  selectedQuizOptions: [],
  playgroundResult: null,
  feedbackAudioUrl: null,
  isPlayingFeedbackAudio: false,
  showControls: true,
  showTransitionParticles: false,
  transitionParticleColor: 'cyan',
  isNavigatingBack: false,
  error: null,
};

// ============================================================================
// HELPER: Scale script to match audio duration
// ============================================================================

function scaleScriptToAudioDuration(
  script: V7LessonScript,
  actualAudioDuration: number
): V7LessonScript {
  const scriptDuration = script.totalDuration;

  // Don't scale if durations are similar (within 5 seconds)
  if (Math.abs(scriptDuration - actualAudioDuration) < 5) {
    return script;
  }

  const scaleFactor = actualAudioDuration / scriptDuration;

  const scaledPhases = script.phases.map((phase) => {
    const scaledStartTime = phase.startTime * scaleFactor;
    const scaledEndTime = phase.endTime * scaleFactor;

    const scaledScenes = phase.scenes.map((scene) => ({
      ...scene,
      startTime: scene.startTime !== undefined ? scene.startTime * scaleFactor : undefined,
      duration: scene.duration !== undefined ? scene.duration * scaleFactor : undefined,
    }));

    return {
      ...phase,
      startTime: scaledStartTime,
      endTime: scaledEndTime,
      scenes: scaledScenes,
    };
  });

  return {
    ...script,
    totalDuration: actualAudioDuration,
    phases: scaledPhases,
  };
}

// ============================================================================
// STATE MACHINE DEFINITION (XState v5 setup API)
// ============================================================================

export const v7PlayerMachine = setup({
  types: {
    context: {} as V7PlayerContext,
    events: {} as V7PlayerEvent,
  },
  
  guards: {
    hasNextPhase: ({ context }) => {
      const script = context.scaledScript || context.script;
      if (!script) return false;
      return context.currentPhaseIndex < script.phases.length - 1;
    },
    
    hasPreviousPhase: ({ context }) => {
      const effectiveIndex = context.lockedPhaseIndex ?? context.currentPhaseIndex;
      return effectiveIndex > 0;
    },
    
    isLastPhase: ({ context }) => {
      const script = context.scaledScript || context.script;
      if (!script) return true;
      return context.currentPhaseIndex >= script.phases.length - 1;
    },
    
    isBlockingPhase: ({ context }) => {
      const script = context.scaledScript || context.script;
      if (!script) return false;
      const phase = script.phases[context.currentPhaseIndex];
      if (!phase) return false;
      return (
        phase.type === 'interaction' ||
        phase.type === 'secret-reveal' ||
        phase.type === 'playground'
      );
    },
    
    hasFeedbackAudio: ({ context }) => {
      return !!context.feedbackAudioUrl;
    },
    
    hasAudio: ({ context }) => {
      return context.hasAudio;
    },
    
    isLocked: ({ context }) => {
      return context.lockedPhaseIndex !== null;
    },
    
    isNotLocked: ({ context }) => {
      return context.lockedPhaseIndex === null;
    },
  },
  
  actions: {
    // Script management
    assignScript: assign(({ event }) => {
      if (event.type === 'LOAD_SCRIPT') {
        return {
          script: event.script,
          hasAudio: !!event.script.audioUrl,
        };
      }
      return {};
    }),
    
    assignScaledScript: assign(({ context, event }) => {
      if (event.type === 'AUDIO_LOADED' && context.script) {
        return {
          scaledScript: scaleScriptToAudioDuration(context.script, event.duration),
          audioDuration: event.duration,
          isAudioLoaded: true,
        };
      }
      return {};
    }),
    
    // Time management
    updateTime: assign(({ event }) => {
      if (event.type === 'TIME_UPDATE') {
        return { currentTime: event.time };
      }
      return {};
    }),
    
    seekTo: assign(({ event }) => {
      if (event.type === 'SEEK') {
        return { currentTime: event.time };
      }
      return {};
    }),
    
    // Phase management
    lockPhase: assign(({ context, event }) => {
      if (event.type === 'LOCK_PHASE') {
        return {
          lockedPhaseIndex: event.index,
          interactionComplete: false,
        };
      }
      return {
        lockedPhaseIndex: context.currentPhaseIndex,
        interactionComplete: false,
      };
    }),
    
    unlockPhase: assign(() => ({
      lockedPhaseIndex: null,
      interactionComplete: true,
    })),
    
    goToNextPhase: assign(({ context }) => {
      const script = context.scaledScript || context.script;
      if (!script) return {};
      const effectiveIndex = context.lockedPhaseIndex ?? context.currentPhaseIndex;
      return {
        currentPhaseIndex: Math.min(effectiveIndex + 1, script.phases.length - 1),
        lockedPhaseIndex: null,
        interactionComplete: false,
        isNavigatingBack: false,
      };
    }),
    
    goToPreviousPhase: assign(({ context }) => {
      const effectiveIndex = context.lockedPhaseIndex ?? context.currentPhaseIndex;
      return {
        currentPhaseIndex: Math.max(effectiveIndex - 1, 0),
        lockedPhaseIndex: null,
        interactionComplete: false,
        isNavigatingBack: true,
      };
    }),
    
    goToPhase: assign(({ event }) => {
      if (event.type === 'GO_TO_PHASE') {
        return {
          currentPhaseIndex: event.index,
          lockedPhaseIndex: null,
        };
      }
      return {};
    }),
    
    clearNavigatingBack: assign(() => ({
      isNavigatingBack: false,
    })),
    
    // Interaction management
    recordQuizComplete: assign(({ event }) => {
      if (event.type === 'QUIZ_COMPLETE') {
        return {
          selectedQuizOptions: event.selectedIds,
          interactionComplete: true,
        };
      }
      return {};
    }),
    
    recordPlaygroundComplete: assign(({ event }) => {
      if (event.type === 'PLAYGROUND_COMPLETE') {
        return {
          playgroundResult: event.result || {},
          interactionComplete: true,
        };
      }
      return {};
    }),
    
    // Feedback audio
    setFeedbackAudio: assign(({ event }) => {
      if (event.type === 'PLAY_FEEDBACK_AUDIO') {
        return {
          feedbackAudioUrl: event.url,
          isPlayingFeedbackAudio: true,
        };
      }
      return {};
    }),
    
    clearFeedbackAudio: assign(() => ({
      feedbackAudioUrl: null,
      isPlayingFeedbackAudio: false,
    })),
    
    // UI management
    showControls: assign(() => ({
      showControls: true,
    })),
    
    hideControls: assign(() => ({
      showControls: false,
    })),
    
    toggleMute: assign(({ context }) => ({
      isMuted: !context.isMuted,
    })),
    
    setVolume: assign(({ event }) => {
      if (event.type === 'SET_VOLUME') {
        return { volume: event.volume };
      }
      return {};
    }),
    
    triggerParticles: assign(({ event }) => {
      if (event.type === 'TRIGGER_PARTICLES') {
        return {
          showTransitionParticles: true,
          transitionParticleColor: event.color,
        };
      }
      return {};
    }),
    
    clearParticles: assign(() => ({
      showTransitionParticles: false,
    })),
    
    // Error handling
    setError: assign(({ event }) => {
      if (event.type === 'AUDIO_ERROR') {
        return { error: event.error };
      }
      return {};
    }),
    
    clearError: assign(() => ({
      error: null,
    })),
    
    logComplete: () => {
      console.log('[V7PlayerMachine] 🏁 Lesson completed');
    },
    
    logExit: () => {
      console.log('[V7PlayerMachine] 🚪 User exited');
    },
  },
}).createMachine({
  id: 'v7Player',
  initial: 'idle',
  context: initialContext,
  
  states: {
    // ========================================
    // IDLE: Waiting for script to load
    // ========================================
    idle: {
      on: {
        LOAD_SCRIPT: {
          target: 'loading',
          actions: 'assignScript',
        },
      },
    },
    
    // ========================================
    // LOADING: Script loaded, waiting for audio
    // ========================================
    loading: {
      on: {
        AUDIO_LOADED: {
          target: 'ready',
          actions: 'assignScaledScript',
        },
        AUDIO_ERROR: {
          target: 'ready', // Continue without audio
          actions: 'setError',
        },
        LOADING_COMPLETE: {
          target: 'ready',
        },
      },
    },
    
    // ========================================
    // READY: Can start playing
    // ========================================
    ready: {
      on: {
        PLAY: 'playing',
        LOADING_COMPLETE: 'playing',
      },
    },
    
    // ========================================
    // PLAYING: Active playback
    // ========================================
    playing: {
      initial: 'normal',
      
      states: {
        // Normal playback - audio is playing
        normal: {
          on: {
            PAUSE: '#v7Player.paused',
            TIME_UPDATE: {
              actions: 'updateTime',
            },
            ANCHOR_PAUSE: 'anchorPaused',
            LOCK_PHASE: {
              target: 'interactionLocked',
              actions: 'lockPhase',
            },
          },
        },
        
        // Paused by anchor keyword detection
        anchorPaused: {
          on: {
            ANCHOR_RESUME: 'normal',
            PLAY: 'normal',
          },
        },
        
        // Locked in an interactive phase (quiz, playground, secret-reveal)
        interactionLocked: {
          initial: 'waitingForInput',
          
          states: {
            waitingForInput: {
              on: {
                QUIZ_COMPLETE: [
                  {
                    target: 'playingFeedback',
                    guard: 'hasFeedbackAudio',
                    actions: ['recordQuizComplete', 'setFeedbackAudio'],
                  },
                  {
                    target: '#v7Player.playing.advancing',
                    actions: ['recordQuizComplete', 'unlockPhase'],
                  },
                ],
                PLAYGROUND_COMPLETE: {
                  target: '#v7Player.playing.advancing',
                  actions: ['recordPlaygroundComplete', 'unlockPhase'],
                },
                SECRET_REVEAL_COMPLETE: {
                  target: '#v7Player.playing.advancing',
                  actions: 'unlockPhase',
                },
                CTA_CHOICE: {
                  target: '#v7Player.playing.advancing',
                  actions: 'unlockPhase',
                },
              },
            },
            
            playingFeedback: {
              on: {
                FEEDBACK_AUDIO_ENDED: {
                  target: '#v7Player.playing.advancing',
                  actions: ['clearFeedbackAudio', 'unlockPhase'],
                },
                FEEDBACK_AUDIO_ERROR: {
                  target: '#v7Player.playing.advancing',
                  actions: ['clearFeedbackAudio', 'unlockPhase'],
                },
              },
            },
          },
        },
        
        // Advancing to next phase after interaction
        advancing: {
          always: [
            {
              target: '#v7Player.completed',
              guard: 'isLastPhase',
            },
            {
              target: 'normal',
              actions: 'goToNextPhase',
            },
          ],
        },
      },
      
      on: {
        AUDIO_ENDED: [
          {
            target: 'completed',
            guard: 'isNotLocked',
          },
          // Stay in playing if locked in interaction
        ],
        GO_TO_NEXT_PHASE: [
          {
            target: 'completed',
            guard: 'isLastPhase',
          },
          {
            actions: 'goToNextPhase',
          },
        ],
        GO_TO_PREVIOUS_PHASE: {
          guard: 'hasPreviousPhase',
          actions: 'goToPreviousPhase',
        },
        GO_TO_PHASE: {
          actions: 'goToPhase',
        },
        SEEK: {
          actions: 'seekTo',
        },
        TOGGLE_MUTE: {
          actions: 'toggleMute',
        },
        SET_VOLUME: {
          actions: 'setVolume',
        },
        SHOW_CONTROLS: {
          actions: 'showControls',
        },
        HIDE_CONTROLS: {
          actions: 'hideControls',
        },
        TRIGGER_PARTICLES: {
          actions: 'triggerParticles',
        },
        PARTICLES_COMPLETE: {
          actions: 'clearParticles',
        },
        EXIT: 'exited',
      },
    },
    
    // ========================================
    // PAUSED: Playback paused by user
    // ========================================
    paused: {
      on: {
        PLAY: 'playing',
        TOGGLE_PLAY_PAUSE: 'playing',
        SEEK: {
          actions: 'seekTo',
        },
        GO_TO_NEXT_PHASE: {
          guard: 'hasNextPhase',
          actions: 'goToNextPhase',
        },
        GO_TO_PREVIOUS_PHASE: {
          guard: 'hasPreviousPhase',
          actions: 'goToPreviousPhase',
        },
        EXIT: 'exited',
      },
    },
    
    // ========================================
    // COMPLETED: Lesson finished
    // ========================================
    completed: {
      type: 'final',
      entry: 'logComplete',
    },
    
    // ========================================
    // EXITED: User exited the player
    // ========================================
    exited: {
      type: 'final',
      entry: 'logExit',
    },
  },
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type V7PlayerMachine = typeof v7PlayerMachine;
