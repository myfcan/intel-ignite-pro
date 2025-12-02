import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Book, Brain, Sparkles, Zap, Star, Rocket,
  Target, Lightbulb, Trophy, Heart, Crown,
  Flame, Diamond, Gem, Shield, Sword,
  Music, Camera, Palette, Code, Cpu, Database,
  Globe, Map, Compass, Anchor, Ship, Plane,
  Sun, Moon, Cloud, Wind, Waves, Mountain
} from 'lucide-react';

// ============================================
// 🎨 DYNAMIC EXPERIENCE CARD - V5 KILLER FEATURE
// Animações INCRÍVEIS que fazem o usuário dizer UAU!
// ============================================

interface DynamicExperienceCardProps {
  type: string;
  title: string;
  subtitle?: string;
  icon?: string;
  colorScheme?: string;
  chapters?: string[];
  effectDescription?: string;
  onComplete?: () => void;
  className?: string;
}

// Mapeamento de ícones disponíveis
const iconMap: Record<string, React.ComponentType<any>> = {
  book: Book,
  brain: Brain,
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  rocket: Rocket,
  target: Target,
  lightbulb: Lightbulb,
  trophy: Trophy,
  heart: Heart,
  crown: Crown,
  flame: Flame,
  diamond: Diamond,
  gem: Gem,
  shield: Shield,
  sword: Sword,
  music: Music,
  camera: Camera,
  palette: Palette,
  code: Code,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  map: Map,
  compass: Compass,
  anchor: Anchor,
  ship: Ship,
  plane: Plane,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  wind: Wind,
  waves: Waves,
  mountain: Mountain,
};

// Esquemas de cores disponíveis
const colorSchemes: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string;
  bgGradient: string;
}> = {
  purple: {
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.6)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #c084fc 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.6)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)',
  },
  green: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
    glow: 'rgba(34, 197, 94, 0.6)',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #4ade80 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.6)',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
  },
  pink: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.6)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f472b6 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.1) 100%)',
  },
  cyan: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.6)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #22d3ee 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)',
  },
  gold: {
    primary: '#eab308',
    secondary: '#ca8a04',
    accent: '#facc15',
    glow: 'rgba(234, 179, 8, 0.6)',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #facc15 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.1) 100%)',
  },
  red: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    glow: 'rgba(239, 68, 68, 0.6)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #f87171 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
  },
};

// Variantes de animação para o container
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    filter: 'blur(20px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -30,
    filter: 'blur(10px)',
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

// Variantes para elementos filhos
const childVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 12 },
  },
};

// Variantes para o ícone com efeito de pulse
const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.3,
    },
  },
  pulse: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  },
};

// Variantes para capítulos com efeito stagger
const chapterVariants: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.2 + 0.5,
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  }),
};

// Componente de partículas flutuantes
const FloatingParticles: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Componente de borda animada com glow
const AnimatedBorder: React.FC<{ gradient: string; glow: string }> = ({ gradient, glow }) => {
  return (
    <>
      {/* Borda com gradiente rotativo */}
      <motion.div
        className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden"
        style={{
          background: gradient,
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-full h-full rounded-2xl bg-gray-900/95" />
      </motion.div>

      {/* Glow externo pulsante */}
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-50 blur-xl pointer-events-none"
        style={{ background: gradient }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
};

// Componente principal
export const DynamicExperienceCard: React.FC<DynamicExperienceCardProps> = ({
  type,
  title,
  subtitle,
  icon = 'sparkles',
  colorScheme = 'purple',
  chapters = [],
  effectDescription,
  onComplete,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  const colors = colorSchemes[colorScheme] || colorSchemes.purple;
  const IconComponent = iconMap[icon.toLowerCase()] || Sparkles;

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Show chapters after icon animation
    const chaptersTimer = setTimeout(() => setShowChapters(true), 800);

    // Auto-complete after full animation if onComplete provided
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3000 + chapters.length * 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(chaptersTimer);
      clearTimeout(completeTimer);
    };
  }, [chapters.length, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`relative max-w-lg mx-auto ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Borda animada e glow */}
          <AnimatedBorder gradient={colors.gradient} glow={colors.glow} />

          {/* Container principal */}
          <motion.div
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{ background: colors.bgGradient }}
          >
            {/* Partículas flutuantes */}
            <FloatingParticles color={colors.accent} />

            {/* Background pattern animado */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary} 1px, transparent 1px), radial-gradient(circle at 75% 75%, ${colors.secondary} 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
              animate={{
                backgroundPosition: ['0px 0px', '30px 30px'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Header com ícone e título */}
            <motion.div className="relative flex items-start gap-4 mb-4" variants={childVariants}>
              {/* Ícone animado */}
              <motion.div
                className="relative flex-shrink-0"
                variants={iconVariants}
                initial="hidden"
                animate={['visible', 'pulse']}
              >
                {/* Glow do ícone */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{ background: colors.glow }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Container do ícone */}
                <motion.div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: colors.gradient,
                    boxShadow: `0 0 30px ${colors.glow}`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                </motion.div>
              </motion.div>

              {/* Título e subtítulo */}
              <div className="flex-1 min-w-0">
                {/* Título com gradiente animado */}
                <motion.h3
                  className="text-xl font-bold mb-1"
                  style={{
                    background: colors.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {title}
                </motion.h3>

                {/* Subtítulo */}
                {subtitle && (
                  <motion.p
                    className="text-gray-300 text-sm"
                    variants={childVariants}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Descrição do efeito */}
            {effectDescription && (
              <motion.div
                className="relative mb-4 p-3 rounded-lg"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                variants={childVariants}
              >
                <motion.p
                  className="text-sm text-gray-200 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {effectDescription}
                </motion.p>
              </motion.div>
            )}

            {/* Capítulos com animação stagger */}
            {chapters.length > 0 && showChapters && (
              <motion.div
                className="relative space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.p
                  className="text-xs text-gray-400 uppercase tracking-wider mb-3"
                  variants={childVariants}
                >
                  Capítulos
                </motion.p>

                {chapters.map((chapter, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: `3px solid ${colors.primary}`,
                    }}
                    variants={chapterVariants}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      x: 5,
                      background: 'rgba(255, 255, 255, 0.08)',
                      transition: { duration: 0.2 },
                    }}
                  >
                    {/* Número do capítulo */}
                    <motion.span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: colors.gradient,
                        color: 'white',
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 10px ${colors.glow}`,
                          `0 0 20px ${colors.glow}`,
                          `0 0 10px ${colors.glow}`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      {i + 1}
                    </motion.span>

                    {/* Texto do capítulo com efeito typewriter */}
                    <motion.span
                      className="text-sm text-gray-200"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      transition={{ delay: i * 0.2 + 0.8, duration: 0.3 }}
                    >
                      {chapter}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Linha decorativa final */}
            <motion.div
              className="mt-4 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              variants={childVariants}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: colors.gradient }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  delay: 0.5,
                  duration: 2,
                  ease: 'easeOut',
                }}
              />
            </motion.div>

            {/* Badge do tipo no canto */}
            <motion.div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: `${colors.primary}20`,
                color: colors.primary,
                border: `1px solid ${colors.primary}40`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              {type}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicExperienceCard;
