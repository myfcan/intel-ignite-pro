// Hook to load and transform V7 lessons into phase-based format for V7PhasePlayer
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { V7LessonScript, V7Phase, V7Scene } from '@/components/lessons/v7/cinematic/phases/V7PhaseController';

interface UseV7PhaseScriptResult {
  script: V7LessonScript | null;
  audioUrl: string | null;
  wordTimestamps: Array<{ word: string; start: number; end: number }>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useV7PhaseScript(lessonId: string | undefined): UseV7PhaseScriptResult {
  const [script, setScript] = useState<V7LessonScript | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wordTimestamps, setWordTimestamps] = useState<Array<{ word: string; start: number; end: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLesson = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Aula não encontrada');

      const content = data.content as any;
      const timestamps = data.word_timestamps as any[] || [];

      // Check if using rich cinematic_flow structure
      const hasCinematicFlow = content?.cinematic_flow?.acts?.length > 0;

      // Get raw acts from either source
      const rawActs = content?.cinematic_flow?.acts || content?.cinematicStructure?.acts || [];

      // ✅ PRIORITY ORDER for total duration:
      // 1. word_timestamps (actual audio length) - most accurate
      // 2. cinematic_flow.timeline.totalDuration (pipeline-calculated)
      // 3. metadata.totalDuration
      // 4. Sum of act durations (may be pre-scaled by pipeline)
      // 5. estimated_time in minutes (fallback)
      const audioDurationFromTimestamps = timestamps.length > 0
        ? Math.ceil(timestamps[timestamps.length - 1].end)
        : null;

      const totalDuration = audioDurationFromTimestamps ||
        content?.cinematic_flow?.timeline?.totalDuration ||
        content?.metadata?.totalDuration ||
        (data.estimated_time || 8) * 60;

      // Check if acts already have scaled durations from pipeline
      // (Pipeline v2.0+ stores startTime/endTime directly on acts)
      const actsHaveScaledTimings = rawActs.length > 0 &&
        rawActs[0].startTime !== undefined &&
        rawActs[0].endTime !== undefined;

      console.log('[useV7PhaseScript] Loading lesson:', data.id);
      console.log('[useV7PhaseScript] Has cinematic_flow:', hasCinematicFlow);
      console.log('[useV7PhaseScript] Acts count:', rawActs.length);
      console.log('[useV7PhaseScript] Audio duration from timestamps:', audioDurationFromTimestamps);
      console.log('[useV7PhaseScript] Total duration used:', totalDuration);
      console.log('[useV7PhaseScript] Acts have pre-scaled timings:', actsHaveScaledTimings);

      // Transform database acts to V7 phases
      const phases: V7Phase[] = transformActsToPhases(rawActs, totalDuration, hasCinematicFlow);

      // Create script
      const lessonScript: V7LessonScript = {
        id: data.id,
        title: data.title,
        totalDuration,
        audioUrl: data.audio_url || '',
        wordTimestamps: timestamps,
        phases,
      };

      setScript(lessonScript);
      setAudioUrl(data.audio_url || null);
      setWordTimestamps(timestamps);
    } catch (err: any) {
      console.error('[useV7PhaseScript] Error:', err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar aula',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, toast]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { script, audioUrl, wordTimestamps, isLoading, error, refetch: fetchLesson };
}

// Transform database acts to V7 phase format
function transformActsToPhases(acts: any[], totalDuration: number, hasCinematicFlow: boolean = false): V7Phase[] {
  if (!acts || acts.length === 0) {
    // Return default phases if no acts
    return getDefaultPhases(totalDuration);
  }

  let currentTime = 0;
  const phases: V7Phase[] = [];

  // ✅ Check if acts already have pre-scaled timings from pipeline v2.0+
  const hasPreScaledTimings = acts[0]?.startTime !== undefined && acts[0]?.endTime !== undefined;

  // Calculate total duration from acts
  let totalActsDuration: number;
  if (hasPreScaledTimings) {
    // Use the last act's endTime as total
    totalActsDuration = acts[acts.length - 1].endTime || totalDuration;
  } else {
    // Legacy: sum up durations
    totalActsDuration = acts.reduce((sum, act) => {
      return sum + (act.duration || 60);
    }, 0);
  }

  // Available time after loading phase (3s)
  const availableTime = totalDuration - 3;

  // ✅ CRITICAL FIX: Even if acts have pre-scaled timings, check if they match the actual audio duration
  // If the pre-scaled timings are from old pipeline (wrong duration), we need to RE-SCALE them
  const preScaledTotal = hasPreScaledTimings ? totalActsDuration : 0;
  const needsReScaling = hasPreScaledTimings && Math.abs(preScaledTotal - availableTime) > 5;

  // Scale factor: needed if acts DON'T have pre-scaled timings OR if pre-scaled timings are wrong
  const scaleFactor = (!hasPreScaledTimings || needsReScaling)
    ? (totalActsDuration > 0 ? availableTime / totalActsDuration : 1)
    : 1;

  console.log(`[transformActsToPhases] Pre-scaled timings: ${hasPreScaledTimings}`);
  console.log(`[transformActsToPhases] Pre-scaled total: ${preScaledTotal}s, Available time: ${availableTime}s`);
  console.log(`[transformActsToPhases] Needs re-scaling: ${needsReScaling}`);
  console.log(`[transformActsToPhases] Scale factor: ${scaleFactor.toFixed(2)} (${totalActsDuration}s acts → ${availableTime}s audio)`);

  // Add loading phase first
  phases.push({
    id: 'loading',
    title: 'Carregando',
    startTime: 0,
    endTime: 3,
    type: 'loading',
    scenes: [],
    mood: 'neutral',
  });
  currentTime = 3;

  acts.forEach((act, index) => {
    const phaseType = mapActTypeToPhaseType(act.type);

    // ✅ Calculate timings - ALWAYS apply scaleFactor if re-scaling is needed
    let startTime: number;
    let endTime: number;
    let duration: number;

    // Minimum duration per phase type to ensure content is visible
    const minDurations: Record<string, number> = {
      dramatic: 8,
      narrative: 8,
      interaction: 10,
      playground: 15,
      revelation: 8,
      gamification: 5,
    };
    const minDuration = minDurations[phaseType] || 5;

    if (hasPreScaledTimings && act.startTime !== undefined && act.endTime !== undefined) {
      if (needsReScaling) {
        // Pre-scaled timings exist but are WRONG - re-scale them
        const scaledStart = act.startTime * scaleFactor;
        const scaledEnd = act.endTime * scaleFactor;
        startTime = 3 + scaledStart; // Add 3s loading phase offset
        endTime = 3 + scaledEnd;
        duration = Math.max(minDuration, scaledEnd - scaledStart);
        // Adjust endTime if we hit minimum
        if (duration > scaledEnd - scaledStart) {
          endTime = startTime + duration;
        }
      } else {
        // Pipeline v2.0+: timings already correct, just add loading phase offset
        startTime = 3 + act.startTime;
        endTime = 3 + act.endTime;
        duration = Math.max(minDuration, act.endTime - act.startTime);
      }
    } else {
      // Legacy: scale manually
      const originalDuration = act.duration || 60;
      duration = Math.max(minDuration, originalDuration * scaleFactor);
      startTime = currentTime;
      endTime = currentTime + duration;
    }

    console.log(`[transformActsToPhases] Act ${index + 1}: "${act.type}" → phase "${phaseType}" (${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s) [duration: ${duration.toFixed(1)}s]`);

    currentTime = endTime; // Update for next iteration
    
    // For cinematic_flow, extract visual and audio from act.content
    const visualData = act.content?.visual;
    const audioData = act.content?.audio;
    const interactionData = act.content?.interaction;
    
    const phase: V7Phase = {
      id: act.id || `phase-${index + 1}`,
      title: act.title || `Fase ${index + 1}`,
      startTime,
      endTime,
      type: phaseType,
      mood: extractMood(visualData),
      autoAdvance: phaseType !== 'interaction' && phaseType !== 'playground',
      scenes: generateScenesForPhase(
        {
          ...act,
          content: {
            visual: visualData,
            audio: audioData,
            interaction: interactionData,
            // Pass visual.instruction as screen direction metadata
            screenDirection: visualData?.instruction || '',
          }
        },
        phaseType,
        startTime, // Use calculated startTime
        duration
      ),
    };

    phases.push(phase);
  });

  // Add gamification phase at the end (using the last phase's endTime)
  const lastPhaseEndTime = phases.length > 1 ? phases[phases.length - 1].endTime : currentTime;
  phases.push({
    id: 'gamification',
    title: 'Gamificação',
    startTime: lastPhaseEndTime,
    endTime: lastPhaseEndTime + 10, // Short gamification phase
    type: 'gamification',
    mood: 'success',
    scenes: [{
      id: 'scene-achievements',
      type: 'result',
      startTime: lastPhaseEndTime,
      duration: 10,
      content: {
        mainText: '🎊 PARABÉNS!',
        subtitle: 'Aula completa!',
        items: [
          { emoji: '✅', text: 'Aula Completada' },
          { emoji: '✅', text: 'Conhecimento Adquirido' },
        ],
        metrics: [
          { label: 'XP Ganho', value: '+150' },
        ],
      },
      animation: 'fade',
    }],
  });

  return phases;
}

// Map database act type to V7 phase type
function mapActTypeToPhaseType(type: string): V7Phase['type'] {
  const typeMap: Record<string, V7Phase['type']> = {
    // Core types
    'dramatic': 'dramatic',
    'narrative': 'narrative',
    'interaction': 'interaction',
    'playground': 'playground',
    'revelation': 'revelation',
    'gamification': 'gamification',
    // Aliases from JSON
    'comparison': 'narrative',
    'quiz': 'interaction',
    'result': 'revelation',
    'reveal': 'revelation',
    'challenge': 'interaction',
    'cta': 'revelation', // CTA uses revelation phase (V7PhaseCTA)
  };
  console.log(`[mapActTypeToPhaseType] "${type}" → "${typeMap[type] || 'dramatic'}"`);
  return typeMap[type] || 'dramatic';
}

// Extract mood from visual content
function extractMood(visual: any): V7Phase['mood'] {
  if (!visual) return 'neutral';
  
  const mood = visual.mood?.toLowerCase();
  if (mood === 'success' || mood === 'positive') return 'success';
  if (mood === 'danger' || mood === 'negative' || mood === 'warning') return 'danger';
  if (mood === 'dramatic') return 'dramatic';
  return 'neutral';
}

// Generate scenes for a phase based on act content
function generateScenesForPhase(act: any, phaseType: V7Phase['type'], startTime: number, duration: number): V7Scene[] {
  const visual = act.content?.visual || {};
  const interaction = act.content?.interaction || {};
  const audio = act.content?.audio || {};
  const scenes: V7Scene[] = [];
  
  // Extract common fields that can appear in any act
  const commonFields = {
    narration: audio.narration || act.narration || '',
    explanation: visual.explanation || interaction.explanation || act.explanation || '',
    tip: visual.tip || interaction.tip || '',
    warning: visual.warning || '',
  };
  
  switch (phaseType) {
    case 'dramatic':
      // 🎬 6 CINEMATIC SCENES (Netflix Bandersnatch-inspired)
      // ✅ SYNC FIX: Timings adjusted to match typical narration flow
      // Narration typically says "98%" in the first 2-3 seconds
      // Extract all dramatic content from visual
      const dramaticNumber = String(visual.mainValue || visual.number || '01');
      const dramaticSubtitle = visual.subtitle || act.title || '';
      const dramaticHighlight = visual.highlightWord || '';
      const dramaticImpact = visual.impactWord || visual.mainText || dramaticHighlight || 'IMPACTO';

      // ✅ Extract hookQuestion from visual, or detect from narration, or use default
      let dramaticHook = visual.hookQuestion || visual.hook || '';
      if (!dramaticHook && commonFields.narration) {
        // Check if narration starts with "Você sabia" pattern
        const narrationLower = commonFields.narration.toLowerCase();
        if (narrationLower.includes('você sabia') || narrationLower.includes('voce sabia')) {
          dramaticHook = 'VOCÊ SABIA?';
        }
      }

      // Scene 0: Letterbox with hook question "VOCÊ SABIA?" (15% - give more time)
      scenes.push({
        id: `${act.id}-hook`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.15,
        content: {
          mainText: dramaticHook,
          hookQuestion: dramaticHook,
          subtitle: '',
          backgroundColor: 'black',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Hook question continues with glow (10% - more time for "VOCÊ SABIA?")
      scenes.push({
        id: `${act.id}-hook-glow`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.15,
        duration: duration * 0.10,
        content: {
          hookQuestion: dramaticHook,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // ✅ Extract secondary number (2%) from visual or use default
      const dramaticSecondaryNumber = visual.secondaryNumber || visual.contrastValue || '2%';

      // Scene 2: Number appears with glow effect (10% - 98% appears here)
      scenes.push({
        id: `${act.id}-number-appear`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          secondaryNumber: dramaticSecondaryNumber,
          subtitle: '', // No subtitle yet - builds suspense
          highlightWord: dramaticHighlight,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 3: Number count-up animation + subtitle reveal (15%)
      scenes.push({
        id: `${act.id}-count-up`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.35,
        duration: duration * 0.15,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          highlightWord: dramaticHighlight,
          countUpAnimation: true,
          ...commonFields,
        },
        animation: 'count-up',
      });

      // Scene 4: Particle explosion transition (10%)
      scenes.push({
        id: `${act.id}-explosion`,
        type: 'particle-effect',
        startTime: startTime + duration * 0.50,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          particleType: 'sparks',
          particleColor: visual.mood === 'danger' ? '#ff0040' : '#22D3EE',
          ...commonFields,
        },
        animation: 'particle-burst',
      });

      // Scene 5: Subtitle reveal letter-by-letter with highlight (20%)
      scenes.push({
        id: `${act.id}-subtitle`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.60,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          mainText: dramaticSubtitle,
          subtitle: dramaticHighlight,
          highlightWord: dramaticHighlight,
          letterByLetter: true,
          ...commonFields,
        },
        animation: 'letter-by-letter',
      });

      // Scene 6: Impact with 98% VS 2% (20% - show contrast)
      scenes.push({
        id: `${act.id}-impact`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.80,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          mainText: dramaticImpact,
          highlightWord: dramaticHighlight,
          cameraZoom: true,
          cameraShake: true,
          particleEffect: 'confetti',
          ...commonFields,
        },
        animation: 'zoom-in',
      });
      break;

    case 'narrative':
      // 🎬 6 CINEMATIC SCENES (Split-screen comparisons)
      // Scene 0: Title fade in with letterboxing (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || act.title,
          subtitle: visual.subtitle || '',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Split-screen slide transition (15%)
      scenes.push({
        id: `${act.id}-split`,
        type: 'split-screen',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || act.title,
          splitPosition: 0.5,
          dividerAnimation: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 2: Left card details animate in (20%)
      scenes.push({
        id: `${act.id}-left-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.leftCard?.label || 'AMADOR',
          items: [
            {
              label: visual.leftCard?.label || 'Opção A',
              value: visual.leftCard?.value || '',
              details: visual.leftCard?.details || '',
              isNegative: !visual.leftCard?.isPositive,
            },
          ],
          amateurPrompt: visual.amateurPrompt || visual.leftCard?.prompt || '',
          amateurScore: visual.amateurScore || visual.leftCard?.score || 0,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: Right card details animate in (20%)
      scenes.push({
        id: `${act.id}-right-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.2,
        content: {
          mainText: visual.rightCard?.label || 'PROFISSIONAL',
          items: [
            {
              label: visual.rightCard?.label || 'Opção B',
              value: visual.rightCard?.value || '',
              details: visual.rightCard?.details || '',
              isPositive: visual.rightCard?.isPositive,
            },
          ],
          professionalPrompt: visual.professionalPrompt || visual.rightCard?.prompt || '',
          professionalScore: visual.professionalScore || visual.rightCard?.score || 100,
          ...commonFields,
        },
        animation: 'slide-right',
      });

      // Scene 4: Comparison highlight effects (20%)
      scenes.push({
        id: `${act.id}-highlight`,
        type: 'comparison',
        startTime: startTime + duration * 0.65,
        duration: duration * 0.2,
        content: {
          mainText: visual.subtitle || 'DIFERENÇA BRUTAL',
          items: [
            {
              label: 'Comparação',
              left: visual.leftCard?.details || '',
              right: visual.rightCard?.details || '',
            },
          ],
          pulseEffect: true,
          glowColor: '#22D3EE',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 5: Warning/urgency with color shift (15%)
      scenes.push({
        id: `${act.id}-warning`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.mainText || act.title,
          subtitle: visual.warning || '',
          warning: visual.warning || '',
          backgroundColor: 'from-black to-red-900/20',
          ...commonFields,
        },
        animation: 'slide-up',
      });
      break;

    case 'interaction':
      // 🎬 5 CINEMATIC SCENES (Interactive quiz with feedback)
      // Extract quiz-specific fields
      const quizOptions = (visual.options || interaction.options || []).map((opt: any) => ({
        id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
        label: opt.text || opt.label || '',
        text: opt.text || opt.label || '',
        isCorrect: opt.isCorrect ?? false,
        category: opt.category || (opt.isCorrect ? 'good' : 'bad'),
        feedback: opt.feedback || '',
      }));

      // Scene 0: Quiz title with icon bounce (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'quiz-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || interaction.title || 'AUTO-AVALIAÇÃO',
          subtitle: '',
          iconBounce: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Question reveal (15%)
      scenes.push({
        id: `${act.id}-question`,
        type: 'quiz-question',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: Options slide in one by one (20%)
      scenes.push({
        id: `${act.id}-options`,
        type: 'quiz-options',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: User interaction pause (40%)
      scenes.push({
        id: `${act.id}-interaction`,
        type: 'quiz',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.4,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          correctFeedback: interaction.correctFeedback || visual.correctFeedback || 'Correto! 🎉',
          incorrectFeedback: interaction.incorrectFeedback || visual.incorrectFeedback || 'Tente novamente',
          revealGoodMessage: interaction.revealGoodMessage || visual.revealGoodMessage || '',
          revealBadMessage: interaction.revealBadMessage || visual.revealBadMessage || '',
          highlightOnHover: true,
          scaleOnHover: 1.02,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Result reveal with feedback glow (15%)
      scenes.push({
        id: `${act.id}-result`,
        type: 'quiz-result',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.correctFeedback || 'Excelente!',
          subtitle: visual.revealGoodMessage || '',
          particles: 'confetti',
          glowEffect: true,
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    case 'playground':
      // 🎬 6 CINEMATIC SCENES (Code typing + results comparison)
      // Extract playground-specific fields
      const playgroundVisual = visual.playground || visual;

      // Scene 0: Challenge title with code effect (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'playground-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: playgroundVisual.title || 'DESAFIO PRÁTICO',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          glitchEffect: true,
          ...commonFields,
        },
        animation: 'glitch',
      });

      // Scene 1: Amateur prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-amateur-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT AMADOR',
          subtitle: '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          typewriterSpeed: 50,
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 2: Amateur result with score animation (15%)
      scenes.push({
        id: `${act.id}-amateur-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          countUpAnimation: true,
          scoreColor: 'red',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: Professional prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-professional-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.4,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT PROFISSIONAL',
          subtitle: '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          typewriterSpeed: 30, // Faster = more professional
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Professional result with score animation (15%)
      scenes.push({
        id: `${act.id}-professional-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.55,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          countUpAnimation: true,
          scoreColor: 'green',
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 5: Comparison bars with winner effect (30%)
      scenes.push({
        id: `${act.id}-comparison`,
        type: 'playground',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: playgroundVisual.title || 'COMPARAÇÃO FINAL',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          raceAnimation: true,
          winnerEffect: 'confetti',
          context: playgroundVisual.context || '',
          hints: playgroundVisual.hints || [],
          successCriteria: playgroundVisual.successCriteria || [],
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'revelation':
      // 🎬 5 CINEMATIC SCENES (Method reveal + CTA)
      // Scene 0: Dramatic pause with black screen (5%)
      scenes.push({
        id: `${act.id}-pause`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.05,
        content: {
          mainText: '',
          subtitle: '',
          backgroundColor: 'black',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 1: Method name reveal with glow (15%)
      scenes.push({
        id: `${act.id}-method-name`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.05,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || visual.mainValue || '✨ REVELAÇÃO',
          subtitle: visual.subtitle || act.title,
          highlightWord: visual.highlightWord,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'zoom-in',
      });

      // Scene 2: Items reveal sequentially (50%)
      scenes.push({
        id: `${act.id}-items`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.subtitle || act.title,
          subtitle: '',
          items: visual.items || visual.bullets || [],
          metrics: visual.metrics || [],
          staggerChildren: 0.25,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: CTA options slide in (20%)
      scenes.push({
        id: `${act.id}-cta-slide`,
        type: 'cta',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.2,
        content: {
          mainText: visual.ctaTitle || 'O QUE VOCÊ VAI FAZER AGORA?',
          subtitle: 'Escolha seu caminho',
          options: visual.options || visual.ctaOptions || [
            { label: 'Aplicar AGORA', emoji: '🎯', variant: 'primary' },
            { label: 'Revisar Tudo', emoji: '📚', variant: 'secondary' },
          ],
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 4: Final CTA pulse effect (10%)
      scenes.push({
        id: `${act.id}-cta-pulse`,
        type: 'cta',
        startTime: startTime + duration * 0.9,
        duration: duration * 0.1,
        content: {
          mainText: visual.ctaTitle || 'Próximos Passos',
          options: visual.options || visual.ctaOptions || [
            { label: 'Revisar', emoji: '📚', variant: 'secondary' },
            { label: 'Continuar', emoji: '🚀', variant: 'primary' },
          ],
          pulseAnimation: true,
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'gamification':
      // 🎬 3 CINEMATIC SCENES (Achievement celebration)
      // Scene 0: Title with celebration effect (20%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'text-reveal',
        startTime,
        duration: duration * 0.2,
        content: {
          mainText: visual.mainText || '🏆 CONQUISTAS',
          subtitle: visual.subtitle || 'Parabéns!',
          glowEffect: true,
          particles: 'confetti',
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Achievements list (50%)
      scenes.push({
        id: `${act.id}-achievements`,
        type: 'result',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.mainText || 'CONQUISTAS',
          subtitle: visual.subtitle || '',
          items: visual.items || [],
          staggerChildren: 0.2,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: XP and metrics (30%)
      scenes.push({
        id: `${act.id}-metrics`,
        type: 'result',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: 'RECOMPENSAS',
          subtitle: '',
          metrics: visual.metrics || [{ label: 'XP Ganho', value: '+100' }],
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    default:
      scenes.push({
        id: `${act.id}-default`,
        type: 'text-reveal',
        startTime,
        duration,
        content: {
          mainText: act.title || 'Conteúdo',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'fade',
      });
  }

  return scenes;
}

// Default phases when no acts are available
function getDefaultPhases(totalDuration: number): V7Phase[] {
  const phaseDuration = totalDuration / 5;
  
  return [
    {
      id: 'loading',
      title: 'Carregando',
      startTime: 0,
      endTime: 3,
      type: 'loading',
      scenes: [],
      mood: 'neutral',
    },
    {
      id: 'intro',
      title: 'Introdução',
      startTime: 3,
      endTime: 3 + phaseDuration,
      type: 'dramatic',
      mood: 'dramatic',
      scenes: [{
        id: 'intro-scene',
        type: 'text-reveal',
        startTime: 3,
        duration: phaseDuration,
        content: { mainText: 'Bem-vindo!', subtitle: 'Vamos começar sua jornada' },
        animation: 'fade',
      }],
    },
    {
      id: 'content',
      title: 'Conteúdo',
      startTime: 3 + phaseDuration,
      endTime: 3 + phaseDuration * 3,
      type: 'narrative',
      mood: 'neutral',
      scenes: [{
        id: 'content-scene',
        type: 'text-reveal',
        startTime: 3 + phaseDuration,
        duration: phaseDuration * 2,
        content: { mainText: 'Conteúdo Principal', subtitle: '' },
        animation: 'fade',
      }],
    },
    {
      id: 'gamification',
      title: 'Conclusão',
      startTime: 3 + phaseDuration * 3,
      endTime: totalDuration,
      type: 'gamification',
      mood: 'success',
      scenes: [{
        id: 'conclusion-scene',
        type: 'result',
        startTime: 3 + phaseDuration * 3,
        duration: phaseDuration * 2 - 3,
        content: { mainText: 'Parabéns!', subtitle: 'Aula completa!' },
        animation: 'fade',
      }],
    },
  ];
}
