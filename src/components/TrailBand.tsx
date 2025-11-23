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
        "group relative overflow-hidden rounded-2xl transition-all duration-300 min-h-[120px]",
        "hover:scale-[1.02] hover:shadow-2xl",
        isLocked && "opacity-60 cursor-not-allowed hover:scale-100",
        !isLocked && "cursor-pointer shadow-lg",
        !isLocked && "hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-shadow"
      )}
      style={{
        background: isLocked 
          ? 'hsl(220, 13%, 91%)'
          : 'hsl(330, 81%, 60%)'
      }}
    >
      
      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Icon in colored circle */}
          {!isLocked ? (
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h3 className={cn(
                "font-bold text-lg sm:text-xl text-balance",
                isLocked ? "text-gray-700" : "text-white drop-shadow-md"
              )}>
                {trail.title}
              </h3>
              {isCompleted && (
                <span className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-white/90 text-primary backdrop-blur-sm">
                  ✓ Concluída
                </span>
              )}
            </div>
            <p className={cn(
              "text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1 leading-relaxed font-normal",
              isLocked ? "text-gray-600" : "text-white/90 drop-shadow-sm"
            )}>
              {trail.description}
            </p>
            
            {/* Progress Bar */}
            {!isLocked && (
              <div className="mb-2">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white/90 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={cn(
                "text-sm font-medium",
                isLocked ? "text-gray-600" : "text-white/90 drop-shadow-sm"
              )}>
                {completedLessons}/{totalLessons} aulas
              </span>
              {!isLocked && progress > 0 && (
                <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
                  • {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
          <p className="text-sm font-semibold text-gray-800 px-4 text-center drop-shadow-sm">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
      )}
    </div>
  );
};
