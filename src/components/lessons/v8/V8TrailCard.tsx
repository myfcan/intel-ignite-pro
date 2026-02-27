import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface V8TrailCardProps {
  trailId: string;
  title: string;
  description?: string;
  icon?: string;
  lessonCount: number;
  completedCount: number;
}

export const V8TrailCard = ({
  trailId,
  title,
  description,
  icon,
  lessonCount,
  completedCount,
}: V8TrailCardProps) => {
  const navigate = useNavigate();
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const isCompleted = progress === 100;

  return (
    <motion.button
      onClick={() => navigate(`/v8-trail/${trailId}`)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl border border-white/10 p-6 min-h-[160px] transition-all hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-start gap-4 h-full">
        {/* Icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-center text-2xl">
          {icon || "📚"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-white/50 line-clamp-2">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <BookOpen className="w-4 h-4" />
            <span>
              {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
              {isCompleted ? " • ✅ Concluída" : ""}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-semibold text-white/40 tabular-nums w-8 text-right">
              {progress}%
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0 mt-2" />
      </div>
    </motion.button>
  );
};
