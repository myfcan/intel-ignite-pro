/**
 * V7MicroVisualOverlay - Renders micro-visuals as animated overlays
 *
 * V7-vv-v3: Supports ALL micro-visual types from JSON:
 * - image-flash, text-pop, number-count, text-highlight
 * - card-reveal, letter-reveal, highlight
 */

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Extended interface to support all JSON types
interface MicroVisualData {
  id: string;
  anchorText: string;
  triggerTime: number;
  type: string; // Accepts any type from JSON
  content: Record<string, any>;
  duration: number;
}

interface V7MicroVisualOverlayProps {
  microVisuals: MicroVisualData[];
  currentTime: number;
  isPlaying: boolean;
}

// Position mapping for micro-visuals
const positionStyles: Record<string, React.CSSProperties> = {
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  top: { top: '15%', left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: '20%', left: '50%', transform: 'translateX(-50%)' },
  left: { top: '50%', left: '15%', transform: 'translateY(-50%)' },
  right: { top: '50%', right: '15%', transform: 'translateY(-50%)' },
};

// Animation variants for ALL micro-visual types
const animationVariants: Record<string, any> = {
  // image-flash: Quick flash of image/description
  'image-flash': {
    initial: { opacity: 0, scale: 1.2, filter: 'brightness(2)' },
    animate: { opacity: 1, scale: 1, filter: 'brightness(1)', transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, filter: 'brightness(0.5)', transition: { duration: 0.4 } },
  },
  // text-pop: Text pops in with bounce
  'text-pop': {
    initial: { scale: 0, opacity: 0, y: 30 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 15 } },
    exit: { scale: 0.5, opacity: 0, y: -20, transition: { duration: 0.3 } },
  },
  // number-count: Number counting up animation
  'number-count': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
    exit: { scale: 1.5, opacity: 0, transition: { duration: 0.4 } },
  },
  // text-highlight: Text with glow effect
  'text-highlight': {
    initial: { opacity: 0, textShadow: '0 0 0px #22D3EE' },
    animate: {
      opacity: 1,
      textShadow: ['0 0 10px #22D3EE', '0 0 30px #22D3EE', '0 0 10px #22D3EE'],
      transition: { duration: 0.5, textShadow: { duration: 1, repeat: 2 } }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
  // highlight: Pulse highlight on side
  'highlight': {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: [1, 1.05, 1],
      transition: { duration: 0.4, scale: { duration: 0.6, repeat: 2 } }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  },
  // card-reveal: Card slides up
  'card-reveal': {
    initial: { y: 100, opacity: 0, rotateX: -30 },
    animate: { y: 0, opacity: 1, rotateX: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } },
    exit: { y: -50, opacity: 0, transition: { duration: 0.3 } },
  },
  // letter-reveal: Single letter reveals
  'letter-reveal': {
    initial: { scale: 0, opacity: 0, rotate: -90 },
    animate: { scale: 1, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 12 } },
    exit: { scale: 0.5, opacity: 0, transition: { duration: 0.2 } },
  },
  // Fallback for unknown types
  'default': {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  },
};

