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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } : undefined}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed opacity-40 border-gray-100' : 'cursor-pointer border-gray-200 hover:border-gray-300'
      }`}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Colored header area with icon (replaces image) */}
      <div
        className="h-36 sm:h-40 flex items-center justify-center relative overflow-hidden"
        style={{
          background: isLocked
            ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)'
            : `linear-gradient(135deg, ${theme.accent}DD, ${theme.accent})`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute w-32 h-32 rounded-full opacity-20"
          style={{ background: 'white', top: '-20px', right: '-20px' }}
        />
        <div
          className="absolute w-20 h-20 rounded-full opacity-10"
          style={{ background: 'white', bottom: '-10px', left: '10px' }}
        />
        {isLocked ? (
          <Lock className="w-10 h-10 text-white/60" />
        ) : (
          <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
        )}
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5">
        {/* Category badge */}
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold mb-2"
          style={{
            background: isLocked ? '#F3F4F6' : `${theme.accent}12`,
            color: isLocked ? '#9CA3AF' : theme.accent,
          }}
        >
          {theme.label}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 leading-tight line-clamp-2">
          {trail.title}
        </h3>

        {/* Lesson count */}
        <p className="text-xs sm:text-sm text-gray-400 mb-3">
          {totalLessons} aulas
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: isLocked ? '#E5E7EB' : theme.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400">
            {completedLessons}/{totalLessons}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrailCard;
