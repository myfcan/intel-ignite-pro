import { useNavigate } from "react-router-dom";
import { LucideIcon, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrailBandProps {
  trail: {
    id: string;
    title: string;
    description: string;
    icon: string;
    order_index: number;
  };
  Icon: LucideIcon;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'locked';
  gradient: string;
}

export const TrailBand = ({
  trail,
  Icon,
  progress,
  completedLessons,
  totalLessons,
  status,
  gradient,
}: TrailBandProps) => {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  // Circular progress calculation
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-300",
        "bg-white/40 backdrop-blur-xl border border-white/60",
        "hover:scale-[1.02] hover:shadow-xl hover:border-white/80",
        isLocked && "opacity-60 cursor-not-allowed hover:scale-100",
        !isLocked && "cursor-pointer"
      )}
    >
      {/* Gradient background overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
        `bg-gradient-to-r ${gradient}`
      )} />

      <div className="relative flex items-center gap-6 p-5">
        {/* Icon Section */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300",
          "group-hover:scale-110",
          isLocked ? "bg-slate-200" : `bg-gradient-to-br ${gradient}`
        )}>
          {isLocked ? (
            <Lock className="w-7 h-7 text-slate-500" />
          ) : (
            <Icon className="w-7 h-7 text-white" />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-lg truncate",
              isLocked ? "text-slate-500" : "text-slate-800"
            )}>
              {trail.title}
            </h3>
            {isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                Concluída
              </span>
            )}
          </div>
          <p className={cn(
            "text-sm line-clamp-1",
            isLocked ? "text-slate-400" : "text-slate-600"
          )}>
            {trail.description}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className={cn(
              "text-xs font-medium",
              isLocked ? "text-slate-400" : "text-slate-500"
            )}>
              {completedLessons}/{totalLessons} aulas
            </span>
            {!isLocked && progress > 0 && (
              <div className="flex-1 max-w-xs">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      `bg-gradient-to-r ${gradient}`
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Circle & Action */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Circular Progress */}
          <div className="relative w-14 h-14">
            <svg className="transform -rotate-90 w-14 h-14">
              {/* Background circle */}
              <circle
                cx="28"
                cy="28"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-slate-200"
              />
              {/* Progress circle */}
              {!isLocked && (
                <circle
                  cx="28"
                  cy="28"
                  r="20"
                  stroke="url(#gradient-progress)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
              <defs>
                <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="text-cyan-400" stopColor="currentColor" />
                  <stop offset="100%" className="text-purple-500" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-xs font-bold",
                isLocked ? "text-slate-400" : "text-slate-700"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Arrow */}
          {!isLocked && (
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </div>

      {/* Locked overlay message */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[2px]">
          <p className="text-sm font-medium text-slate-600">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
      )}
    </div>
  );
};
