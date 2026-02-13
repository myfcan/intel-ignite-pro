import { LucideIcon, Lock, BookOpen, Clock, Bookmark } from 'lucide-react';
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

// Color themes per trail
const TRAIL_THEMES = [
  { bg: 'linear-gradient(145deg, #3B5BDB 0%, #4C6EF5 100%)', label: 'Fundamentos', accent: '#5C7CFA' },
  { bg: 'linear-gradient(145deg, #E8590C 0%, #F76707 100%)', label: 'Dia a Dia', accent: '#FF922B' },
  { bg: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)', label: 'Negócios', accent: '#A78BFA' },
  { bg: 'linear-gradient(145deg, #0B7285 0%, #1098AD 100%)', label: 'Renda Extra', accent: '#22B8CF' },
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

  const cardBg = isLocked
    ? 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)'
    : theme.bg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -4 } : undefined}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      style={{
        background: cardBg,
        boxShadow: isLocked ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top section */}
      <div className="p-3 sm:p-4 pb-0 flex items-start justify-between">
        {/* Category badge */}
        <div
          className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold tracking-wide"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.25)',
            color: isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
          }}
        >
          {theme.label}
        </div>

        {/* Bookmark / Lock icon */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
          }}
        >
          {isLocked ? (
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
          ) : (
            <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/80" />
          )}
        </div>
      </div>

      {/* Title */}
      <div className="p-3 sm:p-4 pt-2 sm:pt-3 flex-grow">
        <h3
          className="font-bold text-sm sm:text-base lg:text-lg leading-tight break-words"
          style={{ color: isLocked ? 'rgba(255,255,255,0.3)' : 'white' }}
        >
          {trail.title}
        </h3>
      </div>

      {/* Progress section */}
      <div className="p-3 sm:p-4 pt-0">
        {/* Progress label + count */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] sm:text-xs font-medium"
            style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}
          >
            Progress
          </span>
          <span
            className="text-[10px] sm:text-xs font-semibold"
            style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)' }}
          >
            {completedLessons}/{totalLessons} aulas
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 sm:h-2 rounded-full overflow-hidden mb-3 sm:mb-4"
          style={{ background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: isLocked ? 'rgba(255,255,255,0.1)' : 'white' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        </div>

        {/* Bottom: CTA button */}
        <div className="flex items-center justify-end">
          <button
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all"
            disabled={isLocked}
            style={{
              background: isLocked
                ? 'rgba(255,255,255,0.05)'
                : '#C8FF00',
              color: isLocked ? 'rgba(255,255,255,0.2)' : '#1a1a1a',
              boxShadow: isLocked ? 'none' : '0 2px 8px rgba(200, 255, 0, 0.25)',
            }}
          >
            {isLocked ? 'Bloqueado' : isCompleted ? 'Revisar' : 'Continuar'}
          </button>
        </div>
      </div>

      {/* Hover glow */}
      {!isLocked && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl"
          style={{
            boxShadow: `inset 0 0 40px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.2)`,
          }}
        />
      )}
    </motion.div>
  );
};

export default TrailCard;
