// V7PhasePlayer - Main player component orchestrating all cinematic phases
// ✅ V7-v2: Uses useV7AudioManager with fade capabilities for interactions
// ✅ V7-v2: Uses useAnchorText for keyword-based pause sync
// ✅ Level 4: Integrated with XState machine via useV7PlayerAdapter
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { V7MinimalControls } from './V7MinimalControls';
import { V7AudioIndicator } from './V7AudioIndicator';
import { V7CinematicCanvas } from './V7CinematicCanvas';
import { useV7AudioManager } from './useV7AudioManager';
import { useV7SoundEffects } from './useV7SoundEffects';
import { useAnchorText, convertPauseKeywordsToActions, AnchorAction, AnchorEvent } from './useAnchorText';
import { V7SynchronizedCaptions } from '../V7SynchronizedCaptions';
import { V7DebugPanel } from '../V7DebugPanel';
import { useV7PlayerAdapter } from '../state/useV7PlayerAdapter';

import V7PhaseLoading from './phases/V7PhaseLoading';
import V7PhaseDramatic from './phases/V7PhaseDramatic';
import V7PhaseNarrative from './phases/V7PhaseNarrative';
import V7PhaseQuiz from './phases/V7PhaseQuiz';
import V7PhasePlayground from './phases/V7PhasePlayground';
import V7PhaseGamification from './phases/V7PhaseGamification';
import V7PhaseCTA from './phases/V7PhaseCTA';
import V7PhasePERFEITO from './phases/V7PhasePERFEITO';
import V7PhasePERFEITOSynced from './phases/V7PhasePERFEITOSynced';
import V7PhaseSecretReveal from './phases/V7PhaseSecretReveal';
import V7PhaseMethodReveal from './phases/V7PhaseMethodReveal';
import { V7TransitionParticles } from './effects/V7TransitionParticles';
import { V7MicroVisualOverlay } from './effects/V7MicroVisualOverlay';
import {
  V7LessonScript,
  V7Phase,
  V7TimeoutConfig,
  V7AudioBehavior,
  V7MicroVisual,
  usePhaseController
} from './phases/V7PhaseController';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// ✅ V7-vv Definitive: Feedback audio structure
interface FeedbackAudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
}

interface V7PhasePlayerProps {
  script: V7LessonScript;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  onComplete?: () => void;
  onExit?: () => void;
  // ✅ DEBUG: For V7DebugPanel
  rawContent?: any;
  detectionPath?: 'v7-vv' | 'emergency' | 'v7-v3' | 'legacy' | 'error' | null;
  // ✅ V7-vv Definitive: Feedback audios for quiz
  feedbackAudios?: Record<string, FeedbackAudioSegment>;
}

