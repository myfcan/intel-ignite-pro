// V7PhasePlayer - Main player component orchestrating all cinematic phases
// ✅ V7-v2: Uses useV7AudioManager with fade capabilities for interactions
// ✅ V7-v2: Uses useAnchorText for keyword-based pause sync
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
import { V7TransitionParticles } from './effects/V7TransitionParticles';
import {
  V7LessonScript,
  V7Phase,
  V7TimeoutConfig,
  V7AudioBehavior,
  usePhaseController
} from './phases/V7PhaseController';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7PhasePlayerProps {
  script: V7LessonScript;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  onComplete?: () => void;
  onExit?: () => void;
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
  onExit
}: V7PhasePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlayingWithoutAudio, setIsPlayingWithoutAudio] = useState(false);

  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects();

  // ✅ V7-v2: Audio hook with fade capabilities
  const audio = useV7AudioManager({
    onEnded: () => {
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

  // ✅ V7-v6 FIX: Track if we're in an interactive phase that should block progression
  const [lockedPhaseIndex, setLockedPhaseIndex] = useState<number | null>(null);
  const [interactionComplete, setInteractionComplete] = useState(false);
  // ✅ V7-v9: Track when quiz result is showing to hide controls
  const [isQuizResultShowing, setIsQuizResultShowing] = useState(false);
  // ✅ V7-v15: Track if we're navigating backwards to prevent re-locking
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  // ✅ V7-v18: Track transition particles for dramatic phase changes
  const [showTransitionParticles, setShowTransitionParticles] = useState(false);
  const [transitionParticleColor, setTransitionParticleColor] = useState<'cyan' | 'gold' | 'emerald' | 'purple'>('cyan');
  const previousPhaseRef = useRef<string | null>(null);

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
    
    if (currentPhase.anchorActions && currentPhase.anchorActions.length > 0) {
      console.log(`[V7PhasePlayer] 📍 Phase "${currentPhase.id}" anchorActions:`, 
        currentPhase.anchorActions.map(a => `${a.keyword}`));
      return currentPhase.anchorActions;
    }
    
    if (currentPhase.pauseKeywords && currentPhase.pauseKeywords.length > 0) {
      return convertPauseKeywordsToActions(currentPhase.pauseKeywords);
    }
    
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

  // ✅ V7-v15 FIX: Lock interactive phases IMMEDIATELY ao entrar
  // Isso impede que a fase avance pelo tempo, mas o áudio CONTINUA tocando
  // O lock aqui é sobre FASE, não sobre áudio!
  // CRITICAL: Don't lock when navigating backwards!
  useEffect(() => {
    // ✅ V7-v15: Skip locking if we're navigating backwards
    if (isNavigatingBack) {
      console.log(`[V7PhasePlayer] ⏭️ Skipping lock - navigating backwards`);
      return;
    }
    
    const isInteractivePhase = currentPhase?.type === 'interaction' || currentPhase?.type === 'secret-reveal';
    
    // ✅ V7-v12: Also lock revelation phases that show PERFEITO (requires animation to complete)
    const isRevelationWithPERFEITO = currentPhase?.type === 'revelation' && 
      (currentPhase?.title?.toLowerCase().includes('perfeito') || 
       String((currentPhase?.scenes?.[0]?.content as Record<string, unknown>)?.mainText || '').toLowerCase().includes('perfeito'));
    
    // ✅ CRITICAL: Lock IMEDIATAMENTE ao entrar na fase interativa ou revelation PERFEITO
    // O áudio continua tocando até o anchorText detectar "IA." ou animação PERFEITO terminar
    // Sem esse lock, a fase mudaria automaticamente antes da interação/animação completar
    if ((isInteractivePhase || isRevelationWithPERFEITO) && lockedPhaseIndex === null) {
      console.log(`[V7PhasePlayer] 🔒 LOCKING phase ${currentPhaseIndex} (${currentPhase?.type}) IMMEDIATELY`);
      setLockedPhaseIndex(currentPhaseIndex);
      setInteractionComplete(false);
    }
  }, [currentPhase?.type, currentPhase?.title, currentPhase?.scenes, currentPhaseIndex, lockedPhaseIndex, isNavigatingBack]);

  // ✅ V7-v6: Reset lock when interaction completes and advances manually
  useEffect(() => {
    if (interactionComplete && lockedPhaseIndex !== null) {
      console.log(`[V7PhasePlayer] 🔓 UNLOCKING phase - interaction complete`);
      setLockedPhaseIndex(null);
      setInteractionComplete(false);
    }
  }, [interactionComplete, lockedPhaseIndex]);

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
        setTransitionParticleColor('cyan');
        setShowTransitionParticles(true);
        setTimeout(() => setShowTransitionParticles(false), 1500);
      } else if (isInteractionToSecretReveal) {
        setTransitionParticleColor('gold');
        setShowTransitionParticles(true);
        setTimeout(() => setShowTransitionParticles(false), 1500);
      } else if (isPlaygroundToGamification) {
        setTransitionParticleColor('emerald');
        setShowTransitionParticles(true);
        setTimeout(() => setShowTransitionParticles(false), 1500);
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
    }
  }, [currentPhase?.id, currentPhase?.type, currentPhaseIndex, scaledScript.phases, audio.currentTime, audio.isPlaying]);

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

      // Don't seek if coming from interactive phases or if explicitly told to skip
      // ✅ V7-v4: Added 'secret-reveal' to interactive phases list
      const isInteractivePhase = currentPhaseType === 'interaction' || currentPhaseType === 'playground' || currentPhaseType === 'secret-reveal';
      const shouldSeek = hasAudio && nextPhase && !skipAudioSeek && !isInteractivePhase;

      if (shouldSeek) {
        audio.seekTo(nextPhase.startTime);
        console.log(`  🔀 SEEKING to ${nextPhase.startTime.toFixed(2)}s`);
      } else if (isInteractivePhase) {
        console.log(`  ⏸️ From interactive phase - NOT seeking (resume from paused)`);
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
      setIsNavigatingBack(true);

      // ✅ V7-v15: Reset ALL interaction states
      if (lockedPhaseIndex !== null) {
        console.log(`  🔓 Unlocking phase for back navigation`);
        setLockedPhaseIndex(null);
      }
      setInteractionComplete(false);
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
        setIsNavigatingBack(false);
      }, 500);
    }
  }, [currentPhaseIndex, scaledScript.phases, playSound, goToPhase, hasAudio, audio, lockedPhaseIndex]);

  const handleQuizComplete = useCallback((selectedIds: string[]) => {
    playSound('success');
    
    const nextPhase = scaledScript.phases[currentPhaseIndex + 1];
    console.log(`\n🎯 [V7PhasePlayer] QUIZ COMPLETE`);
    console.log(`  Selected:   [${selectedIds.join(', ')}]`);
    console.log(`  Current:    "${currentPhase?.id}" (index: ${currentPhaseIndex})`);
    console.log(`  Next:       "${nextPhase?.id}" (${nextPhase?.type})`);
    console.log(`  Audio at:   ${audio.currentTime?.toFixed(2)}s`);

    // ✅ V7-v6: Mark interaction as complete to unlock phase
    setInteractionComplete(true);

    // ✅ V7-v7: Do NOT call manualResume if next phase is secret-reveal
    // The secret-reveal phase will handle its own audio flow
    if (nextPhase?.type !== 'secret-reveal') {
      manualResume();
    }

    // ✅ V7-v4: Do NOT resume audio here - let the secret-reveal phase handle it
    // The secret-reveal phase will pause main audio and play its own ElevenLabs narration
    // Audio will be resumed when user clicks the button in secret-reveal

    goToNextPhase();
  }, [playSound, goToNextPhase, manualResume, currentPhaseIndex, currentPhase, scaledScript.phases, audio.currentTime]);

  const handlePlaygroundComplete = useCallback(() => {
    playSound('success');
    console.log('[V7PhasePlayer] Playground complete - advancing');

    // ✅ Trigger resume via anchor text system
    manualResume();

    // ✅ Resume audio for next phase narration
    if (hasAudio && !audio.isPlaying) {
      audio.play();
      console.log('[V7PhasePlayer] ▶️ Audio resumed after playground');
    }

    setTimeout(goToNextPhase, 1000);
  }, [playSound, goToNextPhase, hasAudio, audio, manualResume]);

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

    // Small delay to show selection animation before navigating
    setTimeout(() => {
      goToNextPhase();
    }, 800);
  }, [ctaClicked, playSound, goToNextPhase]);

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

  // Combine ALL scene content for progressive reveal phases (dramatic, etc.)
  const getCombinedSceneContent = (): any => {
    if (!currentPhase?.scenes) return {};

    // Merge all scenes' content, prioritizing later scenes for conflicts
    const combined: any = {};
    currentPhase.scenes.forEach((scene, idx) => {
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
        // Use combined content from ALL scenes for progressive reveal
        const dramaticContent = getCombinedSceneContent();
        // Get impactWord from scene 5 specifically (impact scene)
        const impactScene = getSceneContent(5);
        // Get hookQuestion from scene 0 specifically (letterbox scene)
        const letterboxScene = getSceneContent(0);

        // ✅ CRITICAL: Ensure hookQuestion is always shown at start
        // Fallback to "VOCÊ SABIA?" if not defined in database
        const extractedHook = letterboxScene.hookQuestion || letterboxScene.mainText || dramaticContent.hookQuestion || '';
        const hookQuestion = extractedHook || 'VOCÊ SABIA?';

        console.log('[V7PhasePlayer] Dramatic phase - hookQuestion:', hookQuestion, 'sceneIndex:', currentSceneIndex);

        return (
          <V7PhaseDramatic
            mainNumber={String(dramaticContent.number || '98%')}
            secondaryNumber={dramaticContent.secondaryNumber || '2%'}
            subtitle={dramaticContent.subtitle || currentPhase.title}
            highlightWord={dramaticContent.highlightWord}
            impactWord={impactScene.mainText || dramaticContent.highlightWord || ''}
            hookQuestion={hookQuestion}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            mood={currentPhase.mood === 'danger' ? 'danger' : currentPhase.mood === 'success' ? 'success' : 'neutral'}
          />
        );

      case 'narrative':
        // CORRECT: Scene 0 has main comparison items, Scene 1 has detailed comparisons, Scene 2 has warning
        const scene0Content = getSceneContent(0); // Main comparison items
        const scene1Content = getSceneContent(1); // Detailed comparisons
        const scene2Warning = getSceneContent(2); // Warning/urgency section
        const narrativeContent = getCombinedSceneContent();

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
            leftTitle={leftItem.label || '98% BRINCANDO'}
            rightTitle={rightItem.label || '2% DOMINANDO'}
            leftEmoji="😂"
            rightEmoji="💰"
            comparisons={comparisons}
            warningTitle={scene2Warning.mainText || scene2Warning.highlightWord || ''}
            warningSubtitle={scene2Warning.subtitle || ''}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
          />
        );

      case 'interaction':
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
            onComplete={handleQuizComplete}
            audioControl={audio}
            isPausedByAnchor={isPausedByAnchor}
            onResultShow={(isShowing) => setIsQuizResultShowing(isShowing)}
            timeoutConfig={quizTimeoutConfig}
          />
        );

      case 'playground':
        // Combine content from ALL playground scenes
        const playgroundContent = getCombinedSceneContent();

        // Extract playground scores from combined content with proper fallbacks
        const amateurScore = typeof playgroundContent.amateurScore === 'number'
          ? playgroundContent.amateurScore
          : (typeof content.amateurScore === 'number' ? content.amateurScore : 10);
        const professionalScore = typeof playgroundContent.professionalScore === 'number'
          ? playgroundContent.professionalScore
          : (typeof content.professionalScore === 'number' ? content.professionalScore : 95);
        const maxScore = 100;

        // Determine verdict based on score
        const getVerdict = (score: number): 'bad' | 'good' | 'excellent' => {
          if (score < 30) return 'bad';
          if (score < 70) return 'good';
          return 'excellent';
        };

        // Parse result content (handle both string and object formats)
        const getResultContent = (result: any): string => {
          if (typeof result === 'string') return result;
          if (typeof result === 'object' && result?.content) return result.content;
          return '';
        };

        // ✅ V7-v2: Extract timeout config for playground (uses perStep)
        const playgroundTimeoutConfig = currentPhase.timeout ? {
          perStep: currentPhase.timeout.soft, // Use soft timeout as perStep
          hints: currentPhase.timeout.hints
        } : undefined;

        return (
          <V7PhasePlayground
            challengeTitle={playgroundContent.mainText || content.mainText || 'DESAFIO PRÁTICO'}
            challengeSubtitle={playgroundContent.subtitle || content.subtitle || currentPhase.title}
            amateurPrompt={playgroundContent.amateurPrompt || content.amateurPrompt || 'prompt simples'}
            amateurResult={{
              title: 'Resultado Amador',
              content: getResultContent(playgroundContent.amateurResult || content.amateurResult) || 'Resultado genérico...',
              score: amateurScore,
              maxScore,
              verdict: getVerdict(amateurScore)
            }}
            professionalPrompt={playgroundContent.professionalPrompt || content.professionalPrompt || 'prompt profissional estruturado'}
            professionalResult={{
              title: 'Resultado Profissional',
              content: getResultContent(playgroundContent.professionalResult || content.professionalResult) || 'Resultado otimizado...',
              score: professionalScore,
              maxScore,
              verdict: getVerdict(professionalScore)
            }}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            onComplete={handlePlaygroundComplete}
            audioControl={audio}
            timeoutConfig={playgroundTimeoutConfig}
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
                  setLockedPhaseIndex(null);
                }
                setInteractionComplete(true);
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
              console.log('[V7PhasePlayer] Secret revealed - advancing');
              
              // ✅ V7-v11: Capture current locked index BEFORE unlocking
              const fromIndex = lockedPhaseIndex ?? currentPhaseIndex;
              
              // ✅ V7-v11 FIX: FIRST unlock phase
              if (lockedPhaseIndex !== null) {
                console.log('[V7PhasePlayer] 🔓 Unlocking secret-reveal phase');
                setLockedPhaseIndex(null);
              }
              setInteractionComplete(true);
              
              manualResume();
              
              // ✅ Resume main audio for next phase
              if (hasAudio && !audio.isPlaying) {
                audio.play();
                console.log('[V7PhasePlayer] ▶️ Audio resumed after secret-reveal');
              }
              
              // ✅ V7-v11: Pass the captured index directly to avoid closure issues
              goToNextPhase(false, fromIndex);
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
          // ✅ V7-v13: Always show controls during revelation/secret-reveal phases (PERFEITO, etc)
          currentPhase?.type === 'revelation' || currentPhase?.type === 'secret-reveal'
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
      />
    </div>
  );
};
