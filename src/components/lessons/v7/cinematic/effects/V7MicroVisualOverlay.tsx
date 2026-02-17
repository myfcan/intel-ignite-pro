/**
 * V7MicroVisualOverlay - Renders micro-visuals as animated overlays
 *
 * V7-vv-v4: CINEMATOGRAPHIC VERSION
 * - Integrated with useV7SoundEffects for audio feedback
 * - Uses V7CinematicEffects for professional animations
 * - Dynamic duration from Pipeline
 * - Smart positioning based on visual type
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useV7SoundEffects } from '../useV7SoundEffects';
import { TIMING, EASING } from '../V7CinematicEffects';
import { useSignedUrl } from '@/hooks/useSignedUrl';

// Extended interface to support all JSON types
interface MicroVisualData {
  id: string;
  anchorText: string;
  triggerTime: number;
  type: string;
  content: Record<string, any>;
  duration: number;
}

interface V7MicroVisualOverlayProps {
  microVisuals: MicroVisualData[];
  currentTime: number;
  isPlaying: boolean;
  visualType?: string; // Type of main visual for smart positioning
  // ✅ V7-v60: Optional set of IDs triggered by anchor system
  // When provided, these IDs are visible regardless of triggerTime
  anchorTriggeredIds?: Set<string>;
}

// Position mapping for micro-visuals - V7-v33: Posições que NÃO sobrepõem conteúdo principal
// Micro-visuals devem aparecer em áreas periféricas, não no centro da tela
const positionStyles: Record<string, React.CSSProperties> = {
  // Centro agora é mais alto para não sobrepor conteúdo VS
  center: { top: '35%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Topo da tela - área segura
  top: { top: '8%', left: '50%', transform: 'translateX(-50%)' },
  // Bottom agora é bem acima do player (75% da altura = 25% de baixo)
  bottom: { top: '70%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Laterais - ajustadas para não sobrepor conteúdo
  left: { top: '40%', left: '5%', transform: 'translateY(-50%)' },
  right: { top: '40%', right: '5%', transform: 'translateY(-50%)' },
  // Cantos - áreas mais seguras
  'top-left': { top: '10%', left: '10%' },
  'top-right': { top: '10%', right: '10%' },
  'bottom-left': { bottom: '20%', left: '10%' },
  'bottom-right': { bottom: '20%', right: '10%' },
};

// ✅ CINEMATIC Animation variants using V7CinematicEffects principles
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAnimationVariants = (type: string, animation?: string): any => {
  // Custom animation from content
  if (animation === 'zoom-in') {
    return {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1, transition: { duration: TIMING.slow, ease: EASING.dramatic } },
      exit: { opacity: 0, scale: 1.5, transition: { duration: TIMING.fast } },
    };
  }
  if (animation === 'explode') {
    return {
      initial: { opacity: 0, scale: 0.3, rotate: -10 },
      animate: { opacity: 1, scale: 1, rotate: 0, transition: { duration: TIMING.slow, ease: EASING.dramatic } },
      exit: { opacity: 0, scale: 2, rotate: 10, transition: { duration: TIMING.fast } },
    };
  }
  if (animation === 'dissolve') {
    return {
      initial: { opacity: 0, scale: 1.05 },
      animate: { opacity: 1, scale: 1, transition: { duration: TIMING.cinematic, ease: EASING.cinematic } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: TIMING.medium } },
    };
  }

  // Type-specific animations
  switch (type) {
    case 'image-flash':
      return {
        initial: { opacity: 0, scale: 1.3, filter: 'brightness(2.5) blur(10px)' },
        animate: {
          opacity: 1,
          scale: 1,
          filter: 'brightness(1) blur(0px)',
          transition: { duration: 0.25, ease: EASING.dramatic }
        },
        exit: {
          opacity: 0,
          scale: 0.9,
          filter: 'brightness(0.3) blur(5px)',
          transition: { duration: 0.3 }
        },
      };

    case 'text-pop':
      return {
        initial: { scale: 0, opacity: 0, y: 40, rotateX: -45 },
        animate: {
          scale: 1,
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { type: 'spring' as const, stiffness: 400, damping: 15 }
        },
        exit: { scale: 0.7, opacity: 0, y: -30, transition: { duration: 0.25 } },
      };

    case 'number-count':
      return {
        initial: { scale: 0.3, opacity: 0, y: 20 },
        animate: {
          scale: 1,
          opacity: 1,
          y: 0,
          transition: { type: 'spring' as const, stiffness: 150, damping: 12 }
        },
        exit: { scale: 1.8, opacity: 0, transition: { duration: 0.5, ease: EASING.dramatic } },
      };

    case 'text-highlight':
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: EASING.easeOut }
        },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } },
      };

    case 'highlight':
      return {
        initial: { opacity: 0, scale: 0.85, x: -20 },
        animate: {
          opacity: 1,
          scale: 1,
          x: 0,
          transition: { duration: 0.35, ease: EASING.snappy }
        },
        exit: { opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.25 } },
      };

    case 'card-reveal':
      return {
        initial: { y: 120, opacity: 0, rotateX: -40, scale: 0.9 },
        animate: {
          y: 0,
          opacity: 1,
          rotateX: 0,
          scale: 1,
          transition: { type: 'spring' as const, stiffness: 120, damping: 18 }
        },
        exit: { y: -60, opacity: 0, scale: 0.95, transition: { duration: 0.35 } },
      };

    case 'letter-reveal':
      return {
        initial: { scale: 0, opacity: 0, rotate: -120 },
        animate: {
          scale: 1,
          opacity: 1,
          rotate: 0,
          transition: { type: 'spring' as const, stiffness: 250, damping: 14 }
        },
        exit: { scale: 0.6, opacity: 0, rotate: 45, transition: { duration: 0.2 } },
      };

    default:
      return {
        initial: { opacity: 0, scale: 0.9, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: TIMING.medium, ease: EASING.easeOut } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: TIMING.fast } },
      };
  }
};

// ✅ Map microvisual type to sound
const getMicroVisualSound = (type: string): string | null => {
  switch (type) {
    case 'image-flash': return 'transition-whoosh';
    case 'text-pop': return 'reveal';
    case 'number-count': return 'count-up';
    case 'text-highlight': return 'click-confirm';
    case 'highlight': return 'click-soft';
    case 'card-reveal': return 'transition-dramatic';
    case 'letter-reveal': return 'letter-reveal';
    default: return 'click-soft';
  }
};

export const V7MicroVisualOverlay: React.FC<V7MicroVisualOverlayProps> = ({
  microVisuals,
  currentTime,
  isPlaying,
  visualType,
  anchorTriggeredIds,
}) => {
  const { playSound } = useV7SoundEffects();
  const activeMvRef = useRef<Set<string>>(new Set());

  // ✅ V7-v60: Determine visibility using BOTH time-based AND anchor-based triggers
  // Priority: anchorTriggeredIds (if provided) OR time-based calculation
  const visibleMicroVisuals = useMemo(() => {
    return microVisuals.filter(mv => {
      // ✅ V7-v60: If anchor system has triggered this ID, show it
      if (anchorTriggeredIds && anchorTriggeredIds.has(mv.id)) {
        console.log(`[MicroVisual] 👁️ "${mv.id}" visible via anchor trigger`);
        return true;
      }
      
      // Fallback: time-based visibility
      const isAfterTrigger = currentTime >= mv.triggerTime;
      const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
      return isAfterTrigger && isBeforeEnd;
    });
  }, [microVisuals, currentTime, anchorTriggeredIds]);

  // ✅ Track activation and play sounds
  useEffect(() => {
    microVisuals.forEach(mv => {
      const isActive = currentTime >= mv.triggerTime && currentTime < mv.triggerTime + mv.duration;
      const wasActive = activeMvRef.current.has(mv.id);

      if (isActive && !wasActive) {
        // Just became active - play sound!
        activeMvRef.current.add(mv.id);
        const soundType = getMicroVisualSound(mv.type);
        if (soundType) {
          playSound(soundType as any);
          console.log(`[MicroVisual] 🔊 ${mv.type} "${mv.anchorText}" activated @ ${currentTime.toFixed(1)}s`);
        }
      } else if (!isActive && wasActive) {
        // Just became inactive
        activeMvRef.current.delete(mv.id);
      }
    });
  }, [currentTime, microVisuals, playSound]);

  if (visibleMicroVisuals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {visibleMicroVisuals.map((mv) => (
          <MicroVisualItem
            key={mv.id}
            microVisual={mv}
            currentTime={currentTime}
            visualType={visualType}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ✅ Phase 4: ImageFlashContent extracted as component so useSignedUrl hook can be used
const ImageFlashContent: React.FC<{ content: Record<string, any> }> = ({ content }) => {
  // Resolve storagePath → signed URL (Image Lab C12 private bucket)
  const signedUrl = useSignedUrl(content.storagePath || null);
  const resolvedImageUrl = content.imageUrl || signedUrl;

  return (
    <div className="relative flex items-center justify-center">
      {/* Cinematic flash overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(circle at center, ${content.color || 'rgba(255,255,255,0.5)'} 0%, transparent 70%)`,
          width: '300px',
          height: '200px',
          margin: '-50px',
        }}
      />
      {/* Actual image if provided (direct URL or signed URL from storagePath) */}
      {resolvedImageUrl && (
        <img
          src={resolvedImageUrl}
          alt=""
          className="max-w-sm max-h-56 object-contain rounded-2xl"
          style={{
            boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 100px rgba(255,255,255,0.2)'
          }}
        />
      )}
      {/* Emoji if provided (and no image) */}
      {content.emoji && !resolvedImageUrl && (
        <span
          className="text-7xl md:text-8xl"
          style={{
            textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)',
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))'
          }}
        >
          {content.emoji}
        </span>
      )}
      {/* Description fallback when no image/emoji */}
      {!resolvedImageUrl && !content.emoji && content.description && (
        <motion.div
          className="bg-black/80 backdrop-blur-lg rounded-xl px-6 py-4 border border-white/20 shadow-2xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <p className="text-white text-lg md:text-xl font-medium text-center max-w-xs">
            {content.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};

interface MicroVisualItemProps {
  microVisual: MicroVisualData;
  currentTime: number;
  visualType?: string;
}

// Component for counting numbers with sound
const CountingNumber: React.FC<{ from: number; to: number; prefix?: string; suffix?: string; duration: number }> = ({
  from, to, prefix = '', suffix = '', duration
}) => {
  const [current, setCurrent] = useState(from);
  const { playSound } = useV7SoundEffects();

  useEffect(() => {
    const steps = 30;
    const increment = (to - from) / steps;
    const stepDuration = (duration * 1000) / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(to);
        clearInterval(interval);
      } else {
        setCurrent(Math.round(from + increment * step));
        // Play tick sound every few steps
        if (step % 5 === 0) {
          playSound('progress-tick');
        }
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [from, to, duration, playSound]);

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-5xl md:text-7xl font-black text-emerald-400"
        style={{
          textShadow: '0 0 40px rgba(52, 211, 153, 0.6), 0 0 80px rgba(52, 211, 153, 0.3)'
        }}
      >
        {prefix}{current.toLocaleString('pt-BR')}
      </span>
      {suffix && (
        <span className="text-lg md:text-xl text-white/70 mt-2 font-medium">{suffix}</span>
      )}
    </div>
  );
};

const MicroVisualItem: React.FC<MicroVisualItemProps> = ({ microVisual, currentTime, visualType }) => {
  // V7-v33: Smart positioning - EVITAR sobreposição com conteúdo principal
  const getPosition = () => {
    const { type, content } = microVisual;

    // ✅ Posição explícita tem prioridade
    if (content.position) return content.position;

    // ✅ V7-v33: Para split-screen/comparison, usar cantos superiores (não centro)
    if (visualType === 'split-screen' || visualType === 'comparison') {
      if (content.side === 'left') return 'top-left';
      if (content.side === 'right') return 'top-right';
      // Default para split-screen: topo (acima do VS)
      return 'top';
    }

    // ✅ V7-v33: Para quiz, posicionar nos cantos para não cobrir opções
    if (visualType === 'quiz') {
      return 'top';
    }

    // For highlight type, side determines position
    if (type === 'highlight' && content.side) {
      return content.side === 'left' ? 'top-left' : 'top-right';
    }

    // ✅ V7-v33: Smart defaults - preferir topo e cantos
    switch (type) {
      case 'image-flash': return 'top'; // Antes era 'center'
      case 'text-pop': return 'top';    // Antes era 'bottom' que ainda sobrepunha
      case 'number-count': return 'top';
      case 'highlight': return 'top-left';
      case 'text-highlight': return 'top';
      default: return 'top';
    }
  };

  const position = getPosition();
  const variants = getAnimationVariants(microVisual.type, microVisual.content.animation);

  const renderContent = () => {
    const { type, content } = microVisual;

    switch (type) {
      // IMAGE-FLASH: Cinematic flash effect with visual impact
      // ✅ Phase 4: Supports storagePath from Image Lab C12 (resolved via signed URL)
      case 'image-flash':
        return <ImageFlashContent content={content} />;

      // TEXT-POP: Text with emoji pops in dramatically
      // ✅ V7-v25: Emoji centralizado, texto abaixo - layout vertical
      case 'text-pop':
        return (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {/* Emoji grande e centralizado */}
            {content.emoji && (
              <motion.span
                className="text-6xl md:text-7xl lg:text-8xl block"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                }}
              >
                {content.emoji}
              </motion.span>
            )}
            {/* Texto abaixo do emoji */}
            {(content.text || content.words) && (
              <motion.div
                className="px-6 py-3 rounded-xl backdrop-blur-xl border border-white/20 max-w-[90vw]"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-white text-center">
                  {content.text || content.words?.join(' • ')}
                </p>
              </motion.div>
            )}
          </div>
        );

      // NUMBER-COUNT: Animated counting number with sound
      case 'number-count':
        return (
          <CountingNumber
            from={content.from || 0}
            to={content.to || 0}
            prefix={content.prefix || ''}
            suffix={content.suffix}
            duration={microVisual.duration || 1.5}
          />
        );

      // TEXT-HIGHLIGHT: Glowing highlighted text
      case 'text-highlight':
        return (
          <motion.div
            className="px-10 py-5 rounded-xl"
            animate={{
              boxShadow: [
                '0 0 30px rgba(34,211,238,0.3)',
                '0 0 50px rgba(34,211,238,0.5)',
                '0 0 30px rgba(34,211,238,0.3)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(168,85,247,0.2) 100%)',
            }}
          >
            <motion.span
              className="text-3xl md:text-4xl font-black text-cyan-300"
              animate={{
                textShadow: [
                  '0 0 20px rgba(34,211,238,0.6)',
                  '0 0 40px rgba(34,211,238,0.9)',
                  '0 0 20px rgba(34,211,238,0.6)',
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {content.highlight || content.text}
            </motion.span>
          </motion.div>
        );

      // HIGHLIGHT: Side highlight with pulse effect
      case 'highlight':
        const side = content.side || 'left';
        const highlightColor = side === 'left' ? '#ff6b6b' : '#4ecdc4';
        const highlightLabel = content.label || (side === 'left' ? '😂 BRINCANDO' : '💰 DOMINANDO');
        return (
          <motion.div
            className="px-6 py-3 rounded-xl border-2"
            animate={content.pulse ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                `0 0 20px ${highlightColor}40`,
                `0 0 40px ${highlightColor}70`,
                `0 0 20px ${highlightColor}40`,
              ]
            } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              borderColor: highlightColor,
              backgroundColor: `${highlightColor}20`,
              boxShadow: content.glow ? `0 0 30px ${highlightColor}50` : undefined,
            }}
          >
            <span className="text-lg md:text-xl font-bold" style={{ color: highlightColor }}>
              {highlightLabel}
            </span>
          </motion.div>
        );

      // CARD-REVEAL: Reference to phase cards - minimal render
      case 'card-reveal':
        if (!content.text && !content.icon) return null;
        return (
          <motion.div
            className="px-8 py-6 rounded-2xl border border-cyan-500/30"
            style={{
              background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(34,211,238,0.15)'
            }}
          >
            {content.icon && (
              <div className="text-4xl mb-3 text-center">{content.icon}</div>
            )}
            {content.text && (
              <p className="text-xl md:text-2xl font-bold text-white text-center">
                {content.text}
              </p>
            )}
          </motion.div>
        );

      // LETTER-REVEAL: DISABLED - V7PhasePERFEITOSynced handles all letter rendering
      case 'letter-reveal':
        return null;

      // DEFAULT: Generic text display with style
      default:
        return (
          <div
            className="px-6 py-4 rounded-xl backdrop-blur-xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <p className="text-xl md:text-2xl font-medium text-white text-center">
              {content.text || content.value || content.description || ''}
            </p>
          </div>
        );
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <motion.div
      key={microVisual.id}
      className="absolute z-50"
      style={positionStyles[position] || positionStyles.center}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {content}
    </motion.div>
  );
};

export default V7MicroVisualOverlay;
