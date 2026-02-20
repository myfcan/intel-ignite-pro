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

    // ✅ Fix #4: animações para novos tipos canônicos
    case 'stat':
      return {
        initial: { scale: 0.3, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 12 } },
        exit: { scale: 1.8, opacity: 0, transition: { duration: 0.5, ease: EASING.dramatic } },
      };
    case 'step':
      return {
        initial: { x: -60, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
        exit: { x: 60, opacity: 0, transition: { duration: 0.25 } },
      };
    case 'comparison-bar':
      return {
        initial: { y: 40, opacity: 0, scale: 0.95 },
        animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 140, damping: 18 } },
        exit: { y: -20, opacity: 0, transition: { duration: 0.25 } },
      };
    case 'quote':
      return {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASING.cinematic } },
        exit: { opacity: 0, scale: 0.96, transition: { duration: 0.3 } },
      };
    case 'pill-tag':
      return {
        initial: { opacity: 0, scale: 0.7, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 15 } },
        exit: { opacity: 0, scale: 0.8, y: -10, transition: { duration: 0.2 } },
      };
    case 'alert':
      return {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 14 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
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
    case 'number-count':
    case 'stat': return 'count-up';
    case 'text-highlight': return 'click-confirm';
    case 'highlight': return 'click-soft';
    case 'badge':
    case 'card-reveal': return 'transition-dramatic';
    case 'letter-reveal': return 'letter-reveal';
    case 'step': return 'click-confirm';
    case 'comparison-bar': return 'transition-dramatic';
    case 'quote': return 'reveal';
    case 'pill-tag': return 'click-soft';
    case 'alert': return 'transition-whoosh';
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

// ─── ImageFlash (single + slideshow mode) ────────────────────────────────────
const ImageFlashContent: React.FC<{ content: Record<string, any> }> = ({ content }) => {
  const signedUrl = useSignedUrl(content.storagePath || null);
  const resolvedImageUrl = content.imageUrl || signedUrl;

  // ✅ FIX #3: Suporte a modo slideshow via content.images (array)
  const images: Array<{ imageUrl?: string; description?: string; durationMs?: number }> = content.images || [];
  if (images.length > 1) {
    return <ImageFlashSequence images={images} intervalMs={content.intervalMs || 1800} flashBetween={content.flashBetween ?? true} />;
  }

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

// ─── ImageFlashSequence (slideshow cinematográfico) ───────────────────────────
const ImageFlashSequence: React.FC<{
  images: Array<{ imageUrl?: string; description?: string; durationMs?: number }>;
  intervalMs: number;
  flashBetween: boolean;
}> = ({ images, intervalMs, flashBetween }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const duration = images[frameIndex]?.durationMs || intervalMs;
    const timer = setTimeout(() => {
      if (flashBetween) {
        setShowFlash(true);
        setTimeout(() => {
          setShowFlash(false);
          setFrameIndex(i => (i + 1) % images.length);
        }, 120);
      } else {
        setFrameIndex(i => (i + 1) % images.length);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [frameIndex, images, intervalMs, flashBetween]);

  const current = images[frameIndex];

  return (
    <div className="relative flex flex-col items-center justify-center gap-3" style={{ minWidth: 280 }}>
      {/* Flash branco de transição */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="absolute inset-0 rounded-2xl bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ zIndex: 10 }}
          />
        )}
      </AnimatePresence>

      {/* Frame image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={frameIndex}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.12 } }}
        >
          {current?.imageUrl && (
            <img
              src={current.imageUrl}
              alt={current.description || ''}
              className="max-w-xs max-h-52 object-contain rounded-2xl"
              style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 100px rgba(255,255,255,0.15)' }}
            />
          )}
          {current?.description && (
            <p className="text-white/70 text-sm text-center mt-2 font-medium">{current.description}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Indicadores de paginação (dots) */}
      <div className="flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === frameIndex ? 18 : 6,
              height: 6,
              background: i === frameIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
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

      // ─── STAT (métricas com count-up) — Fix #4 ───────────────────────────
      case 'stat': {
        const statColor = content.color || '#10B981';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              padding: '20px 36px',
              borderRadius: 18,
              background: 'linear-gradient(145deg, rgba(8,8,20,0.95), rgba(16,12,36,0.98))',
              border: `1px solid ${statColor}40`,
              boxShadow: `0 0 40px ${statColor}20, 0 20px 50px rgba(0,0,0,0.6)`,
              backdropFilter: 'blur(24px)',
              textAlign: 'center',
            }}>
              <CountingNumber
                from={content.from ?? 0}
                to={content.to ?? content.value ?? 0}
                prefix={content.prefix || ''}
                suffix={content.suffix || ''}
                duration={microVisual.duration || 2}
              />
              {content.label && (
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {content.label}
                </p>
              )}
            </div>
          </div>
        );
      }

      // ─── STEP (etapas numeradas) — Fix #4 ────────────────────────────────
      case 'step': {
        const stepColor = content.color || '#22D3EE';
        return (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'linear-gradient(145deg, rgba(8,8,20,0.95), rgba(16,12,36,0.98))',
            border: `1px solid ${stepColor}40`,
            boxShadow: `0 0 30px ${stepColor}18, 0 16px 40px rgba(0,0,0,0.55)`,
            backdropFilter: 'blur(20px)',
            maxWidth: '85vw',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: `linear-gradient(135deg, ${stepColor}, ${stepColor}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 20, color: '#000', flexShrink: 0,
              boxShadow: `0 0 20px ${stepColor}60`,
            }}>
              {content.stepNumber ?? 1}
            </div>
            <p style={{ fontSize: 'clamp(14px, 2vw, 20px)', fontWeight: 700, color: '#eef', margin: 0, lineHeight: 1.35 }}>
              {content.text || content.label || ''}
            </p>
          </div>
        );
      }

      // ─── COMPARISON-BAR (barras de comparação animadas) — Fix #4 ─────────
      case 'comparison-bar': {
        const lColor = content.leftColor || '#EF4444';
        const rColor = content.rightColor || '#10B981';
        const lVal = content.leftValue ?? 0;
        const rVal = content.rightValue ?? 100;
        const total = Math.max(lVal + rVal, 1);
        return (
          <div style={{
            padding: '18px 28px', borderRadius: 16,
            background: 'linear-gradient(145deg, rgba(8,8,20,0.95), rgba(16,12,36,0.98))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(20px)',
            minWidth: 260, maxWidth: '85vw',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: lColor }}>{content.leftLabel || 'A'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: rColor }}>{content.rightLabel || 'B'}</span>
            </div>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 28 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(lVal / total) * 100}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ background: lColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{lVal}%</span>
              </motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(rVal / total) * 100}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                style={{ background: rColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{rVal}%</span>
              </motion.div>
            </div>
          </div>
        );
      }

      // ─── QUOTE (citação editorial com typewriter) — Fix #4 ───────────────
      case 'quote': {
        const qColor = content.color || '#a78bfa';
        return (
          <div style={{
            padding: '22px 32px', borderRadius: 18,
            background: 'linear-gradient(145deg, rgba(10,8,28,0.96), rgba(20,12,44,0.98))',
            border: `1px solid ${qColor}35`,
            boxShadow: `0 0 40px ${qColor}18, 0 20px 50px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(24px)',
            maxWidth: '85vw',
          }}>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 18px)', fontWeight: 500, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{content.text || ''}"
            </p>
            {content.author && (
              <p style={{ fontSize: 12, fontWeight: 700, color: qColor, margin: '10px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                — {content.author}
              </p>
            )}
          </div>
        );
      }

      // ─── PILL-TAG (etiqueta contextual) — Fix #4 ─────────────────────────
      case 'pill-tag': {
        const ptColor = content.color || '#f59e0b';
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 999,
            background: `${ptColor}18`,
            border: `1px solid ${ptColor}50`,
            boxShadow: `0 0 20px ${ptColor}25`,
            backdropFilter: 'blur(12px)',
          }}>
            {content.icon && <span style={{ fontSize: 18 }}>{content.icon}</span>}
            <span style={{ fontSize: 'clamp(13px, 1.8vw, 17px)', fontWeight: 700, color: ptColor, letterSpacing: '0.03em' }}>
              {content.label || content.text || ''}
            </span>
          </div>
        );
      }

      // ─── ALERT (aviso com shake físico) — Fix #4 ─────────────────────────
      case 'alert': {
        const alertColor = content.color || '#ef4444';
        return (
          <motion.div
            animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 28px', borderRadius: 16,
              background: `linear-gradient(145deg, rgba(8,8,20,0.96), rgba(20,8,8,0.98))`,
              border: `1px solid ${alertColor}50`,
              boxShadow: `0 0 30px ${alertColor}30, 0 16px 40px rgba(0,0,0,0.55)`,
              backdropFilter: 'blur(20px)',
              maxWidth: '85vw',
            }}
          >
            <span style={{ fontSize: 28 }}>{content.icon || '⚠️'}</span>
            <p style={{ fontSize: 'clamp(14px, 2vw, 19px)', fontWeight: 700, color: alertColor, margin: 0, lineHeight: 1.35 }}>
              {content.text || content.label || ''}
            </p>
          </motion.div>
        );
      }

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
