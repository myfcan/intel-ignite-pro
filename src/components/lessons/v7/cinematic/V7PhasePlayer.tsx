// V7PhasePlayer - Main player component orchestrating all cinematic phases
// ✅ V7-v2: Uses useV7AudioManager with fade capabilities for interactions
// ✅ V7-v2: Uses useAnchorText for keyword-based pause sync
// ✅ Level 4: Integrated with XState machine via useV7PlayerAdapter
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { V7MinimalControls } from './V7MinimalControls';
import { V7AudioIndicator } from './V7AudioIndicator';
import { V7CinematicCanvas } from './V7CinematicCanvas';
import { V7ExitConfirmModal } from './V7ExitConfirmModal';
import { useV7AudioManager } from './useV7AudioManager';
import { useV7SoundEffects } from './useV7SoundEffects';
import { useAnchorText, convertPauseKeywordsToActions, AnchorAction, AnchorEvent } from './useAnchorText';
import { pushV7DebugLog, V7_RUNTIME_CONTRACT_VERSION, V7_RUNTIME_CONTRACTS } from './v7DebugLogger';
import { V7SynchronizedCaptions } from '../V7SynchronizedCaptions';
import { V7DebugPanel } from '../V7DebugPanel';
import { V7DebugHUD } from './V7DebugHUD';
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
import V7ImageSequenceRenderer from './phases/V7ImageSequenceRenderer';
import { V7TransitionParticles } from './effects/V7TransitionParticles';
import { V7MicroVisualOverlay } from './effects/V7MicroVisualOverlay';
import { V7NarrativeVisualOverlay } from './effects/V7NarrativeVisualOverlay';
import { V7SecretRevelation3D } from './effects/V7SecretRevelation3D';
import { V7MethodRevealGlow } from './effects/V7MethodRevealGlow';
import {
  V7LessonScript,
  V7Phase,
  V7TimeoutConfig,
  V7AudioBehavior,
  V7MicroVisual,
  usePhaseController
} from './phases/V7PhaseController';
// Legacy debug system removed - now using V7 Diagnostic Engine

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

