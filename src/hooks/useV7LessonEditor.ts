// src/hooks/useV7LessonEditor.ts
// Hook for loading and editing existing V7 lessons

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toV7vvPayload } from '@/services/v7vvPayloadAdapter';
import { V7CinematicLesson, V7PipelineInput } from '@/types/v7-cinematic.types';
import { useToast } from '@/hooks/use-toast';

interface UseV7LessonEditorProps {
  lessonId?: string;
}

interface LessonEditState {
  isLoading: boolean;
  isEditing: boolean;
  lesson: V7CinematicLesson | null;
  formData: Partial<V7PipelineInput> | null;
  hasChanges: boolean;
}

export const useV7LessonEditor = ({ lessonId }: UseV7LessonEditorProps) => {
  const { toast } = useToast();

  const [state, setState] = useState<LessonEditState>({
    isLoading: false,
    isEditing: false,
    lesson: null,
    formData: null,
    hasChanges: false,
  });

  // Load existing lesson
  const loadLesson = useCallback(async () => {
    if (!lessonId) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      // Parse content as V7 lesson
      const content = data.content as unknown as V7CinematicLesson;
      const wordTimestamps = data.word_timestamps as any;

      // Convert lesson to editable form data
      const formData: Partial<V7PipelineInput> = {
        title: data.title,
        subtitle: content?.subtitle || '',
        difficulty: content?.metadata?.difficulty || 'beginner',
        category: content?.metadata?.category || 'javascript',
        tags: content?.metadata?.tags || [],
        learningObjectives: content?.metadata?.learningObjectives || [],
        narrativeScript: extractNarrativeFromLesson(content),
        duration: content?.duration || 300,
      };

      // Extend the content with wordTimestamps from DB
      const lessonWithTimestamps = {
        ...content,
        id: data.id,
      } as V7CinematicLesson & { wordTimestamps?: any };

      setState({
        isLoading: false,
        isEditing: true,
        lesson: lessonWithTimestamps,
        formData,
        hasChanges: false,
      });

      return { lesson: content, formData };
    } catch (error: any) {
      console.error('[useV7LessonEditor] Error loading lesson:', error);
      toast({
        title: 'Erro ao carregar lição',
        description: error.message,
        variant: 'destructive',
      });
      setState((prev) => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [lessonId, toast]);

  // Update lesson content
  const updateLesson = useCallback(
    async (updates: Partial<V7CinematicLesson>) => {
      if (!lessonId || !state.lesson) {
        throw new Error('No lesson loaded for editing');
      }

      try {
        const updatedContent = {
          ...state.lesson,
          ...updates,
          metadata: {
            ...state.lesson.metadata,
            ...updates.metadata,
            updatedAt: new Date().toISOString(),
          },
        };

        const { error } = await supabase
          .from('lessons')
          .update({
            title: updatedContent.title,
            content: updatedContent as any,
            description: updatedContent.metadata?.description,
          })
          .eq('id', lessonId);

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          lesson: updatedContent,
          hasChanges: false,
        }));

        toast({
          title: '✅ Lição atualizada',
          description: 'As alterações foram salvas com sucesso',
        });

        return updatedContent;
      } catch (error: any) {
        console.error('[useV7LessonEditor] Error updating lesson:', error);
        toast({
          title: 'Erro ao atualizar lição',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [lessonId, state.lesson, toast]
  );

  // Regenerate lesson with new content
  const regenerateLesson = useCallback(
    async (newFormData: Partial<V7PipelineInput>) => {
      if (!lessonId) {
        throw new Error('No lesson ID for regeneration');
      }

      try {
        // Call pipeline with update flag
        const { data, error } = await supabase.functions.invoke('v7-vv', {
          body: toV7vvPayload({
            ...newFormData,
            existingLessonId: lessonId,
            mode: 'regenerate',
          }),
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || 'Pipeline failed');

        toast({
          title: '✨ Lição regenerada',
          description: 'A lição foi atualizada com o novo conteúdo',
        });

        // Reload the lesson
        await loadLesson();

        return data;
      } catch (error: any) {
        console.error('[useV7LessonEditor] Error regenerating lesson:', error);
        toast({
          title: 'Erro ao regenerar lição',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [lessonId, loadLesson, toast]
  );

  // Activate/deactivate lesson
  const setLessonStatus = useCallback(
    async (isActive: boolean, status: string = 'pronta') => {
      if (!lessonId) {
        throw new Error('No lesson ID');
      }

      try {
        const { error } = await supabase
          .from('lessons')
          .update({
            is_active: isActive,
            status: status,
          })
          .eq('id', lessonId);

        if (error) throw error;

        toast({
          title: isActive ? '✅ Lição publicada' : '📝 Lição despublicada',
          description: isActive
            ? 'A lição está disponível para os alunos'
            : 'A lição foi movida para rascunhos',
        });

        return true;
      } catch (error: any) {
        console.error('[useV7LessonEditor] Error updating status:', error);
        toast({
          title: 'Erro ao atualizar status',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [lessonId, toast]
  );

  // Delete lesson
  const deleteLesson = useCallback(async () => {
    if (!lessonId) {
      throw new Error('No lesson ID');
    }

    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

      if (error) throw error;

      toast({
        title: '🗑️ Lição excluída',
        description: 'A lição foi removida permanentemente',
      });

      return true;
    } catch (error: any) {
      console.error('[useV7LessonEditor] Error deleting lesson:', error);
      toast({
        title: 'Erro ao excluir lição',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [lessonId, toast]);

  // Update form data locally
  const updateFormData = useCallback((updates: Partial<V7PipelineInput>) => {
    setState((prev) => ({
      ...prev,
      formData: prev.formData ? { ...prev.formData, ...updates } : updates,
      hasChanges: true,
    }));
  }, []);

  // Load lesson on mount if ID provided
  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId, loadLesson]);

  return {
    ...state,
    loadLesson,
    updateLesson,
    regenerateLesson,
    setLessonStatus,
    deleteLesson,
    updateFormData,
  };
};

// Helper to extract narrative from lesson acts
function extractNarrativeFromLesson(lesson: V7CinematicLesson | null): string {
  if (!lesson?.cinematicFlow?.acts) return '';

  return lesson.cinematicFlow.acts
    .map((act: any) => {
      // Try to extract text content from visual layers
      const textLayers = act.content?.visual?.layers?.filter((l: any) => l.type === 'text') || [];
      const texts = textLayers.map((l: any) => l.content).filter(Boolean);

      // ✅ V7-v2 FIX: Check BOTH formats (V7-v2 direct + legacy nested)
      const narrationText = act.narration ||                           // V7-v2 format (direct)
                           act.content?.audio?.narration ||           // V7-v2 nested
                           act.content?.audio?.narrationSegment?.text || // Legacy format
                           '';

      return [...texts, narrationText].join('\n');
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
