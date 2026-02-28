import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Loader2, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, Trophy, Lock, Award, Star, Sparkles, type LucideIcon } from "lucide-react";
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
          {/* ── Premium Certificate Card (Left) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-[300px] flex-shrink-0 lg:sticky lg:top-[72px] lg:self-start"
          >
            <div className={`rounded-2xl overflow-hidden ${
              allCompleted
                ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-xl"
                : "bg-white shadow-lg"
            }`}
              style={{
                border: allCompleted
                  ? '2.5px solid hsl(43, 80%, 55%)'
                  : '2.5px solid hsl(43, 65%, 72%)',
                boxShadow: allCompleted
                  ? '0 8px 32px rgba(217, 168, 42, 0.30), 0 0 0 4px rgba(217, 168, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
                  : '0 4px 24px rgba(217, 168, 42, 0.15), 0 0 0 4px rgba(217, 168, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              {/* Certificate Header Band */}
              <div className={`px-4 py-3 ${
                allCompleted
                  ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                  : "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600"
              }`}>
                <div className="flex items-center gap-2">
                  {allCompleted ? (
                    <Sparkles className="w-4 h-4 text-amber-900" />
                  ) : (
                    <Award className="w-4 h-4 text-white/90" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    allCompleted ? "text-amber-900" : "text-white/90"
                  }`}>
                    Certificado
                  </span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-5">
                {/* Document Mockup */}
                <div className={`rounded-xl p-4 border-2 ${
                  allCompleted 
                    ? "border-amber-200 bg-gradient-to-b from-white to-amber-50/30" 
                    : "border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50"
                }`}>
                  {/* Seal / Badge */}
                  <div className="flex justify-center mb-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center relative ${
                      allCompleted 
                        ? "bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-200/50" 
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}>
                      {allCompleted ? (
                        <Trophy className="w-7 h-7 text-amber-900" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                      {/* Decorative ring */}
                      {allCompleted && (
                        <motion.div
                          className="absolute inset-[-3px] rounded-full border-2 border-amber-300/60"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <p className={`text-center text-[11px] font-bold uppercase tracking-[0.12em] mb-1 ${
                    allCompleted ? "text-amber-700" : "text-gray-500"
                  }`}>
                    Certificado de Conclusão
                  </p>

                  {/* Decorative divider */}
                  <div className="flex items-center gap-2 my-2.5">
                    <div className={`flex-1 h-px ${allCompleted ? "bg-amber-200" : "bg-gray-200"}`} />
                    <Star className={`w-3 h-3 ${allCompleted ? "text-amber-400" : "text-gray-300"}`} />
                    <div className={`flex-1 h-px ${allCompleted ? "bg-amber-200" : "bg-gray-200"}`} />
                  </div>

                  {/* Simulated text lines */}
                  <div className="space-y-1.5 px-2">
                    <div className={`h-1.5 rounded-full mx-auto w-[85%] ${allCompleted ? "bg-amber-200/80" : "bg-gray-200/80"}`} />
                    <div className={`h-1.5 rounded-full mx-auto w-[65%] ${allCompleted ? "bg-amber-100/80" : "bg-gray-150/80"}`} style={{ backgroundColor: allCompleted ? undefined : 'hsl(220, 14%, 92%)' }} />
                    <div className={`h-1.5 rounded-full mx-auto w-[75%] ${allCompleted ? "bg-amber-100/60" : "bg-gray-150/60"}`} style={{ backgroundColor: allCompleted ? undefined : 'hsl(220, 14%, 94%)' }} />
                  </div>

                  {/* Signature area */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200/60">
                    <div className={`h-1 rounded-full mx-auto w-[40%] ${allCompleted ? "bg-amber-300/50" : "bg-gray-200/50"}`} />
                    <p className={`text-center text-[9px] mt-1 ${allCompleted ? "text-amber-500/70" : "text-gray-300"}`}>
                      AIliv Academy
                    </p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-4">
                  <p className={`text-xs mb-2 ${allCompleted ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                    {allCompleted
                      ? "Parabéns! Trilha concluída."
                      : `${totalLessons - completedCount} aula${totalLessons - completedCount !== 1 ? 's' : ''} restante${totalLessons - completedCount !== 1 ? 's' : ''}`
                    }
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Progress value={overallProgress} className="flex-1 h-2" />
                    <span className={`text-xs font-bold ${allCompleted ? "text-amber-700" : "text-gray-500"}`}>
                      {completedCount}/{totalLessons}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Skill Tree (Right) ── */}
          <div className="flex-1 min-w-0">
            {totalLessons > 0 ? (
              <V8SkillTree
                lessons={lessonItems}
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
      </div>
    </div>
  );
}
