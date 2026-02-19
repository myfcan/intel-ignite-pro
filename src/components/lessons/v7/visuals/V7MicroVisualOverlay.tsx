/**
 * V7MicroVisualOverlay - Renderiza micro-visuais como overlays cinematográficos
 *
 * Tipos suportados:
 * - image-flash      → imagem com flash de brilho
 * - text-pop         → texto com spring bounce
 * - number-count     → contador animado
 * - text-highlight   → destaque com glow pulsante
 * - highlight        → ponto colorido pulse/shake/glow
 * - card-reveal      → card com slide-up
 * - letter-reveal    → letra de acrônimo com rotateY 3D flip [FIXED]
 * - stat             → métrica de impacto com label
 * - step             → passo numerado sequencial
 * - quote            → citação editorial com typewriter
 * - pill-tag         → tag/etiqueta contextual
 * - comparison-bar   → barras de comparação visual
 * - alert            → alerta urgente com shake físico
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import type { V7MicroVisual } from '@/types/V7Contract';

interface V7MicroVisualOverlayProps {
  microVisuals: V7MicroVisual[];
}

export default function V7MicroVisualOverlay({ microVisuals }: V7MicroVisualOverlayProps) {
  if (microVisuals.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {microVisuals.map((mv) => (
          <MicroVisualItem key={mv.id} microVisual={mv} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// POSITION MAPPING
// ============================================================================

const positionDefaults: Record<string, string> = {
  stat: 'center',
  step: 'center',
  quote: 'center',
  'pill-tag': 'top',
  'comparison-bar': 'center',
  alert: 'top',
  'image-flash': 'center',
  'text-pop': 'center',
  'number-count': 'center',
  'text-highlight': 'center',
  highlight: 'center',
  'card-reveal': 'center',
  'letter-reveal': 'center',
};

const positionClasses: Record<string, string> = {
  center: 'inset-0 flex items-center justify-center',
  top: 'top-8 left-0 right-0 flex justify-center',
  bottom: 'bottom-8 left-0 right-0 flex justify-center',
  left: 'left-8 top-0 bottom-0 flex items-center',
  right: 'right-8 top-0 bottom-0 flex items-center',
};

// ============================================================================
// MICRO VISUAL ITEM WRAPPER
// ============================================================================

function MicroVisualItem({ microVisual }: { microVisual: V7MicroVisual }) {
  const { type, content } = microVisual;
  const posKey = (content.position as string) || positionDefaults[type] || 'center';
  const posClass = positionClasses[posKey] || positionClasses.center;

  const wrapperProps = getWrapperProps(type, content);

  return (
    <motion.div
      className={`absolute ${posClass}`}
      initial={wrapperProps.initial}
      animate={wrapperProps.animate}
      exit={wrapperProps.exit}
      transition={wrapperProps.transition}
    >
      {type === 'image-flash' && <ImageFlash content={content} />}
      {type === 'text-pop' && <TextPop content={content} />}
      {type === 'number-count' && <NumberCount content={content} />}
      {type === 'text-highlight' && <TextHighlight content={content} />}
      {type === 'highlight' && <Highlight content={content} />}
      {type === 'card-reveal' && <CardReveal content={content} />}
      {type === 'letter-reveal' && <LetterReveal content={content} />}
      {type === 'stat' && <Stat content={content} />}
      {type === 'step' && <Step content={content} />}
      {type === 'quote' && <Quote content={content} />}
      {type === 'pill-tag' && <PillTag content={content} />}
      {type === 'comparison-bar' && <ComparisonBar content={content} />}
      {type === 'alert' && <Alert content={content} />}
    </motion.div>
  );
}

function getWrapperProps(type: string, content: any) {
  switch (type) {
    case 'stat':
      return {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.6 },
        transition: { type: 'spring' as const, stiffness: 450, damping: 16 },
      };
    case 'step': {
      const delay = ((content.stepNumber || 1) - 1) * 0.15;
      return {
        initial: { opacity: 0, x: -60 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 60 },
        transition: { type: 'spring' as const, stiffness: 380, damping: 22, delay },
      };
    }
    case 'quote':
      return {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };
    case 'pill-tag':
      return {
        initial: { opacity: 0, scale: 0.4 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.4 },
        transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
      };
    case 'comparison-bar':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
      };
    case 'alert':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };
    case 'letter-reveal':
      return {
        initial: { opacity: 0, rotateY: -90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: 90 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 18 },
      };
    default:
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: { type: 'spring' as const, stiffness: 380, damping: 18 },
      };
  }
}

// ============================================================================
// MICRO-VISUAL COMPONENTS
// ============================================================================

function ImageFlash({ content }: { content: any }) {
  if (!content.imageUrl) return null;
  return (
    <motion.div
      className="relative"
      initial={{ filter: 'brightness(2)' }}
      animate={{ filter: 'brightness(1)' }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={content.imageUrl}
        alt={content.description || ''}
        className="max-w-[300px] max-h-[200px] rounded-lg shadow-2xl"
      />
    </motion.div>
  );
}

function TextPop({ content }: { content: any }) {
  const text = content.text || (content.words ? content.words.join(' ') : '');
  return (
    <div className="text-center">
      {content.emoji && <span className="text-4xl mr-2">{content.emoji}</span>}
      <span
        className="text-2xl md:text-4xl font-bold"
        style={{ color: content.color || '#22D3EE' }}
      >
        {text}
      </span>
    </div>
  );
}

function NumberCount({ content }: { content: any }) {
  const [displayValue, setDisplayValue] = React.useState(content.from || 0);
  const targetValue = content.to || 100;
  const prefix = content.prefix || '';
  const suffix = content.suffix || '';

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = (targetValue - (content.from || 0)) / steps;
    let current = content.from || 0;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));
      if (step >= steps) { setDisplayValue(targetValue); clearInterval(interval); }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [targetValue, content.from]);

  return (
    <span
      className="text-4xl md:text-6xl font-black"
      style={{ color: content.color || '#22D3EE', textShadow: '0 0 30px currentColor' }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function TextHighlight({ content }: { content: any }) {
  return (
    <motion.div
      className="bg-yellow-400/20 border-2 border-yellow-400 rounded-lg px-6 py-3"
      animate={{
        boxShadow: ['0 0 20px rgba(250,204,21,0.3)', '0 0 40px rgba(250,204,21,0.5)', '0 0 20px rgba(250,204,21,0.3)'],
      }}
      transition={{ boxShadow: { repeat: Infinity, duration: 1 } }}
    >
      <span className="text-2xl font-bold text-yellow-400">{content.highlight}</span>
    </motion.div>
  );
}

function Highlight({ content }: { content: any }) {
  const side = content.side || 'center';
  return (
    <motion.div
      className={`absolute ${side === 'left' ? 'left-4' : side === 'right' ? 'right-4' : ''} top-1/2 -translate-y-1/2`}
      animate={
        content.pulse ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }
          : content.shake ? { x: [-5, 5, -5, 5, 0] }
          : content.glow ? { boxShadow: ['0 0 20px #22D3EE', '0 0 40px #22D3EE', '0 0 20px #22D3EE'] }
          : {}
      }
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <div className="w-4 h-4 bg-cyan-400 rounded-full" />
    </motion.div>
  );
}

function CardReveal({ content }: { content: any }) {
  return (
    <div className="bg-gray-800/90 border border-cyan-500/50 rounded-xl p-6 shadow-2xl">
      <span className="text-xl font-semibold text-white">{content.cardId || 'Card'}</span>
    </div>
  );
}

// ============================================================================
// LETTER REVEAL — FIXED (rotateY 3D flip)
// ============================================================================

function LetterReveal({ content }: { content: any }) {
  const index = content.index ?? 0;
  // 'text' field used in sandbox; fallback to char code
  const letter = content.text || content.letter || String.fromCharCode(65 + index);
  const accentColor = content.color || '#22D3EE';

  return (
    <div className="perspective-[800px]">
      <div
        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: accentColor,
          boxShadow: `0 0 40px ${accentColor}66`,
        }}
      >
        <span
          className="text-7xl md:text-8xl font-black leading-none"
          style={{ color: accentColor, textShadow: `0 0 40px ${accentColor}` }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// NEW TYPE: STAT — Métrica de Impacto com Label
// ============================================================================

function Stat({ content }: { content: any }) {
  const hasCountUp = content.from !== undefined && content.to !== undefined;
  const [displayValue, setDisplayValue] = React.useState(
    hasCountUp ? (content.from as number) : null
  );
  const prefix = content.prefix || '';
  const suffix = content.suffix || '';
  const accentColor = content.color || '#10B981';

  useEffect(() => {
    if (!hasCountUp) return;
    const from = content.from as number;
    const to = content.to as number;
    const duration = 1800;
    const steps = 72;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));
      if (step >= steps) { setDisplayValue(to); clearInterval(interval); }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [hasCountUp, content.from, content.to]);

  const displayStr = hasCountUp && displayValue !== null
    ? displayValue.toLocaleString('pt-BR')
    : String(content.value ?? '');

  return (
    <div className="text-center flex flex-col items-center gap-2">
      <motion.span
        className="text-5xl md:text-7xl font-black leading-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, #22D3EE)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 20px ${accentColor}88)`,
        }}
        animate={{
          filter: [
            `drop-shadow(0 0 20px ${accentColor}44)`,
            `drop-shadow(0 0 36px ${accentColor}aa)`,
            `drop-shadow(0 0 20px ${accentColor}44)`,
          ],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {prefix}{displayStr}{suffix}
      </motion.span>
      {content.label && (
        <span className="text-sm md:text-base font-medium text-white/70 tracking-wider uppercase">
          {content.label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// NEW TYPE: STEP — Passo Numerado Sequencial
// ============================================================================

function Step({ content }: { content: any }) {
  const num = content.stepNumber || 1;
  const text = content.text || '';
  const accentColor = content.color || '#22D3EE';

  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-4 max-w-md"
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}22`,
      }}
    >
      {/* Number bubble */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
          color: '#000',
          boxShadow: `0 0 20px ${accentColor}66`,
        }}
      >
        {num}
      </div>
      {/* Text */}
      <span className="text-white font-semibold text-base md:text-lg leading-snug">
        {text}
      </span>
    </div>
  );
}

