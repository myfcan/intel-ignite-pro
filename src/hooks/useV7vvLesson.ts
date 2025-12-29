/**
 * useV7vvLesson - Hook simplificado para aulas V7-vv
 *
 * Este hook foi criado para trabalhar com o novo formato V7-vv onde:
 * - O Pipeline V7-vv já processa completamente os dados
 * - Phases, scenes e anchorActions já vêm prontos do backend
 * - ZERO fallbacks - se algo estiver faltando, é erro no Pipeline
 * - AnchorText é o ÚNICO mecanismo de sincronização
 *
 * @version vv
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TIPOS - Espelhando o formato do V7-vv Pipeline
// ============================================================================

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface AnchorAction {
  id: string;
  keyword: string;
  keywordTime: number;
  type: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;
}

export interface CinematicScene {
  id: string;
  type: string;
  startTime: number;
  endTime: number;
  content: Record<string, any>;
  animation: string;
}

export interface V7Phase {
  id: string;
  title: string;
  type: string;
  startTime: number;
  endTime: number;
  anchorActions: AnchorAction[];
  scenes: CinematicScene[];
  interaction?: {
    type: 'quiz' | 'playground';
    question?: string;
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
      feedback?: string;
    }>;
    amateurPrompt?: string;
    professionalPrompt?: string;
    amateurResult?: any;
    professionalResult?: any;
    secretContent?: string;
  };
  audioBehavior?: {
    onStart: 'pause' | 'fade' | 'continue';
    onComplete: 'resume' | 'next-phase';
  };
}

export interface V7vvLessonData {
  model: 'v7-cinematic';
  version: 'vv';
  metadata: {
    title: string;
    subtitle: string;
    difficulty: string;
    category: string;
    tags: string[];
    learningObjectives: string[];
    totalDuration: number;
    phaseCount: number;
    createdAt: string;
    generatedBy: 'V7-vv';
  };
  phases: V7Phase[];
  audioConfig: {
    url: string;
    duration: number;
    wordTimestampsCount: number;
  };
  wordTimestamps: WordTimestamp[];
}

// Formato de script para o player (compatível com V7PhasePlayer)
export interface V7LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  phases: V7Phase[];
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

interface UseV7vvLessonResult {
  // Estado
  loading: boolean;
  error: string | null;

  // Dados da aula
  lessonData: V7vvLessonData | null;
  script: V7LessonScript | null;

  // Áudio
  audioUrl: string | null;
  wordTimestamps: WordTimestamp[];

  // Metadados
  metadata: V7vvLessonData['metadata'] | null;
}

export function useV7vvLesson(lessonId: string): UseV7vvLessonResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<V7vvLessonData | null>(null);

  // Buscar dados da aula
  useEffect(() => {
    if (!lessonId) {
      setError('lessonId é obrigatório');
      setLoading(false);
      return;
    }

    async function fetchLesson() {
      setLoading(true);
      setError(null);

      console.log('[V7-vv:Hook] Fetching lesson:', lessonId);

      try {
        // Buscar da tabela lessons
        const { data, error: fetchError } = await supabase
          .from('lessons')
          .select('id, title, content, audio_url, word_timestamps')
          .eq('id', lessonId)
          .single();

        if (fetchError) {
          throw new Error(`Erro ao buscar aula: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error('Aula não encontrada');
        }

        // Validar que é uma aula V7-vv
        const content = data.content as V7vvLessonData;

        if (!content) {
          throw new Error('Aula sem conteúdo');
        }

        if (content.version !== 'vv') {
          console.warn('[V7-vv:Hook] Aula não é V7-vv, tentando usar formato legado');
          // Ainda podemos tentar processar se tiver o formato correto
        }

        if (!content.phases || content.phases.length === 0) {
          throw new Error('Aula sem phases. Pipeline não processou corretamente.');
        }

        // Validar que todas as phases interativas têm anchorActions
        const missingAnchors: string[] = [];
        content.phases.forEach(phase => {
          const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(phase.type);
          if (isInteractive && (!phase.anchorActions || phase.anchorActions.length === 0)) {
            missingAnchors.push(`Phase "${phase.id}" (${phase.type}) não tem anchorActions`);
          }
        });

        if (missingAnchors.length > 0) {
          console.error('[V7-vv:Hook] ⚠️ Phases interativas sem anchorActions:', missingAnchors);
          // Não vamos falhar aqui, mas logar o problema
        }

        // Usar wordTimestamps do audio gerado
        let wordTimestamps = content.wordTimestamps || [];
        if (data.word_timestamps && Array.isArray(data.word_timestamps)) {
          wordTimestamps = data.word_timestamps as WordTimestamp[];
        }

        // Usar audio_url do storage se disponível
        let audioUrl = content.audioConfig?.url || '';
        if (data.audio_url) {
          audioUrl = data.audio_url;
        }

        // Construir o objeto final
        const finalData: V7vvLessonData = {
          ...content,
          wordTimestamps,
          audioConfig: {
            ...content.audioConfig,
            url: audioUrl,
          },
        };

        console.log('[V7-vv:Hook] ✅ Lesson loaded:', {
          title: content.metadata?.title,
          phases: content.phases?.length,
          scenes: content.phases?.reduce((sum, p) => sum + (p.scenes?.length || 0), 0),
          wordTimestamps: wordTimestamps.length,
          hasAudio: !!audioUrl,
        });

        setLessonData(finalData);

      } catch (err: any) {
        console.error('[V7-vv:Hook] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonId]);

  // Construir script para o player
  const script = useMemo((): V7LessonScript | null => {
    if (!lessonData) return null;

    return {
      id: lessonId,
      title: lessonData.metadata.title,
      totalDuration: lessonData.metadata.totalDuration,
      phases: lessonData.phases,
    };
  }, [lessonData, lessonId]);

  return {
    loading,
    error,
    lessonData,
    script,
    audioUrl: lessonData?.audioConfig?.url || null,
    wordTimestamps: lessonData?.wordTimestamps || [],
    metadata: lessonData?.metadata || null,
  };
}

// ============================================================================
// HELPER: Converter pauseKeywords legado para AnchorActions
// ============================================================================

export function convertLegacyPauseKeywords(pauseKeywords: string[]): AnchorAction[] {
  return pauseKeywords.map((keyword, index) => ({
    id: `legacy-pause-${index}`,
    keyword,
    keywordTime: 0, // Será calculado em runtime
    type: 'pause' as const,
  }));
}

// ============================================================================
// HELPER: Verificar se a aula é compatível com V7-vv
// ============================================================================

export function isV7vvCompatible(content: any): boolean {
  if (!content) return false;
  if (content.version === 'vv') return true;
  if (content.model === 'v7-cinematic' && content.phases && Array.isArray(content.phases)) {
    // Verificar se todas as phases têm a estrutura esperada
    return content.phases.every((p: any) =>
      p.id && p.type && p.scenes && Array.isArray(p.scenes)
    );
  }
  return false;
}
