import { LucideIcon, Lock, ChevronRight, Clock } from 'lucide-react';
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
  { accent: '#3B82F6', label: 'Profissionais' },
  { accent: '#F59E0B', label: 'Avançado' },
  { accent: '#10B981', label: 'Vibe Core' },
  { accent: '#7C3AED', label: 'Copyright' },
  { accent: '#D4A017', label: 'Renda Extra', isGold: true },
  { accent: '#8B5CF6', label: 'Negócios' },
  { accent: '#EC4899', label: 'Vendas' },
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
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300
        w-full
        ${isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
      `}
      style={{
        scrollSnapAlign: 'start',
        boxShadow: isGold
          ? '0 0 0 2px #D4A017, 0 0 24px rgba(212, 160, 23, 0.25), 0 8px 32px -4px rgba(212, 160, 23, 0.2), 0 2px 8px -2px rgba(0,0,0,0.05)'
          : isLocked
            ? '0 2px 8px rgba(0,0,0,0.03)'
            : `0 8px 32px -4px rgba(99, 102, 241, 0.12), 0 4px 16px -2px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.1)`,
      }}
    >
      {/* Aurora border glow effect */}
      {!isLocked && (
        <div
          className="absolute inset-0 rounded-2xl z-0 pointer-events-none"
          style={{
            background: isGold
              ? 'linear-gradient(135deg, #F5D060, #D4A017, #B8860B, #D4A017, #F5D060)'
              : 'linear-gradient(135deg, #6366F1, #818CF8, #06B6D4, #818CF8, #6366F1)',
            backgroundSize: '300% 300%',
            animation: isGold ? undefined : 'aurora-shift 6s ease infinite',
          }}
        />
      )}
      {/* Inner card */}
      <div className="relative z-10 bg-white rounded-[14px] overflow-hidden m-[2px] flex flex-col h-[calc(100%-4px)]">
      {/* Aurora ambient glow on hover */}
      {!isLocked && !isGold && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.12), rgba(6,182,212,0.1), rgba(129,140,248,0.15))',
            backgroundSize: '300% 300%',
            animation: 'aurora-shift 6s ease infinite',
          }}
        />
      )}
      {/* Colored header area with aurora gradient */}
      <div
        className="h-[120px] sm:h-[148px] flex items-center justify-center relative overflow-hidden"
        style={{
          background: isLocked
            ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)'
            : isGold
              ? 'linear-gradient(135deg, #F5D060, #D4A017, #B8860B)'
              : `linear-gradient(135deg, ${theme.accent}, #818CF8, #06B6D4, ${theme.accent})`,
          backgroundSize: isLocked || isGold ? '100% 100%' : '300% 300%',
          animation: isLocked || isGold ? undefined : 'aurora-shift 8s ease infinite',
        }}
      >
        {/* Decorative shapes */}
        <div
          className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)', top: '-14px', right: '-14px' }}
        />
        <div
          className="absolute w-14 h-14 sm:w-20 sm:h-20 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', bottom: '-10px', left: '-6px' }}
        />
        <div
          className="absolute w-8 h-8 sm:w-12 sm:h-12 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', top: '8px', left: '14px' }}
        />
        <div className="relative">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: isLocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md ${isLocked ? 'text-white/50' : 'text-white'}`} />
            </div>
            {isLocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-400/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
      </div>

      {/* Card body */}
      <div className="px-3.5 py-3.5 sm:px-5 sm:py-5 flex-1 flex flex-col justify-between">
        {/* Category badge + time */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase"
              style={{
                background: isLocked ? '#F3F4F6' : `${theme.accent}15`,
                color: isLocked ? '#9CA3AF' : theme.accent,
              }}
            >
              {theme.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-1">
            {trail.title}
          </h3>

          {/* Subtitle / Description - hidden on mobile */}
          {trail.description && (
            <p className="hidden sm:block text-xs text-gray-500 mt-1 leading-relaxed line-clamp-1">
              {trail.description}
            </p>
          )}
        </div>

        {/* Progress bar + count */}
        <div className="flex items-center gap-2.5 mt-3 sm:mt-2">
          <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-gray-100 overflow-hidden">
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
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 whitespace-nowrap">
            {completedLessons}/{totalLessons}
          </span>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default TrailCard;
