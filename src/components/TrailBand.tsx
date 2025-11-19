import { useNavigate } from "react-router-dom";
import { LucideIcon, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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

// Color mapping per trail
const TRAIL_COLORS: { [key: string]: string } = {
  'Fundamentos de IA': 'from-cyan-400 to-teal-500',
  'IA no Dia a Dia': 'from-pink-400 to-rose-500',
  'IA nos Negócios': 'from-orange-400 to-amber-500',
  'Renda Extra com IA': 'from-blue-400 to-indigo-500',
};

// Solid vibrant colors for backgrounds
const TRAIL_BG_COLORS: { [key: string]: string } = {
  'Fundamentos de IA': 'bg-gradient-to-br from-teal-400 to-cyan-500',
  'IA no Dia a Dia': 'bg-gradient-to-br from-pink-500 to-rose-500',
  'IA nos Negócios': 'bg-gradient-to-br from-orange-400 to-amber-500',
  'Renda Extra com IA': 'bg-gradient-to-br from-blue-400 to-indigo-500',
};

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
      navigate(`/trails/${trail.id}`);
    }
  };

  const bgColor = TRAIL_BG_COLORS[trail.title] || 'bg-gradient-to-br from-slate-400 to-slate-500';

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-[32px] transition-all duration-300 min-h-[120px]",
        "hover:scale-[1.02] hover:shadow-2xl",
        isLocked && "opacity-50 cursor-not-allowed hover:scale-100",
        !isLocked && "cursor-pointer",
        isLocked ? "bg-slate-200" : bgColor
      )}
    >
      {/* Organic blob decorations */}
      {!isLocked && (
        <>
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </>
      )}

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Play button in white circle (replaces icon) */}
          {!isLocked ? (
            <div className={cn(
              "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300",
              "group-hover:bg-white group-hover:scale-110 group-hover:shadow-xl"
            )}>
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800 ml-0.5 group-hover:scale-110 transition-transform" fill="currentColor" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-300 flex items-center justify-center shadow-lg">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h3 className={cn(
                "font-bold text-lg sm:text-xl text-balance",
                isLocked ? "text-slate-600" : "text-white"
              )}>
                {trail.title}
              </h3>
              {isCompleted && (
                <span className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-600">
                  ✓ Concluída
                </span>
              )}
            </div>
            <p className={cn(
              "text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1 leading-relaxed font-normal",
              isLocked ? "text-slate-500" : "text-white/90"
            )}>
              {trail.description}
            </p>
            
            {/* Progress Bar */}
            {!isLocked && (
              <div className="mb-2">
                <Progress 
                  value={progress} 
                  className="h-2 bg-white/20"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={cn(
                "text-sm font-medium",
                isLocked ? "text-slate-500" : "text-white/80"
              )}>
                {completedLessons}/{totalLessons} aulas
              </span>
              {!isLocked && progress > 0 && (
                <span className="text-xs font-medium text-white/80">
                  • {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
          <p className="text-sm font-semibold text-slate-700 px-4 text-center">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
      )}
    </div>
  );
};
