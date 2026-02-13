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
      whileHover={!isLocked ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } : undefined}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`group bg-white rounded-2xl border transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed opacity-50 border-gray-100' : 'cursor-pointer border-gray-100 hover:border-gray-200'
      }`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isLocked ? '#F3F4F6' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}CC)`,
            boxShadow: isLocked ? 'none' : `0 4px 12px ${theme.accent}30`,
          }}
        >
          {isLocked ? (
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          ) : (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{trail.title}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold flex-shrink-0"
              style={{
                background: isLocked ? '#F3F4F6' : `${theme.accent}15`,
                color: isLocked ? '#9CA3AF' : theme.accent,
              }}
            >
              {theme.label}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isLocked ? '#E5E7EB' : theme.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 flex-shrink-0">
              {completedLessons}/{totalLessons}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          {isLocked ? (
            <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Bloqueado</span>
          ) : (
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: theme.accent,
                boxShadow: `0 2px 8px ${theme.accent}30`,
              }}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrailCard;
