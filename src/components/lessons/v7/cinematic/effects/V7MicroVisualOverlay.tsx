/**
 * V7MicroVisualOverlay - Renders micro-visuals as animated overlays
 *
 * V7-vv-v5: PREMIUM REDESIGN
 * - text/badge tipos com visual cinematográfico
 * - Glow, gradientes e tipografia dramática
 * - Integrado com useV7SoundEffects
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
  visualType?: string;
  anchorTriggeredIds?: Set<string>;
}

// Position mapping
const positionStyles: Record<string, React.CSSProperties> = {
  center: { top: '35%', left: '50%', transform: 'translate(-50%, -50%)' },
  top: { top: '8%', left: '50%', transform: 'translateX(-50%)' },
  bottom: { top: '70%', left: '50%', transform: 'translate(-50%, -50%)' },
  left: { top: '40%', left: '5%', transform: 'translateY(-50%)' },
  right: { top: '40%', right: '5%', transform: 'translateY(-50%)' },
  'top-left': { top: '10%', left: '10%' },
  'top-right': { top: '10%', right: '10%' },
  'bottom-left': { bottom: '20%', left: '10%' },
  'bottom-right': { bottom: '20%', right: '10%' },
};

const getAnimationVariants = (type: string, animation?: string): any => {
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

  switch (type) {
    case 'image-flash':
      return {
        initial: { opacity: 0, scale: 1.3, filter: 'brightness(2.5) blur(10px)' },
        animate: { opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)', transition: { duration: 0.25, ease: EASING.dramatic } },
        exit: { opacity: 0, scale: 0.9, filter: 'brightness(0.3) blur(5px)', transition: { duration: 0.3 } },
      };

    case 'text-pop':
    case 'text':
      return {
        initial: { scale: 0.6, opacity: 0, y: 30, rotateX: -25 },
        animate: { scale: 1, opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 380, damping: 18 } },
        exit: { scale: 0.8, opacity: 0, y: -20, transition: { duration: 0.22 } },
      };

    case 'badge':
    case 'card-reveal':
      return {
        initial: { y: 80, opacity: 0, rotateX: -30, scale: 0.92 },
        animate: { y: 0, opacity: 1, rotateX: 0, scale: 1, transition: { type: 'spring', stiffness: 140, damping: 20 } },
        exit: { y: -40, opacity: 0, scale: 0.96, transition: { duration: 0.28 } },
      };

    case 'number-count':
      return {
        initial: { scale: 0.3, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 12 } },
        exit: { scale: 1.8, opacity: 0, transition: { duration: 0.5, ease: EASING.dramatic } },
      };

    case 'text-highlight':
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASING.easeOut } },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } },
      };

    case 'highlight':
      return {
        initial: { opacity: 0, scale: 0.85, x: -20 },
        animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.35, ease: EASING.snappy } },
        exit: { opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.25 } },
      };

    default:
      return {
        initial: { opacity: 0, scale: 0.9, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: TIMING.medium, ease: EASING.easeOut } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: TIMING.fast } },
      };
  }
};

const getMicroVisualSound = (type: string): string | null => {
  switch (type) {
    case 'image-flash': return 'transition-whoosh';
    case 'text-pop':
    case 'text': return 'reveal';
    case 'number-count': return 'count-up';
    case 'text-highlight': return 'click-confirm';
    case 'highlight': return 'click-soft';
    case 'badge':
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

  const visibleMicroVisuals = useMemo(() => {
    return microVisuals.filter(mv => {
      if (anchorTriggeredIds && anchorTriggeredIds.has(mv.id)) {
        console.log(`[MicroVisual] 👁️ "${mv.id}" visible via anchor trigger`);
        return true;
      }
      const isAfterTrigger = currentTime >= mv.triggerTime;
      const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
      return isAfterTrigger && isBeforeEnd;
    });
  }, [microVisuals, currentTime, anchorTriggeredIds]);

  useEffect(() => {
    microVisuals.forEach(mv => {
      const isActive = currentTime >= mv.triggerTime && currentTime < mv.triggerTime + mv.duration;
      const wasActive = activeMvRef.current.has(mv.id);
      if (isActive && !wasActive) {
        activeMvRef.current.add(mv.id);
        const soundType = getMicroVisualSound(mv.type);
        if (soundType) {
          playSound(soundType as any);
          console.log(`[MicroVisual] 🔊 ${mv.type} "${mv.anchorText}" activated @ ${currentTime.toFixed(1)}s`);
        }
      } else if (!isActive && wasActive) {
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

// ─── ImageFlash ──────────────────────────────────────────────────────────────
const ImageFlashContent: React.FC<{ content: Record<string, any> }> = ({ content }) => {
  const signedUrl = useSignedUrl(content.storagePath || null);
  const resolvedImageUrl = content.imageUrl || signedUrl;

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-3xl"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(circle at center, ${content.color || 'rgba(255,255,255,0.5)'} 0%, transparent 70%)`,
          width: '300px', height: '200px', margin: '-50px',
        }}
      />
      {resolvedImageUrl && (
        <img src={resolvedImageUrl} alt="" className="max-w-sm max-h-56 object-contain rounded-2xl"
          style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 100px rgba(255,255,255,0.2)' }} />
      )}
      {content.emoji && !resolvedImageUrl && (
        <span className="text-7xl md:text-8xl"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' }}>
          {content.emoji}
        </span>
      )}
      {!resolvedImageUrl && !content.emoji && content.description && (
        <motion.div className="bg-black/80 backdrop-blur-lg rounded-xl px-6 py-4 border border-white/20 shadow-2xl"
          initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <p className="text-white text-lg md:text-xl font-medium text-center max-w-xs">{content.description}</p>
        </motion.div>
      )}
    </div>
  );
};

// ─── CountingNumber ───────────────────────────────────────────────────────────
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
      if (step >= steps) { setCurrent(to); clearInterval(interval); }
      else {
        setCurrent(Math.round(from + increment * step));
        if (step % 5 === 0) playSound('progress-tick');
      }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [from, to, duration, playSound]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl md:text-7xl font-black"
        style={{ color: '#34d399', textShadow: '0 0 40px rgba(52,211,153,0.6), 0 0 80px rgba(52,211,153,0.3)' }}>
        {prefix}{current.toLocaleString('pt-BR')}
      </span>
      {suffix && <span className="text-lg md:text-xl text-white/70 mt-2 font-medium">{suffix}</span>}
    </div>
  );
};

// ─── MicroVisualItem ──────────────────────────────────────────────────────────
interface MicroVisualItemProps {
  microVisual: MicroVisualData;
  currentTime: number;
  visualType?: string;
}

const MicroVisualItem: React.FC<MicroVisualItemProps> = ({ microVisual, currentTime, visualType }) => {
  const getPosition = () => {
    const { type, content } = microVisual;
    if (content.position) return content.position;
    if (visualType === 'split-screen' || visualType === 'comparison') {
      if (content.side === 'left') return 'top-left';
      if (content.side === 'right') return 'top-right';
      return 'top';
    }
    if (visualType === 'quiz') return 'top';
    if (type === 'highlight' && content.side) return content.side === 'left' ? 'top-left' : 'top-right';
    switch (type) {
      case 'image-flash': return 'top';
      case 'text-pop':
      case 'text': return 'center';
      case 'badge':
      case 'card-reveal': return 'center';
      case 'number-count': return 'top';
      case 'highlight': return 'top-left';
      case 'text-highlight': return 'top';
      default: return 'center';
    }
  };

  const position = getPosition();
  const variants = getAnimationVariants(microVisual.type, microVisual.content.animation);

  const renderContent = () => {
    const { type, content } = microVisual;

    switch (type) {
      // ─── IMAGE-FLASH ──────────────────────────────────────────────────────
      case 'image-flash':
        return <ImageFlashContent content={content} />;

      // ─── TEXT / TEXT-POP ─────────────────────────────────────────────────
      // Renderiza o tipo canônico "text" (text-pop) com design dramático
      case 'text-pop':
      case 'text': {
        const label = content.text || content.words?.join(' • ') || '';
        return (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {/* Emoji flutuante */}
            {content.emoji && (
              <motion.span
                className="text-6xl md:text-7xl block"
                animate={{ y: [0, -8, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.35))' }}
              >
                {content.emoji}
              </motion.span>
            )}
            {/* Pill premium com glow lateral */}
            {label && (
              <div style={{ position: 'relative' }}>
                {/* Glow blob atrás */}
                <div style={{
                  position: 'absolute', inset: '-12px -20px',
                  background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.45) 0%, transparent 70%)',
                  filter: 'blur(18px)',
                  borderRadius: '999px',
                  zIndex: 0,
                }} />
                <motion.div
                  style={{
                    position: 'relative', zIndex: 1,
                    padding: '14px 32px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(15,10,35,0.92) 0%, rgba(30,15,60,0.96) 100%)',
                    border: '1px solid rgba(139,92,246,0.5)',
                    boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    maxWidth: '80vw',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 0 1px rgba(139,92,246,0.15), 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                      '0 0 0 1px rgba(139,92,246,0.4), 0 12px 60px rgba(0,0,0,0.7), 0 0 30px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
                      '0 0 0 1px rgba(139,92,246,0.15), 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Linha accent no topo */}
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)',
                    borderRadius: '999px',
                  }} />
                  <p style={{
                    fontSize: 'clamp(16px, 2.5vw, 24px)',
                    fontWeight: 700,
                    color: '#e2d9f3',
                    letterSpacing: '0.01em',
                    margin: 0,
                    lineHeight: 1.3,
                    textShadow: '0 1px 12px rgba(139,92,246,0.3)',
                  }}>
                    {label}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        );
      }

      // ─── BADGE / CARD-REVEAL ─────────────────────────────────────────────
      // Badge sobe do fundo com glassmorphism e linha colorida
      case 'badge':
      case 'card-reveal': {
        const label = content.text || content.label || '';
        const icon = content.icon || '';
        const accent = content.color || '#22d3ee'; // default cyan
        return (
          <div style={{ position: 'relative', minWidth: '200px', maxWidth: '85vw' }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', inset: '-20px -30px',
              background: `radial-gradient(ellipse at center, ${accent}30 0%, transparent 65%)`,
              filter: 'blur(24px)',
              borderRadius: '999px',
              zIndex: 0,
            }} />
            <motion.div
              style={{
                position: 'relative', zIndex: 1,
                padding: icon ? '18px 28px' : '16px 28px',
                borderRadius: '18px',
                background: 'linear-gradient(145deg, rgba(8,8,20,0.95) 0%, rgba(16,12,36,0.98) 100%)',
                border: `1px solid ${accent}40`,
                boxShadow: `0 0 0 1px ${accent}18, 0 20px 50px rgba(0,0,0,0.65), 0 0 40px ${accent}18`,
                backdropFilter: 'blur(24px)',
              }}
              animate={{
                boxShadow: [
                  `0 0 0 1px ${accent}18, 0 20px 50px rgba(0,0,0,0.65), 0 0 40px ${accent}18`,
                  `0 0 0 1px ${accent}50, 0 20px 60px rgba(0,0,0,0.75), 0 0 60px ${accent}30`,
                  `0 0 0 1px ${accent}18, 0 20px 50px rgba(0,0,0,0.65), 0 0 40px ${accent}18`,
                ]
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                borderRadius: '999px',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {icon && (
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</span>
                )}
                <div style={{ flex: 1 }}>
                  {label && (
                    <p style={{
                      fontSize: 'clamp(15px, 2.2vw, 21px)',
                      fontWeight: 700,
                      color: '#f0f0ff',
                      margin: 0,
                      lineHeight: 1.35,
                      letterSpacing: '0.005em',
                    }}>
                      {label}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        );
      }

      // ─── NUMBER-COUNT ─────────────────────────────────────────────────────
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

      // ─── TEXT-HIGHLIGHT ───────────────────────────────────────────────────
      case 'text-highlight':
        return (
          <motion.div
            style={{
              padding: '18px 36px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            }}
            animate={{
              boxShadow: [
                '0 0 30px rgba(34,211,238,0.25)',
                '0 0 50px rgba(34,211,238,0.45)',
                '0 0 30px rgba(34,211,238,0.25)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.span
              style={{
                fontSize: 'clamp(20px, 3vw, 34px)',
                fontWeight: 900,
                color: '#67e8f9',
                letterSpacing: '-0.01em',
                display: 'block',
              }}
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

      // ─── HIGHLIGHT ────────────────────────────────────────────────────────
      case 'highlight': {
        const side = content.side || 'left';
        const highlightColor = side === 'left' ? '#f87171' : '#2dd4bf';
        const highlightLabel = content.label || (side === 'left' ? '😂 BRINCANDO' : '💰 DOMINANDO');
        return (
          <motion.div
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              border: `2px solid ${highlightColor}`,
              background: `${highlightColor}15`,
              boxShadow: content.glow ? `0 0 30px ${highlightColor}50` : undefined,
            }}
            animate={content.pulse ? {
              scale: [1, 1.05, 1],
              boxShadow: [`0 0 20px ${highlightColor}40`, `0 0 40px ${highlightColor}70`, `0 0 20px ${highlightColor}40`],
            } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: highlightColor }}>{highlightLabel}</span>
          </motion.div>
        );
      }

      // ─── LETTER-REVEAL ────────────────────────────────────────────────────
      case 'letter-reveal':
        return null;

      // ─── DEFAULT ──────────────────────────────────────────────────────────
      default: {
        const label = content.text || content.value || content.description || '';
        if (!label) return null;
        return (
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-10px -16px',
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)',
              filter: 'blur(16px)',
              borderRadius: '999px',
              zIndex: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              padding: '14px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(12,10,30,0.94) 0%, rgba(25,15,50,0.97) 100%)',
              border: '1px solid rgba(99,102,241,0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
              backdropFilter: 'blur(18px)',
              maxWidth: '80vw',
            }}>
              <p style={{
                fontSize: 'clamp(15px, 2.2vw, 22px)',
                fontWeight: 600,
                color: '#d4d0f0',
                margin: 0,
                lineHeight: 1.4,
                textAlign: 'center',
              }}>
                {label}
              </p>
            </div>
          </div>
        );
      }
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
