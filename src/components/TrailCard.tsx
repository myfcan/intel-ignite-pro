import { LucideIcon, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TrailCardProps {
  trail: {
    id: string;
    title: string;
    description: string;
    icon: string;
    order_index: number;
  };
  Icon: LucideIcon;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  status?: 'active' | 'completed' | 'locked';
  gradient: string;
  estimatedTime?: number;
  isNext?: boolean;
}

const TRAIL_THEMES = [
  { accent: '#6366F1', label: 'Fundamentos' },
  { accent: '#F97316', label: 'Dia a Dia' },
  { accent: '#8B5CF6', label: 'Negócios' },
  { accent: '#0EA5E9', label: 'Renda Extra' },
];

const TrailCard = ({
  trail,
  Icon,
  progress = 0,
  completedLessons = 0,
  totalLessons = 5,
  status = 'locked',
  gradient,
  estimatedTime = 45,
  isNext = false,
}: TrailCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const theme = TRAIL_THEMES[(trail.order_index - 1) % TRAIL_THEMES.length];

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } : undefined}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`group bg-white rounded-2xl border transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed opacity-40 border-gray-100' : 'cursor-pointer border-gray-200 hover:border-gray-300'
      }`}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
        {/* Icon - larger rounded square */}
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isLocked ? '#F3F4F6' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}CC)`,
            boxShadow: isLocked ? 'none' : `0 6px 16px ${theme.accent}30`,
          }}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : (
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          )}
        </div>

        {/* Info - takes remaining space */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate uppercase tracking-wide">
              {trail.title}
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0"
              style={{
                background: isLocked ? '#F3F4F6' : `${theme.accent}12`,
                color: isLocked ? '#9CA3AF' : theme.accent,
              }}
            >
              {theme.label}
            </span>
          </div>
          {/* Progress bar - full width */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isLocked ? '#E5E7EB' : theme.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-400 flex-shrink-0 min-w-[32px] text-right">
              {completedLessons}/{totalLessons}
            </span>
          </div>
        </div>

        {/* CTA button - larger */}
        <div className="flex-shrink-0">
          {isLocked ? (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gray-100">
              <Lock className="w-4 h-4 text-gray-300" />
            </div>
          ) : (
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}DD)`,
                boxShadow: `0 4px 12px ${theme.accent}35`,
              }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrailCard;