// Helper to format time in mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ✅ CRITICAL FIX: Scale phases to match actual audio duration at runtime
function scaleScriptToAudioDuration(script: V7LessonScript, actualAudioDuration: number): V7LessonScript {
  const scriptDuration = script.totalDuration;

  // Don't scale if durations are similar (within 5 seconds)
  if (Math.abs(scriptDuration - actualAudioDuration) < 5) {
    return script;
  }

  const scaleFactor = actualAudioDuration / scriptDuration;
  console.log(`[V7PhasePlayer] ⚡ RUNTIME SCALING: ${scriptDuration}s → ${actualAudioDuration}s (scale: ${scaleFactor.toFixed(3)})`);

  // Scale all phase timings
  const scaledPhases = script.phases.map((phase, index) => {
    const scaledStartTime = phase.startTime * scaleFactor;
    const scaledEndTime = phase.endTime * scaleFactor;

    // Scale scene timings within the phase
    const scaledScenes = phase.scenes.map(scene => ({
      ...scene,
      startTime: scene.startTime !== undefined ? scene.startTime * scaleFactor : undefined,
      duration: scene.duration !== undefined ? scene.duration * scaleFactor : undefined,
    }));

    console.log(`[V7PhasePlayer] Phase ${index + 1} "${phase.type}": ${phase.startTime.toFixed(1)}s-${phase.endTime.toFixed(1)}s → ${scaledStartTime.toFixed(1)}s-${scaledEndTime.toFixed(1)}s`);

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

export const V7PhasePlayer = ({
  script,
  audioUrl,
  wordTimestamps = [],
  onComplete,
  onExit,
  rawContent,
  detectionPath,
  feedbackAudios
}: V7PhasePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlayingWithoutAudio, setIsPlayingWithoutAudio] = useState(false);

  // ✅ DEBUG LOGS SOLICITADOS
  console.log('[V7PhasePlayer DEBUG] ==========================================');
  console.log('[V7PhasePlayer DEBUG] Script recebido:', {
    id: script?.id,
    title: script?.title,
    phasesCount: script?.phases?.length,
    firstPhaseType: script?.phases?.[0]?.type,
    firstPhaseScenesCount: script?.phases?.[0]?.scenes?.length,
  });
  console.log('[V7PhasePlayer DEBUG] Primeira phase completa:', JSON.stringify(script?.phases?.[0], null, 2));
  console.log('[V7PhasePlayer DEBUG] ==========================================');

  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects();

  // ✅ V7-v30 FIX: Track if we're in a blocking interactive phase
  // This ref is used to prevent onComplete from being called when audio ends
  // but we're still in an interactive phase (playground, quiz, etc.)
  const isInBlockingPhaseRef = useRef(false);

  // ✅ V7-v2: Audio hook with fade capabilities
  // ✅ V7-v30: Only call onComplete if NOT in blocking phase
  const audio = useV7AudioManager({
    onEnded: () => {
      // ✅ V7-v30: Check if we're in a blocking interactive phase
      if (isInBlockingPhaseRef.current) {
        console.log('[V7PhasePlayer] 🎧 Audio ended but in BLOCKING PHASE - NOT calling onComplete');
        return;
      }
      playSound('completion');
      onComplete?.();
    }
  });

  // Detect if audio is available
  const hasAudio = Boolean(audioUrl && audioUrl.length > 0);
  
  // ✅ DEBUG: Log wordTimestamps on mount
  useEffect(() => {
    console.log(`[V7PhasePlayer] 🎧 INIT - hasAudio: ${hasAudio}, wordTimestamps: ${wordTimestamps.length}`);
    if (wordTimestamps.length > 0) {
      console.log(`[V7PhasePlayer] 📝 First 5 words:`, wordTimestamps.slice(0, 5).map(w => `"${w.word}"@${w.start.toFixed(1)}s`));
      console.log(`[V7PhasePlayer] 📝 Last 5 words:`, wordTimestamps.slice(-5).map(w => `"${w.word}"@${w.start.toFixed(1)}s`));
    }
  }, [hasAudio, wordTimestamps]);

  // ✅ CRITICAL FIX: Scale script to actual audio duration when audio loads
  const scaledScript = useMemo(() => {
    // Only scale when we have audio with known duration
    if (hasAudio && audio.duration > 0) {
      return scaleScriptToAudioDuration(script, audio.duration);
    }
    return script;
  }, [script, audio.duration, hasAudio]);

  // Effective isPlaying state (works with or without audio)
  // ✅ V7-v16: Directly read from mainAudioRef for accurate state
  const effectiveIsPlaying = hasAudio ? audio.isPlaying : isPlayingWithoutAudio;
  
  // ✅ V7-v16 DEBUG: Log play state mismatch
  useEffect(() => {
    if (hasAudio) {
      console.log(`[V7PhasePlayer] ▶️ Play state: audio.isPlaying=${audio.isPlaying}, effectiveIsPlaying=${effectiveIsPlaying}`);
    }
  }, [audio.isPlaying, effectiveIsPlaying, hasAudio]);

  // ✅ V7-v9: Track when quiz result is showing to hide controls
  const [isQuizResultShowing, setIsQuizResultShowing] = useState(false);
  // ✅ V7-vv Definitive: Track feedback audio playback via machine
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<string | null>(null);

  // ✅ Level 4: XState machine integration via adapter
  // ALL state now comes from the machine - no more scattered useState!
  const machineAdapter = useV7PlayerAdapter({
    script,
    hasAudio,
    audioDuration: audio.duration,
    audioCurrentTime: audio.currentTime,
    audioIsPlaying: audio.isPlaying,
    onComplete,
    onExit,
  });

  // ✅ EXTRACT STATE FROM MACHINE - These replace the old useState hooks
  const { 
    lockedPhaseIndex, 
    interactionComplete, 
    showTransitionParticles, 
    transitionParticleColor,
    isNavigatingBack,
    isPlayingFeedbackAudio,
    triggerParticles,
  } = machineAdapter;

  // ✅ Log machine state for debugging
  useEffect(() => {
    console.log(`[V7PhasePlayer] 🤖 Machine state: ${machineAdapter.machineState}`);
  }, [machineAdapter.machineState]);

  // Phase controller with fallback timer for no-audio scenarios
  // ✅ Uses scaledScript which has correct timings based on actual audio duration
  // ✅ V7.1: Passes wordTimestamps for anchor-based phase transitions
  const {
    currentPhase: rawCurrentPhase,
    currentPhaseIndex: rawCurrentPhaseIndex,
    currentSceneIndex,
    phaseProgress,
    goToPhase,
    internalTime
  } = usePhaseController({
    script: scaledScript, // Use scaled script with correct timings
    currentTime: audio.currentTime,
    isPlaying: effectiveIsPlaying,
    hasAudio,
    wordTimestamps // ✅ V7.1: For enterAnchor-based phase transitions
  });

  // ✅ V7-v6: Override phase index when locked in interactive phase
  const currentPhaseIndex = lockedPhaseIndex !== null ? lockedPhaseIndex : rawCurrentPhaseIndex;
  const currentPhase = scaledScript.phases[currentPhaseIndex] || null;

  // Load audio
  useEffect(() => {
    if (audioUrl) {
      audio.loadAudio(audioUrl);
    }
  }, [audioUrl]);

  // Unlock audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [unlockAudio]);

  // ✅ V7-vv Definitive: Cleanup feedback audio on unmount
  useEffect(() => {
    return () => {
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
        feedbackAudioRef.current.src = '';
        feedbackAudioRef.current = null;
      }
    };
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Play sound on phase change
  useEffect(() => {
    if (currentPhaseIndex > 0 && !isLoading) {
      playSound('transition-whoosh');
    }
  }, [currentPhaseIndex, isLoading, playSound]);

  // ============================================
  // ÚNICO SISTEMA DE CONTROLE: AnchorText
  // NENHUM fallback, NENHUM timer, NENHUM % 
  // ============================================
  
  // Coleta anchor actions da fase atual (se tiver)
  const anchorActions = useMemo((): AnchorAction[] => {
    if (!currentPhase) return [];
    
    // 🔍 DIAGNOSTIC LOG: Show what's arriving at the player
    console.log(`[V7PhasePlayer] 🔍 Phase "${currentPhase.id}" data:`, {
      type: currentPhase.type,
      hasAnchorActions: !!currentPhase.anchorActions,
      anchorActionsCount: currentPhase.anchorActions?.length || 0,
      anchorActionsKeywords: currentPhase.anchorActions?.map((a: any) => a.keyword),
      hasPauseKeywords: !!currentPhase.pauseKeywords,
      pauseKeywordsCount: currentPhase.pauseKeywords?.length || 0,
      pauseKeywords: currentPhase.pauseKeywords,
    });
    
    if (currentPhase.anchorActions && currentPhase.anchorActions.length > 0) {
      console.log(`[V7PhasePlayer] ✅ Using anchorActions from DB:`, 
        currentPhase.anchorActions.map((a: any) => `${a.keyword} (${a.type})`));
      return currentPhase.anchorActions;
    }
    
    if (currentPhase.pauseKeywords && currentPhase.pauseKeywords.length > 0) {
      console.log(`[V7PhasePlayer] ⚠️ Using pauseKeywords as fallback:`, currentPhase.pauseKeywords);
      return convertPauseKeywordsToActions(currentPhase.pauseKeywords);
    }
    
    console.log(`[V7PhasePlayer] ❌ NO anchorActions OR pauseKeywords for phase "${currentPhase.id}"`);
    return [];
  }, [currentPhase]);

  // Verificações simples
  const hasWordTimestamps = wordTimestamps.length > 0;
  const hasAnchorActions = anchorActions.length > 0;
  
  // AnchorText habilitado APENAS quando temos wordTimestamps E anchorActions
  const shouldEnableAnchors = hasAudio && hasAnchorActions && hasWordTimestamps;
  
  // Log simples do status
  useEffect(() => {
    console.log(`[V7PhasePlayer] 🎯 Phase "${currentPhase?.id}": AnchorText ${shouldEnableAnchors ? 'ENABLED' : 'DISABLED'} (words: ${wordTimestamps.length}, actions: ${anchorActions.length})`);
  }, [currentPhase?.id, shouldEnableAnchors, wordTimestamps.length, anchorActions.length]);

  // ÚNICO useAnchorText - sem fallbacks, sem triggers globais
  const { 
    isPausedByAnchor, 
    manualResume,
    isElementVisible,
    isElementHighlighted,
    visibleElements,
    highlightedElements
  } = useAnchorText({
    wordTimestamps,
    currentTime: audio.currentTime,
    actions: anchorActions,
    isPlaying: audio.isPlaying,
    phaseId: currentPhase?.id || '',
    enabled: shouldEnableAnchors,
    onPause: () => {
      if (audio.isPlaying) {
        audio.pause();
        console.log(`[V7PhasePlayer] ⏸️ ANCHOR PAUSE - palavra detectada!`);
      }
    },
    onResume: () => {
      if (!audio.isPlaying) {
        audio.play();
        console.log(`[V7PhasePlayer] ▶️ ANCHOR RESUME`);
      }
    },
  });

  // ✅ V7-v30 FIX: Lock interactive phases IMMEDIATELY ao entrar
  // Isso impede que a fase avance pelo tempo E que onComplete seja chamado quando áudio termina
  // O lock aqui é sobre FASE e sobre IMPEDIR fim prematuro da aula!
  // CRITICAL: Don't lock when navigating backwards!
  useEffect(() => {
    // ✅ V7-v15: Skip locking if we're navigating backwards
    if (isNavigatingBack) {
      console.log(`[V7PhasePlayer] ⏭️ Skipping lock - navigating backwards`);
      isInBlockingPhaseRef.current = false;
      return;
    }
    
    // ✅ V7-v30 CRITICAL: Include 'playground' in blocking phases!
    // These phases BLOCK lesson completion until user explicitly completes them
    const isBlockingPhase = 
      currentPhase?.type === 'interaction' || 
      currentPhase?.type === 'secret-reveal' ||
      currentPhase?.type === 'playground';  // ← ADDED: Playground must block!
    
    // ✅ V7-v12: Also lock revelation phases that show PERFEITO (requires animation to complete)
    const isRevelationWithPERFEITO = currentPhase?.type === 'revelation' && 
      (currentPhase?.title?.toLowerCase().includes('perfeito') || 
       String((currentPhase?.scenes?.[0]?.content as Record<string, unknown>)?.mainText || '').toLowerCase().includes('perfeito'));
    
    // ✅ V7-v30: Update ref for audio onEnded check
    isInBlockingPhaseRef.current = isBlockingPhase || isRevelationWithPERFEITO;
    
    // ✅ CRITICAL: Lock IMEDIATAMENTE ao entrar na fase que bloqueia
    // O áudio continua tocando até o anchorText detectar a keyword ou interação completar
    // Sem esse lock, a fase mudaria automaticamente antes da interação/animação completar
    if ((isBlockingPhase || isRevelationWithPERFEITO) && lockedPhaseIndex === null) {
      console.log(`[V7PhasePlayer] 🔒 LOCKING phase ${currentPhaseIndex} (${currentPhase?.type}) - BLOCKING lesson completion`);
      machineAdapter.lockPhase(currentPhaseIndex);
    }
    
    // ✅ V7-v30: Log blocking state for debugging
    if (isBlockingPhase) {
      console.log(`[V7PhasePlayer] 🛡️ Phase "${currentPhase?.id}" is BLOCKING - audio.onEnded will NOT end lesson`);
    }
  }, [currentPhase?.type, currentPhase?.id, currentPhase?.title, currentPhase?.scenes, currentPhaseIndex, lockedPhaseIndex, isNavigatingBack]);

  // ✅ V7-v6: Reset lock when interaction completes - now handled by machine unlockPhase action

  // ✅ V7-v18: Trigger particle burst on specific phase transitions
  useEffect(() => {
    const prevPhaseType = previousPhaseRef.current;
    const currentPhaseType = currentPhase?.type;
    
    // Trigger particles when transitioning FROM revelation/secret-reveal TO playground
    if (prevPhaseType && currentPhaseType) {
      const isRevelationToPlayground = 
        (prevPhaseType === 'revelation' || prevPhaseType === 'secret-reveal') && 
        currentPhaseType === 'playground';
      
      const isInteractionToSecretReveal = 
        prevPhaseType === 'interaction' && 
        currentPhaseType === 'secret-reveal';
      
      const isPlaygroundToGamification = 
        prevPhaseType === 'playground' && 
        currentPhaseType === 'gamification';
      
      if (isRevelationToPlayground) {
        triggerParticles('cyan');
      } else if (isInteractionToSecretReveal) {
        triggerParticles('gold');
      } else if (isPlaygroundToGamification) {
        triggerParticles('emerald');
      }
    }
    
    previousPhaseRef.current = currentPhaseType || null;
  }, [currentPhase?.type]);

  // ✅ V7-v5: TODA pausa é controlada APENAS pelo anchorText
  useEffect(() => {
    if (currentPhase?.id) {
      console.log(`\n========================================`);
      console.log(`[V7PhasePlayer] 📍 PHASE TRANSITION`);
      console.log(`----------------------------------------`);
      console.log(`  Phase ID:    "${currentPhase.id}"`);
      console.log(`  Phase Type:  "${currentPhase.type}"`);
      console.log(`  Phase Index: ${currentPhaseIndex} / ${scaledScript.phases.length - 1}`);
      console.log(`  Start Time:  ${currentPhase.startTime?.toFixed(2)}s`);
      console.log(`  End Time:    ${currentPhase.endTime?.toFixed(2)}s`);
      console.log(`  Audio Time:  ${audio.currentTime?.toFixed(2)}s`);
      console.log(`  Audio State: ${audio.isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}`);
      console.log(`  Scenes:      ${currentPhase.scenes?.length || 0}`);
      console.log(`----------------------------------------`);
      
      // Log das próximas 2 fases para contexto
      const nextPhases = scaledScript.phases.slice(currentPhaseIndex + 1, currentPhaseIndex + 3);
      if (nextPhases.length > 0) {
        console.log(`  Next phases:`);
        nextPhases.forEach((p, i) => {
          console.log(`    [${currentPhaseIndex + 1 + i}] "${p.id}" (${p.type}) @ ${p.startTime?.toFixed(2)}s`);
        });
      }
      console.log(`========================================\n`);
      
      // ✅ V7-v25 FIX: SEEK + PLAY ao entrar em secret-reveal
      // O audio pode estar tocando na POSIÇÃO ERRADA (ex: 89s quando deveria ser 34s)
      // Precisamos SEEKAR para a posição correta da fase E garantir que está tocando
      if (currentPhase.type === 'secret-reveal' && hasAudio) {
        const phaseStartTime = currentPhase.startTime ?? 0;
        const audioCurrentTime = audio.currentTime ?? 0;
        const timeDrift = Math.abs(audioCurrentTime - phaseStartTime);
        
        console.log(`[V7PhasePlayer] ▶️ V7-v25: Secret-reveal phase entered`);
        console.log(`[V7PhasePlayer] 📍 Phase startTime: ${phaseStartTime}s, Audio currentTime: ${audioCurrentTime}s, Drift: ${timeDrift}s`);
        
        // Se drift > 5s, o áudio está fora de sync - precisa seekar
        if (timeDrift > 5) {
          console.log(`[V7PhasePlayer] 🔀 SEEKING audio to phase startTime ${phaseStartTime}s (was ${audioCurrentTime}s)`);
          audio.seekTo(phaseStartTime);
        }
        
        // Garantir que está tocando após seek
        setTimeout(() => {
          if (!audio.isPlaying) {
            audio.play();
            console.log(`[V7PhasePlayer] ▶️ Audio PLAY forced for secret-reveal`);
          }
        }, 100);
      }
    }
  }, [currentPhase?.id, currentPhase?.type, currentPhaseIndex, scaledScript.phases, audio.currentTime, audio.isPlaying, hasAudio, audio]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPhase();
      if (e.key === 'ArrowLeft') goToPreviousPhase();
      if (e.key === ' ') {
        e.preventDefault();
        audio.togglePlayPause();
      }
      if (e.key === 'm' || e.key === 'M') audio.toggleMute();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [audio, currentPhaseIndex]);

  // ✅ CRITICAL FIX: Calculate current scene based on currentTime
  // MUST be called BEFORE any early returns to maintain consistent hooks order
  // ONLY ONE scene should be active at a time!
  const currentScene = useMemo(() => {
    if (!currentPhase?.scenes || currentPhase.scenes.length === 0) {
      return null;
    }

    const effectiveTime = hasAudio ? audio.currentTime : internalTime;
    const phaseStartTime = currentPhase.startTime ?? 0;
    const relativeTime = effectiveTime - phaseStartTime;

    // Find the scene that matches the current time
    const activeScene = currentPhase.scenes.find((scene, idx) => {
      const sceneStart = scene.startTime ?? 0;
      const sceneDuration = scene.duration ?? 2; // Default 2 seconds
      const sceneEnd = sceneStart + sceneDuration;

      const isActive = relativeTime >= sceneStart && relativeTime < sceneEnd;

      if (isActive) {
        console.log(`[V7 SCENE DEBUG] Scene ${idx} "${scene.id}" is ACTIVE:`, {
          sceneStart,
          sceneEnd,
          relativeTime: relativeTime.toFixed(2),
        });
      }

      return isActive;
    });

    // If no scene found, return last scene (for end of phase)
    if (!activeScene && currentPhase.scenes.length > 0) {
      return currentPhase.scenes[currentPhase.scenes.length - 1];
    }

    return activeScene;
  }, [currentPhase, audio.currentTime, internalTime, hasAudio]);

  // ✅ V7-v18 FIX: Usar play() diretamente ao invés de togglePlayPause()
  // Isso garante que o áudio SEMPRE inicia, independente do estado isPlaying
  // O togglePlayPause() verificava isPlaying que poderia estar dessincronizado
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    if (hasAudio) {
      // ✅ CRITICAL: Usar play() diretamente para garantir que o áudio inicie
      audio.play();
      console.log('[V7PhasePlayer] ▶️ Audio started via play() after loading');
    } else {
      // Start internal timer when no audio
      setIsPlayingWithoutAudio(true);
    }
  }, [audio, hasAudio]);

  // ✅ CRITICAL FIX: Don't seek audio when coming from interactive phases (quiz/playground/secret-reveal)
  // These phases pause audio manually and should resume from current position
  // ✅ V7-v11: Accept optional fromPhaseIndex to handle locked phase navigation correctly
  const goToNextPhase = useCallback((skipAudioSeek: boolean = false, fromPhaseIndex?: number) => {
    // ✅ V7-v11: Use provided fromPhaseIndex if given (for locked phases), otherwise use currentPhaseIndex
    const effectiveCurrentIndex = fromPhaseIndex ?? currentPhaseIndex;
    const currentPhaseId = scaledScript.phases[effectiveCurrentIndex]?.id;
    const currentPhaseType = scaledScript.phases[effectiveCurrentIndex]?.type;
    
    if (effectiveCurrentIndex < scaledScript.phases.length - 1) {
      playSound('transition-whoosh');
      const nextPhaseIndex = effectiveCurrentIndex + 1;
      const nextPhase = scaledScript.phases[nextPhaseIndex];

      console.log(`\n⏭️ [V7PhasePlayer] GO TO NEXT PHASE`);
      console.log(`  From: [${effectiveCurrentIndex}] "${currentPhaseId}" (${currentPhaseType})`);
      console.log(`  To:   [${nextPhaseIndex}] "${nextPhase?.id}" (${nextPhase?.type})`);
      console.log(`  Audio: ${audio.currentTime?.toFixed(2)}s | ${audio.isPlaying ? 'PLAYING' : 'PAUSED'}`);

      // ✅ V7-v27 FIX: ALWAYS seek when coming from interactive phases
      // This is critical because during interactive phases, the audio may have continued playing
      // or the user may have paused/seeked, causing the audio time to be completely out of sync
      // with the expected phase timings. We MUST sync the audio to the next phase's startTime.
      const isInteractivePhase = currentPhaseType === 'interaction' || currentPhaseType === 'playground' || currentPhaseType === 'secret-reveal';
      
      // ✅ V7-v27: CRITICAL - Check if audio is significantly out of sync with next phase
      // If the audio time is MORE than 5 seconds away from the next phase's startTime,
      // we MUST seek to prevent skipping phases
      const audioTime = audio.currentTime || 0;
      const nextPhaseStart = nextPhase?.startTime || 0;
      const timeDrift = Math.abs(audioTime - nextPhaseStart);
      const isAudioOutOfSync = timeDrift > 5;
      
      // Seek if:
      // 1. Not coming from interactive phase AND not skipAudioSeek AND normal behavior, OR
      // 2. Coming from interactive phase AND audio is significantly out of sync
      const shouldSeekNormal = hasAudio && nextPhase && !skipAudioSeek && !isInteractivePhase;
      const shouldSeekForSync = hasAudio && nextPhase && isInteractivePhase && isAudioOutOfSync;
      
      if (shouldSeekNormal) {
        audio.seekTo(nextPhaseStart);
        console.log(`  🔀 SEEKING to ${nextPhaseStart.toFixed(2)}s (normal navigation)`);
      } else if (shouldSeekForSync) {
        // ✅ V7-v27: CRITICAL FIX - Seek audio back to next phase start to prevent skipping
        audio.seekTo(nextPhaseStart);
        console.log(`  🔀 SEEKING to ${nextPhaseStart.toFixed(2)}s (audio was at ${audioTime.toFixed(2)}s, drift: ${timeDrift.toFixed(2)}s) - SYNC FIX`);
      } else if (isInteractivePhase && !isAudioOutOfSync) {
        console.log(`  ⏸️ From interactive phase - NOT seeking (audio in sync, drift: ${timeDrift.toFixed(2)}s)`);
      }

      goToPhase(nextPhaseIndex);
    } else {
      console.log(`\n🏁 [V7PhasePlayer] LESSON COMPLETE - calling onComplete()`);
      onComplete?.();
    }
  }, [currentPhaseIndex, scaledScript.phases, playSound, goToPhase, onComplete, hasAudio, audio]);

  // ✅ V7-v15 FIX: Improved back navigation - reset all states and properly sync audio
  const goToPreviousPhase = useCallback(() => {
    // Use effective index considering locked state
    const effectiveIndex = lockedPhaseIndex !== null ? lockedPhaseIndex : currentPhaseIndex;
    
    if (effectiveIndex > 0) {
      playSound('click-soft');
      const prevPhaseIndex = effectiveIndex - 1;
      const prevPhase = scaledScript.phases[prevPhaseIndex];

      console.log(`\n⏮️ [V7PhasePlayer] GO TO PREVIOUS PHASE`);
      console.log(`  From: [${effectiveIndex}] (locked: ${lockedPhaseIndex !== null})`);
      console.log(`  To:   [${prevPhaseIndex}] "${prevPhase?.id}" (${prevPhase?.type})`);

      // ✅ V7-v15: Mark that we're navigating back (prevents re-locking)
      machineAdapter.setIsNavigatingBack(true);

      // ✅ V7-v15: Reset ALL interaction states
      if (lockedPhaseIndex !== null) {
        console.log(`  🔓 Unlocking phase for back navigation`);
        machineAdapter.unlockPhase();
      }
      setIsQuizResultShowing(false);

      // ✅ V7-v16: Reset audio interaction state (so togglePlayPause works again)
      audio.resetInteraction();

      // ✅ V7-v15: CRITICAL - Seek audio BEFORE navigation
      // Need to subtract 3 to account for the +3 offset in V7PhaseController
      if (hasAudio && prevPhase) {
        // The startTime in the script already includes the offset, so seek directly
        const seekTime = Math.max(0, prevPhase.startTime - 3);
        audio.seekTo(seekTime);
        console.log(`  🔀 Seeking audio to ${seekTime.toFixed(1)}s (phase startTime: ${prevPhase.startTime.toFixed(1)}s)`);
        
        // ✅ V7-v16: Always resume audio when going back
        setTimeout(() => {
          audio.play();
          console.log(`  ▶️ Audio resumed after navigation`);
        }, 100);
      }

      goToPhase(prevPhaseIndex);
      
      // ✅ V7-v15: Clear navigation flag after a short delay
      setTimeout(() => {
        machineAdapter.setIsNavigatingBack(false);
      }, 500);
    }
  }, [currentPhaseIndex, scaledScript.phases, playSound, goToPhase, hasAudio, audio, lockedPhaseIndex]);

  const handleQuizComplete = useCallback((selectedIds: string[]) => {
    playSound('success');

    // ✅ V7-vv-v3: Get actual next phase from locked or current index
    const effectiveIndex = lockedPhaseIndex !== null ? lockedPhaseIndex : currentPhaseIndex;
    const nextPhaseIndex = effectiveIndex + 1;
    const nextPhase = scaledScript.phases[nextPhaseIndex];

    console.log(`\n🎯 [V7PhasePlayer] QUIZ COMPLETE`);
    console.log(`  Selected:   [${selectedIds.join(', ')}]`);
    console.log(`  Current:    "${currentPhase?.id}" (index: ${currentPhaseIndex}, locked: ${lockedPhaseIndex})`);
    console.log(`  Effective:  index ${effectiveIndex}`);
    console.log(`  Next:       "${nextPhase?.id}" (${nextPhase?.type}) @ ${nextPhase?.startTime?.toFixed(2)}s`);
    console.log(`  Audio at:   ${audio.currentTime?.toFixed(2)}s`);
    console.log(`  FeedbackAudios:`, feedbackAudios ? Object.keys(feedbackAudios) : 'NONE');

    // ✅ V7-v6: Mark interaction as complete to unlock phase
    machineAdapter.setInteractionComplete(true);

    // ✅ V7-vv Definitive: Helper to continue after feedback
    const continueToNextPhase = () => {
      // ✅ V7-vv-v3: CRITICAL FIX - Unlock FIRST, then navigate
      if (lockedPhaseIndex !== null) {
        console.log(`  🔓 Unlocking phase ${lockedPhaseIndex}`);
        machineAdapter.unlockPhase();
      }

      // ✅ V7-vv-v3: ALWAYS seek audio to next phase start - NO EXCEPTIONS
      if (hasAudio && nextPhase) {
        const nextStartTime = nextPhase.startTime || 0;
        console.log(`  🔀 SEEKING to ${nextStartTime.toFixed(2)}s`);
        audio.seekTo(nextStartTime);
      }

      // ✅ FIX: SEMPRE dar play no áudio, incluindo para secret-reveal
      // O secret-reveal precisa do áudio PRINCIPAL tocando para a narração funcionar!
      manualResume();

      // ✅ Resume audio after seek - SEMPRE, para qualquer fase
      // IMPORTANTE: Usar delay maior e retry para garantir que o play funcione
      if (hasAudio) {
        const attemptPlay = (attempt: number) => {
          console.log(`[V7PhasePlayer] 🎵 Attempt ${attempt} to resume audio...`);
          audio.play();
          
          // Verificar se realmente está tocando após 100ms
          setTimeout(() => {
            if (!audio.isPlaying) {
              console.warn(`[V7PhasePlayer] ⚠️ Audio still not playing after attempt ${attempt}`);
              if (attempt < 3) {
                attemptPlay(attempt + 1);
              }
            } else {
              console.log(`[V7PhasePlayer] ▶️ Audio RESUMED after quiz @ ${audio.currentTime?.toFixed(2)}s (attempt ${attempt})`);
            }
          }, 100);
        };
        
        setTimeout(() => attemptPlay(1), 200);
      }

      // ✅ V7-vv-v3: Navigate to next phase AFTER unlock and seek
      setTimeout(() => {
        goToPhase(nextPhaseIndex);
        console.log(`  ➡️ Navigated to phase ${nextPhaseIndex}`);
      }, 50);
    };

    // ✅ V7-vv Definitive: Check if we have feedback audio for the selected option
    const selectedOptionId = selectedIds[0]; // First selected option
    const feedbackAudioKey = `feedback-${selectedOptionId}`;
    const feedbackAudio = feedbackAudios?.[feedbackAudioKey];

    if (feedbackAudio?.url) {
      console.log(`  🎧 Playing feedback audio for option "${selectedOptionId}"`);
      console.log(`  🎧 Audio URL: ${feedbackAudio.url}`);

      // Pause main audio while playing feedback
      if (hasAudio && audio.isPlaying) {
        audio.pause();
        console.log(`  ⏸️ Main audio PAUSED for feedback playback`);
      }

      machineAdapter.playFeedbackAudio(feedbackAudio.url);

      // Create or reuse audio element for feedback
      if (!feedbackAudioRef.current) {
        feedbackAudioRef.current = new Audio();
      }

      const feedbackEl = feedbackAudioRef.current;
      feedbackEl.src = feedbackAudio.url;

      // When feedback audio ends, continue to next phase
      feedbackEl.onended = () => {
        console.log(`  ✅ Feedback audio COMPLETED`);
        machineAdapter.onFeedbackAudioEnded();
        continueToNextPhase();
      };

      // Handle errors gracefully - continue anyway
      feedbackEl.onerror = (e) => {
        console.error(`  ❌ Feedback audio ERROR:`, e);
        machineAdapter.onFeedbackAudioError();
        continueToNextPhase();
      };

      // Play feedback audio
      feedbackEl.play().catch(err => {
        console.error(`  ❌ Feedback audio PLAY error:`, err);
        machineAdapter.onFeedbackAudioError();
        continueToNextPhase();
      });
    } else {
      // No feedback audio - continue immediately
      console.log(`  ⚠️ No feedback audio found for key "${feedbackAudioKey}"`);
      continueToNextPhase();
    }
  }, [playSound, manualResume, currentPhaseIndex, currentPhase, scaledScript.phases, audio, hasAudio, lockedPhaseIndex, goToPhase, feedbackAudios]);

  const handlePlaygroundComplete = useCallback(() => {
    playSound('success');

    // ✅ V7-vv-v2: Get actual next phase from locked or current index
    const effectiveIndex = lockedPhaseIndex !== null ? lockedPhaseIndex : currentPhaseIndex;
    const nextPhaseIndex = effectiveIndex + 1;
    const nextPhase = scaledScript.phases[nextPhaseIndex];

    console.log(`\n🎮 [V7PhasePlayer] PLAYGROUND COMPLETE`);
    console.log(`  Current:    "${currentPhase?.id}" (index: ${currentPhaseIndex}, locked: ${lockedPhaseIndex})`);
    console.log(`  Next:       "${nextPhase?.id}" (${nextPhase?.type}) @ ${nextPhase?.startTime?.toFixed(2)}s`);
    console.log(`  Audio at:   ${audio.currentTime?.toFixed(2)}s`);
    console.log(`  Total phases: ${scaledScript.phases.length}`);

    // ✅ V7-v30: Clear blocking state since we're completing the interaction
    isInBlockingPhaseRef.current = false;

    // ✅ V7-v6: Mark interaction as complete to unlock phase
    machineAdapter.setInteractionComplete(true);

    // ✅ V7-v30: Check if this is the LAST phase - if so, complete the lesson!
    if (!nextPhase) {
      console.log(`[V7PhasePlayer] 🏁 PLAYGROUND is LAST PHASE - completing lesson!`);
      playSound('completion');
      setTimeout(() => {
        onComplete?.();
      }, 500);
      return;
    }

    // ✅ V7-vv-v2: ALWAYS seek audio to next phase start for proper sync
    if (hasAudio && nextPhase) {
      const nextStartTime = nextPhase.startTime || 0;
      const audioTime = audio.currentTime || 0;
      const drift = Math.abs(audioTime - nextStartTime);

      if (drift > 2) {
        console.log(`  🔀 SEEKING to ${nextStartTime.toFixed(2)}s (drift: ${drift.toFixed(2)}s)`);
        audio.seekTo(nextStartTime);
      }
    }

    // ✅ Trigger resume via anchor text system
    manualResume();

    // ✅ Resume audio for next phase narration
    if (hasAudio && !audio.isPlaying) {
      setTimeout(() => {
        audio.play();
        console.log('[V7PhasePlayer] ▶️ Audio resumed after playground');
      }, 100);
    }

    setTimeout(() => goToNextPhase(false, effectiveIndex), 1000);
  }, [playSound, goToNextPhase, hasAudio, audio, manualResume, lockedPhaseIndex, currentPhaseIndex, currentPhase, scaledScript.phases, onComplete]);

  // Track if CTA was already clicked to prevent double navigation
  const [ctaClicked, setCtaClicked] = useState(false);

  // Reset ctaClicked when phase changes (in case user navigates back)
  useEffect(() => {
    setCtaClicked(false);
  }, [currentPhaseIndex]);

  const handleCTAChoice = useCallback((choice: 'negative' | 'positive') => {
    // Prevent multiple clicks
    if (ctaClicked) {
      console.log('[V7PhasePlayer] CTA already clicked, ignoring');
      return;
    }

    setCtaClicked(true);
    console.log('[V7PhasePlayer] CTA choice:', choice);

    if (choice === 'positive') {
      playSound('success');
    }

    // ✅ V7-v27 FIX: Resume audio after CTA choice
    manualResume();
    if (hasAudio && !audio.isPlaying) {
      audio.play();
      console.log('[V7PhasePlayer] ▶️ Audio RESUMED after CTA choice');
    }

    // Small delay to show selection animation before navigating
    setTimeout(() => {
      goToNextPhase();
    }, 800);
  }, [ctaClicked, playSound, goToNextPhase, manualResume, hasAudio, audio]);

  // Get canvas mood based on phase type
  const getCanvasMood = (type?: V7Phase['type']): 'dramatic' | 'calm' | 'energetic' | 'mysterious' => {
    switch (type) {
      case 'dramatic': return 'dramatic';
      case 'narrative': return 'mysterious';
      case 'interaction': return 'energetic';
      case 'playground': return 'calm';
      case 'revelation': return 'energetic';
      case 'gamification': return 'energetic';
      case 'secret-reveal': return 'dramatic'; // ✅ Gold explosion mood
      default: return 'dramatic';
    }
  };

  // Calculate duration string (use scaled duration for accurate display)
  const minutes = Math.floor(scaledScript.totalDuration / 60);
  const seconds = Math.floor(scaledScript.totalDuration % 60);
  const totalDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Show loading screen
  if (isLoading) {
    return <V7PhaseLoading onComplete={handleLoadingComplete} duration={3000} />;
  }

  // Extract scene content with fallbacks (cast to any for flexible DB data)
  const getSceneContent = (sceneIndex: number = 0): any => {
    const scene = currentPhase?.scenes?.[sceneIndex];
    return scene?.content || {};
  };

  // ✅ FIX: Extract string from possibly object content (e.g., {text, fontSize, animation})
  const extractTextFromContent = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value?.text) return value.text;
    if (typeof value === 'object' && value?.content) return value.content;
    return '';
  };

  // Get content from the CURRENT scene only (not all scenes combined)
  const getCurrentSceneContent = (): any => {
    if (!currentScene?.content) return {};
    return currentScene.content;
  };

  // For phases that need progressive content (combines scenes UP TO currentTime)
  const getCombinedSceneContent = (): any => {
    if (!currentPhase?.scenes) return {};

    const effectiveTime = hasAudio ? audio.currentTime : internalTime;
    const phaseStartTime = currentPhase.startTime ?? 0;
    const relativeTime = effectiveTime - phaseStartTime;

    // Merge only scenes that have STARTED (not future scenes)
    const combined: any = {};
    currentPhase.scenes
      .filter(scene => {
        const sceneStart = scene.startTime ?? 0;
        return relativeTime >= sceneStart; // Only include scenes that have started
      })
      .forEach((scene, idx) => {
        console.log('[V7 SCENE DEBUG] Including scene in combined:', {
          id: scene.id,
          type: scene.type,
          startTime: scene.startTime,
        });
        
        const content = scene.content || {};
        Object.keys(content).forEach(key => {
          // Keep first non-empty value for each key
          if (!combined[key] && content[key]) {
            combined[key] = content[key];
          }
        });
      });
    return combined;
  };

  // Render current phase content using DYNAMIC data from database
  const renderPhaseContent = () => {
    if (!currentPhase) return null;

    const content = getSceneContent(currentSceneIndex);
    const firstSceneContent = getSceneContent(0);

    switch (currentPhase.type) {
      case 'dramatic':
        // ✅ V7-v33 FIX: Check if this is a text-reveal visual (e.g., "O MÉTODO PERFEITO" transition)
        const dramaticVisual = (currentPhase as any).visual;
        if (dramaticVisual?.type === 'text-reveal') {
          const revealContent = dramaticVisual.content || {};
          console.log('[V7PhasePlayer] 🎬 DRAMATIC TEXT-REVEAL detected:', revealContent);
          // ✅ FIX: Only render V7PhaseMethodReveal if highlightWord is explicitly set
          // Otherwise use V7PhaseDramatic with just mainText (e.g. "SEJA HONESTO.")
          if (revealContent.highlightWord) {
            return (
              <V7PhaseMethodReveal
                mainText={revealContent.mainText || 'O MÉTODO'}
                highlightWord={revealContent.highlightWord}
              />
            );
          }
          // No highlightWord - render as simple text reveal with V7PhaseDramatic
          return (
            <V7PhaseDramatic
              mainNumber=""
              subtitle=""
              hookQuestion={revealContent.mainText || ''}
              sceneIndex={currentSceneIndex}
              phaseProgress={phaseProgress}
              mood={revealContent.mood === 'danger' ? 'danger' : revealContent.mood === 'success' ? 'success' : 'neutral'}
            />
          );
        }

        // ✅ V7-vv FIX: Get content from phase.visual.content FIRST (database format)
        // Then fallback to scenes (legacy format)
        const dramaticVisualContent = (currentPhase as any).visual?.content || {};
        const dramaticContent = getCombinedSceneContent();
        
        // Get impactWord from scene 5 specifically (impact scene)
        const impactScene = getSceneContent(5);
        // Get hookQuestion from scene 0 specifically (letterbox scene)
        const letterboxScene = getSceneContent(0);

        // ✅ CRITICAL: Ensure hookQuestion is always shown at start
        // V7-vv stores in visual.content.hookQuestion
        const extractedHook = dramaticVisualContent.hookQuestion || letterboxScene.hookQuestion || letterboxScene.mainText || dramaticContent.hookQuestion || '';
        const hookQuestion = extractedHook || 'VOCÊ SABIA?';

        console.log('[V7PhasePlayer] 🎬 Dramatic phase rendering:', {
          phaseId: currentPhase.id,
          visualContentNumber: dramaticVisualContent.number,
          visualContentShowSecondary: dramaticVisualContent.showSecondaryAsMain,
          phaseMood: currentPhase.mood,
          hookQuestion,
          sceneIndex: currentSceneIndex
        });

        // ✅ V7-vv FIX: Read showSecondaryAsMain from visual.content FIRST!
        // This is where the database stores it in V7-vv format
        const showSecondaryAsMain = dramaticVisualContent.showSecondaryAsMain === true ||
          dramaticContent.showSecondaryAsMain === true ||
          (currentPhase.mood === 'success');

        // ✅ V7-vv FIX: Read number and secondaryNumber from visual.content
        const mainNumber = String(dramaticVisualContent.number || dramaticContent.number || '98%');
        const secondaryNumber = dramaticVisualContent.secondaryNumber || dramaticContent.secondaryNumber || '2%';
        const subtitle = dramaticVisualContent.subtitle || dramaticContent.subtitle || currentPhase.title || '';

        return (
          <V7PhaseDramatic
            mainNumber={mainNumber}
            secondaryNumber={secondaryNumber}
            subtitle={subtitle}
            highlightWord={dramaticVisualContent.highlightWord || dramaticContent.highlightWord}
            impactWord={impactScene.mainText || dramaticVisualContent.highlightWord || dramaticContent.highlightWord || ''}
            hookQuestion={hookQuestion}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            mood={currentPhase.mood === 'danger' ? 'danger' : currentPhase.mood === 'success' ? 'success' : 'neutral'}
            showSecondaryAsMain={showSecondaryAsMain}
          />
        );

      case 'narrative':
      case 'comparison': // ✅ V7-v30: COMPARISON usa mesmo renderizador que NARRATIVE (leftCard/rightCard)
        // CORRECT: Scene 0 has main comparison items, Scene 1 has detailed comparisons, Scene 2 has warning
        const scene0Content = getSceneContent(0); // Main comparison items
        const scene1Content = getSceneContent(1); // Detailed comparisons
        const scene2Warning = getSceneContent(2); // Warning/urgency section
        const narrativeContent = getCombinedSceneContent();

        // ✅ V7-vv: Extract visual content for split-screen (left/right + centerPrompt)
        const narrativeVisualContent = (currentPhase as any).visual?.content || {};
        const leftVisual = narrativeVisualContent.left || {};
        const rightVisual = narrativeVisualContent.right || {};
        
        // ✅ Center prompt - look for centerPrompt or first item as example prompt
        const centerPrompt = narrativeVisualContent.centerPrompt || narrativeVisualContent.examplePrompt || '';
        const centerEmoji = narrativeVisualContent.centerEmoji || '🍌';

        // Extract left/right from scene 0 items (format: {label, value, isNegative/isPositive})
        const mainItems = scene0Content.items || [];
        const leftItem = mainItems.find((item: any) => item.isNegative) || mainItems[0] || {};
        const rightItem = mainItems.find((item: any) => item.isPositive) || mainItems[1] || {};

        // Build comparisons array from scene 1 items (format: {label, left, right})
        const detailedItems = scene1Content.items || [];
        const comparisons = detailedItems.length > 0
          ? detailedItems.map((item: any) => ({
              label: item.label || '',
              leftValue: item.left || '',
              rightValue: item.right || '',
              leftColor: '#ff6b6b',
              rightColor: '#4ecdc4'
            }))
          : [{
              label: scene0Content.mainText || 'Comparação',
              leftValue: leftItem.value || '',
              rightValue: rightItem.value || '',
              leftColor: '#ff6b6b',
              rightColor: '#4ecdc4'
            }];

        return (
          <V7PhaseNarrative
            leftTitle={leftVisual.label || leftItem.label || '98% BRINCANDO'}
            rightTitle={rightVisual.label || rightItem.label || '2% DOMINANDO'}
            leftEmoji={leftVisual.emoji || '😂'}
            rightEmoji={rightVisual.emoji || '💰'}
            comparisons={comparisons}
            warningTitle={scene2Warning.mainText || scene2Warning.highlightWord || ''}
            warningSubtitle={scene2Warning.subtitle || ''}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            centerPrompt={centerPrompt}
            centerEmoji={centerEmoji}
          />
        );

      case 'interaction':
        // ✅ V7-vv: Check interaction type FIRST
        const interactionType = (currentPhase.interaction as any)?.type;

        // ✅ V7-vv: CTA-BUTTON - Render button that advances to next phase
        if (interactionType === 'cta-button') {
          const ctaInteraction = currentPhase.interaction as any;
          const ctaContent = getCombinedSceneContent();
          const ctaButtonText = ctaInteraction.buttonText || 'CONTINUAR';

          // ✅ FIX: Botão só ativa quando narração termina
          // isPausedByAnchor=true OU áudio está a menos de 2s do fim da fase
          const phaseEndTime = currentPhase.endTime;
          const audioNearEnd = hasAudio && phaseEndTime && (audio.currentTime >= phaseEndTime - 2);
          const ctaButtonEnabled = isPausedByAnchor || audioNearEnd || !hasAudio;

          const handleCtaClick = () => {
            if (!ctaButtonEnabled) return; // Prevent click if disabled
            
            console.log('[V7PhasePlayer] CTA clicked, resuming audio and advancing');

            // Get next phase info for seeking
            const effectiveIndex = lockedPhaseIndex !== null ? lockedPhaseIndex : currentPhaseIndex;
            const nextPhaseIndex = effectiveIndex + 1;
            const nextPhase = scaledScript.phases[nextPhaseIndex];

            // ✅ FIX: Unlock and reset state FIRST
            machineAdapter.unlockPhase();
            machineAdapter.setInteractionComplete(true);
            
            // ✅ Resume anchor system BEFORE playing audio
            manualResume();

            // ✅ V7-vv FIX: GARANTIR que o áudio toca - múltiplas tentativas
            if (hasAudio) {
              const nextStartTime = nextPhase?.startTime || audio.currentTime;
              console.log(`[V7PhasePlayer] CTA: Seeking to ${nextStartTime.toFixed(2)}s and PLAYING`);
              
              // Seek to next phase start
              audio.seekTo(nextStartTime);
              
              // Force play with multiple attempts
              const forcePlay = () => {
                // Ensure volume is up
                audio.setVolume(0.8);
                audio.play();
                console.log('[V7PhasePlayer] ▶️ Audio PLAY called');
              };
              
              // Immediate play
              forcePlay();
              
              // Retry after short delays to ensure play works
              setTimeout(forcePlay, 100);
              setTimeout(forcePlay, 300);
              setTimeout(() => {
                if (!audio.isPlaying) {
                  console.log('[V7PhasePlayer] ⚠️ Audio still not playing, forcing again');
                  forcePlay();
                }
              }, 500);
            }

            // ✅ FIX: Navigate LAST, after all audio setup
            goToPhase(nextPhaseIndex);
          };

          return (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-8">
              {/* Title */}
              {ctaContent.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {ctaContent.title}
                </h2>
              )}

              {/* Subtitle */}
              {ctaContent.subtitle && (
                <p className="text-xl text-gray-300 max-w-2xl">
                  {ctaContent.subtitle}
                </p>
              )}

              {/* Cards if present */}
              {ctaContent.cards && Array.isArray(ctaContent.cards) && (
                <div className="flex flex-wrap justify-center gap-4 my-6">
                  {ctaContent.cards.map((card: any, idx: number) => (
                    <div
                      key={card.id || idx}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 min-w-[150px] transform hover:scale-105 transition-transform"
                    >
                      <p className="text-lg font-semibold text-cyan-400">{card.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button - ✅ FIX: Só ativo quando narração termina */}
              <button
                onClick={handleCtaClick}
                disabled={!ctaButtonEnabled}
                className={`px-8 py-4 text-xl font-bold rounded-xl shadow-lg transform transition-all duration-300 ${
                  ctaButtonEnabled
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white hover:scale-105 animate-pulse cursor-pointer'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {ctaButtonEnabled ? ctaButtonText : '⏳ Aguarde a narração...'}
              </button>
            </div>
          );
        }

        // ✅ QUIZ - Default interaction type
        // Combine content from ALL interaction scenes
        const interactionContent = getCombinedSceneContent();

        // ✅ V7-v3 FIX: Options can be in phase.interaction.options (V7-v3 JSON format)
        // or in scenes[].content.options (legacy format)
        const phaseInteractionOptions = (currentPhase.interaction as any)?.options;
        const rawOptions = phaseInteractionOptions || interactionContent.options || content.options || firstSceneContent.options || [];

        console.log('[V7PhasePlayer:interaction] 🎯 Options source:', {
          'phase.interaction.options': phaseInteractionOptions?.length || 0,
          'interactionContent.options': interactionContent.options?.length || 0,
          'content.options': content.options?.length || 0,
          'firstSceneContent.options': firstSceneContent.options?.length || 0,
          'rawOptions': rawOptions.length
        });

        const quizOptions = rawOptions.map((opt: any) => ({
          id: opt.id || String(Math.random()),
          text: opt.label || opt.text || '',
          category: (opt.isCorrect === true || opt.category === 'good' ? 'good' : 'bad') as 'good' | 'bad'
        }));

        // ✅ V7-v2: Extract timeout config from phase
        const quizTimeoutConfig = currentPhase.timeout ? {
          soft: currentPhase.timeout.soft,
          medium: currentPhase.timeout.medium,
          hard: currentPhase.timeout.hard,
          hints: currentPhase.timeout.hints
        } : undefined;

        // ✅ V7-v3 FIX: Also extract feedback from phase.interaction
        const quizPhaseInteraction = currentPhase.interaction as any || {};
        const quizQuestion = quizPhaseInteraction.question || interactionContent.mainText || content.mainText;
        const quizCorrectFeedback = quizPhaseInteraction.correctFeedback || interactionContent.correctFeedback || content.correctFeedback;
        const quizIncorrectFeedback = quizPhaseInteraction.incorrectFeedback || interactionContent.incorrectFeedback || content.incorrectFeedback;

        return (
          <V7PhaseQuiz
            title={extractTextFromContent(quizQuestion) || 'Responda:'}
            subtitle={extractTextFromContent(interactionContent.subtitle || content.subtitle) || (currentPhase as any).visualContent?.subtitle || ''}
            options={quizOptions}
            revealTitle="RESULTADO"
            revealMessage={extractTextFromContent(interactionContent.explanation || content.explanation) || ''}
            revealValue=""
            correctFeedback={extractTextFromContent(quizCorrectFeedback)}
            incorrectFeedback={extractTextFromContent(quizIncorrectFeedback)}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            onComplete={handleQuizComplete}
            audioControl={audio}
            isPausedByAnchor={isPausedByAnchor}
            onResultShow={(isShowing) => setIsQuizResultShowing(isShowing)}
            timeoutConfig={quizTimeoutConfig}
          />
        );

      case 'playground':
        // ✅ V7-v31 DEFINITIVE FIX: Extract data from phase.interaction AND phase.visual
        // The database stores playground data in:
        // - currentPhase.interaction.amateurPrompt / professionalPrompt / comparison
        // - currentPhase.visual.content.title / subtitle
        const playgroundInteraction = (currentPhase as any).interaction || {};
        const playgroundVisual = (currentPhase as any).visual?.content || {};
        const playgroundSceneContent = getCombinedSceneContent();

        // Log for debugging
        console.log('[V7PhasePlayer] 🎮 PLAYGROUND DATA:');
        console.log('  interaction:', JSON.stringify(playgroundInteraction, null, 2));
        console.log('  visual:', JSON.stringify(playgroundVisual, null, 2));

        // ✅ Extract prompts from interaction (primary source from database)
        const pgAmateurPrompt = playgroundInteraction.amateurPrompt || 
                                playgroundSceneContent.amateurPrompt || 
                                content.amateurPrompt || 
                                'Me dá ideias de negócio';
        
        const pgProfessionalPrompt = playgroundInteraction.professionalPrompt || 
                                     playgroundSceneContent.professionalPrompt || 
                                     content.professionalPrompt || 
                                     'prompt profissional estruturado';

        // ✅ Extract comparison results from interaction.comparison
        const comparison = playgroundInteraction.comparison || {};
        const amateurComparison = comparison.amateur || {};
        const professionalComparison = comparison.professional || {};

        // ✅ Extract results - support both direct and comparison formats
        const pgAmateurResultText = amateurComparison.response || 
                                    playgroundInteraction.amateurResult?.content ||
                                    playgroundInteraction.amateurResult ||
                                    playgroundSceneContent.amateurResult?.content ||
                                    playgroundSceneContent.amateurResult ||
                                    content.amateurResult?.content ||
                                    content.amateurResult ||
                                    'Resultado genérico do prompt amador...';
        
        const pgProfessionalResultText = professionalComparison.response || 
                                         playgroundInteraction.professionalResult?.content ||
                                         playgroundInteraction.professionalResult ||
                                         playgroundSceneContent.professionalResult?.content ||
                                         playgroundSceneContent.professionalResult ||
                                         content.professionalResult?.content ||
                                         content.professionalResult ||
                                         'Resultado otimizado do prompt profissional...';

        // ✅ Extract scores with proper fallbacks
        const pgAmateurScore = typeof playgroundInteraction.amateurScore === 'number'
          ? playgroundInteraction.amateurScore
          : (typeof playgroundSceneContent.amateurScore === 'number' 
              ? playgroundSceneContent.amateurScore 
              : (typeof content.amateurScore === 'number' ? content.amateurScore : 10));
        
        const pgProfessionalScore = typeof playgroundInteraction.professionalScore === 'number'
          ? playgroundInteraction.professionalScore
          : (typeof playgroundSceneContent.professionalScore === 'number' 
              ? playgroundSceneContent.professionalScore 
              : (typeof content.professionalScore === 'number' ? content.professionalScore : 95));
        
        const pgMaxScore = 100;

        // Determine verdict based on score
        const getPlaygroundVerdict = (score: number): 'bad' | 'good' | 'excellent' => {
          if (score < 30) return 'bad';
          if (score < 70) return 'good';
          return 'excellent';
        };

        // ✅ Extract title/subtitle from visual.content (primary) or scene content
        const pgTitle = playgroundVisual.title || 
                        playgroundSceneContent.mainText || 
                        content.mainText || 
                        'A DIFERENÇA NA PRÁTICA';
        
        const pgSubtitle = playgroundVisual.subtitle || 
                           playgroundSceneContent.subtitle || 
                           content.subtitle || 
                           currentPhase.title ||
                           'Prompt amador vs profissional';

        // ✅ V7-v2: Extract timeout config for playground (uses perStep)
        const playgroundTimeoutConfig = currentPhase.timeout ? {
          perStep: currentPhase.timeout.soft,
          hints: currentPhase.timeout.hints
        } : undefined;

        console.log('[V7PhasePlayer] 🎮 PLAYGROUND FINAL PROPS:');
        console.log('  title:', pgTitle);
        console.log('  amateurPrompt:', pgAmateurPrompt);
        console.log('  professionalPrompt:', pgProfessionalPrompt.substring(0, 80) + '...');

        // ✅ V7-vv: Extract userChallenge from interaction
        const pgUserChallenge = playgroundInteraction.userChallenge ? {
          instruction: playgroundInteraction.userChallenge.instruction || 'Agora é sua vez!',
          challengePrompt: playgroundInteraction.userChallenge.challengePrompt || '',
          hints: Array.isArray(playgroundInteraction.userChallenge.hints) 
            ? playgroundInteraction.userChallenge.hints 
            : []
        } : undefined;

        console.log('[V7PhasePlayer] 🎮 userChallenge:', pgUserChallenge);

        return (
          <V7PhasePlayground
            challengeTitle={pgTitle}
            challengeSubtitle={pgSubtitle}
            amateurPrompt={pgAmateurPrompt}
            amateurResult={{
              title: 'Resultado Amador',
              content: typeof pgAmateurResultText === 'string' ? pgAmateurResultText : JSON.stringify(pgAmateurResultText),
              score: pgAmateurScore,
              maxScore: pgMaxScore,
              verdict: getPlaygroundVerdict(pgAmateurScore)
            }}
            professionalPrompt={pgProfessionalPrompt}
            professionalResult={{
              title: 'Resultado Profissional',
              content: typeof pgProfessionalResultText === 'string' ? pgProfessionalResultText : JSON.stringify(pgProfessionalResultText),
              score: pgProfessionalScore,
              maxScore: pgMaxScore,
              verdict: getPlaygroundVerdict(pgProfessionalScore)
            }}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            onComplete={handlePlaygroundComplete}
            audioControl={audio}
            timeoutConfig={playgroundTimeoutConfig}
            userChallenge={pgUserChallenge}
            lessonId={script.id}
          />
        );

      case 'revelation':
        // Combine content from ALL revelation scenes
        const revelationContent = getCombinedSceneContent();

        // Check if this is a "PERFEITO" method reveal
        const mainTextStr = extractTextFromContent(revelationContent.mainText);
        const isPerfeitoMethod =
          mainTextStr?.toLowerCase().includes('perfeito') ||
          revelationContent.title?.toLowerCase().includes('perfeito') ||
          currentPhase.title?.toLowerCase().includes('perfeito');

        // ✅ V7-v21: PERFEITO phase uses ONLY the synced component - NO CTA overlay
        // The V7PhasePERFEITOSynced handles the entire narration from "Eles" to "constante"
        if (isPerfeitoMethod) {
          return (
            <V7PhasePERFEITOSynced
              wordTimestamps={wordTimestamps}
              currentTime={audio.currentTime}
              isPlaying={audio.isPlaying}
              onComplete={() => {
                console.log('[V7PhasePlayer] PERFEITO synced animation complete - advancing');
                // ✅ V7-v12: Unlock and advance when PERFEITO animation completes
                const fromIndex = lockedPhaseIndex ?? currentPhaseIndex;
                if (lockedPhaseIndex !== null) {
                  console.log('[V7PhasePlayer] 🔓 Unlocking revelation/PERFEITO phase');
                  machineAdapter.unlockPhase();
                }
                machineAdapter.setInteractionComplete(true);
                goToNextPhase(false, fromIndex);
              }}
            />
          );
        }

        // Map variant: 'primary'/'secondary' from JSON to 'positive'/'negative' expected by component
        const mapVariant = (v: string): 'negative' | 'positive' => {
          if (v === 'primary' || v === 'positive') return 'positive';
          return 'negative';
        };

        const ctaOptions = (revelationContent.options || content.options || []).map((opt: any) => ({
          label: opt.label || '',
          emoji: opt.emoji || '🎯',
          variant: mapVariant(opt.variant || 'primary')
        }));

        // ✅ V7-v2: Extract timeout config for CTA
        const ctaTimeoutConfig = currentPhase.timeout ? {
          soft: currentPhase.timeout.soft,
          medium: currentPhase.timeout.medium,
          hard: currentPhase.timeout.hard,
          hints: currentPhase.timeout.hints
        } : undefined;

        return (
          <V7PhaseCTA
            title={extractTextFromContent(revelationContent.mainText) || extractTextFromContent(content.mainText) || currentPhase.title}
            subtitle={extractTextFromContent(revelationContent.subtitle) || extractTextFromContent(content.subtitle) || ''}
            options={ctaOptions.length > 0 ? ctaOptions : [
              { label: 'Revisar', emoji: '📚', variant: 'negative' },
              { label: 'Continuar', emoji: '🚀', variant: 'positive' }
            ]}
            duration={currentPhase.endTime - currentPhase.startTime}
            onChoice={handleCTAChoice}
            audioControl={audio}
            timeoutConfig={ctaTimeoutConfig}
          />
        );

      case 'secret-reveal':
        // ✅ V7-v4: Secret Reveal phase with ElevenLabs narration + cinematic effects
        const secretContent = getCombinedSceneContent();
        // ✅ Check interaction content from the phase (where the DB stores it)
        const phaseInteraction = currentPhase.interaction as Record<string, any> | undefined;
        const interactionNarration = phaseInteraction?.narration || 
                                     content.interaction?.narration ||
                                     content.narration;
        const interactionPauseKeyword = phaseInteraction?.pauseKeyword ||
                                        content.interaction?.pauseKeyword ||
                                        content.pauseKeyword;
        
        const defaultNarration = 'Agora vou te mostrar o segredo dos 2% que sabem usar a Inteligência Artificial de verdade, seja, para seus projetos, fazer renda extra ou simplesmente para se tornar 10X mais inteligente.';
        
        const finalNarration = interactionNarration || secretContent.narration || secretContent.mainText || defaultNarration;
        const finalPauseKeyword = interactionPauseKeyword || secretContent.pauseKeyword || '10X mais inteligente';
        const narrationAudioUrl = phaseInteraction?.narrationAudioUrl || secretContent.narrationAudioUrl;
        
        console.log('[V7PhasePlayer] 🔮 Secret-reveal phase interaction:', phaseInteraction);
        console.log('[V7PhasePlayer] 🔮 Secret-reveal narration:', finalNarration.substring(0, 50) + '...');
        console.log('[V7PhasePlayer] 🔮 Secret-reveal audioUrl:', narrationAudioUrl || 'NONE - will generate');
        
        return (
          <V7PhaseSecretReveal
            narrationText={finalNarration}
            narrationAudioUrl={narrationAudioUrl}
            pauseKeyword={finalPauseKeyword}
            sceneIndex={currentSceneIndex}
            onComplete={() => {
              console.log('[V7PhasePlayer] Secret revealed - advancing to NEXT phase');
              
              // ✅ V7-v11: Capture current locked index BEFORE unlocking
              const fromIndex = lockedPhaseIndex ?? currentPhaseIndex;
              
              // ✅ V7-v11 FIX: FIRST unlock phase
              if (lockedPhaseIndex !== null) {
                console.log('[V7PhasePlayer] 🔓 Unlocking secret-reveal phase');
                machineAdapter.unlockPhase();
              }
              machineAdapter.setInteractionComplete(true);
              
              // ✅ V7-v23 FIX: SEEK to next phase startTime ANTES de resumir
              // Isso evita repetir a narração da fase secret-reveal
              const nextPhaseIdx = fromIndex + 1;
              const nextPhase = scaledScript.phases[nextPhaseIdx];
              if (nextPhase && hasAudio) {
                console.log(`[V7PhasePlayer] 🔀 SEEKING to next phase "${nextPhase.id}" @ ${nextPhase.startTime}s`);
                audio.seekTo(nextPhase.startTime);
                
                // ✅ V7-v23 FIX: SEMPRE dar play após seek - não checar isPlaying
                // O áudio estava pausado pelo anchorText, precisa retomar SEMPRE
                setTimeout(() => {
                  audio.play();
                  console.log('[V7PhasePlayer] ▶️ Audio PLAY forced after seek');
                }, 50); // Pequeno delay para garantir que seek completou
              }
              
              manualResume();
              
              // ✅ Advance to next phase
              goToPhase(nextPhaseIdx);
            }}
            onSecretClick={() => {
              console.log('[V7PhasePlayer] 🔓 Secret button clicked!');
            }}
            audioControl={audio}
            isPausedByAnchor={isPausedByAnchor}
          />
        );

      case 'gamification':
        // Combine content from ALL gamification scenes
        const gamificationContent = getCombinedSceneContent();
        const metrics = gamificationContent.metrics || content.metrics || [];
        const xp = metrics.find((m: any) => m.label?.includes('XP'))?.value || '+100';

        return (
          <V7PhaseGamification
            achievements={(gamificationContent.items || content.items || []).map((item: any, idx: number) => ({
              id: String(idx),
              icon: item.emoji || '✅',
              title: item.text || 'Conquista',
              unlocked: true
            }))}
            xpEarned={parseInt(xp.replace(/\D/g, '')) || 100}
            levelName={extractTextFromContent(gamificationContent.mainText) || extractTextFromContent(content.mainText) || 'COMPLETO'}
            nextLessonTitle={extractTextFromContent(gamificationContent.subtitle) || extractTextFromContent(content.subtitle) || 'Próxima Aula'}
            nextLessonCountdown=""
            sceneIndex={currentSceneIndex}
            onContinue={() => onComplete?.()}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`w-full h-screen relative overflow-hidden ${showControls ? 'cursor-default' : 'cursor-none'}`}
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Canvas Background */}
      <V7CinematicCanvas
        mood={getCanvasMood(currentPhase?.type)}
        intensity={effectiveIsPlaying ? 'high' : 'medium'}
      />

      {/* Minimal Unified Controls - ✅ V7-v17: Nunca bloqueado, sempre acessível */}
      <V7MinimalControls
        isPlaying={effectiveIsPlaying}
        currentTime={hasAudio ? audio.formattedCurrentTime : formatTime(internalTime)}
        duration={audio.formattedDuration || totalDuration}
        progress={hasAudio && audio.duration > 0 ? audio.currentTime / audio.duration : 0}
        isMuted={audio.isMuted}
        volume={audio.volume}
        canGoPrevious={currentPhaseIndex > 0}
        canGoNext={currentPhaseIndex < scaledScript.phases.length - 1}
        currentPhase={currentPhaseIndex}
        totalPhases={scaledScript.phases.length}
        onTogglePlay={audio.togglePlayPause}
        onToggleMute={audio.toggleMute}
        onVolumeChange={audio.setVolume}
        onPrevious={goToPreviousPhase}
        onNext={goToNextPhase}
        onExit={onExit}
        isVisible={
          // ✅ V7-v13: Always show controls during interactive phases
          // User needs X button visible during CTA/quiz/playground to exit if needed
          currentPhase?.type === 'revelation' ||
          currentPhase?.type === 'secret-reveal' ||
          currentPhase?.type === 'interaction' ||
          currentPhase?.type === 'playground'
            ? true
            : (showControls && !isQuizResultShowing)
        }
        isLocked={false} // ✅ V7-v17: NUNCA bloquear controles - usuário precisa poder pausar/resumir sempre
      />

      {/* Audio/Play Indicator */}
      <V7AudioIndicator isPlaying={effectiveIsPlaying} />

      {/* Transition Particles Effect */}
      <AnimatePresence>
        {showTransitionParticles && (
          <V7TransitionParticles
            isActive={showTransitionParticles}
            color={transitionParticleColor}
            particleCount={50}
          />
        )}
      </AnimatePresence>

      {/* V7-vv-v4: MicroVisual Overlay - renders word-triggered micro-visuals with sounds */}
      {currentPhase?.microVisuals && currentPhase.microVisuals.length > 0 && (
        <V7MicroVisualOverlay
          microVisuals={currentPhase.microVisuals}
          currentTime={hasAudio ? audio.currentTime : internalTime}
          isPlaying={effectiveIsPlaying}
          visualType={(currentPhase as any).visual?.type}
        />
      )}

      {/* Phase Content - Cinematic Fade Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase?.id || 'empty'}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ 
            opacity: 0, 
            scale: 0.92,
            filter: 'blur(12px) brightness(1.3)'
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            filter: 'blur(0px) brightness(1)'
          }}
          exit={{ 
            opacity: 0, 
            scale: 1.08,
            filter: 'blur(16px) brightness(0.7)'
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.8 },
            scale: { duration: 1.0 },
            filter: { duration: 1.0 }
          }}
        >
          {renderPhaseContent()}
        </motion.div>
      </AnimatePresence>

      {/* Captions - ✅ V7-v17: HIDE during interactive phases but SHOW during all others */}
      {wordTimestamps.length > 0 && (
        <V7SynchronizedCaptions
          wordTimestamps={wordTimestamps}
          currentTime={audio.currentTime}
          isVisible={
            // ✅ V7-v17: Show captions when audio is playing OR when we have any audio time
            // Hide only during interactive phases that control their own content
            (audio.isPlaying || audio.currentTime > 0.5) &&
            currentPhase?.type !== 'interaction' &&
            currentPhase?.type !== 'playground' &&
            currentPhase?.type !== 'gamification' &&
            currentPhase?.type !== 'secret-reveal' // ✅ secret-reveal has its own narration
          }
          maxWords={10}
        />
      )}


      {/* Debug Panel */}
      <V7DebugPanel
        currentPhase={currentPhase}
        currentPhaseIndex={currentPhaseIndex}
        currentScene={currentPhase?.scenes?.[currentSceneIndex] || null}
        currentSceneIndex={currentSceneIndex}
        currentTime={hasAudio ? audio.currentTime : internalTime}
        isPlaying={effectiveIsPlaying}
        audioUrl={audioUrl || null}
        wordTimestamps={wordTimestamps}
        fullScript={scaledScript}
        rawContent={rawContent}
        detectionPath={detectionPath || undefined}
      />
    </div>
  );
};
