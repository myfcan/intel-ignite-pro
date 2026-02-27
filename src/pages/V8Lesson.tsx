import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { V8LessonData } from "@/types/v8Lesson";
import { V8LessonPlayer } from "@/components/lessons/v8/V8LessonPlayer";
import { V8CompletionScreen } from "@/components/lessons/v8/V8CompletionScreen";
import { ExercisesSection } from "@/components/lessons/ExercisesSection";
import { Json } from "@/integrations/supabase/types";

export default function V8Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const hasSavedProgress = useRef(false);

  // Fetch lesson
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ["v8-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, trail_id, content, exercises, estimated_time")
        .eq("id", lessonId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  // Parse V8LessonData from JSONB content
  const lessonData: V8LessonData | null = (() => {
    if (!lesson?.content) return null;
    const raw = lesson.content as Record<string, Json>;
    if (raw.contentVersion !== "v8") return null;
    return raw as unknown as V8LessonData;
  })();

  // Parse exercises from separate column (fallback to content.exercises)
  const exercises = (() => {
    if (lesson?.exercises && Array.isArray(lesson.exercises) && lesson.exercises.length > 0) {
      return lesson.exercises;
    }
    return lessonData?.exercises ?? [];
  })();

  // Merge exercises into lessonData for the player
  const playerData: V8LessonData | null = lessonData
    ? { ...lessonData, exercises: exercises as V8LessonData["exercises"] }
    : null;

  // Save progress
  const saveProgress = async (status: "in_progress" | "completed", score?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lessonId) return;

      const { data: existing } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_progress")
          .update({
            status,
            score: score ?? undefined,
            completed_at: status === "completed" ? new Date().toISOString() : undefined,
            last_accessed: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_progress").insert({
          user_id: user.id,
          lesson_id: lessonId,
          status,
          score: score ?? 0,
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          completed_at: status === "completed" ? new Date().toISOString() : undefined,
        });
      }
    } catch {
      // Non-blocking
    }
  };

  const handleComplete = async (scores: number[]) => {
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100;
    await saveProgress("completed", avg);

    // Navigate to next lesson or back to trail
    if (lesson?.trail_id) {
      navigate(`/v8-trail/${lesson.trail_id}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (lesson?.trail_id) {
      navigate(`/v8-trail/${lesson.trail_id}`);
    } else {
      navigate("/dashboard");
    }
  };

  // Mark as in_progress on first render
  useEffect(() => {
    if (!hasSavedProgress.current && playerData) {
      hasSavedProgress.current = true;
      saveProgress("in_progress");
    }
  }, [playerData, lessonId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-slate-400">
          {error ? "Erro ao carregar aula" : "Conteúdo V8 não encontrado"}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-indigo-400 hover:text-white transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <V8LessonPlayer
      lessonData={playerData}
      onComplete={handleComplete}
      onBack={handleBack}
      renderExercises={({ exercises: exs, onComplete: onExComplete, onScoreUpdate }) => (
        <ExercisesSection
          exercises={exs}
          onComplete={onExComplete}
          onScoreUpdate={onScoreUpdate}
        />
      )}
      renderCompletion={({ scores, onContinue }) => (
        <V8CompletionScreen
          scores={scores}
          lessonId={lessonId!}
          onContinue={onContinue}
          onBackToTrail={handleBack}
        />
      )}
    />
  );
}
