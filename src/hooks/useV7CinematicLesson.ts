// Hook to load and transform V7 lessons for the Cinematic player
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface V7CinematicActData {
  id: string;
  type: 'dramatic' | 'comparison' | 'interaction' | 'result' | 'playground';
  title: string;
  content: {
    narrative?: string;
    dramaticNumber?: string;
    dramaticLabel?: string;
    comparisonItems?: Array<{
      label: string;
      description: string;
      highlight?: boolean;
    }>;
    interactionQuestion?: string;
    interactionOptions?: Array<{
      id: string;
      label: string;
      correct?: boolean;
    }>;
    resultMetrics?: Array<{
      label: string;
      value: string;
      icon?: string;
    }>;
    playgroundCode?: string;
    playgroundLanguage?: string;
  };
  startTime: number;
  endTime: number;
  autoAdvanceMs?: number;
}

export interface V7CinematicLessonData {
  id: string;
  title: string;
  subtitle?: string;
  audioUrl?: string;
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
  acts: V7CinematicActData[];
  totalDuration: number;
  metadata: {
    difficulty: string;
    category: string;
    tags: string[];
    learningObjectives: string[];
  };
}

interface UseV7CinematicLessonResult {
  lesson: V7CinematicLessonData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useV7CinematicLesson(lessonId: string | undefined): UseV7CinematicLessonResult {
  const [lesson, setLesson] = useState<V7CinematicLessonData | null>(null);
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
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Lesson not found');

      // Transform database content to cinematic format
      const content = data.content as any;
      const wordTimestamps = data.word_timestamps as any;

      // Extract acts from timeline or create default structure
      const timeline = content?.timeline || content?.cinematic_flow?.timeline || {};
      const rawActs = content?.cinematic_flow?.acts || content?.cinematicStructure?.acts || timeline?.acts || content?.cinematicFlow?.acts || [];
      
      // Transform acts to cinematic format
      const acts: V7CinematicActData[] = rawActs.map((act: any, index: number) => {
        return transformActToCinematic(act, index);
      });

      // If no acts, create default acts from narrative
      if (acts.length === 0 && content?.metadata?.title) {
        acts.push({
          id: 'act-intro',
          type: 'dramatic',
          title: 'Introdução',
          content: {
            narrative: content.metadata?.learningObjectives?.join('\n') || data.title,
            dramaticNumber: '01',
            dramaticLabel: data.title,
          },
          startTime: 0,
          endTime: 30,
          autoAdvanceMs: 5000,
        });
      }

      const lessonData: V7CinematicLessonData = {
        id: data.id,
        title: data.title,
        subtitle: data.description || content?.metadata?.subtitle || '',
        audioUrl: data.audio_url || content?.audioConfig?.url || '',
        wordTimestamps: wordTimestamps || [],
        acts,
        totalDuration: timeline?.totalDuration || content?.metadata?.totalDuration || (data.estimated_time || 5) * 60,
        metadata: {
          difficulty: data.difficulty_level || content?.metadata?.difficulty || 'beginner',
          category: content?.metadata?.category || 'IA',
          tags: content?.metadata?.tags || [],
          learningObjectives: content?.metadata?.learningObjectives || [],
        },
      };

      setLesson(lessonData);
    } catch (err: any) {
      console.error('[useV7CinematicLesson] Error:', err);
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

  return { lesson, isLoading, error, refetch: fetchLesson };
}

// Transform raw act data to cinematic format
function transformActToCinematic(act: any, index: number): V7CinematicActData {
  const actType = mapActType(act.type);
  
  return {
    id: act.id || `act-${index + 1}`,
    type: actType,
    title: act.title || `Ato ${index + 1}`,
    content: extractActContent(act, actType),
    startTime: act.startTime || 0,
    endTime: act.endTime || act.startTime + (act.duration || 30),
    autoAdvanceMs: actType === 'interaction' ? undefined : getAutoAdvanceMs(actType),
  };
}

// Map pipeline act types to cinematic types
function mapActType(type: string): V7CinematicActData['type'] {
  const typeMap: Record<string, V7CinematicActData['type']> = {
    // Direct mappings
    'dramatic': 'dramatic',
    'comparison': 'comparison',
    'quiz': 'interaction',
    'interaction': 'interaction',
    'result': 'result',
    'playground': 'playground',
    // Legacy/pipeline mappings
    'narrative': 'dramatic',
    'reveal': 'dramatic',
    'challenge': 'interaction',
    'code-demo': 'playground',
    'interactive': 'interaction',
    'outro': 'result',
  };
  return typeMap[type] || 'dramatic';
}

// Extract content based on act type
function extractActContent(act: any, type: V7CinematicActData['type']): V7CinematicActData['content'] {
  const content = act.content || {};
  const visual = content.visual || {};
  
  switch (type) {
    case 'dramatic':
      return {
        narrative: visual.subtitle || content.narrative || act.title,
        dramaticNumber: String(visual.mainValue || extractDramaticNumber(content.narrative)),
        dramaticLabel: visual.highlightWord || act.title,
      };
    
    case 'comparison':
      // Handle visual-based comparison (from DB)
      if (visual.leftCard && visual.rightCard) {
        return {
          comparisonItems: [
            { 
              label: visual.leftCard.label || 'Opção A', 
              description: visual.leftCard.details || visual.leftCard.value, 
              highlight: visual.leftCard.isPositive 
            },
            { 
              label: visual.rightCard.label || 'Opção B', 
              description: visual.rightCard.details || visual.rightCard.value, 
              highlight: visual.rightCard.isPositive 
            },
          ],
        };
      }
      // Handle legacy comparison structure
      if (content.comparison) {
        return {
          comparisonItems: [
            { label: 'Antes', description: content.comparison.before, highlight: false },
            { label: 'Depois', description: content.comparison.after, highlight: true },
          ],
        };
      }
      return {
        comparisonItems: [
          { label: 'Amador', description: 'Abordagem básica', highlight: false },
          { label: 'Profissional', description: 'Abordagem avançada', highlight: true },
        ],
      };
    
    case 'interaction':
      // Handle visual-based quiz (from DB)
      if (visual.question && visual.options) {
        return {
          interactionQuestion: visual.question,
          interactionOptions: visual.options.map((opt: any) => ({
            id: opt.id || `opt-${opt.text?.slice(0, 10)}`,
            label: opt.text,
            correct: opt.isCorrect,
          })),
        };
      }
      // Handle legacy challenge structure
      if (content.challenge) {
        return {
          interactionQuestion: content.challenge.prompt,
          interactionOptions: content.challenge.hints?.map((hint: string, i: number) => ({
            id: `opt-${i}`,
            label: hint,
            correct: i === 0,
          })) || [],
        };
      }
      if (content.reveal) {
        return {
          interactionQuestion: content.reveal.question,
          interactionOptions: [
            { id: 'opt-correct', label: content.reveal.answer, correct: true },
          ],
        };
      }
      return {
        interactionQuestion: 'Qual é a melhor abordagem?',
        interactionOptions: [],
      };
    
    case 'result':
      return {
        narrative: visual.subtitle || content.narrative,
        dramaticNumber: String(visual.mainValue || '100%'),
        resultMetrics: [
          { label: 'Score', value: String(visual.mainValue || '100%'), icon: 'trophy' },
        ],
      };
    
    case 'playground':
      return {
        playgroundCode: content.code?.code || '// Seu código aqui',
        playgroundLanguage: content.code?.language || 'javascript',
      };
    
    default:
      return { 
        narrative: visual.subtitle || content.narrative || act.title,
        dramaticNumber: String(visual.mainValue || '01'),
      };
  }
}

// Extract dramatic number from narrative (e.g., "98%" -> "98")
function extractDramaticNumber(narrative?: string): string {
  if (!narrative) return '01';
  const match = narrative.match(/(\d+)%?/);
  return match ? match[1] : '01';
}

// Get auto-advance time based on act type
function getAutoAdvanceMs(type: V7CinematicActData['type']): number {
  const times: Record<string, number> = {
    'dramatic': 5000,
    'comparison': 8000,
    'result': 6000,
    'playground': 0, // No auto-advance for playground
    'interaction': 0, // No auto-advance for interaction
  };
  return times[type] || 5000;
}