// ✅ C12.1: Type guard for frame trigger payloads (eliminates unsafe `as any` casts)
function isFrameTriggerPayload(payload: unknown): payload is { frameIndex: number } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'frameIndex' in payload &&
    typeof (payload as { frameIndex: unknown }).frameIndex === 'number'
  );
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // ✅ V7 DEBUG HUD: Track quiz state for debugging
  const [debugQuizEnabled, setDebugQuizEnabled] = useState(false);
  const [debugQuizReason, setDebugQuizReason] = useState('initial');

  // ✅ C12.1: Image sequence frame control (anchor mode vs timer fallback)
  const [imageSequenceFrameIndex, setImageSequenceFrameIndex] = useState<number | null>(null);
  const [imageSequenceTimerFallback, setImageSequenceTimerFallback] = useState(false);
  const isResyncingRef = useRef(false);

  // ✅ DETERMINISTIC LOGS: Mount/unmount tracking + C11 SESSION_INIT
  useEffect(() => {
    console.log(`[PLAYER_MOUNT] V7PhasePlayer mounted - scriptId="${script?.id}" phasesCount=${script?.phases?.length}`);
    pushV7DebugLog('SESSION_INIT', {
      currentTime: 0,
      contractVersion: V7_RUNTIME_CONTRACT_VERSION,
      contracts: [...V7_RUNTIME_CONTRACTS],
      scriptId: script?.id ?? null,
      phasesCount: script?.phases?.length ?? 0,
      hasAudio,
    });
    return () => {
      console.log(`[PLAYER_UNMOUNT] V7PhasePlayer unmounted - scriptId="${script?.id}"`);
    };
  }, [script?.id, script?.phases?.length]);

  // ✅ DEBUG LOGS
  console.log('[V7PhasePlayer] Script recebido:', {
    id: script?.id,
    title: script?.title,
    phasesCount: script?.phases?.length,
    firstPhaseType: script?.phases?.[0]?.type,
    firstPhaseScenesCount: script?.phases?.[0]?.scenes?.length,
  });

  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects();

  // Legacy debug system removed - V7 Diagnostic Engine is used on-demand via admin panel

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
  // ✅ A1-v3: Guard to only log PLAYGROUND_ENTRY on state transitions
  const playgroundLastLogRef = useRef<string | null>(null);

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

  // ✅ V7-vv PADRÃO: Determina se o play deve ser BLOQUEADO
  // Fases interativas exigem que o usuário complete a ação antes de continuar
  const isPlayLocked = useMemo(() => {
    if (!currentPhase) return false;
    
    // Tipos de fases que BLOQUEIAM o play
    const interactivePhaseTypes = [
      'interaction',      // Quiz de múltipla escolha
      'playground',       // Chat/Playground de prática
      'quiz',             // Quiz alternativo
      'exercise',         // Exercícios diversos
      'cta',              // Call to action com botão
      'secret-reveal',    // Revelação que exige atenção
    ];
    
    const isInteractivePhase = interactivePhaseTypes.includes(currentPhase.type);
    
    // Revelation com PERFEITO também bloqueia (animação especial)
    const isRevelationWithPERFEITO = currentPhase.type === 'revelation' && 
      (currentPhase.title?.toLowerCase().includes('perfeito') || 
       String((currentPhase.scenes?.[0]?.content as Record<string, unknown>)?.mainText || '').toLowerCase().includes('perfeito'));
    
    const shouldLock = isInteractivePhase || isRevelationWithPERFEITO;
    
    if (shouldLock) {
      console.log(`[V7PhasePlayer] 🔒 Play BLOQUEADO - fase "${currentPhase.id}" (${currentPhase.type}) requer interação`);
    }
    
    return shouldLock;
  }, [currentPhase]);

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

  // ✅ C07: Verificar se a fase interativa tem pause action
  const hasPauseActionForInteractivePhase = useMemo(() => {
    if (!currentPhase) return true; // Não bloquear se não há fase
    
    const interactivePhaseTypes = ['interaction', 'playground', 'quiz', 'cta'];
    const isInteractive = interactivePhaseTypes.includes(currentPhase.type) || 
                          currentPhase.interaction !== undefined;
    
    if (!isInteractive) return true; // Não é interativa, não precisa de pause
    
    // Verificar se existe pause action
    const hasPause = anchorActions.some(a => a.type === 'pause');
    
    console.log(`[C07] Phase "${currentPhase.id}" (${currentPhase.type}): interactive=${isInteractive}, hasPause=${hasPause}`);
    
    return hasPause;
  }, [currentPhase, anchorActions]);

  // ✅ C07: Flag para indicar que auto-pause foi aplicado (fallback para phases sem pause action)
  const [c07AutoPaused, setC07AutoPaused] = useState(false);
  const c07AutoPauseAppliedRef = useRef(false);

  // Verificações simples
  // ✅ PATCH A2: Caption anti-bleed via pause anchor real
  const phaseFilteredTimestamps = useMemo(() => {
    if (!currentPhase) return wordTimestamps;
    const start = currentPhase.startTime ?? 0;
    const endFallback = currentPhase.endTime ?? Infinity;

    // Buscar pause action da fase para cutoff preciso
    const pauseAction = (currentPhase as any).anchorActions?.find(
      (a: any) => a.type === 'pause'
    );
    const pauseKeyword = pauseAction?.keyword;

    let captionEnd = endFallback;

    if (pauseKeyword) {
      const norm = (s: string) =>
        s.toLowerCase().normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '')
         .replace(/[.,!?;:'"()\[\]{}]/g, '')
         .trim();

      const kw = norm(pauseKeyword);
      const inRange = wordTimestamps.filter(
        w => w.start >= start && w.end <= endFallback
      );
      const matched = [...inRange].reverse().find(w => norm(w.word) === kw);
      if (matched) {
        captionEnd = matched.end + 0.02;
        console.log(`[CaptionFilter] Phase "${currentPhase.id}": cutoff by anchor "${pauseKeyword}" at ${matched.end.toFixed(3)}s`);
      } else {
        console.warn(`[CaptionFilter] Phase "${currentPhase.id}": keyword "${pauseKeyword}" not found in range, using endTime fallback`);
      }
    }

    return wordTimestamps.filter(w => w.start >= start && w.end <= captionEnd);
  }, [wordTimestamps, currentPhase?.startTime, currentPhase?.endTime,
      currentPhase?.anchorActions]);

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
    highlightedElements,
    // ✅ V7 DEBUG HUD: Extract debug state
    lastCrossedAction,
    prevTime: anchorPrevTime,
    resetActions,
  } = useAnchorText({
    wordTimestamps,
    currentTime: audio.currentTime,
    actions: anchorActions,
    isPlaying: audio.isPlaying,
    phaseId: currentPhase?.id || '',
    enabled: shouldEnableAnchors,
    onPause: (triggeredKeywordTime?: number) => {
      if (audio.isPlaying) {
        // ✅ V7-v42: PAUSA INSTANTÂNEA - para IMEDIATAMENTE
        audio.pause();
        console.log(`[V7PhasePlayer] ⏸️ ANCHOR PAUSE @ ${audio.currentTime.toFixed(3)}s (keywordTime: ${triggeredKeywordTime?.toFixed(3) || 'N/A'}s)`);
        
        // ✅ V7-v42: SEMPRE faz seek-back para a posição exata da keyword
        // Isso GARANTE que o usuário não ouça nada após a keyword (ex: "E..." da próxima frase)
        // Usamos o keywordTime passado pelo callback, não procuramos na lista
        if (triggeredKeywordTime !== undefined && triggeredKeywordTime > 0) {
          // Sempre seek-back, mesmo se diferença for mínima - isso corta qualquer vazamento
          console.log(`[V7PhasePlayer] ⏪ SEEK-BACK GARANTIDO: ${audio.currentTime.toFixed(3)}s → ${triggeredKeywordTime.toFixed(3)}s`);
          audio.seekTo(triggeredKeywordTime);
        }
      }
    },
    onResume: () => {
      if (!audio.isPlaying) {
        audio.play();
        console.log(`[V7PhasePlayer] ▶️ ANCHOR RESUME`);
      }
    },
    // ✅ V7-v60 PATCH D2: Process 'show' actions for microVisuals
    onShow: (targetId: string, payload?: any) => {
      console.log(`[V7PhasePlayer] 👁️ ANCHOR SHOW: targetId="${targetId}"`, payload);
      // visibleElements state is already updated by useAnchorText internally
      // This callback is for logging and any additional side effects
    },
    // ✅ C12.1: Handle frame triggers from anchor actions
    onTrigger: (action: AnchorAction) => {
      if (isFrameTriggerPayload(action.payload)) {
        // ✅ M2: Gate anti-flicker — ignore triggers during seek resync window
        if (isResyncingRef.current) {
          console.log(`[V7PhasePlayer] IMAGE_SEQ FRAME TRIGGER IGNORED (resync in progress): frame=${action.payload.frameIndex}`);
          return;
        }
        setImageSequenceFrameIndex(action.payload.frameIndex);
        pushV7DebugLog('C12.1_IMAGE_SEQUENCE_FRAME_TRIGGER', {
          phaseId: currentPhase?.id,
          frameIndex: action.payload.frameIndex,
          keyword: action.keyword,
          currentTime: audio.currentTime,
        });
        console.log(`[V7PhasePlayer] IMAGE_SEQ FRAME TRIGGER: frame=${action.payload.frameIndex} keyword="${action.keyword}" @ ${audio.currentTime.toFixed(3)}s`);
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

  // ✅ C12.1: Init/reset image sequence mode when phase changes
  useEffect(() => {
    if (!currentPhase) return;
    const narrativeVisual = (currentPhase as any).visual;
    if (narrativeVisual?.type !== 'image-sequence') {
      if (imageSequenceFrameIndex !== null) {
        setImageSequenceFrameIndex(null);
        setImageSequenceTimerFallback(false);
      }
      return;
    }
    const hasFrameTriggers = currentPhase.anchorActions?.some(
      (a: any) => a.type === 'trigger' && isFrameTriggerPayload(a.payload)
    );
    if (hasFrameTriggers) {
      setImageSequenceFrameIndex(0);
      setImageSequenceTimerFallback(false);
      pushV7DebugLog('C12.1_IMAGE_SEQUENCE_MODE_INIT', {
        phaseId: currentPhase.id, mode: 'anchor', currentTime: audio.currentTime,
      });
    } else {
      setImageSequenceFrameIndex(null);
      setImageSequenceTimerFallback(true);
      pushV7DebugLog('C12.1_IMAGE_SEQUENCE_MODE_INIT', {
        phaseId: currentPhase.id, mode: 'timer', currentTime: audio.currentTime,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase?.id]);

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * C12.1 — Image Sequence Anchor Synchronization (ARCHITECTURAL CONTRACT)
   *
   * SOURCE OF TRUTH:
   * Frame state is derived from AnchorText resolution using canonical `keywordTime`
   * (produced during pipeline anchor resolution and consumed by useAnchorText).
   *
   * DO NOT:
   * - Derive frame timing from durationMs (timer is fallback only for legacy content).
   * - Introduce independent timing logic inside the renderer.
   * - Replace keywordTime with arbitrary timestamps.
   *
   * SEEK BEHAVIOR:
   * Frame index MUST be recomputed deterministically from audio.currentTime
   * by selecting the highest frameIndex whose triggerTime <= currentTime.
   *
   * This guarantees:
   * - Determinism on seek-back / seek-forward
   * - Immunity to React batching order
   * - Consistency with useAnchorText crossing engine
   *
   * CRITICAL DEPENDENCY:
   * This logic depends on:
   *   1) keywordTime being correctly populated by the pipeline
   *   2) audio.currentTime triggering React updates
   *
   * Any change in audio engine or anchor resolution MUST preserve this contract.
   *
   * If modifying audio manager or anchor engine:
   * - Re-run C12.1 test matrix (T1–T10)
   * - Validate deterministic resync on seek
   *
   * ─────────────────────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    if (imageSequenceFrameIndex === null) return; // timer mode, skip
    if (!currentPhase?.anchorActions?.length) return;

    const frameTriggers = currentPhase.anchorActions
      .filter((a: any) => a.type === 'trigger' && isFrameTriggerPayload(a.payload))
      .map((a: any) => ({
        frameIndex: (a.payload as { frameIndex: number }).frameIndex,
        triggerTime: a.keywordTime ?? 0,
      }))
      .sort((a: { triggerTime: number }, b: { triggerTime: number }) => a.triggerTime - b.triggerTime);

    if (!frameTriggers.length) return;

    let correctFrame = 0;
    for (const ft of frameTriggers) {
      if (ft.triggerTime <= audio.currentTime) {
        correctFrame = ft.frameIndex;
      }
    }

    // Guard anti-loop: only update if different
    if (correctFrame !== imageSequenceFrameIndex) {
      // ✅ M2: Gate anti-flicker — block onTrigger during resync window (250ms)
      isResyncingRef.current = true;
      setImageSequenceFrameIndex(correctFrame);
      pushV7DebugLog('C12.1_IMAGE_SEQUENCE_SEEK_RESYNC', {
        phaseId: currentPhase.id,
        fromFrame: imageSequenceFrameIndex,
        toFrame: correctFrame,
        currentTime: audio.currentTime,
      });
      setTimeout(() => { isResyncingRef.current = false; }, 250);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.currentTime, imageSequenceFrameIndex, currentPhase?.id]);

  // ✅ C07.2 LEGACY FALLBACK: For interactive phases without pause action in JSON
  // NÃO é "auto-pause 300ms" - é fallback para JSON legado que não tem pause
  // CONDIÇÃO: (interaction && pause_actions_count==0)
  // AÇÃO: Habilitar opções IMEDIATAMENTE e logar [LEGACY_FALLBACK_USED]
  // NOTA: CTA não precisa de fallback - botão é sempre clicável
  useEffect(() => {
    if (!currentPhase) return;
    
    // Detectar CTA pela presença de scenes com ctaOptions (CTA é sempre clicável)
    const hasCTAContent = currentPhase.scenes?.some((s: any) => 
      s.content?.ctaOptions || s.content?.isCTA
    );
    if (hasCTAContent) {
      console.log(`[C07.2] Phase "${currentPhase.id}" has CTA content - button always clickable, no pause needed`);
      return;
    }
    
    // ✅ GUARD C07.2: Se a fase tem anchorText.pauseAt explícito, o sistema de anchors
    // (useAnchorText) é responsável por pausar via crossing detection. O fallback NÃO deve interferir.
    const hasExplicitPauseAt = !!(currentPhase as any).anchorText?.pauseAt ||
                               currentPhase.scenes?.some((s: any) => s.anchorText?.pauseAt);

    if (hasExplicitPauseAt) {
      console.log(`[C07.2] Phase "${currentPhase.id}" has anchorText.pauseAt - anchor system handles pause, skipping fallback`);
      return;
    }

    const interactivePhaseTypes = ['interaction', 'playground', 'quiz'];
    const isInteractive = interactivePhaseTypes.includes(currentPhase.type) || 
                          currentPhase.interaction !== undefined;
    
    if (!isInteractive) {
      // Reset C07 state when leaving interactive phase
      setC07AutoPaused(false);
      c07AutoPauseAppliedRef.current = false;
      playgroundLastLogRef.current = null;
      return;
    }
    
    // If we already have a pause action from pipeline, skip - anchor system will handle it
    if (hasPauseActionForInteractivePhase) {
      console.log(`[C07.2] Phase "${currentPhase.id}" has pause action in JSON - anchor system will handle`);
      return;
    }
    
    // If already applied legacy fallback, skip
    if (c07AutoPauseAppliedRef.current) {
      return;
    }
    
    // LEGACY FALLBACK: JSON não tem pauseAction - habilitar opções imediatamente
    // Este é o ÚNICO fallback permitido - para JSON legado sem C07 aplicado no pipeline
    console.warn(`[LEGACY_FALLBACK_USED] Phase "${currentPhase.id}" (${currentPhase.type}) missing pause_action in JSON contract`);
    console.warn(`[LEGACY_FALLBACK_USED] Enabling interaction immediately - this indicates pipeline did NOT apply C07`);
    
    // Pausar áudio se estiver tocando (para permitir interação)
    if (audio.isPlaying) {
      audio.pause();
      console.log(`[LEGACY_FALLBACK_USED] Audio paused for legacy interactive phase`);
    }
    
    setC07AutoPaused(true);
    c07AutoPauseAppliedRef.current = true;
  }, [currentPhase?.id, currentPhase?.type, currentPhase?.interaction, hasPauseActionForInteractivePhase, audio.isPlaying]);

  // A1-v3: Edge-triggered log quando isPausedByAnchor transiciona false->true
  const prevPausedByAnchorRef = useRef<boolean>(false);
  useEffect(() => {
    const prev = prevPausedByAnchorRef.current;
    const next = Boolean(isPausedByAnchor);
    if (!prev && next) {
      pushV7DebugLog('PLAYER_PAUSE_STATE_TRUE', {
        phaseId: currentPhase?.id ?? null,
        isPausedByAnchor: true,
        c07AutoPaused: Boolean(c07AutoPaused),
        shouldPauseAudio: true,
        currentTime: audio.getCurrentTime(),
      });
    }
    prevPausedByAnchorRef.current = next;
  }, [isPausedByAnchor, c07AutoPaused, currentPhase?.id, audio]);

  // ✅ V7 DEBUG HUD: Sync quiz enabled state for debugging
  useEffect(() => {
    const interactivePhaseTypes = ['interaction', 'playground', 'quiz'];
    const isInteractive = currentPhase && interactivePhaseTypes.includes(currentPhase.type);
    
    if (isInteractive) {
      // Quiz options are enabled when paused by anchor OR by C07 auto-pause
      const enabled = isPausedByAnchor || c07AutoPaused;
      const reason = isPausedByAnchor ? 'paused_by_anchor' : 
                     c07AutoPaused ? 'c07_auto_pause' : 
                     'waiting_for_anchor';
      
      setDebugQuizEnabled(enabled);
      setDebugQuizReason(reason);
    } else {
      setDebugQuizEnabled(false);
      setDebugQuizReason('not_interactive_phase');
    }
  }, [currentPhase?.type, isPausedByAnchor, c07AutoPaused]);

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
  // Legacy debug registration removed - V7 Diagnostic Engine analyzes on-demand

  // Legacy phase transition tracking removed

  // Legacy debug audio events and report saving removed - V7 Diagnostic Engine analyzes on-demand

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

  // ✅ V7-vv PADRÃO: Callback seguro para toggle play que respeita o lock
  const safeTogglePlayPause = useCallback(() => {
    if (isPlayLocked) {
      console.log('[V7PhasePlayer] ⛔ Play BLOQUEADO - complete a interação primeiro');
      return;
    }
    audio.togglePlayPause();
  }, [isPlayLocked, audio]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPhase();
      if (e.key === 'ArrowLeft') goToPreviousPhase();
      if (e.key === ' ') {
        e.preventDefault();
        // ✅ V7-vv: Usar callback seguro que respeita o lock
        safeTogglePlayPause();
      }
      if (e.key === 'm' || e.key === 'M') audio.toggleMute();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [audio, currentPhaseIndex, safeTogglePlayPause]);

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

      // ✅ PLAYER_NEXT_DOES_NOT_SEEK_AUDIO FIX: ALWAYS seek to next phase start
      // Previous logic had complex conditions that silently skipped seeking.
      // Now we ALWAYS seek when navigating via Next, ensuring audio stays in sync.
      const audioTime = audio.currentTime || 0;
      const nextPhaseStart = nextPhase?.startTime || 0;
      const timeDrift = Math.abs(audioTime - nextPhaseStart);
      
      if (hasAudio && nextPhase && !skipAudioSeek) {
        audio.seekTo(nextPhaseStart);
        console.log(`  🔀 SEEKING to ${nextPhaseStart.toFixed(2)}s (from ${audioTime.toFixed(2)}s, drift: ${timeDrift.toFixed(2)}s)`);
      } else if (skipAudioSeek) {
        console.log(`  ⏸️ skipAudioSeek=true - NOT seeking (audio at ${audioTime.toFixed(2)}s)`);
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

  // Loading is now rendered as an overlay inside the main return, not a replacement

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
  // ✅ V7-v50 FIX: Added includeImmediate flag to include first scene immediately
  // This prevents race conditions where relativeTime ≈ 0 returns empty content
  const getCombinedSceneContent = (includeImmediate: boolean = false): any => {
    if (!currentPhase?.scenes) return {};

    const effectiveTime = hasAudio ? audio.currentTime : internalTime;
    const phaseStartTime = currentPhase.startTime ?? 0;
    const relativeTime = effectiveTime - phaseStartTime;

    // Merge only scenes that have STARTED (not future scenes)
    // ✅ V7-v50: When includeImmediate=true, ALWAYS include scene 0 to prevent empty content at phase start
    const combined: any = {};
    currentPhase.scenes
      .filter((scene, idx) => {
        const sceneStart = scene.startTime ?? 0;
        // ✅ Include first scene immediately if flag is set, OR if scene has started
        if (includeImmediate && idx === 0) return true;
        return relativeTime >= sceneStart;
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
      case 'comparison': {
        // ✅ C12.1: Check for image-sequence visual type FIRST
        const narrativeVisual = (currentPhase as any).visual;
        if (narrativeVisual?.type === 'image-sequence' && narrativeVisual?.frames?.length > 0) {
          return (
            <V7ImageSequenceRenderer
              key={currentPhase.id}
              frames={narrativeVisual.frames}
              activeFrameIndex={imageSequenceFrameIndex}
              displayMode={narrativeVisual.displayMode ?? 'fullscreen'}
              enableTimerFallback={imageSequenceTimerFallback}
              fadeMs={800}
              effects={narrativeVisual.effects}
              phaseId={currentPhase.id}
              currentTime={hasAudio ? audio.currentTime : internalTime}
              phaseTitle={currentPhase.title}
            />
          );
        }

        // ✅ V7-vv FIX: Extract data from phase.visual.content (not scenes!)
        const compVisualContent = (currentPhase as any).visual?.content || {};
        const compLeft = compVisualContent.left || {};
        const compRight = compVisualContent.right || {};
        
        // ✅ V7-vv: items são arrays de STRINGS no formato do banco
        const leftItems = Array.isArray(compLeft.items) ? compLeft.items : [];
        const rightItems = Array.isArray(compRight.items) ? compRight.items : [];
        
        // Build comparisons from the items arrays (zip left and right)
        const maxItems = Math.max(leftItems.length, rightItems.length);
        const compComparisons = maxItems > 0
          ? Array.from({ length: maxItems }, (_, i) => ({
              label: '',
              leftValue: typeof leftItems[i] === 'string' ? leftItems[i] : (leftItems[i]?.text || ''),
              rightValue: typeof rightItems[i] === 'string' ? rightItems[i] : (rightItems[i]?.text || ''),
              leftColor: '#ff6b6b',
              rightColor: '#4ecdc4'
            }))
          : [{ label: 'Comparação', leftValue: '', rightValue: '', leftColor: '#ff6b6b', rightColor: '#4ecdc4' }];

        console.log('[V7PhasePlayer] 🎬 Comparison/Narrative phase:', {
          phaseId: currentPhase.id,
          leftLabel: compLeft.label,
          rightLabel: compRight.label,
          leftItems,
          rightItems,
          centerPrompt: compVisualContent.centerPrompt
        });

        return (
          <V7PhaseNarrative
            leftTitle={compLeft.label || '98% BRINCANDO'}
            rightTitle={compRight.label || '2% DOMINANDO'}
            leftEmoji={compLeft.emoji || '😂'}
            rightEmoji={compRight.emoji || '💰'}
            comparisons={compComparisons}
            warningTitle=""
            warningSubtitle=""
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            centerPrompt={compVisualContent.centerPrompt || ''}
            centerEmoji={compVisualContent.centerEmoji || '🍌'}
          />
        );
      }

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
            isPausedByAnchor={isPausedByAnchor || c07AutoPaused}
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

        const _pgCurrentTime = audio.getCurrentTime();
        const _pgShouldPause = Boolean(isPausedByAnchor || c07AutoPaused);
        const _pgInPhase = _pgCurrentTime >= (currentPhase.startTime ?? 0) &&
                   _pgCurrentTime <= (currentPhase.endTime ?? Infinity);
        
        // ✅ A1-v3 FIX: Only log PLAYGROUND_ENTRY on state transitions, not every render
        const _pgStateKey = `${_pgShouldPause}|${_pgInPhase}|${isPausedByAnchor}`;
        if (!playgroundLastLogRef.current || playgroundLastLogRef.current !== _pgStateKey) {
          const _pgEntryPayload = {
            phaseId: currentPhase.id,
            startTime: currentPhase.startTime,
            endTime: currentPhase.endTime,
            currentTime: _pgCurrentTime,
            inPhase: _pgInPhase,
            isPausedByAnchor,
            c07AutoPaused,
            shouldPauseAudio: _pgShouldPause,
          };
          console.log('[V7PhasePlayer] 🎮 PLAYGROUND ENTRY:', _pgEntryPayload);
          pushV7DebugLog('PLAYGROUND_ENTRY', _pgEntryPayload);
          playgroundLastLogRef.current = _pgStateKey;
        }
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
            shouldPauseAudio={Boolean(isPausedByAnchor || c07AutoPaused)}
            getAudioCurrentTime={() => audio.getCurrentTime()}
          />
        );

      case 'revelation':
        // ✅ V7-v50 FIX: IMMEDIATE DETECTION - Check multiple sources for letter-reveal
        // This prevents race conditions where visual.type isn't loaded yet at phase start
        const revelationVisual = (currentPhase as any).visual;
        const revelationVisualType = revelationVisual?.type;
        const revelationVisualContent = revelationVisual?.content || {};
        
        // ✅ V7-v50: Use includeImmediate=true to get scene 0 content immediately
        const revelationContent = getCombinedSceneContent(true);
        
        // ✅ UNIVERSAL: Merge visual content with scene content (visual takes priority)
        const mergedRevelationContent = {
          ...revelationContent,
          ...revelationVisualContent, // Visual content overwrites scene content
        };

        // ✅ V7-v51 FIX: Multi-source detection for letter-reveal / PERFEITO
        // Check ALL possible indicators - not just visual.type
        const isPerfeitoByTitle = currentPhase.title?.toLowerCase().includes('perfeito') || 
                                   currentPhase.id?.toLowerCase().includes('perfeito');
        const isPerfeitoByVisualType = revelationVisualType === 'letter-reveal';
        const isPerfeitoByVisualWord = revelationVisualContent?.word?.toLowerCase() === 'perfeito';
        const isPerfeitoBySceneContent = mergedRevelationContent?.word?.toLowerCase() === 'perfeito' ||
                                          mergedRevelationContent?.highlightWord?.toLowerCase() === 'perfeito';
        
        // ✅ V7-v51: Detecção adicional por phase.id
        const isPerfeitoByPhaseId = currentPhase.id?.toLowerCase().includes('perfeito');
        
        // ✅ V7-v51: Detecção por visual.content.letters (array de letras)
        const hasLettersArray = Array.isArray(revelationVisualContent?.letters);
        
        // ✅ V7-v51: UNIFIED DETECTION - qualquer sinal positivo = renderizar V7PhasePERFEITOSynced
        const shouldRenderLetterReveal = isPerfeitoByVisualType || 
                                          isPerfeitoByTitle || 
                                          isPerfeitoByVisualWord || 
                                          isPerfeitoBySceneContent ||
                                          isPerfeitoByPhaseId ||
                                          hasLettersArray;

        // ✅ V7-v51: Log diagnóstico completo antes da decisão
        console.log('[V7PhasePlayer] 🔴 REVELATION FULL DEBUG:', {
          phaseId: currentPhase.id,
          phaseType: currentPhase.type,
          phaseTitle: currentPhase.title,
          // Check visual object
          hasVisual: !!revelationVisual,
          visualType: revelationVisualType,
          visualWord: revelationVisualContent?.word,
          // Check detection results
          isPerfeitoByTitle,
          isPerfeitoByVisualType,
          isPerfeitoByVisualWord,
          isPerfeitoBySceneContent,
          isPerfeitoByPhaseId,
          hasLettersArray,
          shouldRenderLetterReveal,
          // Raw visual for inspection
          rawVisual: JSON.stringify(revelationVisual || {}).slice(0, 300),
        });

        // ✅ V7-v51: Use unified detection with robust fallbacks
        if (shouldRenderLetterReveal) {
          // ✅ V7-v51: Extrair dados do visual.content do banco
          const lettersFromDB = revelationVisualContent?.letters || [];
          
          console.log('[V7PhasePlayer] ✅ RENDERING V7PhasePERFEITOSynced:', {
            word: revelationVisualContent?.word,
            lettersCount: lettersFromDB.length,
            finalStamp: revelationVisualContent?.finalStamp,
          });
          
          // Letter reveal visual (e.g., PERFEITO, MÉTODO, any vertical word)
          // ✅ V7-v60: Pass anchorActions for audio-synced reveal
          return (
            <V7PhasePERFEITOSynced
              wordTimestamps={wordTimestamps}
              currentTime={audio.currentTime}
              isPlaying={audio.isPlaying}
              // ✅ V7-v51: Passar dados do banco
              lettersData={lettersFromDB}
              word={revelationVisualContent?.word || 'PERFEITO'}
              finalStamp={revelationVisualContent?.finalStamp}
              // ✅ V7-v60: Passar anchorActions para sincronização com áudio
              anchorActions={currentPhase.anchorActions || []}
              onComplete={() => {
                console.log('[V7PhasePlayer] Letter-reveal animation complete - advancing');
                const fromIndex = lockedPhaseIndex ?? currentPhaseIndex;
                if (lockedPhaseIndex !== null) {
                  console.log('[V7PhasePlayer] 🔓 Unlocking revelation phase');
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

        // ✅ V7-v31: Use mergedRevelationContent (visual + scenes merged)
        const ctaOptions = (mergedRevelationContent.options || content.options || []).map((opt: any) => ({
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
            title={extractTextFromContent(mergedRevelationContent.mainText) || extractTextFromContent(content.mainText) || currentPhase.title}
            subtitle={extractTextFromContent(mergedRevelationContent.subtitle) || extractTextFromContent(content.subtitle) || ''}
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
        onTogglePlay={safeTogglePlayPause}
        onToggleMute={audio.toggleMute}
        onVolumeChange={audio.setVolume}
        onPrevious={goToPreviousPhase}
        onNext={goToNextPhase}
        onExit={() => setShowExitConfirm(true)}
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
        isLocked={isPlayLocked} // ✅ V7-vv PADRÃO: Bloqueia play durante fases interativas
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
      {/* Hide during dramatic/revelation phases as they have their own prominent visuals */}
      {/* ✅ V7-v60: Pass anchorTriggeredIds for anchor-based visibility */}
      {currentPhase?.microVisuals && currentPhase.microVisuals.length > 0 && 
       currentPhase?.type !== 'dramatic' && 
       currentPhase?.type !== 'revelation' && (
        <V7MicroVisualOverlay
          microVisuals={currentPhase.microVisuals}
          currentTime={hasAudio ? audio.currentTime : internalTime}
          isPlaying={effectiveIsPlaying}
          visualType={(currentPhase as any).visual?.type}
          anchorTriggeredIds={visibleElements}
        />
      )}

      {/* V7-vv-v6: 3D Cinematic Secret Revelation - sophisticated Three.js effects */}
      {/* Active during "segredo dos 2%" narration: ~52s to ~65s, STOPS before revelation phase */}
      <V7SecretRevelation3D
        enabled={effectiveIsPlaying && 
          (hasAudio ? audio.currentTime : internalTime) >= 52 && 
          (hasAudio ? audio.currentTime : internalTime) <= 65 &&
          currentPhase?.type !== 'revelation'
        }
        intensity={1}
        currentTime={hasAudio ? audio.currentTime : internalTime}
      />

      {/* V7-vv-v7: Subtle golden glow for MÉTODO PERFEITO revelation */}
      <V7MethodRevealGlow
        enabled={currentPhase?.type === 'revelation'}
        intensity={0.8}
      />

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

      {/* ✅ V7-vv-v8: Botão "Continuar" para fases não-interativas quando pausadas por anchor */}
      {/* Mostra apenas quando isPausedByAnchor está ativo E a fase NÃO tem UI de interação própria */}
      <AnimatePresence>
        {isPausedByAnchor && 
         currentPhase?.type !== 'interaction' && 
         currentPhase?.type !== 'playground' && 
         currentPhase?.type !== 'secret-reveal' && 
         currentPhase?.type !== 'gamification' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() => {
                console.log('[V7PhasePlayer] ▶️ User clicked Continue - resuming audio');
                manualResume();
                if (hasAudio && !audio.isPlaying) {
                  audio.play();
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
            >
              ▶ Continuar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captions - ✅ V7-v17: HIDE during interactive phases but SHOW during all others */}
      {/* ✅ V7-v32: CTA-button interactions should SHOW captions (they have continuous narration) */}
      {wordTimestamps.length > 0 && (
        <V7SynchronizedCaptions
          wordTimestamps={phaseFilteredTimestamps}
          currentTime={audio.currentTime}
          isVisible={
            // ✅ V7-v17: Show captions when audio is playing OR when we have any audio time
            // Hide only during interactive phases that control their own content
            // ✅ V7-v32: Exception for CTA-button interactions - they have continuous narration
            (audio.isPlaying || audio.currentTime > 0.5) &&
            (currentPhase?.type !== 'interaction' || (currentPhase?.interaction as any)?.type === 'cta-button') &&
            currentPhase?.type !== 'playground' &&
            currentPhase?.type !== 'gamification' &&
            currentPhase?.type !== 'secret-reveal' // ✅ secret-reveal has its own narration
          }
          maxWords={10}
        />
      )}

      {/* Loading overlay - elegant bottom bar, doesn't cover player */}
      {isLoading && (
        <V7PhaseLoading onComplete={handleLoadingComplete} duration={3000} />
      )}

      {/* ✅ V7 Debug HUD - Fixed top right, always visible in debug mode */}
      <V7DebugHUD
        hasAudio={hasAudio}
        wordTimestampsCount={wordTimestamps.length}
        currentTime={hasAudio ? audio.currentTime : internalTime}
        prevTime={anchorPrevTime}
        lastCrossedAction={lastCrossedAction ? {
          type: lastCrossedAction.type,
          phaseId: currentPhase?.id || 'unknown',
          targetId: lastCrossedAction.targetId,
          keywordTime: lastCrossedAction.keywordTime,
          keyword: lastCrossedAction.keyword,
          id: lastCrossedAction.id,
        } : null}
        visibleElementsSize={visibleElements.size}
        quizOptionsEnabled={debugQuizEnabled}
        quizOptionsReason={debugQuizReason}
        currentPhase={currentPhase}
        onResetState={() => {
          console.log('[V7DebugHUD] 🔄 Reset State triggered');
          resetActions();
          setDebugQuizEnabled(false);
          setDebugQuizReason('reset_by_hud');
        }}
        onSimulateSeekBack={() => {
          console.log('[V7DebugHUD] ⏪ Simulate Seek Back -2s triggered');
          const targetTime = Math.max(0, audio.currentTime - 2);
          audio.seekTo(targetTime);
        }}
        onSeekForward={() => {
          console.log('[V7DebugHUD] ⏩ Seek Forward +30s triggered');
          const targetTime = Math.min(audio.duration, audio.currentTime + 30);
          audio.seekTo(targetTime);
        }}
      />

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

      {/* ✅ Exit Confirmation Modal */}
      <V7ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirmExit={() => {
          setShowExitConfirm(false);
          onExit?.();
        }}
        onContinue={() => setShowExitConfirm(false)}
      />
    </div>
  );
};
