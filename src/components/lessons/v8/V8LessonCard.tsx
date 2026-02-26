import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play } from "lucide-react";

interface V8LessonCardProps {
  lessonId: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  status: "completed" | "in_progress" | "locked" | "available";
  index: number;
  onClick: () => void;
}

export const V8LessonCard = ({
  title,
  description,
  estimatedTime,
  status,
  index,
  onClick,
}: V8LessonCardProps) => {
  const isLocked = status === "locked";

  const statusConfig = {
    completed: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      badge: "Concluída",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      borderClass: "border-emerald-500/20",
    },
    in_progress: {
      icon: <Play className="w-5 h-5 text-indigo-400" />,
      badge: "Cursando",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      borderClass: "border-indigo-500/30",
    },
    available: {
      icon: <Play className="w-5 h-5 text-slate-400" />,
      badge: null,
      badgeClass: "",
      borderClass: "border-white/10",
    },
    locked: {
      icon: <Lock className="w-4 h-4 text-slate-600" />,
      badge: "Bloqueada",
      badgeClass: "bg-white/5 text-slate-600 border-white/5",
      borderClass: "border-white/5",
    },
  };

  const config = statusConfig[status];

  return (
    <motion.button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={`w-full text-left rounded-xl border ${config.borderClass} ${
        isLocked ? "bg-white/[0.02] opacity-50 cursor-not-allowed" : "bg-white/5 hover:bg-white/[0.08] cursor-pointer"
      } p-4 transition-colors`}
    >
      <div className="flex items-center gap-3">
        {/* Index circle */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          status === "completed"
            ? "bg-emerald-500/10"
            : status === "in_progress"
            ? "bg-indigo-500/10"
            : "bg-white/5"
        }`}>
          {status === "completed" ? config.icon : (
            <span className={`text-sm font-semibold tabular-nums ${
              isLocked ? "text-slate-600" : "text-slate-400"
            }`}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-medium truncate ${
              isLocked ? "text-slate-600" : "text-white"
            }`}>
              {title}
            </h4>
            {config.badge && (
              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.badgeClass}`}>
                {config.badge}
              </span>
            )}
          </div>
          {description && (
            <p className={`text-[12px] mt-0.5 truncate ${
              isLocked ? "text-slate-700" : "text-slate-500"
            }`}>
              {description}
            </p>
          )}
        </div>

        {/* Time */}
        {estimatedTime && !isLocked && (
          <span className="text-[11px] text-slate-500 flex-shrink-0">
            {estimatedTime} min
          </span>
        )}

        {/* Lock icon for locked */}
        {isLocked && config.icon}
      </div>
    </motion.button>
  );
};
