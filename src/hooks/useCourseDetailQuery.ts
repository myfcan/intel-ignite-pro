import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: number;
  difficulty_level: string;
  is_active: boolean;
  lesson_type?: string;
  model?: string;
  slug?: string;
}

interface Course {
  id: string;
  trail_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
}

interface CourseDetailData {
  course: Course;
  trailType: string | null;
  trailTitle: string | null;
  lessons: Lesson[];
  completedLessonIds: string[];
  isAdmin: boolean;
}

// Standalone queryFn for reuse in prefetch
async function fetchCourseDetail(courseId: string): Promise<CourseDetailData> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');
  const uid = session.user.id;

  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('id, trail_id, title, description, icon, order_index')
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  const [trailResult, lessonsResult, v10LessonsResult, progressResult, v10ProgressResult, rolesResult] = await Promise.all([
    supabase.from('trails').select('trail_type, title').eq('id', courseData.trail_id).single(),
    supabase.from('lessons')
      .select('id, title, description, order_index, estimated_time, difficulty_level, is_active, lesson_type, model')
      .eq('course_id', courseId).eq('is_active', true).order('order_index'),
    (supabase as any).from('v10_lessons')
      .select('id, slug, title, description, order_in_trail, estimated_minutes, total_steps, status')
      .eq('course_id', courseId).eq('status', 'published').order('order_in_trail'),
    supabase.from('user_progress').select('lesson_id, status').eq('user_id', uid).in('status', ['completed']),
    (supabase as any).from('v10_user_lesson_progress').select('lesson_id, completed').eq('user_id', uid).eq('completed', true),
    supabase.from('user_roles').select('role').eq('user_id', uid),
  ]);

  if (lessonsResult.error) throw lessonsResult.error;
  const roles = (rolesResult.data || []).map(r => r.role);

  // Merge legacy lessons + V10 lessons into a unified array
  const legacyLessons = (lessonsResult.data || []) as Lesson[];
  const v10Lessons: Lesson[] = ((v10LessonsResult.data || []) as any[]).map((v10: any) => ({
    id: v10.id,
    title: v10.title,
    description: v10.description || '',
    order_index: v10.order_in_trail ?? 0,
    estimated_time: v10.estimated_minutes ?? 0,
    difficulty_level: 'beginner',
    is_active: true,
    lesson_type: 'v10',
    model: 'v10',
    slug: v10.slug,
  }));

  // Combine and sort by order_index
  const allLessons = [...legacyLessons, ...v10Lessons].sort((a, b) => a.order_index - b.order_index);

  // Merge completed IDs from both systems
  const legacyCompleted = (progressResult.data || []).map((p: any) => p.lesson_id).filter(Boolean) as string[];
  const v10Completed = ((v10ProgressResult.data || []) as any[]).filter((p: any) => p.completed).map((p: any) => p.lesson_id) as string[];
  const allCompletedIds = [...legacyCompleted, ...v10Completed];

  return {
    course: courseData as Course,
    trailType: trailResult.data?.trail_type ?? null,
    trailTitle: trailResult.data?.title ?? null,
    lessons: allLessons,
    completedLessonIds: allCompletedIds,
    isAdmin: roles.includes('admin') || roles.includes('supervisor'),
  };
}

export function useCourseDetailQuery(courseId: string | undefined) {
  return useQuery<CourseDetailData>({
    queryKey: ['course-detail', courseId],
    queryFn: () => fetchCourseDetail(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook that returns a prefetch handler for CourseDetail data.
 * Use on onMouseEnter / onTouchStart of journey cards.
 */
export function usePrefetchCourseDetailData() {
  const queryClient = useQueryClient();

  return useCallback((courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['course-detail', courseId],
      queryFn: () => fetchCourseDetail(courseId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
}
