// V7PhasePlayer - Main player component orchestrating all cinematic phases
// ✅ V7-v2: Uses useV7AudioManager with fade capabilities for interactions
// ✅ V7-v2: Uses useAnchorText for keyword-based pause sync
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { V7MinimalTimeline } from './V7MinimalTimeline';
import { V7AudioIndicator } from './V7AudioIndicator';
import { V7AudioControls } from './V7AudioControls';
import { V7DiscreteNavigation } from './V7DiscreteNavigation';
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
  const [isPlayingWithoutAudio, setIsPlayingWithoutAudio] = useState(false); // Fallback for no-audio mode
  
  // ✅ FASE 3: Sistema de trigger de fase por AnchorText
  // Quiz só aparece quando a palavra-gatilho é detectada, não por timing
  const [anchorTriggeredPhase, setAnchorTriggeredPhase] = useState<string | null>(null);

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
  const effectiveIsPlaying = hasAudio ? audio.isPlaying : isPlayingWithoutAudio;

  // Phase controller with fallback timer for no-audio scenarios
  // ✅ Uses scaledScript which has correct timings based on actual audio duration
  const {
    currentPhase,
    currentPhaseIndex,
    currentSceneIndex,
    phaseProgress,
    goToPhase,
    internalTime
  } = usePhaseController({
    script: scaledScript, // Use scaled script with correct timings
    currentTime: audio.currentTime,
    isPlaying: effectiveIsPlaying,
    hasAudio
  });

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

  // ✅ ANCHOR TEXT SYSTEM: Flexible keyword-based sync (V5-inspired)
  // Supports multiple action types: pause, resume, show, hide, highlight, trigger
  const anchorActions = useMemo((): AnchorAction[] => {
    if (!currentPhase) return [];
    
    // Priority 1: Use anchorActions if defined
    if (currentPhase.anchorActions && currentPhase.anchorActions.length > 0) {
      console.log(`[V7PhasePlayer] 📍 Phase "${currentPhase.id}" has ${currentPhase.anchorActions.length} anchorActions:`, 
        currentPhase.anchorActions.map(a => `${a.id}:${a.keyword}`));
      return currentPhase.anchorActions;
    }
    
    // Priority 2: Convert legacy pauseKeywords to actions
    if (currentPhase.pauseKeywords && currentPhase.pauseKeywords.length > 0) {
      console.log(`[V7PhasePlayer] 📍 Phase "${currentPhase.id}" using legacy pauseKeywords:`, currentPhase.pauseKeywords);
      return convertPauseKeywordsToActions(currentPhase.pauseKeywords);
    }
    
    return [];
  }, [currentPhase]);

  // ✅ Check if we have word timestamps (needed before globalAnchorActions)
  const hasWordTimestamps = wordTimestamps.length > 0;

  // ✅ FASE 3: GLOBAL ANCHOR ACTIONS - Monitora palavras-gatilho para TODAS as fases
  // Isso permite que o quiz seja triggerado quando a narração chega na palavra certa,
  // mesmo que o sistema de timing coloque em outra fase
  const globalAnchorActions = useMemo((): AnchorAction[] => {
    if (!hasWordTimestamps) return [];
    
    const actions: AnchorAction[] = [];
    
    // Procura em TODAS as fases por anchorActions do tipo 'pause' em fases interativas
    scaledScript.phases.forEach((phase, phaseIndex) => {
      if (phase.type === 'interaction' && phase.anchorActions) {
        phase.anchorActions.forEach(action => {
          if (action.type === 'pause') {
            actions.push({
              ...action,
              id: `global-trigger-${phase.id}-${action.id}`,
              type: 'trigger', // Muda para trigger para não pausar diretamente
              payload: { targetPhaseId: phase.id, targetPhaseIndex: phaseIndex },
            });
          }
        });
      }
    });
    
    if (actions.length > 0) {
      console.log(`[V7PhasePlayer] 🌐 GLOBAL anchor actions:`, actions.map(a => `${a.keyword} → ${a.payload?.targetPhaseId}`));
    }
    
    return actions;
  }, [scaledScript.phases, hasWordTimestamps]);

  const handleAnchorEvent = useCallback((event: AnchorEvent) => {
    console.log(`[V7PhasePlayer] 🎯 Anchor event: "${event.action.id}" (${event.action.type}) at ${event.timestamp.toFixed(1)}s`);
    
    // ✅ FASE 3: Se for um trigger global, muda para a fase alvo
    if (event.action.type === 'trigger' && event.action.payload?.targetPhaseId) {
      const targetPhaseId = event.action.payload.targetPhaseId;
      const targetPhaseIndex = event.action.payload.targetPhaseIndex;
      
      console.log(`[V7PhasePlayer] 🎬 GLOBAL TRIGGER: Switching to phase "${targetPhaseId}" (index: ${targetPhaseIndex})`);
      
      // Pausa o áudio
      if (audio.isPlaying) {
        audio.pause();
      }
      
      // Muda para a fase alvo
      setAnchorTriggeredPhase(targetPhaseId);
      goToPhase(targetPhaseIndex);
      playSound('transition-whoosh');
    }
  }, [audio, goToPhase, playSound]);

  // ✅ Check if we should enable anchor text system
  const isInteractivePhase = currentPhase?.type === 'interaction' || currentPhase?.type === 'playground';
  const hasAnchorActions = anchorActions.length > 0;
  const hasGlobalAnchorActions = globalAnchorActions.length > 0;
  
  // ✅ LOGIC:
  // - TEM wordTimestamps → useAnchorText (keyword sync)
  // - NÃO TEM wordTimestamps → Fallback 30% (pause at 30% of audio duration)
  const shouldEnableAnchors = hasAudio && hasAnchorActions && hasWordTimestamps;
  const shouldUseFallback30 = hasAudio && isInteractivePhase && !hasWordTimestamps;
  
  // ✅ FALLBACK 30%: Pause at 30% of audio duration when no wordTimestamps
  const fallback30TriggeredRef = useRef(false);
  
  useEffect(() => {
    // Reset fallback trigger when phase changes
    fallback30TriggeredRef.current = false;
  }, [currentPhase?.id]);
  
  useEffect(() => {
    if (!shouldUseFallback30 || fallback30TriggeredRef.current) return;
    if (!audio.duration || audio.duration <= 0) return;
    
    const triggerPoint = audio.duration * 0.30; // 30% of audio
    
    if (audio.currentTime >= triggerPoint && audio.isPlaying) {
      console.log(`[V7PhasePlayer] ⏸️ FALLBACK 30% PAUSE at ${audio.currentTime.toFixed(1)}s (trigger: ${triggerPoint.toFixed(1)}s)`);
      fallback30TriggeredRef.current = true;
      audio.pause();
    }
  }, [shouldUseFallback30, audio.currentTime, audio.duration, audio.isPlaying]);
  
  // Log anchor system status for debugging
  useEffect(() => {
    console.log(`[V7PhasePlayer] 🔊 System status for "${currentPhase?.id}" (${currentPhase?.type}):`, {
      system: hasWordTimestamps ? 'useAnchorText' : (shouldUseFallback30 ? 'Fallback30%' : 'none'),
      hasWordTimestamps,
      hasAnchorActions,
      isInteractivePhase,
      wordTimestampCount: wordTimestamps.length,
      audioDuration: audio.duration?.toFixed(1)
    });
  }, [currentPhase?.id, currentPhase?.type, hasWordTimestamps, hasAnchorActions, isInteractivePhase, shouldUseFallback30, audio.duration]);

  const { 
    isPausedByAnchor, 
    manualResume,
    isElementVisible,
    isElementHighlighted,
    visibleElements,
    highlightedElements
  } = useAnchorText({
    wordTimestamps: wordTimestamps,
    currentTime: audio.currentTime,
    actions: anchorActions,
    isPlaying: audio.isPlaying,
    phaseId: currentPhase?.id || '',
    // ✅ CRITICAL: Enable whenever we have the required data
    enabled: shouldEnableAnchors,
    onPause: () => {
      if (audio.isPlaying) {
        audio.pause();
        console.log(`[V7PhasePlayer] ⏸️ ANCHOR PAUSE for phase "${currentPhase?.id}"`);
      }
    },
    onResume: () => {
      if (!audio.isPlaying) {
        audio.play();
        console.log(`[V7PhasePlayer] ▶️ ANCHOR RESUME for phase "${currentPhase?.id}"`);
      }
    },
    onShow: (targetId, payload) => {
      console.log(`[V7PhasePlayer] 👁️ SHOW element: ${targetId}`, payload);
    },
    onHide: (targetId, payload) => {
      console.log(`[V7PhasePlayer] 🙈 HIDE element: ${targetId}`, payload);
    },
    onHighlight: (targetId, payload) => {
      console.log(`[V7PhasePlayer] ✨ HIGHLIGHT element: ${targetId}`, payload);
    },
    onTrigger: (action) => {
      console.log(`[V7PhasePlayer] 🎬 TRIGGER action: ${action.id}`, action.payload);
    },
    onAnchorEvent: handleAnchorEvent,
  });
  
  // ✅ FASE 3: GLOBAL ANCHOR TEXT - Monitora palavras-gatilho em TODAS as fases
  // Isso roda em paralelo com o anchor local e pode triggerar mudança de fase
  useAnchorText({
    wordTimestamps: wordTimestamps,
    currentTime: audio.currentTime,
    actions: globalAnchorActions,
    isPlaying: audio.isPlaying,
    phaseId: 'global',
    enabled: hasGlobalAnchorActions && hasWordTimestamps && hasAudio,
    onTrigger: (action) => {
      // ✅ FASE 3: Trigger global detectado - muda para a fase do quiz
      if (action.payload?.targetPhaseId && action.payload?.targetPhaseIndex !== undefined) {
        const targetPhaseId = action.payload.targetPhaseId;
        const targetPhaseIndex = action.payload.targetPhaseIndex;
        
        // Só triggera se ainda não está nessa fase
        if (currentPhase?.id !== targetPhaseId) {
          console.log(`[V7PhasePlayer] 🎬 GLOBAL TRIGGER: Switching to phase "${targetPhaseId}" (index: ${targetPhaseIndex})`);
          
          // Pausa o áudio
          if (audio.isPlaying) {
            audio.pause();
          }
          
          // Muda para a fase alvo
          setAnchorTriggeredPhase(targetPhaseId);
          goToPhase(targetPhaseIndex);
          playSound('transition-whoosh');
        }
      }
    },
    onAnchorEvent: (event) => {
      console.log(`[V7PhasePlayer] 🌐 GLOBAL anchor event: "${event.action.id}" at ${event.timestamp.toFixed(1)}s`);
    },
  });
  
  // ✅ FALLBACK: Auto-pause for interactive phases when there are NO wordTimestamps
  // This ensures the lesson flow works even without precise word-level sync
  const fallbackPauseTriggeredRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Only use fallback if:
    // 1. We're in an interactive phase
    // 2. We have anchor actions that include a pause
    // 3. We DON'T have wordTimestamps (so anchor system won't work)
    // 4. Audio is playing
    if (!isInteractivePhase || !hasAnchorActions || hasWordTimestamps || !audio.isPlaying) {
      return;
    }
    
    const phaseId = currentPhase?.id || '';
    const hasPauseAction = anchorActions.some(a => a.type === 'pause');
    
    // Only trigger fallback once per phase
    if (hasPauseAction && !fallbackPauseTriggeredRef.current.has(phaseId)) {
      // Calculate when to pause: after 80% of phase narration time
      // This gives time for intro narration before showing UI
      const phaseDuration = (currentPhase?.endTime || 0) - (currentPhase?.startTime || 0);
      const timeInPhase = audio.currentTime - (currentPhase?.startTime || 0);
      const progressInPhase = timeInPhase / phaseDuration;
      
      // Pause after first 3-5 seconds or 30% of phase, whichever comes first
      const shouldPause = timeInPhase >= 3 || progressInPhase >= 0.3;
      
      if (shouldPause) {
        console.log(`[V7PhasePlayer] ⏸️ FALLBACK PAUSE for "${phaseId}" (no wordTimestamps, ${timeInPhase.toFixed(1)}s into phase)`);
        fallbackPauseTriggeredRef.current.add(phaseId);
        audio.pause();
      }
    }
  }, [isInteractivePhase, hasAnchorActions, hasWordTimestamps, audio.isPlaying, audio.currentTime, currentPhase, anchorActions]);
  
  // Reset fallback tracker when phase changes
  useEffect(() => {
    // Clear fallback when entering a new phase
    if (currentPhase?.id) {
      console.log(`[V7PhasePlayer] 📍 Entered phase "${currentPhase.id}" (${currentPhase.type})`);
    }
  }, [currentPhase?.id, currentPhase?.type]);

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

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    if (hasAudio) {
      audio.togglePlayPause();
    } else {
      // Start internal timer when no audio
      setIsPlayingWithoutAudio(true);
    }
  }, [audio, hasAudio]);

  // ✅ CRITICAL FIX: Don't seek audio when coming from interactive phases (quiz/playground)
  // These phases pause audio manually and should resume from current position
  const goToNextPhase = useCallback((skipAudioSeek: boolean = false) => {
    if (currentPhaseIndex < scaledScript.phases.length - 1) {
      playSound('transition-whoosh');
      const nextPhaseIndex = currentPhaseIndex + 1;
      const nextPhase = scaledScript.phases[nextPhaseIndex];
      const currentPhaseType = scaledScript.phases[currentPhaseIndex]?.type;

      // Don't seek if coming from interactive phases or if explicitly told to skip
      const isInteractivePhase = currentPhaseType === 'interaction' || currentPhaseType === 'playground';
      const shouldSeek = hasAudio && nextPhase && !skipAudioSeek && !isInteractivePhase;

      if (shouldSeek) {
        audio.seekTo(nextPhase.startTime);
        console.log(`[V7PhasePlayer] Seeking audio to phase ${nextPhaseIndex} start: ${nextPhase.startTime.toFixed(1)}s`);
      } else if (isInteractivePhase) {
        console.log(`[V7PhasePlayer] ⏭️ Advancing from ${currentPhaseType} - NOT seeking audio (will resume from paused position)`);
      }

      goToPhase(nextPhaseIndex);
    } else {
      onComplete?.();
    }
  }, [currentPhaseIndex, scaledScript.phases, playSound, goToPhase, onComplete, hasAudio, audio]);

  const goToPreviousPhase = useCallback(() => {
    if (currentPhaseIndex > 0) {
      playSound('click-soft');
      const prevPhaseIndex = currentPhaseIndex - 1;
      const prevPhase = scaledScript.phases[prevPhaseIndex];

      // Seek audio to previous phase start time
      if (hasAudio && prevPhase) {
        audio.seekTo(prevPhase.startTime);
        console.log(`[V7PhasePlayer] Seeking audio to phase ${prevPhaseIndex} start: ${prevPhase.startTime.toFixed(1)}s`);
      }

      goToPhase(prevPhaseIndex);
    }
  }, [currentPhaseIndex, scaledScript.phases, playSound, goToPhase, hasAudio, audio]);

  const handleQuizComplete = useCallback((selectedIds: string[]) => {
    playSound('success');
    console.log('[V7PhasePlayer] Quiz complete - advancing to playground');

    // ✅ Trigger resume via anchor text system
    manualResume();

    // ✅ Resume audio so playground narration plays
    if (hasAudio && !audio.isPlaying) {
      audio.play();
      console.log('[V7PhasePlayer] ▶️ Audio resumed for playground narration');
    }

    goToNextPhase();
  }, [playSound, goToNextPhase, hasAudio, audio, manualResume]);

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
        const quizOptions = (interactionContent.options || content.options || firstSceneContent.options || []).map((opt: any) => ({
          id: opt.id || String(Math.random()),
          text: opt.label || opt.text || '',
          category: (opt.isCorrect ? 'good' : 'bad') as 'good' | 'bad'
        }));

        // ✅ V7-v2: Extract timeout config from phase
        const quizTimeoutConfig = currentPhase.timeout ? {
          soft: currentPhase.timeout.soft,
          medium: currentPhase.timeout.medium,
          hard: currentPhase.timeout.hard,
          hints: currentPhase.timeout.hints
        } : undefined;

        return (
          <V7PhaseQuiz
            title={extractTextFromContent(interactionContent.mainText || content.mainText) || 'Responda:'}
            subtitle={extractTextFromContent(interactionContent.subtitle || content.subtitle) || ''}
            options={quizOptions}
            revealTitle="RESULTADO"
            revealMessage={extractTextFromContent(interactionContent.explanation || content.explanation) || ''}
            revealValue=""
            correctFeedback={extractTextFromContent(interactionContent.correctFeedback || content.correctFeedback)}
            incorrectFeedback={extractTextFromContent(interactionContent.incorrectFeedback || content.incorrectFeedback)}
            sceneIndex={currentSceneIndex}
            onComplete={handleQuizComplete}
            audioControl={audio}
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

        // ✅ Show PERFEITO typewriter during first 3 scenes (0-2), then CTA (3-4)
        const showPerfeitoSlide = currentSceneIndex < 3;

        // Check if this is a "PERFEITO" method reveal
        const mainTextStr = extractTextFromContent(revelationContent.mainText);
        const isPerfeitoMethod =
          mainTextStr?.toLowerCase().includes('perfeito') ||
          revelationContent.title?.toLowerCase().includes('perfeito') ||
          currentPhase.title?.toLowerCase().includes('perfeito');

        if (showPerfeitoSlide && isPerfeitoMethod) {
          return (
            <V7PhasePERFEITO
              onComplete={goToNextPhase}
              autoAdvance={false}
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

      {/* Exit Button - Top Left */}
      {onExit && (
        <motion.button
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[200] w-10 h-10 sm:w-12 sm:h-12 
                     rounded-full bg-black/40 backdrop-blur-md border border-white/10
                     flex items-center justify-center text-white/60 hover:text-white 
                     hover:bg-black/60 hover:border-white/20 transition-all duration-200"
          onClick={onExit}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showControls ? 1 : 0.3, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Sair da aula"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}

      {/* Timeline - show internalTime when no audio */}
      <V7MinimalTimeline
        currentAct={currentPhaseIndex + 1}
        totalActs={scaledScript.phases.length}
        currentTime={hasAudio ? audio.formattedCurrentTime : formatTime(internalTime)}
        totalTime={totalDuration}
        isVisible={showControls}
      />

      {/* Audio/Play Indicator */}
      <V7AudioIndicator isPlaying={effectiveIsPlaying} />

      {/* Audio Controls - Minimal centered pill */}
      {audioUrl && (
        <V7AudioControls
          isPlaying={audio.isPlaying}
          isMuted={audio.isMuted}
          volume={audio.volume}
          currentTime={audio.formattedCurrentTime}
          duration={audio.formattedDuration}
          onTogglePlay={audio.togglePlayPause}
          onToggleMute={audio.toggleMute}
          onVolumeChange={audio.setVolume}
          isVisible={showControls}
          onPrevious={goToPreviousPhase}
          onNext={goToNextPhase}
          canGoPrevious={currentPhaseIndex > 0}
          canGoNext={currentPhaseIndex < scaledScript.phases.length - 1}
        />
      )}

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase?.id || 'empty'}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderPhaseContent()}
        </motion.div>
      </AnimatePresence>

      {/* Captions - HIDE during all interactive phases */}
      {wordTimestamps.length > 0 && (
        <V7SynchronizedCaptions
          wordTimestamps={wordTimestamps}
          currentTime={audio.currentTime}
          isVisible={
            (audio.isPlaying || audio.currentTime > 0) &&
            currentPhase?.type !== 'interaction' &&
            currentPhase?.type !== 'playground' &&
            currentPhase?.type !== 'revelation' &&
            currentPhase?.type !== 'gamification'
          }
          maxWords={10}
        />
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <V7DiscreteNavigation
          onPrevious={goToPreviousPhase}
          onNext={goToNextPhase}
          onSkip={() => goToPhase(scaledScript.phases.length - 1)}
          canGoPrevious={currentPhaseIndex > 0}
          canGoNext={currentPhaseIndex < scaledScript.phases.length - 1}
          showSkip={currentPhaseIndex < scaledScript.phases.length - 2}
        />
      </motion.div>

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
