// Service to connect V7 Cinematic System to Pipeline and Database
import { supabase } from '@/integrations/supabase/client';

export interface V7CinematicPipelineInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  narrativeScript: string;
  duration: number;
  trail_id?: string;
  order_index?: number;
  voice_id?: string;
  generate_audio?: boolean;
}

export interface V7CinematicPipelineResult {
  success: boolean;
  lessonId?: string;
  audioUrl?: string;
  wordTimestampsCount?: number;
  stats?: {
    actCount: number;
    totalDuration: number;
    interactivePoints: number;
    codePlaygrounds: number;
    hasAudio: boolean;
  };
  error?: string;
}

// Submit lesson to V7 Pipeline
export async function submitToV7Pipeline(
  input: V7CinematicPipelineInput
): Promise<V7CinematicPipelineResult> {
  try {
    console.log('[V7CinematicService] Submitting to pipeline:', input.title);

    const { data, error } = await supabase.functions.invoke('v7-pipeline', {
      body: input,
    });

    if (error) {
      console.error('[V7CinematicService] Pipeline error:', error);
      return { success: false, error: error.message };
    }

    console.log('[V7CinematicService] Pipeline result:', data);
    return data as V7CinematicPipelineResult;
  } catch (err: any) {
    console.error('[V7CinematicService] Error:', err);
    return { success: false, error: err.message };
  }
}

// Fetch V7 lesson from database
export async function fetchV7Lesson(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .eq('model', 'v7')
    .single();

  if (error) throw error;
  return data;
}

// List all V7 lessons
export async function listV7Lessons(options?: {
  limit?: number;
  status?: string;
  trail_id?: string;
}) {
  let query = supabase
    .from('lessons')
    .select('id, title, description, status, is_active, created_at, estimated_time, model')
    .eq('model', 'v7')
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.trail_id) {
    query = query.eq('trail_id', options.trail_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Update V7 lesson status
export async function updateV7LessonStatus(
  lessonId: string,
  status: 'rascunho' | 'completed',
  isActive: boolean
) {
  const { error } = await supabase
    .from('lessons')
    .update({ status, is_active: isActive })
    .eq('id', lessonId);

  if (error) throw error;
  return true;
}

// Delete V7 lesson
export async function deleteV7Lesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
  return true;
}

// Regenerate audio for V7 lesson
export async function regenerateV7Audio(
  lessonId: string,
  narrativeScript: string,
  voiceId?: string
) {
  try {
    // Get existing lesson
    const lesson = await fetchV7Lesson(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    // Call pipeline with regenerate flag
    const result = await submitToV7Pipeline({
      title: lesson.title,
      subtitle: lesson.description || '',
      difficulty: (lesson.difficulty_level as any) || 'beginner',
      category: (lesson.content as any)?.metadata?.category || 'IA',
      tags: (lesson.content as any)?.metadata?.tags || [],
      learningObjectives: (lesson.content as any)?.metadata?.learningObjectives || [],
      narrativeScript,
      duration: (lesson.estimated_time || 5) * 60,
      voice_id: voiceId,
      generate_audio: true,
    });

    return result;
  } catch (err: any) {
    console.error('[V7CinematicService] Regenerate error:', err);
    return { success: false, error: err.message };
  }
}

// Update lesson content
export async function updateV7LessonContent(
  lessonId: string,
  updates: {
    title?: string;
    description?: string;
    content?: any;
    audio_url?: string;
    word_timestamps?: any;
  }
) {
  const { error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId);

  if (error) throw error;
  return true;
}
