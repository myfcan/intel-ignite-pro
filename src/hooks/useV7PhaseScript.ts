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
      
      // Calculate total duration from acts or default
      const rawActs = content?.cinematic_flow?.acts || [];
      const totalDuration = content?.cinematic_flow?.timeline?.totalDuration || 
        rawActs.reduce((sum: number, act: any) => sum + (act.duration || 60), 0) ||
        (data.estimated_time || 8) * 60;

      // Transform database acts to V7 phases
      const phases: V7Phase[] = transformActsToPhases(rawActs, totalDuration);

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
function transformActsToPhases(acts: any[], totalDuration: number): V7Phase[] {
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
    const duration = act.duration || 60;
    const endTime = currentTime + duration;
    const phaseType = mapActTypeToPhaseType(act.type);
    
    const phase: V7Phase = {
      id: act.id || `phase-${index + 1}`,
      title: act.title || `Fase ${index + 1}`,
      startTime: currentTime,
      endTime,
      type: phaseType,
      mood: extractMood(act.content?.visual),
      autoAdvance: phaseType !== 'interaction' && phaseType !== 'playground',
      scenes: generateScenesForPhase(act, phaseType, currentTime, duration),
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
  const scenes: V7Scene[] = [];
  
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
        },
        animation: 'fade',
      });
      break;

    case 'interaction':
      scenes.push({
        id: `${act.id}-quiz`,
        type: 'quiz',
        startTime,
        duration,
        content: {
          mainText: visual.question || 'Responda:',
          options: (visual.options || []).map((opt: any) => ({
            id: opt.id,
            label: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
        animation: 'slide-up',
      });
      break;

    case 'playground':
      scenes.push({
        id: `${act.id}-playground`,
        type: 'playground',
        startTime,
        duration,
        content: {
          mainText: 'DESAFIO PRÁTICO',
          subtitle: act.title,
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
        },
        animation: 'explode',
      });
      scenes.push({
        id: `${act.id}-cta`,
        type: 'cta',
        startTime: startTime + duration * 0.5,
        duration: duration * 0.5,
        content: {
          mainText: 'Próximos Passos',
          options: [
            { label: 'Revisar', emoji: '📚', variant: 'secondary' },
            { label: 'Continuar', emoji: '🚀', variant: 'primary' },
          ],
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
