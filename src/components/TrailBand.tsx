import { useNavigate } from "react-router-dom";
import { LucideIcon, Lock } from "lucide-react";
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
  const isActive = status === 'active';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trails/${trail.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 min-h-[140px]",
        isLocked && "opacity-60 cursor-not-allowed",
        !isLocked && "cursor-pointer hover:-translate-y-0.5"
      )}
      style={{
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: `
          0 0 40px rgba(139, 92, 246, 0.1),
          0 0 80px rgba(139, 92, 246, 0.05),
          inset 0 0 60px rgba(139, 92, 246, 0.03)
        `
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.3)';
      }}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center backdrop-blur transition-all duration-300 group-hover:scale-110"
          style={{
            background: isLocked ? 'rgba(75, 85, 99, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            border: isLocked ? '1px solid rgba(75, 85, 99, 0.4)' : '1px solid rgba(139, 92, 246, 0.4)'
          }}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
          ) : (
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" strokeWidth={2.5} />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h3 className="font-bold text-lg sm:text-xl text-gray-100">
              {trail.title}
            </h3>
            {isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                ✓ Concluída
              </span>
            )}
            {isActive && !isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                ▶ Ativo
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base mb-3 line-clamp-2 sm:line-clamp-1 text-gray-400">
            {trail.description}
          </p>
          
          {/* Progress Bar */}
          {!isLocked && (
            <>
              <div className="mb-2">
                <div 
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-gray-400">
                  {completedLessons}/{totalLessons} aulas
                </span>
                {progress > 0 && (
                  <span className="text-xs font-semibold text-purple-400">
                    • {Math.round(progress)}%
                  </span>
                )}
              </div>
            </>
          )}
          
          {isLocked && (
            <p className="text-sm text-gray-500">
              Complete a trilha anterior para desbloquear
            </p>
          )}
        </div>
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-semibold px-4 text-gray-300">
              Complete a trilha anterior para desbloquear
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
