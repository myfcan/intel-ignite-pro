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
      className="w-full text-left rounded-2xl border border-indigo-500/20 bg-slate-900 p-5 transition-shadow hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-2xl">
          {icon || "📚"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white truncate">
              {title}
            </h3>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
              Read & Listen
            </span>
          </div>

          {description && (
            <p className="text-sm text-slate-400 line-clamp-1">{description}</p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
              {isCompleted ? " • Concluída" : ""}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums w-8 text-right">
              {progress}%
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
};
