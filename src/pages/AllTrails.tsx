import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { V8TrailCard } from "@/components/lessons/v8/V8TrailCard";
import TrailCard from "@/components/TrailCard";
import { BookOpen, Brain, Code, DollarSign, Lightbulb, Sparkles, Target, Zap } from "lucide-react";

const TRAIL_ICONS = [Lightbulb, Brain, Zap, Target, Code, DollarSign, Sparkles, BookOpen];

const AllTrails = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const isV8 = type === "v8";

  const { data: trails = [] } = useQuery({
    queryKey: ["all-trails", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trails")
        .select("*")
        .eq("trail_type", type)
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data || [];
    },
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
    queryKey: ["lessons-by-trails", type],
    queryFn: async () => {
      const trailIds = trails.map((t) => t.id);
      if (trailIds.length === 0) return [];
      const { data } = await supabase
        .from("lessons")
        .select("id, trail_id")
        .in("trail_id", trailIds)
        .eq("is_active", true);
      return data || [];
    },
    enabled: trails.length > 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div
        className="px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10"
        style={{
          background: isV8
            ? "linear-gradient(135deg, #7C3AED 0%, #6366F1 40%, #818CF8 100%)"
            : "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #3B82F6 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            {isV8 ? (
              <Crown className="w-7 h-7 text-amber-400" />
            ) : (
              <Rocket className="w-7 h-7 text-sky-300" />
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isV8 ? "Seu Caminho de Maestria" : "Renda Extra PRO"}
            </h1>
          </div>
          <p className="text-white/60 text-sm mt-2">
            {isV8
              ? "Todas as trilhas de leitura e escuta disponíveis"
              : "Todas as jornadas de renda extra disponíveis"}
          </p>
        </div>
      </div>

      {/* Trail grid */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trails.map((trail, idx) => {
            const trailLessons = lessons.filter((l) => l.trail_id === trail.id);
            const completedCount = trailLessons.filter((l) =>
              userProgress.some((p) => p.lesson_id === l.id && p.status === "completed")
            ).length;

            if (isV8) {
              return (
                <motion.div
                  key={trail.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <V8TrailCard
                    trailId={trail.id}
                    title={trail.title}
                    description={trail.description || ""}
                    icon={trail.icon || "📘"}
                    lessonCount={trailLessons.length}
                    completedCount={completedCount}
                    orderIndex={trail.order_index}
                  />
                </motion.div>
              );
            }

            const Icon = TRAIL_ICONS[(trail.order_index - 1) % TRAIL_ICONS.length];
            const progress = trailLessons.length > 0
              ? Math.round((completedCount / trailLessons.length) * 100)
              : 0;

            return (
              <motion.div
                key={trail.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
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
    </div>
  );
};

export default AllTrails;
