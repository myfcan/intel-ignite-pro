import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { V8LessonCard } from "@/components/lessons/v8/V8LessonCard";

export default function V8TrailDetail() {
  const { trailId } = useParams<{ trailId: string }>();
  const navigate = useNavigate();

  // Fetch trail
  const { data: trail, isLoading: trailLoading } = useQuery({
    queryKey: ["v8-trail", trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trails")
        .select("*")
        .eq("id", trailId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!trailId,
  });

  // Fetch lessons for this trail (V8: direct trail_id, no course_id)
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["v8-trail-lessons", trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, order_index, estimated_time, is_active, model")
        .eq("trail_id", trailId!)
        .eq("is_active", true)
        .eq("model", "v8")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!trailId,
  });

  // Fetch user progress for all lessons in this trail
  const { data: progressData } = useQuery({
    queryKey: ["v8-trail-progress", trailId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const lessonIds = lessons?.map((l) => l.id) ?? [];
      if (lessonIds.length === 0) return [];
      const { data, error } = await supabase
        .from("user_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data;
    },
    enabled: !!lessons && lessons.length > 0,
  });

  // Check if user is admin (for unlock bypass)
  const { data: isAdmin } = useQuery({
    queryKey: ["v8-is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  const isLoading = trailLoading || lessonsLoading;

  // Build progress map
  const progressMap = new Map(
    (progressData ?? []).map((p) => [p.lesson_id, p.status])
  );

  // Determine lesson status with sequential unlock
  const getLessonStatus = (index: number, lessonId: string) => {
    const status = progressMap.get(lessonId);
    if (status === "completed") return "completed" as const;
    if (status === "in_progress") return "in_progress" as const;
    // First lesson always available
    if (index === 0) return "available" as const;
    // Admin bypass
    if (isAdmin) return "available" as const;
    // Check previous lesson
    const prevLesson = lessons?.[index - 1];
    if (prevLesson && progressMap.get(prevLesson.id) === "completed") {
      return "available" as const;
    }
    return "locked" as const;
  };

  const completedCount = (progressData ?? []).filter(
    (p) => p.status === "completed"
  ).length;
  const totalLessons = lessons?.length ?? 0;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-slate-400">Trilha não encontrada</p>
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
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-violet-600/20" />
        <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-4">
          {/* Back */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          {/* Trail info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-3xl flex-shrink-0">
              {trail.icon || "📚"}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-white">{trail.title}</h1>
              {trail.description && (
                <p className="text-sm text-slate-400 line-clamp-2">
                  {trail.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {totalLessons} {totalLessons === 1 ? "aula" : "aulas"} • Read
                  & Listen
                </span>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-400 tabular-nums">
              {overallProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-2.5">
        {lessons?.map((lesson, index) => (
          <V8LessonCard
            key={lesson.id}
            lessonId={lesson.id}
            title={lesson.title}
            description={lesson.description ?? undefined}
            estimatedTime={lesson.estimated_time ?? undefined}
            status={getLessonStatus(index, lesson.id)}
            index={index}
            onClick={() => navigate(`/v8/${lesson.id}`)}
          />
        ))}

        {totalLessons === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Nenhuma aula disponível nesta trilha ainda.
          </div>
        )}
      </div>
    </div>
  );
}
