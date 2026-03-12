import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, ChevronRight, type LucideIcon } from "lucide-react";
import { V8TrailDetailSkeleton } from "@/components/skeletons";
import { supabase } from "@/integrations/supabase/client";
import { V8CertificateCard } from "@/components/lessons/v8/V8CertificateCard";
import { V8LivTrailWelcome } from "@/components/lessons/v8/V8LivTrailWelcome";
import { usePrefetchCourseDetailData } from "@/hooks/useCourseDetailQuery";

const TRAIL_ICONS: Record<string, LucideIcon> = {
  Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, BookOpen,
};

const JOURNEY_ICONS: LucideIcon[] = [Rocket, Brain, Zap, Target, Code, Crown, DollarSign];

export default function V8TrailDetail() {
  const { trailId } = useParams<{ trailId: string }>();
  const navigate = useNavigate();
  const prefetchCourse = usePrefetchCourseDetailData();

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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch courses (journeys) for this trail with lesson counts
  const { data: journeys, isLoading: journeysLoading } = useQuery({
    queryKey: ["v8-trail-journeys", trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, icon, order_index, is_active")
        .eq("trail_id", trailId!)
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!trailId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch all lessons for these courses to compute progress
  const { data: allLessons } = useQuery({
    queryKey: ["v8-trail-all-lessons", trailId, journeys],
    queryFn: async () => {
      const courseIds = journeys?.map(j => j.id) ?? [];
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("lessons")
        .select("id, course_id, is_active")
        .eq("is_active", true)
        .eq("model", "v8")
        .in("course_id", courseIds);
      if (error) throw error;
      return data;
    },
    enabled: !!journeys && journeys.length > 0,
  });

  // Fetch progress for all lessons
  const { data: progressData } = useQuery({
    queryKey: ["v8-trail-progress", trailId, allLessons],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const lessonIds = allLessons?.map(l => l.id) ?? [];
      if (lessonIds.length === 0) return [];
      const { data, error } = await supabase
        .from("user_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data;
    },
    enabled: !!allLessons && allLessons.length > 0,
  });

  const [showLivWelcome, setShowLivWelcome] = useState(true);

  const isLoading = trailLoading || journeysLoading;

  // Progress calculations
  const completedSet = new Set(
    (progressData ?? []).filter(p => p.status === "completed").map(p => p.lesson_id)
  );
  const totalLessons = allLessons?.length ?? 0;
  const completedCount = (allLessons ?? []).filter(l => completedSet.has(l.id)).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allCompleted = completedCount === totalLessons && totalLessons > 0;

  // Per-journey stats
  const getJourneyStats = (courseId: string) => {
    const courseLessons = (allLessons ?? []).filter(l => l.course_id === courseId);
    const total = courseLessons.length;
    const completed = courseLessons.filter(l => completedSet.has(l.id)).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, progress };
  };

  if (isLoading) {
    return <V8TrailDetailSkeleton />;
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
        {/* ── Trail Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <TrailIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Trilha Mestre</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{trail.title}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{journeys?.length ?? 0} jornadas</span>
            </div>
          </div>
        </div>

        {/* ── Layout: Certificate Left + Journeys Right ── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Certificate Card ── */}
          <V8CertificateCard
            completedCount={completedCount}
            totalLessons={totalLessons}
            allCompleted={allCompleted}
            trailTitle={trail.title}
          />

          {/* ── Journeys List ── */}
          <div className="flex-1 min-w-0 space-y-3">
            {(journeys ?? []).length > 0 ? (
              (journeys ?? []).map((journey, index) => {
                const stats = getJourneyStats(journey.id);
                const JourneyIcon = TRAIL_ICONS[journey.icon || ''] || JOURNEY_ICONS[index % JOURNEY_ICONS.length];
                
                return (
                  <motion.div
                    key={journey.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    onClick={() => navigate(`/course/${journey.id}`)}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center flex-shrink-0 group-hover:from-violet-100 group-hover:to-indigo-100 transition-colors">
                        <JourneyIcon className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                          Jornada {index + 1}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {journey.title}
                        </p>
                        {journey.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{journey.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-700">{stats.progress}%</p>
                          <p className="text-[10px] text-gray-400">{stats.completed}/{stats.total} aulas</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
                      </div>
                    </div>
                    {/* Progress bar */}
                    {stats.total > 0 && (
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progress}%` }}
                          transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                Nenhuma jornada disponível nesta trilha ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Liv Welcome */}
      {showLivWelcome && trailId && trail && (
        <V8LivTrailWelcome
          trailId={trailId}
          trailTitle={trail.title}
          onContinue={() => setShowLivWelcome(false)}
        />
      )}
    </div>
  );
}
