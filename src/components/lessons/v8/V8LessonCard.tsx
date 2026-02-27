import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play, BookOpen, Clock } from "lucide-react";
import { getLessonIcon } from "@/utils/lessonIconMap";

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
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={!isLocked ? { y: -4, scale: 1.01 } : undefined}
      onClick={isLocked ? undefined : onClick}
      className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        isLocked
          ? "opacity-50 cursor-not-allowed border-gray-200"
          : isCompleted
            ? "cursor-pointer border-emerald-200 hover:shadow-lg hover:border-emerald-300"
            : "cursor-pointer border-gray-200 hover:shadow-lg hover:border-indigo-400"
      }`}
      style={{
        boxShadow: isLocked
          ? "0 2px 8px rgba(0,0,0,0.03)"
          : "0 4px 16px -4px rgba(0,0,0,0.08)",
      }}
    >
      <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        {/* Icon / Index */}
        <div
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isLocked
              ? "#F1F5F9"
              : isCompleted
                ? "linear-gradient(135deg, #10B981, #059669)"
                : isInProgress
                  ? "linear-gradient(135deg, #6366F1, #7C3AED)"
                  : "linear-gradient(135deg, #6366F1CC, #6366F1)",
            boxShadow: isLocked
              ? "none"
              : isCompleted
                ? "0 4px 12px rgba(16,185,129,0.25)"
                : "0 4px 12px rgba(99,102,241,0.25)",
          }}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          ) : (
            (() => { const LIcon = getLessonIcon(title); return <LIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />; })()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Completa
              </span>
            )}
            {isInProgress && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 flex-shrink-0">
                <Play className="w-3 h-3" />
                Cursando
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Aula {index + 1}
            </span>
            {estimatedTime && !isLocked && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {estimatedTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
