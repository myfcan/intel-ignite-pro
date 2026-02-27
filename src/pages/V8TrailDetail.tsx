import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Loader2, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { V8SkillTree } from "@/components/lessons/v8/V8SkillTree";

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
    if (index === 0) return "available" as const;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando trilha...</p>
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 transition-all mb-4 sm:mb-6 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-sm sm:text-base text-gray-700">Voltar</span>
          </button>

          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #8B5CF6 100%)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="flex-1 w-full">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 text-2xl sm:text-3xl md:text-4xl"
                      style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                    >
                      {(() => {
                        const TrailIcon = TRAIL_ICONS[trail.icon || ''] || GraduationCap;
                        return <TrailIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase bg-white/20 text-white/90 border border-white/20">
                          READ & LISTEN
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                        {trail.title}
                      </h1>
                      {trail.description && (
                        <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2">
                          {trail.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
                    </span>
                  </div>
                </div>
                <div
                  className="w-full md:w-auto text-center md:text-right backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 border"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <div className="text-xs sm:text-sm text-white/80 mb-1">Seu progresso</div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-1">{overallProgress}%</div>
                  <div className="text-xs sm:text-sm text-white/80">{completedCount}/{totalLessons} aulas completas</div>
                </div>
              </div>
              <div
                className="h-2 sm:h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <motion.div
                  className="h-full shadow-lg transition-all duration-500"
                  style={{
                    width: `${Math.min(100, overallProgress)}%`,
                    background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Skill Tree */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {totalLessons > 0 ? (
            <V8SkillTree
              lessons={(lessons ?? []).map((lesson, index) => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description ?? undefined,
                estimatedTime: lesson.estimated_time ?? undefined,
                status: getLessonStatus(index, lesson.id),
              }))}
              onLessonClick={(id) => navigate(`/v8/${id}`)}
              allCompleted={completedCount === totalLessons && totalLessons > 0}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              Nenhuma aula disponível nesta trilha ainda.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
