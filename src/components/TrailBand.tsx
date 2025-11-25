import { useNavigate } from "react-router-dom";
import { LucideIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        isLocked && "opacity-70 cursor-not-allowed",
        !isLocked && "cursor-pointer hover:-translate-y-0.5"
      )}
      style={{
        background: isLocked 
          ? 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        backgroundImage: isLocked 
          ? undefined 
          : `
            linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
            radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
          `,
        backgroundSize: isLocked ? 'cover' : 'cover, 16px 16px',
        backgroundPosition: isLocked ? 'center' : 'center, 0 0',
        border: isLocked ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: isLocked 
          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(139, 92, 246, 0.05)'
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLocked) {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.05)';
        }
      }}
    >
      {/* Grid Pattern - Only for locked */}
      {isLocked && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}
      
      {/* Floating Particles - Only for Active Trail */}
      {isActive && (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                background: 'radial-gradient(circle, rgba(167, 139, 250, 1) 0%, rgba(139, 92, 246, 0.3) 70%)',
                boxShadow: '0 0 20px rgba(167, 139, 250, 1), 0 0 40px rgba(167, 139, 250, 0.5)',
                filter: 'blur(0.5px)',
              }}
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: 0,
              }}
              animate={{
                x: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                ],
                y: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                ],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        {/* Icon */}
        <div 
          className={cn(
            "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center backdrop-blur transition-all duration-300 group-hover:scale-110",
            isActive && "animate-pulse-glow"
          )}
          style={{
            background: isLocked 
              ? 'rgba(75, 85, 99, 0.2)' 
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: isLocked 
              ? '1px solid rgba(75, 85, 99, 0.4)' 
              : '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
          ) : (
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2.5} />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h3 className={cn(
              "font-bold text-lg sm:text-xl",
              isLocked ? "text-gray-400" : "text-gray-800"
            )}>
              {trail.title}
            </h3>
            {isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-600 border border-green-500/30">
                ✓ Concluída
              </span>
            )}
            {isActive && !isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                Ativo
              </span>
            )}
          </div>
          <p className={cn(
            "text-sm sm:text-base mb-3 line-clamp-2 sm:line-clamp-1",
            isLocked ? "text-gray-500" : "text-gray-600"
          )}>
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
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {completedLessons}/{totalLessons} aulas
                </span>
                {progress > 0 && (
                  <span className="text-xs font-semibold text-primary">
                    {Math.round(progress)}%
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

      {/* Locked overlay - Dark mode */}
      {isLocked && (
        <div 
          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-2xl"
          style={{
            background: 'rgba(31, 41, 55, 0.8)'
          }}
        >
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
