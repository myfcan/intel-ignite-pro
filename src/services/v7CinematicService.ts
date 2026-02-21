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

    const { data, error } = await supabase.functions.invoke('v7-vv', {
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

// Regenerate audio for V7 lesson via ElevenLabs
export async function regenerateV7LessonAudio(
  lessonId: string,
  voiceId?: string
): Promise<{
  success: boolean;
  audioUrl?: string;
  wordTimestampsCount?: number;
  error?: string;
}> {
  try {
    console.log('[V7CinematicService] Regenerating audio for:', lessonId);

    const { data, error } = await supabase.functions.invoke('v7-regenerate-audio', {
      body: { lessonId, voiceId },
    });

    if (error) {
      console.error('[V7CinematicService] Regenerate audio error:', error);
      return { success: false, error: error.message };
    }

    console.log('[V7CinematicService] Regenerate audio result:', data);
    return data;
  } catch (err: any) {
    console.error('[V7CinematicService] Error:', err);
    return { success: false, error: err.message };
  }
}
