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
  { accent: '#8B5CF6', label: 'Negócios' },
  { accent: '#7C3AED', label: 'Copyright' },
  { accent: '#D4A017', label: 'Renda Extra', isGold: true },
  { accent: '#3B82F6', label: 'Serviços' },
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
  const isGold = !!(theme as any).isGold && !isLocked;

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -6, scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      }`}
      style={{
        boxShadow: isGold
          ? '0 0 0 2px #D4A017, 0 0 24px rgba(212, 160, 23, 0.25), 0 8px 32px -4px rgba(212, 160, 23, 0.2), 0 2px 8px -2px rgba(0,0,0,0.05)'
          : isLocked
            ? '0 2px 8px rgba(0,0,0,0.03)'
            : '0 8px 32px -4px rgba(0,0,0,0.1), 0 2px 8px -2px rgba(0,0,0,0.05)',
        border: isGold
          ? '2px solid transparent'
          : '1px solid rgba(0,0,0,0.04)',
        backgroundImage: isGold
          ? 'linear-gradient(white, white), linear-gradient(135deg, #F5D060, #D4A017, #B8860B, #D4A017, #F5D060)'
          : undefined,
        backgroundOrigin: isGold ? 'border-box' : undefined,
        backgroundClip: isGold ? 'padding-box, border-box' : undefined,
      }}
    >
      {/* Colored header area */}
      <div
        className="h-36 sm:h-40 flex items-center justify-center relative overflow-hidden"
        style={{
          background: isLocked
            ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)'
            : isGold
              ? 'linear-gradient(135deg, #F5D060, #D4A017, #B8860B)'
              : `linear-gradient(135deg, ${theme.accent}CC, ${theme.accent}, ${theme.accent}EE)`,
        }}
      >
        {/* Decorative shapes */}
        <div
          className="absolute w-40 h-40 rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)', top: '-30px', right: '-30px' }}
        />
        <div
          className="absolute w-28 h-28 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', bottom: '-20px', left: '-10px' }}
        />
        <div
          className="absolute w-16 h-16 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', top: '20px', left: '30px' }}
        />
        {isLocked ? (
          <Lock className="w-10 h-10 text-white/40" />
        ) : (
          <div className="relative">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5">
        {/* Category badge */}
        <span
          className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold mb-2.5 tracking-wide uppercase"
          style={{
            background: isLocked ? '#F3F4F6' : `${theme.accent}10`,
            color: isLocked ? '#9CA3AF' : theme.accent,
          }}
        >
          {theme.label}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5 leading-snug line-clamp-2">
          {trail.title}
        </h3>

        {/* Lesson count */}
        <p className="text-xs text-gray-400 mb-3">
          {totalLessons} aulas
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isLocked ? '#E5E7EB' : `linear-gradient(90deg, ${theme.accent}, ${theme.accent}CC)`,
                boxShadow: isLocked ? 'none' : `0 0 8px ${theme.accent}40`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            {completedLessons}/{totalLessons}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrailCard;
