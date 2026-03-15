import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type {
  V10Lesson,
  V10LessonStep,
  V10IntroSlide,
  V10LessonNarration,
  V10UserProgress,
  V10UserStreak,
  V10ScreenPart,
} from '../../../types/v10.types';
import { PartAScreen } from './PartA/PartAScreen';
import { PartCScreen } from './PartC/PartCScreen';
import PartBScreen from './PartB/PartBScreen';

interface LessonContainerProps {
  lessonSlug: string;
}

/**
 * LessonContainer — Top-level orchestrator for V10 lesson playback.
 *
 * Wraps Parts A, B, and C with display:none/flex toggling.
 * Fetches all lesson data from Supabase and manages progress persistence.
 */
const LessonContainer: React.FC<LessonContainerProps> = ({ lessonSlug }) => {
  const navigate = useNavigate();

  // ---------- State ----------
  const [currentPart, setCurrentPart] = useState<V10ScreenPart>('A');
  const [lesson, setLesson] = useState<V10Lesson | null>(null);
  const [steps, setSteps] = useState<V10LessonStep[]>([]);
  const [introSlides, setIntroSlides] = useState<V10IntroSlide[]>([]);
  const [narrations, setNarrations] = useState<{
    A?: V10LessonNarration;
    C?: V10LessonNarration;
  }>({});
  const [userProgress, setUserProgress] = useState<V10UserProgress | null>(null);
  const [userStreak, setUserStreak] = useState<V10UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef(userProgress);
  progressRef.current = userProgress;

  // ---------- Fetch lesson data ----------
  const fetchLessonData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch lesson by slug
      const { data: lessonData, error: lessonErr } = await supabase
        .from('v10_lessons')
        .select('*')
        .eq('slug', lessonSlug)
        .single();

      if (lessonErr || !lessonData) {
        setError('Aula n\u00E3o encontrada.');
        setLoading(false);
        return;
      }

      const fetchedLesson = lessonData as unknown as V10Lesson;
      setLesson(fetchedLesson);

      // 2. Fetch related data in parallel
      const [stepsRes, slidesRes, narrRes] = await Promise.all([
        supabase
          .from('v10_lesson_steps')
          .select('*')
          .eq('lesson_id', fetchedLesson.id)
          .order('step_number', { ascending: true }),
        supabase
          .from('v10_lesson_intro_slides')
          .select('*')
          .eq('lesson_id', fetchedLesson.id)
          .order('slide_order', { ascending: true }),
        supabase
          .from('v10_lesson_narrations')
          .select('*')
          .eq('lesson_id', fetchedLesson.id),
      ]);

      if (stepsRes.data) {
        setSteps(stepsRes.data as unknown as V10LessonStep[]);
      }
      if (slidesRes.data) {
        setIntroSlides(slidesRes.data as unknown as V10IntroSlide[]);
      }
      if (narrRes.data) {
        const narrationMap: { A?: V10LessonNarration; C?: V10LessonNarration } = {};
        for (const n of narrRes.data as unknown as V10LessonNarration[]) {
          narrationMap[n.part] = n;
        }
        setNarrations(narrationMap);
      }

      // 3. Fetch user data (progress + streak) if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [progressRes, streakRes] = await Promise.all([
          supabase
            .from('v10_user_lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('lesson_id', fetchedLesson.id)
            .maybeSingle(),
          supabase
            .from('v10_user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (progressRes.data) {
          const prog = progressRes.data as unknown as V10UserProgress;
          setUserProgress(prog);
          // Resume from saved part
          if (!prog.completed) {
            setCurrentPart(prog.current_part);
          }
        }

        if (streakRes.data) {
          setUserStreak(streakRes.data as unknown as V10UserStreak);
        }
      }
    } catch (err) {
      console.error('[LessonContainer] Fetch error:', err);
      setError('Erro ao carregar a aula. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [lessonSlug]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  // ---------- Save progress (debounced) ----------
  const saveProgress = useCallback(
    async (updates: Partial<V10UserProgress>) => {
      if (!lesson) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const existing = progressRef.current;
        if (existing) {
          await supabase
            .from('v10_user_lesson_progress')
            .update(updates as Record<string, unknown>)
            .eq('id', existing.id);
        } else {
          const newProgress = {
            user_id: user.id,
            lesson_id: lesson.id,
            current_part: 'A' as V10ScreenPart,
            current_step: 0,
            current_frame: 0,
            completed: false,
            started_at: new Date().toISOString(),
            time_spent_seconds: 0,
            ...updates,
          };
          const { data } = await supabase
            .from('v10_user_lesson_progress')
            .insert(newProgress as Record<string, unknown>)
            .select()
            .single();
          if (data) {
            setUserProgress(data as unknown as V10UserProgress);
          }
        }
      } catch (err) {
        console.error('[LessonContainer] Save progress error:', err);
      }
    },
    [lesson],
  );

  const debouncedSave = useCallback(
    (updates: Partial<V10UserProgress>) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        saveProgress(updates);
      }, 1000);
    },
    [saveProgress],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // ---------- Part transitions ----------
  const handleProgressUpdate = useCallback((step: number, frame: number) => {
    debouncedSave({ current_step: step + 1, current_frame: frame });
  }, [debouncedSave]);

  const handlePartAComplete = useCallback(() => {
    setCurrentPart('B');
    debouncedSave({ current_part: 'B', current_step: 0, current_frame: 0 });
  }, [debouncedSave]);

  const handlePartBComplete = useCallback(async () => {
    setCurrentPart('C');
    debouncedSave({
      current_part: 'C',
      completed: true,
      completed_at: new Date().toISOString(),
    });

    // --- Gamification: record achievement + update streak ---
    if (!lesson) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Record achievement (idempotent — unique on user_id + lesson_id)
      await supabase.from('v10_user_achievements').upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          badge_icon: lesson.badge_icon,
          badge_name: lesson.badge_name,
          xp_earned: lesson.xp_reward,
          earned_at: new Date().toISOString(),
        } as Record<string, unknown>,
        { onConflict: 'user_id,lesson_id' }
      );

      // 2. Update streak
      const today = new Date().toISOString().slice(0, 10);
      const { data: streakRow } = await supabase
        .from('v10_user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakRow) {
        const streak = streakRow as unknown as V10UserStreak;
        const lastDate = streak.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        let newStreak = streak.current_streak;
        let newStart = streak.streak_start_date;

        if (lastDate === today) {
          // Already active today, no change
        } else if (lastDate === yesterday) {
          newStreak += 1;
        } else {
          // Streak broken, restart
          newStreak = 1;
          newStart = today;
        }

        const newLongest = Math.max(streak.longest_streak, newStreak);

        await supabase
          .from('v10_user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_activity_date: today,
            streak_start_date: newStart,
          } as Record<string, unknown>)
          .eq('id', streak.id);

        setUserStreak({
          ...streak,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          streak_start_date: newStart,
        });
      } else {
        // First ever activity — create streak row
        const { data: newRow } = await supabase
          .from('v10_user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_start_date: today,
          } as Record<string, unknown>)
          .select()
          .single();

        if (newRow) {
          setUserStreak(newRow as unknown as V10UserStreak);
        }
      }

      // 3. Register gamification event (XP + coins via existing RPC)
      await supabase.rpc('register_gamification_event', {
        p_user_id: user.id,
        p_event_type: 'lesson_completed',
        p_payload: { lesson_id: lesson.id, lesson_title: lesson.title },
      }).catch(() => {
        // Non-critical: RPC may not exist in all environments
      });
    } catch (err) {
      console.error('[LessonContainer] Gamification error:', err);
    }
  }, [debouncedSave, lesson]);

  const handleNextLesson = useCallback(() => {
    // Navigate to next lesson or dashboard
    if (lesson?.trail_id) {
      navigate(`/trilha/${lesson.trail_id}`);
    } else {
      navigate('/dashboard');
    }
  }, [lesson, navigate]);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen w-full"
        style={{ backgroundColor: '#0F0B1E' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }}
          />
          <span className="text-white/50 text-sm">Carregando aula...</span>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error || !lesson) {
    return (
      <div
        className="flex items-center justify-center min-h-screen w-full"
        style={{ backgroundColor: '#0F0B1E' }}
      >
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="text-4xl mb-2">{'\u26A0\uFE0F'}</div>
          <p className="text-white/70 text-sm max-w-[300px]">
            {error ?? 'Aula n\u00E3o encontrada.'}
          </p>
          <button
            type="button"
            onClick={fetchLessonData}
            className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ---------- Main layout ----------
  return (
    <div
      className="flex items-start justify-center min-h-screen w-full"
      style={{ backgroundColor: '#0F0B1E' }}
    >
      {/* Main content area: phone + optional sidebar */}
      <div className="flex items-start justify-center w-full min-h-screen gap-6 px-0 md:px-6">
        {/* Phone container */}
        <div className="w-full max-w-[420px] min-h-screen flex flex-col md:rounded-2xl md:my-6 md:min-h-0 md:h-[calc(100vh-48px)] md:overflow-hidden md:shadow-2xl"
          style={{ backgroundColor: '#0F0B1E' }}
        >
          {/* Part A */}
          <div
            className="flex-col w-full h-full"
            style={{ display: currentPart === 'A' ? 'flex' : 'none' }}
          >
            <PartAScreen
              slides={introSlides}
              audioUrl={narrations.A?.audio_url ?? ''}
              onComplete={handlePartAComplete}
            />
          </div>

          {/* Part B */}
          <div
            className="flex-col w-full h-full"
            style={{ display: currentPart === 'B' ? 'flex' : 'none' }}
          >
            <PartBScreen
              steps={steps}
              lessonTitle={lesson.title}
              onComplete={handlePartBComplete}
              onBack={() => setCurrentPart('A')}
              initialStep={userProgress?.current_step ? userProgress.current_step - 1 : 0}
              initialFrame={userProgress?.current_frame ?? 0}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>

          {/* Part C */}
          <div
            className="flex-col w-full h-full"
            style={{ display: currentPart === 'C' ? 'flex' : 'none' }}
          >
            <PartCScreen
              lesson={lesson}
              streak={userStreak}
              audioUrl={narrations.C?.audio_url ?? null}
              onNextLesson={handleNextLesson}
            />
          </div>
        </div>

        {/* Sidebar — visible on desktop only */}
        <div className="hidden min-w-[260px] max-w-[320px] flex-shrink-0 md:flex md:flex-col md:my-6 md:gap-4">
          {/* Lesson info card */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <h3 className="text-white font-semibold text-sm mb-2">{lesson.title}</h3>
            {lesson.description && (
              <p className="text-white/40 text-xs leading-relaxed mb-3">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span>{lesson.total_steps} passos</span>
              <span>{'\u00B7'}</span>
              <span>{lesson.estimated_minutes} min</span>
            </div>
          </div>

          {/* Tools card */}
          {lesson.tools.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Ferramentas
              </h4>
              <div className="flex flex-wrap gap-2">
                {lesson.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              Progresso
            </h4>
            <div className="flex items-center gap-2">
              {(['A', 'B', 'C'] as const).map((part) => {
                const isActive = currentPart === part;
                const isCompleted =
                  (part === 'A' && (currentPart === 'B' || currentPart === 'C')) ||
                  (part === 'B' && currentPart === 'C');
                return (
                  <div key={part} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? '#34D399'
                          : isActive
                          ? '#6366F1'
                          : 'rgba(255,255,255,0.08)',
                        color: isCompleted || isActive ? '#0F0B1E' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {isCompleted ? '\u2713' : part}
                    </div>
                    {part !== 'C' && (
                      <div
                        className="w-6 h-0.5 rounded-full"
                        style={{
                          backgroundColor: isCompleted
                            ? '#34D399'
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContainer;