// ============================================================================
// NEW TYPE: QUOTE — Citação Editorial de Impacto
// ============================================================================

function Quote({ content }: { content: any }) {
  const quoteText: string = content.quote || content.text || '';
  const author: string = content.author || '';
  const accentColor = content.color || '#818CF8';
  const words = quoteText.split(' ');

  return (
    <div
      className="max-w-lg px-8 py-6 rounded-r-xl"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: `0 4px 40px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Decorative quote mark */}
      <div
        className="text-8xl font-black leading-none mb-1 -mt-4 -ml-2"
        style={{ color: `${accentColor}55`, lineHeight: 1 }}
        aria-hidden
      >
        "
      </div>
      {/* Words with staggered typewriter reveal */}
      <p className="text-white text-lg md:text-2xl font-semibold leading-relaxed">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.3em]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
          >
            {word}
          </motion.span>
        ))}
      </p>
      {author && (
        <motion.p
          className="mt-4 text-sm font-medium tracking-widest uppercase"
          style={{ color: accentColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: words.length * 0.04 + 0.2 }}
        >
          — {author}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// NEW TYPE: PILL-TAG — Tag/Etiqueta Contextual
// ============================================================================

function PillTag({ content }: { content: any }) {
  const tag = content.tag || content.text || '';
  const accentColor = content.color || '#22D3EE';
  const showDot = content.dot !== false;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm md:text-base"
      style={{
        background: `${accentColor}18`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${accentColor}44`,
        boxShadow: `0 0 16px ${accentColor}22`,
      }}
    >
      {showDot && (
        <motion.span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentColor }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      <span style={{ color: accentColor }}>{tag}</span>
    </div>
  );
}

