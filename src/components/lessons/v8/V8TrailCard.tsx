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
      className="w-full text-left rounded-2xl border border-white/10 p-4 sm:p-5 transition-all hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center gap-3"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-center text-xl overflow-hidden">
        {icon && icon.length <= 2 ? icon : <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-white/40 truncate">{description}</p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-white/35">
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
            {isCompleted ? " • Concluída ✅" : ""}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-medium text-white/35 tabular-nums flex-shrink-0">
            {progress}%
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
    </motion.button>
  );
};
