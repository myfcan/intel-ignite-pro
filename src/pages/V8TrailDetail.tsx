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
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: allCompleted
                  ? '3px solid hsl(43, 78%, 52%)'
                  : '2px solid hsl(43, 50%, 78%)',
                boxShadow: allCompleted
                  ? '0 12px 40px rgba(180, 130, 20, 0.35), 0 0 0 6px rgba(217, 168, 42, 0.10), inset 0 2px 0 rgba(255,255,255,0.7)'
                  : '0 6px 28px rgba(180, 130, 20, 0.12), 0 0 0 4px rgba(217, 168, 42, 0.06)',
              }}
            >
              {/* Header Band */}
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

              {/* Certificate Body — parchment feel */}
              <div
                className="relative p-5"
                style={{
                  background: allCompleted
                    ? 'linear-gradient(170deg, #FFFDF5 0%, #FFF8E1 30%, #FFF3CD 100%)'
                    : 'linear-gradient(170deg, #FEFEFE 0%, #FAFAFA 50%, #F5F5F5 100%)',
                }}
              >
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Ornamental corner accents */}
                <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none" style={{
                  borderTop: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderLeft: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderTopLeftRadius: '4px',
                }} />
                <div className="absolute top-3 right-3 w-6 h-6 pointer-events-none" style={{
                  borderTop: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderRight: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderTopRightRadius: '4px',
                }} />
                <div className="absolute bottom-3 left-3 w-6 h-6 pointer-events-none" style={{
                  borderBottom: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderLeft: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderBottomLeftRadius: '4px',
                }} />
                <div className="absolute bottom-3 right-3 w-6 h-6 pointer-events-none" style={{
                  borderBottom: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderRight: `2px solid ${allCompleted ? 'hsl(43, 70%, 60%)' : 'hsl(0, 0%, 82%)'}`,
                  borderBottomRightRadius: '4px',
                }} />

                {/* Inner ornamental border */}
                <div
                  className="relative rounded-lg px-5 py-6"
                  style={{
                    border: allCompleted
                      ? '1.5px solid hsl(43, 60%, 75%)'
                      : '1px solid hsl(0, 0%, 88%)',
                  }}
                >
                  {/* Gold seal / lock badge */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Outer ring glow */}
                      {allCompleted && (
                        <motion.div
                          className="absolute inset-[-6px] rounded-full"
                          style={{
                            border: '1.5px solid hsl(43, 65%, 65%)',
                            background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)',
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        allCompleted
                          ? "shadow-lg"
                          : ""
                      }`}
                        style={{
                          background: allCompleted
                            ? 'linear-gradient(145deg, hsl(43, 85%, 62%) 0%, hsl(38, 90%, 50%) 50%, hsl(33, 85%, 45%) 100%)'
                            : 'linear-gradient(145deg, hsl(0, 0%, 93%) 0%, hsl(0, 0%, 85%) 100%)',
                          boxShadow: allCompleted
                            ? 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1), 0 4px 12px rgba(180, 130, 20, 0.3)'
                            : 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        {allCompleted ? (
                          <Trophy className="w-7 h-7 text-amber-100 drop-shadow-sm" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <p className={`text-center font-bold uppercase tracking-[0.14em] mb-0.5 ${
                    allCompleted
                      ? "text-amber-800 text-[12px]"
                      : "text-gray-500 text-[11px]"
                  }`}
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  >
                    Certificado de Conclusão
                  </p>

                  {/* Ornamental divider */}
                  <div className="flex items-center gap-2 my-3 px-2">
                    <div className={`flex-1 h-px ${allCompleted ? "bg-gradient-to-r from-transparent via-amber-300 to-transparent" : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"}`} />
                    <Star className={`w-3.5 h-3.5 ${allCompleted ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                    <div className={`flex-1 h-px ${allCompleted ? "bg-gradient-to-r from-transparent via-amber-300 to-transparent" : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"}`} />
                  </div>

                  {/* Simulated text — thicker, more "real" */}
                  <div className="space-y-2 px-3 mb-3">
                    <div className={`h-2 rounded-full mx-auto w-[90%] ${allCompleted ? "bg-amber-200/70" : "bg-gray-200/70"}`} />
                    <div className={`h-2 rounded-full mx-auto w-[100%] ${allCompleted ? "bg-amber-300/50" : "bg-gray-200/50"}`} />
                    <div className={`h-1.5 rounded-full mx-auto w-[70%] ${allCompleted ? "bg-amber-200/40" : "bg-gray-100/80"}`} />
                  </div>

                  {/* Signature / Institution */}
                  <div className="mt-5 pt-3" style={{
                    borderTop: `1px dashed ${allCompleted ? 'hsl(43, 50%, 75%)' : 'hsl(0, 0%, 85%)'}`,
                  }}>
                    <div className={`h-1 rounded-full mx-auto w-[35%] mb-1.5 ${allCompleted ? "bg-amber-300/60" : "bg-gray-200/60"}`} />
                    <p className={`text-center text-[10px] font-medium tracking-wide ${
                      allCompleted ? "text-amber-600/80" : "text-gray-300"
                    }`}
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                      AIliv Academy
                    </p>
                  </div>
                </div>

                {/* Progress below the document */}
                <div className="mt-5">
                  <p className={`text-xs mb-2 ${allCompleted ? "text-amber-700 font-semibold" : "text-gray-400"}`}>
                    {allCompleted
                      ? "🏆 Parabéns! Trilha concluída."
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
