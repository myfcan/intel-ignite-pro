import { LucideIcon, Lock, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

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

// Accent colors per trail index
const TRAIL_ACCENTS = [
  { from: '#6366F1', to: '#818CF8', shadow: 'rgba(99, 102, 241, 0.3)' },
  { from: '#8B5CF6', to: '#A78BFA', shadow: 'rgba(139, 92, 246, 0.3)' },
  { from: '#EC4899', to: '#F472B6', shadow: 'rgba(236, 72, 153, 0.3)' },
  { from: '#10B981', to: '#34D399', shadow: 'rgba(16, 185, 129, 0.3)' },
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
  isNext = false
}: TrailCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const accent = TRAIL_ACCENTS[(trail.order_index - 1) % TRAIL_ACCENTS.length];

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  // CARD BLOQUEADO
  if (isLocked) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full"
        style={{
          background: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          opacity: 0.55,
        }}
      >
        {/* Lock badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] font-semibold text-gray-500">Bloqueado</span>
          </div>
        </div>

        {/* Decorative area */}
        <div className="relative h-28 sm:h-36 flex items-center justify-center">
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-gray-600" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 pt-0 flex flex-col flex-grow">
          <h3 className="text-gray-500 font-bold text-xs sm:text-sm text-center mb-1 leading-tight break-words">
            {trail.title}
          </h3>
          <p className="text-gray-600 text-[10px] xs:text-xs text-center mb-3 flex-grow">
            Complete a trilha anterior para desbloquear
          </p>
          
          <div className="flex justify-center gap-4 mb-3 text-gray-600 text-[10px] xs:text-xs">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              {totalLessons} aulas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {estimatedTime} min
            </span>
          </div>

          <button disabled className="w-full py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold rounded-xl cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}>
            Bloqueado
          </button>
        </div>
      </motion.div>
    );
  }

  // CARD COMPLETO
  if (isCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4 }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)',
          border: `1px solid ${accent.from}33`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
        }}
      >
        {/* Completed badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: `${accent.from}20`, border: `1px solid ${accent.from}40` }}>
            <span className="text-[10px] sm:text-xs font-semibold" style={{ color: accent.to }}>✓ 100%</span>
          </div>
        </div>

        {/* Decorative area with accent glow */}
        <div className="relative h-28 sm:h-36 flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 50% 60%, ${accent.from}60 0%, transparent 60%)`,
          }} />
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              boxShadow: `0 6px 20px ${accent.shadow}`,
            }}>
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 pt-0 flex flex-col flex-grow">
          <h3 className="text-white font-bold text-xs sm:text-sm text-center mb-1 leading-tight break-words">
            {trail.title}
          </h3>
          <p className="text-[10px] xs:text-xs text-center mb-3 uppercase tracking-wide font-semibold" style={{ color: accent.to }}>
            Concluído
          </p>

          {/* Progress bar full */}
          <div className="mb-3 flex-grow flex flex-col justify-center">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full w-full" style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mb-3 text-gray-400 text-[10px] xs:text-xs">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              {totalLessons}/{totalLessons}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {estimatedTime} min
            </span>
          </div>

          <motion.button 
            className="w-full py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl"
            whileHover={{ y: -1 }}
            style={{
              background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              color: 'white',
              boxShadow: `0 4px 12px ${accent.shadow}`,
            }}>
            Revisar
          </motion.button>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl"
          style={{ boxShadow: `inset 0 0 30px ${accent.from}15, 0 8px 30px ${accent.shadow}` }} />
      </motion.div>
    );
  }

  // CARD ATIVO ou PRÓXIMA
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)',
        border: `1px solid ${accent.from}30`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
      }}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ background: `${accent.from}20`, border: `1px solid ${accent.from}35` }}>
          {isNext ? (
            <span className="text-[10px] sm:text-xs font-semibold" style={{ color: accent.to }}>PRÓXIMA</span>
          ) : (
            <>
              <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: accent.to }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] sm:text-xs font-semibold" style={{ color: accent.to }}>ATIVO</span>
            </>
          )}
        </div>
      </div>

      {/* Pulsing ring for next */}
      {isNext && (
        <motion.div 
          className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
          style={{ border: `2px solid ${accent.from}40` }}
          animate={{ scale: [1, 1.01, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Decorative area */}
      <div className="relative h-28 sm:h-36 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 60%, ${accent.from}50 0%, transparent 55%)`,
        }} />
        
        {/* Decorative abstract progress rings */}
        <div className="relative">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" strokeWidth="3" stroke={`${accent.from}15`} />
            <motion.circle 
              cx="32" cy="32" r="28" fill="none" strokeWidth="3" 
              stroke={accent.from}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
              transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                boxShadow: `0 4px 14px ${accent.shadow}`,
              }}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 pt-0 flex flex-col flex-grow">
        <h3 className="text-white font-bold text-xs sm:text-sm text-center mb-1 leading-tight break-words">
          {trail.title}
        </h3>
        <p className="text-gray-400 text-[10px] xs:text-xs text-center mb-3">
          {progress}% completo
        </p>

        {/* Progress bar */}
        <div className="mb-3 flex-grow flex flex-col justify-center">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-3 text-gray-400 text-[10px] xs:text-xs">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            {completedLessons}/{totalLessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {estimatedTime} min
          </span>
        </div>

        <motion.button 
          className="w-full py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl"
          whileHover={{ y: -1 }}
          style={{
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            color: 'white',
            boxShadow: `0 4px 12px ${accent.shadow}`,
          }}>
          Continuar
        </motion.button>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl"
        style={{ boxShadow: `inset 0 0 30px ${accent.from}15, 0 8px 30px ${accent.shadow}` }} />
    </motion.div>
  );
};

export default TrailCard;
