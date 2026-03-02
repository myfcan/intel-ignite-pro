import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { V8SkillTree } from "@/components/lessons/v8/V8SkillTree";
import { V8CertificateCard } from "@/components/lessons/v8/V8CertificateCard";
import { V8LivTrailWelcome } from "@/components/lessons/v8/V8LivTrailWelcome";
import { V8LessonReviewGate } from "@/components/lessons/v8/V8LessonReviewGate";

const TRAIL_ICONS: Record<string, LucideIcon> = {
  Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, BookOpen,
};

export default function V8TrailDetail() {
  const { trailId } = useParams<{ trailId: string }>();
  const navigate = useNavigate();

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

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["v8-trail-lessons", trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, order_index, estimated_time, is_active, model, image_url")
        .eq("trail_id", trailId!)
        .eq("is_active", true)
        .eq("model", "v8")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!trailId,
  });

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

  const { data: userPlan } = useQuery({
    queryKey: ["v8-user-plan"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "basico" as const;
      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();
      return data?.plan ?? "basico";
    },
  });

  const [showLivWelcome, setShowLivWelcome] = useState(true);
  const [reviewGateLesson, setReviewGateLesson] = useState<{ id: string; title: string } | null>(null);

  const isLoading = trailLoading || lessonsLoading;

  const progressMap = new Map(
    (progressData ?? []).map((p) => [p.lesson_id, p.status])
  );

  const getLessonStatus = (index: number, lessonId: string) => {
    const status = progressMap.get(lessonId);
    if (status === "completed") return "completed" as const;
    if (status === "in_progress") return "in_progress" as const;
    if (index === 0) return "in_progress" as const;
    if (isAdmin) return "available" as const;
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
  const allCompleted = completedCount === totalLessons && totalLessons > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando trilha...</p>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Trilha não encontrada</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const TrailIcon = TRAIL_ICONS[trail.icon || ''] || GraduationCap;

  const isBasicUser = userPlan === 'basico' && !isAdmin;

  const handleLessonClick = (lessonId: string) => {
    if (isBasicUser) {
      const lesson = lessons?.find(l => l.id === lessonId);
      setReviewGateLesson({ id: lessonId, title: lesson?.title ?? 'Aula' });
    } else {
      navigate(`/v8/${lessonId}`);
    }
  };

  const lessonItems = (lessons ?? []).map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description ?? undefined,
    estimatedTime: lesson.estimated_time ?? undefined,
    imageUrl: (lesson as any).image_url ?? undefined,
    status: getLessonStatus(index, lesson.id),
  }));

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* ── Compact App Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[240px]">
            {trail.title}
          </h1>
          <div className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            {overallProgress}%
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        {/* ── Unit Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <TrailIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Unidade 1</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{trail.title}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{totalLessons}</span>
            </div>
          </div>
        </div>

        {/* ── Premium Layout: Certificate Left + Skill Tree Right ── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Certificate Card ── */}
          <V8CertificateCard
            completedCount={completedCount}
            totalLessons={totalLessons}
            allCompleted={allCompleted}
            trailTitle={trail.title}
          />

          {/* ── Skill Tree (Right) ── */}
          <div className="flex-1 min-w-0">
            {totalLessons > 0 ? (
              <V8SkillTree
                lessons={lessonItems}
                onLessonClick={handleLessonClick}
                allCompleted={allCompleted}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                Nenhuma aula disponível nesta trilha ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {showLivWelcome && trailId && trail && (
        <V8LivTrailWelcome
          trailId={trailId}
          trailTitle={trail.title}
          onContinue={() => setShowLivWelcome(false)}
        />
      )}

      {reviewGateLesson && (
        <V8LessonReviewGate
          lessonId={reviewGateLesson.id}
          lessonTitle={reviewGateLesson.title}
          onClose={() => setReviewGateLesson(null)}
        />
      )}
    </div>
  );
}