// ============================================================================
// NEW TYPE: COMPARISON-BAR — Barra de Comparação Visual
// ============================================================================

function AnimatedBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const target = Math.min(100, Math.max(0, value));
    animate(scope.current, { scaleX: target / 100 }, {
      duration: 0.9,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
  }, [value, delay]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/80 text-sm font-medium">{label}</span>
        <span className="font-bold text-sm" style={{ color }}>{value}%</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: `${color}22` }}>
        <motion.div
          ref={scope}
          className="h-full rounded-full origin-left"
          style={{
            backgroundColor: color,
            scaleX: 0,
            boxShadow: `0 0 10px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

function ComparisonBar({ content }: { content: any }) {
  const leftLabel = content.leftLabel || 'Antes';
  const rightLabel = content.rightLabel || 'Depois';
  const leftValue = content.leftValue ?? 30;
  const rightValue = content.rightValue ?? 80;
  const leftColor = content.leftColor || '#EF4444';
  const rightColor = content.rightColor || '#10B981';

  return (
    <div
      className="w-[340px] md:w-[420px] p-6 rounded-2xl flex flex-col gap-4"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      <AnimatedBar label={leftLabel} value={leftValue} color={leftColor} delay={0} />
      <AnimatedBar label={rightLabel} value={rightValue} color={rightColor} delay={0.3} />
    </div>
  );
}

// ============================================================================
// NEW TYPE: ALERT — Alerta Urgente com Shake Físico
// ============================================================================

function Alert({ content }: { content: any }) {
  const text = content.text || content.highlight || '';
  const icon = content.icon || '⚠️';

  return (
    <motion.div
      className="flex items-start gap-4 px-6 py-4 rounded-xl max-w-sm"
      style={{
        background: 'rgba(127, 29, 29, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid #EF4444',
      }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(239,68,68,0.3)',
          '0 0 40px rgba(239,68,68,0.6)',
          '0 0 20px rgba(239,68,68,0.3)',
        ],
      }}
      transition={{ boxShadow: { repeat: Infinity, duration: 1.2 } }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-label="alerta">{icon}</span>
      <span className="text-white font-semibold text-base md:text-lg leading-snug">{text}</span>
    </motion.div>
  );
}