export const V7MicroVisualOverlay: React.FC<V7MicroVisualOverlayProps> = ({
  microVisuals,
  currentTime,
  isPlaying,
}) => {
  // Determine which micro-visuals should be visible based on current time
  const visibleMicroVisuals = useMemo(() => {
    return microVisuals.filter(mv => {
      const isAfterTrigger = currentTime >= mv.triggerTime;
      const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
      return isAfterTrigger && isBeforeEnd;
    });
  }, [microVisuals, currentTime]);

  if (visibleMicroVisuals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {visibleMicroVisuals.map((mv) => (
          <MicroVisualItem key={mv.id} microVisual={mv} currentTime={currentTime} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface MicroVisualItemProps {
  microVisual: MicroVisualData;
  currentTime: number;
}

// Component for counting numbers
const CountingNumber: React.FC<{ from: number; to: number; prefix?: string; duration: number }> = ({
  from, to, prefix = '', duration
}) => {
  const [current, setCurrent] = useState(from);

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
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return (
    <span className="text-5xl md:text-7xl font-black text-emerald-400"
      style={{ textShadow: '0 0 40px rgba(52, 211, 153, 0.6)' }}>
      {prefix}{current.toLocaleString('pt-BR')}
    </span>
  );
};

const MicroVisualItem: React.FC<MicroVisualItemProps> = ({ microVisual, currentTime }) => {
  const position = microVisual.content.position || 'center';
  const variants = animationVariants[microVisual.type] || animationVariants['default'];

  const renderContent = () => {
    const { type, content } = microVisual;

    switch (type) {
      // IMAGE-FLASH: Cinematic flash effect (NO text displayed)
      // The description is for pipeline/dev reference only, not for display
      case 'image-flash':
        return (
          <div className="w-full h-full flex items-center justify-center">
            {/* Visual flash effect overlay - no text */}
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background: `radial-gradient(circle at center, ${content.color || 'rgba(255,255,255,0.3)'} 0%, transparent 70%)`,
                animation: 'flash 0.5s ease-out',
              }}
            />
            {/* If there's an actual image URL, show it */}
            {content.imageUrl && (
              <img
                src={content.imageUrl}
                alt=""
                className="max-w-md max-h-64 object-contain rounded-xl shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
              />
            )}
            {/* If emoji is provided, show it centered */}
            {content.emoji && !content.imageUrl && (
              <span className="text-8xl md:text-9xl" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                {content.emoji}
              </span>
            )}
          </div>
        );

      // TEXT-POP: Text with emoji pops in
      case 'text-pop':
        return (
          <div className="flex flex-col items-center gap-3">
            {content.emoji && (
              <span className="text-5xl md:text-6xl animate-bounce">
                {content.emoji}
              </span>
            )}
            <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-white/20">
              <p className="text-xl md:text-2xl font-bold text-white text-center">
                {content.text || content.words?.join(' • ')}
              </p>
            </div>
          </div>
        );

      // NUMBER-COUNT: Animated counting number
      case 'number-count':
        return (
          <div className="flex flex-col items-center">
            <CountingNumber
              from={content.from || 0}
              to={content.to || 0}
              prefix={content.prefix || ''}
              duration={content.duration || 1.5}
            />
            {content.suffix && (
              <span className="text-xl text-white/70 mt-2">{content.suffix}</span>
            )}
          </div>
        );

      // TEXT-HIGHLIGHT: Glowing highlighted text
      case 'text-highlight':
        return (
          <div className="px-8 py-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              boxShadow: '0 0 40px rgba(34,211,238,0.4)'
            }}>
            <span className="text-3xl md:text-4xl font-black text-cyan-300"
              style={{ textShadow: '0 0 20px rgba(34,211,238,0.8)' }}>
              {content.highlight || content.text}
            </span>
          </div>
        );

      // HIGHLIGHT: Side highlight with pulse
      // V7-vv: Use content.label if provided, otherwise derive from side
      // side='left' = 98% BRINCANDO, side='right' = 2% DOMINANDO
      case 'highlight':
        const side = content.side || 'left';
        // Colors: red for left/brincando, cyan for right/dominando
        const highlightColor = side === 'left' ? '#ff6b6b' : '#4ecdc4';
        // Use explicit label if provided, otherwise use default based on side
        const highlightLabel = content.label || (side === 'left' ? '😂 BRINCANDO' : '💰 DOMINANDO');
        return (
          <div className="px-6 py-3 rounded-lg border-2"
            style={{
              borderColor: highlightColor,
              backgroundColor: `${highlightColor}20`,
              boxShadow: content.glow ? `0 0 30px ${highlightColor}60` : undefined,
              animation: content.pulse ? 'pulse 1s infinite' : undefined,
            }}>
            <span className="text-xl font-bold" style={{ color: highlightColor }}>
              {highlightLabel}
            </span>
          </div>
        );

      // CARD-REVEAL: Card slides up with content
      case 'card-reveal':
        return (
          <div className="px-8 py-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(34,211,238,0.2)' }}>
            {content.icon && (
              <div className="text-4xl mb-3 text-center">{content.icon}</div>
            )}
            <p className="text-xl md:text-2xl font-bold text-white text-center">
              {content.text}
            </p>
          </div>
        );

      // LETTER-REVEAL: Single letter of PERFEITO
      case 'letter-reveal':
        const letters = ['P', 'E', 'R', 'F', 'E', 'I', 'T', 'O'];
        const meanings = ['Persona', 'Estrutura', 'Resultado', 'Formato', 'Exemplos', 'Iteração', 'Tom', 'Otimização'];
        const index = content.index || 0;
        return (
          <div className="flex flex-col items-center gap-2">
            <span className="text-8xl md:text-9xl font-black text-cyan-400"
              style={{ textShadow: '0 0 40px rgba(34,211,238,0.8)' }}>
              {letters[index]}
            </span>
            <span className="text-xl md:text-2xl font-medium text-white/90">
              {meanings[index]}
            </span>
          </div>
        );

      // DEFAULT: Generic text display
      default:
        return (
          <div className="px-6 py-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20">
            <p className="text-xl md:text-2xl font-medium text-white text-center">
              {content.text || content.value || content.description || JSON.stringify(content)}
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div
      key={microVisual.id}
      className="absolute z-50"
      style={positionStyles[position]}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {renderContent()}
    </motion.div>
  );
};

export default V7MicroVisualOverlay;
