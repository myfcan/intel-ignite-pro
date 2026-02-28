import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Loader2, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, Trophy, Lock, Award, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { V8SkillTree } from "@/components/lessons/v8/V8SkillTree";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* ── Compact App Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[200px]">
            {trail.title}
          </h1>
          <div className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            {overallProgress}%
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        {/* ── Unit Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
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

        {/* ── Certificate Mockup Card ── */}
        <div className={`rounded-2xl p-5 mb-6 ${
          allCompleted 
            ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg"
            : "bg-white shadow-sm"
        }`}>
          {/* Certificate document mockup */}
          <div className={`rounded-xl p-4 mb-4 border-2 border-dashed ${
            allCompleted ? "border-amber-300 bg-white/70" : "border-gray-200 bg-gray-50/50"
          }`}>
            <div className="flex flex-col items-center text-center py-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                allCompleted ? "bg-amber-100" : "bg-gray-100"
              }`}>
                {allCompleted ? (
                  <Trophy className="w-6 h-6 text-amber-500" />
                ) : (
                  <Award className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className={`text-sm font-bold mb-1 ${allCompleted ? "text-amber-800" : "text-gray-600"}`}>
                {allCompleted ? "🎉 Certificado Disponível!" : "Obtenha seu certificado"}
              </p>
              {/* Decorative lines simulating certificate text */}
              <div className="w-full space-y-1.5 mt-2 px-4">
                <div className={`h-1.5 rounded-full mx-auto ${allCompleted ? "bg-amber-200 w-3/4" : "bg-gray-200 w-3/4"}`} />
                <div className={`h-1.5 rounded-full mx-auto ${allCompleted ? "bg-amber-100 w-1/2" : "bg-gray-150 w-1/2"}`} style={{ backgroundColor: allCompleted ? undefined : 'hsl(220, 14%, 92%)' }} />
                <div className={`h-1.5 rounded-full mx-auto ${allCompleted ? "bg-amber-100 w-2/3" : "bg-gray-150 w-2/3"}`} style={{ backgroundColor: allCompleted ? undefined : 'hsl(220, 14%, 94%)' }} />
              </div>
            </div>
          </div>
          
          {/* Progress footer */}
          <p className={`text-xs mb-2 ${allCompleted ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
            {allCompleted 
              ? "Parabéns! Todas as aulas concluídas." 
              : `Complete ${totalLessons - completedCount} aula${totalLessons - completedCount !== 1 ? 's' : ''} restante${totalLessons - completedCount !== 1 ? 's' : ''}`
            }
          </p>
          <div className="flex items-center gap-3">
            <Progress value={overallProgress} className="flex-1 h-2" />
            <span className={`text-xs font-bold ${allCompleted ? "text-amber-700" : "text-gray-500"}`}>
              {completedCount}/{totalLessons}
            </span>
          </div>
        </div>

        {/* ── Skill Tree ── */}
        {totalLessons > 0 ? (
          <V8SkillTree
            lessons={(lessons ?? []).map((lesson, index) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description ?? undefined,
              estimatedTime: lesson.estimated_time ?? undefined,
              imageUrl: (lesson as any).image_url ?? undefined,
              status: getLessonStatus(index, lesson.id),
            }))}
            onLessonClick={(id) => navigate(`/v8/${id}`)}
            allCompleted={allCompleted}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            Nenhuma aula disponível nesta trilha ainda.
          </div>
        )}
      </div>
    </div>
  );
}
