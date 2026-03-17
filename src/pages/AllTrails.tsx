import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Rocket, BookOpen, Brain, Code, DollarSign, Lightbulb, Sparkles, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { V8TrailCard } from "@/components/lessons/v8/V8TrailCard";
import TrailCard from "@/components/TrailCard";

const TRAIL_ICONS = [Lightbulb, Brain, Zap, Target, Code, DollarSign, Sparkles, BookOpen];

const AllTrails = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  const { data: trails = [] } = useQuery({
    queryKey: ["all-trails", type ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("trails")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      
      // Backward compatible: if type provided, filter
      if (type) {
        query = query.eq("trail_type", type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["all-trails-courses", type ?? "all"],
    queryFn: async () => {
      const trailIds = trails.map((t) => t.id);
      if (trailIds.length === 0) return [];
      const { data } = await supabase
        .from("courses")
        .select("id, trail_id, title, description, icon, order_index")
        .in("trail_id", trailIds)
        .eq("is_active", true)
        .order("order_index");
      return data || [];
    },
    enabled: trails.length > 0,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["user-progress-all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("user_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id);
      return data || [];
    },
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons-by-trails", type ?? "all"],
    queryFn: async () => {
      const trailIds = trails.map((t) => t.id);
      if (trailIds.length === 0) return [];
      const { data } = await supabase
        .from("lessons")
        .select("id, trail_id, course_id")
        .in("trail_id", trailIds)
        .eq("is_active", true);
      return data || [];
    },
    enabled: trails.length > 0,
  });

  // Trails with courses → show as V8TrailCards per course
  // Trails without courses → show as TrailCards
  const trailsWithCourses = new Set(courses.map(c => c.trail_id));
  const orphanTrails = trails.filter(t => !trailsWithCourses.has(t.id));

  return (
    <div className="min-h-screen" style={{ background: '#FAFBFC' }}>
      {/* Compact header */}
      <div className="sticky top-0 z-20 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}>
            <Rocket className="w-4 h-4 text-sky-200" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            Todas as Trilhas
          </h1>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-5 pt-5 pb-2 sm:px-8 max-w-5xl mx-auto">
        <p className="text-sm text-gray-500">
          Todas as jornadas e trilhas disponíveis
        </p>
      </div>

      {/* Courses grid */}
      {courses.length > 0 && (
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">Jornadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, idx) => {
              const courseLessons = lessons.filter((l) => l.course_id === course.id);
              const completedCount = courseLessons.filter((l) =>
                userProgress.some((p) => p.lesson_id === l.id && p.status === "completed")
              ).length;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <V8TrailCard
                    trailId={course.trail_id}
                    title={course.title}
                    description={course.description || ""}
                    icon={course.icon || "📘"}
                    lessonCount={courseLessons.length}
                    completedCount={completedCount}
                    orderIndex={course.order_index}
                    navigateToId={course.id}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orphan trails (direct lessons, no courses) */}
      {orphanTrails.length > 0 && (
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 pb-12">
          <h2 className="text-base font-bold text-gray-800 mb-3">Trilhas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orphanTrails.map((trail, idx) => {
              const trailLessons = lessons.filter((l) => l.trail_id === trail.id);
              const completedCount = trailLessons.filter((l) =>
                userProgress.some((p) => p.lesson_id === l.id && p.status === "completed")
              ).length;
              const Icon = TRAIL_ICONS[(trail.order_index - 1) % TRAIL_ICONS.length];
              const progress = trailLessons.length > 0
                ? Math.round((completedCount / trailLessons.length) * 100)
                : 0;

              return (
                <motion.div
                  key={trail.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <TrailCard
                    trail={trail}
                    Icon={Icon}
                    progress={progress}
                    completedLessons={completedCount}
                    totalLessons={trailLessons.length}
                    status={completedCount > 0 ? "active" : "active"}
                    gradient=""
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTrails;
