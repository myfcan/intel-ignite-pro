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
        "group relative overflow-hidden rounded-2xl transition-all duration-300 min-h-[120px] border",
        isLocked && "opacity-75 cursor-not-allowed",
        !isLocked && "cursor-pointer hover:-translate-y-1"
      )}
      style={{
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        backgroundImage: `
          linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
          radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: 'cover, 16px 16px',
        backgroundPosition: 'center, 0 0',
        borderColor: 'rgba(139, 92, 246, 0.2)',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLocked) {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.05)';
        }
      }}
    >
      
      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Icon in colored circle */}
          {!isLocked ? (
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(107, 114, 128, 0.1)' }}>
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h3 className="font-bold text-lg sm:text-xl text-balance text-gray-900">
                {trail.title}
              </h3>
              {isCompleted && (
                <span className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  ✓ Concluída
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1 leading-relaxed font-normal text-gray-600">
              {trail.description}
            </p>
            
            {/* Progress Bar */}
            {!isLocked && (
              <div className="mb-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium text-gray-600">
                {completedLessons}/{totalLessons} aulas
              </span>
              {!isLocked && progress > 0 && (
                <span className="text-xs font-semibold text-purple-600">
                  • {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-2xl">
          <div className="text-center text-white">
            <Lock className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-semibold px-4">
              Complete a trilha anterior para desbloquear
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
