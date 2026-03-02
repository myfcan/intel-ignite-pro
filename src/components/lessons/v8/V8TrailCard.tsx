import { motion } from "framer-motion";
import { BookOpen, Clock, Compass, MessageSquare, Sparkles, Brain, Palette, Zap, Bot, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface V8TrailCardProps {
  trailId: string;
  title: string;
  description?: string;
  icon?: string;
  lessonCount: number;
  completedCount: number;
  estimatedHours?: number;
  orderIndex?: number;
}

const V8_THEMES = [
  { accent: '#6366F1', label: 'Read & Listen' },
  { accent: '#7C3AED', label: 'Read & Listen' },
  { accent: '#4F46E5', label: 'Read & Listen' },
  { accent: '#8B5CF6', label: 'Read & Listen' },
];

// Mapeamento de ícones profissionais por order_index
const V8_ICONS: Record<number, LucideIcon> = {
  2: Compass,       // Aterrizando nas IAs
  3: MessageSquare,  // ChatGPT no máximo
  4: Sparkles,       // Dissecando o Gemini
  5: Brain,          // Claude O melhor
  6: Palette,        // Midjourney
  7: Zap,            // Grok
  8: Bot,            // Manus
};

export const V8TrailCard = ({
  trailId,
  title,
  description,
  icon,
  lessonCount,
  completedCount,
  estimatedHours = 0,
  orderIndex = 1,
}: V8TrailCardProps) => {
  const navigate = useNavigate();
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const theme = V8_THEMES[(orderIndex - 1) % V8_THEMES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/v8-trail/${trailId}`)}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer w-full"
      style={{
        scrollSnapAlign: 'start',
        boxShadow: '0 8px 32px -4px rgba(99, 102, 241, 0.12), 0 4px 16px -2px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.1)',
      }}
    >
      {/* Aurora border glow effect (indigo/violet) */}
      <div
        className="absolute inset-0 rounded-2xl z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #818CF8, #8B5CF6, #818CF8, #6366F1)',
          backgroundSize: '300% 300%',
          animation: 'aurora-shift 6s ease infinite',
        }}
      />

      {/* Aurora ambient glow on hover */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.12), rgba(139,92,246,0.1), rgba(129,140,248,0.15))',
          backgroundSize: '300% 300%',
          animation: 'aurora-shift 6s ease infinite',
        }}
      />

      {/* Inner card */}
      <div className="relative z-10 bg-white rounded-[14px] overflow-hidden m-[2px] flex flex-col h-[calc(100%-4px)]">
        {/* Colored header area with indigo/violet gradient */}
        <div
          className="h-[96px] sm:h-[120px] flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, #818CF8, #8B5CF6, ${theme.accent})`,
            backgroundSize: '300% 300%',
            animation: 'aurora-shift 8s ease infinite',
          }}
        >
          {/* Decorative shapes */}
          <div
            className="absolute w-16 h-16 sm:w-[88px] sm:h-[88px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', top: '-14px', right: '-14px' }}
          />
          <div
            className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', bottom: '-10px', left: '-6px' }}
          />
          <div
            className="absolute w-7 h-7 sm:w-10 sm:h-10 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', top: '8px', left: '14px' }}
          />

          {/* Icon in glass container */}
          <div className="relative">
            <div
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              {(() => {
                const IconComponent = V8_ICONS[orderIndex] || BookOpen;
                return <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-md" />;
              })()}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Category badge + estimated hours */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase"
                style={{
                  background: `${theme.accent}15`,
                  color: theme.accent,
                }}
              >
                {theme.label}
              </span>
              {estimatedHours > 0 && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} className="sm:w-[13px] sm:h-[13px]" />
                  <span className="text-[10px] sm:text-[11px] font-medium">~{estimatedHours}h</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-1">
              {title}
            </h3>

            {/* Description - hidden on mobile */}
            {description && (
              <p className="hidden sm:block text-xs text-gray-500 mt-1 leading-relaxed line-clamp-1">
                {description}
              </p>
            )}
          </div>

          {/* Progress bar + count */}
          <div className="flex items-center gap-2.5 mt-3 sm:mt-2">
            <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}CC)`,
                  boxShadow: `0 0 8px ${theme.accent}40`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-500 whitespace-nowrap">
              {completedCount}/{lessonCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
