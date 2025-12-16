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
      
      // Calculate total duration from acts or default
      const rawActs = content?.cinematic_flow?.acts || content?.cinematicStructure?.acts || [];
      const totalDuration = content?.cinematic_flow?.timeline?.totalDuration || 
        content?.metadata?.totalDuration ||
        rawActs.reduce((sum: number, act: any) => sum + (act.duration || 60), 0) ||
        (data.estimated_time || 8) * 60;

      console.log('[useV7PhaseScript] Loading lesson:', data.id);
      console.log('[useV7PhaseScript] Has cinematic_flow:', hasCinematicFlow);
      console.log('[useV7PhaseScript] Acts count:', rawActs.length);

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
    const duration = act.duration || act.endTime - act.startTime || 60;
    const endTime = currentTime + duration;
    const phaseType = mapActTypeToPhaseType(act.type);
    
    // For cinematic_flow, extract visual and audio from act.content
    const visualData = act.content?.visual;
    const audioData = act.content?.audio;
    const interactionData = act.content?.interaction;
    
    const phase: V7Phase = {
      id: act.id || `phase-${index + 1}`,
      title: act.title || `Fase ${index + 1}`,
      startTime: currentTime,
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
        currentTime, 
        duration
      ),
    };

    phases.push(phase);
    currentTime = endTime;
  });

  // Add gamification phase at the end
  phases.push({
    id: 'gamification',
    title: 'Gamificação',
    startTime: currentTime,
    endTime: currentTime + 60,
    type: 'gamification',
    mood: 'success',
    scenes: [{
      id: 'scene-achievements',
      type: 'result',
      startTime: currentTime,
      duration: 60,
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
    'dramatic': 'dramatic',
    'comparison': 'narrative',
    'quiz': 'interaction',
    'interaction': 'interaction',
    'result': 'revelation',
    'playground': 'playground',
    'narrative': 'narrative',
    'reveal': 'revelation',
    'challenge': 'interaction',
  };
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
      scenes.push({
        id: `${act.id}-number`,
        type: 'number-reveal',
        startTime,
        duration: duration * 0.4,
        content: {
          number: String(visual.mainValue || '01'),
          subtitle: visual.subtitle || act.title,
          highlightWord: visual.highlightWord,
          ...commonFields,
        },
        animation: 'count-up',
      });
      scenes.push({
        id: `${act.id}-text`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.4,
        duration: duration * 0.6,
        content: {
          mainText: visual.subtitle || act.title,
          subtitle: visual.highlightWord ? `${visual.highlightWord}` : '',
          ...commonFields,
        },
        animation: 'letter-by-letter',
      });
      break;

    case 'narrative':
      scenes.push({
        id: `${act.id}-split`,
        type: 'split-screen',
        startTime,
        duration: duration * 0.4,
        content: {
          mainText: visual.title || act.title,
          items: [
            { 
              label: visual.leftCard?.label || 'Opção A', 
              value: visual.leftCard?.value || '', 
              isNegative: !visual.leftCard?.isPositive 
            },
            { 
              label: visual.rightCard?.label || 'Opção B', 
              value: visual.rightCard?.value || '', 
              isPositive: visual.rightCard?.isPositive 
            },
          ],
          // Playground comparison fields
          amateurPrompt: visual.amateurPrompt || visual.leftCard?.prompt || '',
          professionalPrompt: visual.professionalPrompt || visual.rightCard?.prompt || '',
          amateurResult: visual.amateurResult || visual.leftCard?.result || '',
          professionalResult: visual.professionalResult || visual.rightCard?.result || '',
          amateurScore: visual.amateurScore || visual.leftCard?.score || 0,
          professionalScore: visual.professionalScore || visual.rightCard?.score || 100,
          ...commonFields,
        },
        animation: 'slide-left',
      });
      scenes.push({
        id: `${act.id}-comparison`,
        type: 'comparison',
        startTime: startTime + duration * 0.4,
        duration: duration * 0.6,
        content: {
          mainText: visual.subtitle || '',
          items: [
            { 
              label: 'Detalhes', 
              left: visual.leftCard?.details || '', 
              right: visual.rightCard?.details || '' 
            },
          ],
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'interaction':
      // Extract quiz-specific fields
      const quizOptions = (visual.options || interaction.options || []).map((opt: any) => ({
        id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
        label: opt.text || opt.label || '',
        text: opt.text || opt.label || '',
        isCorrect: opt.isCorrect ?? false,
        category: opt.category || (opt.isCorrect ? 'good' : 'bad'),
        feedback: opt.feedback || '',
      }));

      scenes.push({
        id: `${act.id}-quiz`,
        type: 'quiz',
        startTime,
        duration,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          correctFeedback: interaction.correctFeedback || visual.correctFeedback || 'Correto! 🎉',
          incorrectFeedback: interaction.incorrectFeedback || visual.incorrectFeedback || 'Tente novamente',
          revealGoodMessage: interaction.revealGoodMessage || visual.revealGoodMessage || '',
          revealBadMessage: interaction.revealBadMessage || visual.revealBadMessage || '',
          ...commonFields,
        },
        animation: 'slide-up',
      });
      break;

    case 'playground':
      // Extract playground-specific fields
      const playgroundVisual = visual.playground || visual;
      
      scenes.push({
        id: `${act.id}-playground`,
        type: 'playground',
        startTime,
        duration,
        content: {
          mainText: playgroundVisual.title || 'DESAFIO PRÁTICO',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || playgroundVisual.description || '',
          
          // Amateur vs Professional comparison
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
          
          // Additional playground context
          context: playgroundVisual.context || '',
          hints: playgroundVisual.hints || [],
          successCriteria: playgroundVisual.successCriteria || [],
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'revelation':
      scenes.push({
        id: `${act.id}-reveal`,
        type: 'text-reveal',
        startTime,
        duration: duration * 0.5,
        content: {
          mainText: visual.mainValue || '✨',
          subtitle: visual.subtitle || act.title,
          highlightWord: visual.highlightWord,
          items: visual.items || visual.bullets || [],
          metrics: visual.metrics || [],
          ...commonFields,
        },
        animation: 'explode',
      });
      scenes.push({
        id: `${act.id}-cta`,
        type: 'cta',
        startTime: startTime + duration * 0.5,
        duration: duration * 0.5,
        content: {
          mainText: visual.ctaTitle || 'Próximos Passos',
          options: visual.ctaOptions || [
            { label: 'Revisar', emoji: '📚', variant: 'secondary' },
            { label: 'Continuar', emoji: '🚀', variant: 'primary' },
          ],
          ...commonFields,
        },
        animation: 'fade',
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
