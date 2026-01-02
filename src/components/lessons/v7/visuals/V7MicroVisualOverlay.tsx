/**
 * V7MicroVisualOverlay - Renderiza micro-visuais como overlays
 *
 * Suporta todos os tipos de micro-visual do contrato:
 * - image-flash
 * - text-pop
 * - number-count
 * - text-highlight
 * - highlight
 * - card-reveal
 * - letter-reveal
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

function MicroVisualItem({ microVisual }: { microVisual: V7MicroVisual }) {
  const { type, content } = microVisual;

  // Position mapping
  const positionClasses = {
    center: 'inset-0 flex items-center justify-center',
    top: 'top-8 left-0 right-0 flex justify-center',
    bottom: 'bottom-8 left-0 right-0 flex justify-center',
    left: 'left-8 top-0 bottom-0 flex items-center',
    right: 'right-8 top-0 bottom-0 flex items-center',
  };

  const position = (content.position as keyof typeof positionClasses) || 'center';

  return (
    <motion.div
      className={`absolute ${positionClasses[position]}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {type === 'image-flash' && <ImageFlash content={content} />}
      {type === 'text-pop' && <TextPop content={content} />}
      {type === 'number-count' && <NumberCount content={content} />}
      {type === 'text-highlight' && <TextHighlight content={content} />}
      {type === 'highlight' && <Highlight content={content} />}
      {type === 'card-reveal' && <CardReveal content={content} />}
      {type === 'letter-reveal' && <LetterRevealMicro content={content} />}
    </motion.div>
  );
}

// ============================================================================
// MICRO-VISUAL COMPONENTS
// ============================================================================

function ImageFlash({ content }: { content: any }) {
  // Se não tiver imageUrl, não renderiza nada
  if (!content.imageUrl) return null;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, filter: 'brightness(2)' }}
      animate={{ opacity: 1, filter: 'brightness(1)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
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
    <motion.div
      className="text-center"
      initial={{ scale: 0, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {content.emoji && (
        <span className="text-4xl mr-2">{content.emoji}</span>
      )}
      <span
        className="text-2xl md:text-4xl font-bold"
        style={{ color: content.color || '#22D3EE' }}
      >
        {text}
      </span>
    </motion.div>
  );
}

function NumberCount({ content }: { content: any }) {
  const [displayValue, setDisplayValue] = React.useState(content.from || 0);
  const targetValue = content.to || 100;
  const prefix = content.prefix || '';
  const suffix = content.suffix || '';

  React.useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = (targetValue - (content.from || 0)) / steps;
    let current = content.from || 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        setDisplayValue(targetValue);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [targetValue, content.from]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span
        className="text-4xl md:text-6xl font-black"
        style={{
          color: content.color || '#22D3EE',
          textShadow: '0 0 30px currentColor',
        }}
      >
        {prefix}{displayValue.toLocaleString()}{suffix}
      </span>
    </motion.div>
  );
}

function TextHighlight({ content }: { content: any }) {
  return (
    <motion.div
      className="bg-yellow-400/20 border-2 border-yellow-400 rounded-lg px-6 py-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: ['0 0 20px rgba(250, 204, 21, 0.3)', '0 0 40px rgba(250, 204, 21, 0.5)', '0 0 20px rgba(250, 204, 21, 0.3)'],
      }}
      exit={{ opacity: 0 }}
      transition={{
        boxShadow: { repeat: Infinity, duration: 1 },
      }}
    >
      <span className="text-2xl font-bold text-yellow-400">
        {content.highlight}
      </span>
    </motion.div>
  );
}

function Highlight({ content }: { content: any }) {
  const side = content.side || 'center';

  return (
    <motion.div
      className={`absolute ${side === 'left' ? 'left-4' : side === 'right' ? 'right-4' : ''} top-1/2 -translate-y-1/2`}
      animate={
        content.pulse ? {
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        } : content.shake ? {
          x: [-5, 5, -5, 5, 0],
        } : content.glow ? {
          boxShadow: ['0 0 20px #22D3EE', '0 0 40px #22D3EE', '0 0 20px #22D3EE'],
        } : {}
      }
      transition={{
        repeat: Infinity,
        duration: 1,
      }}
    >
      <div className="w-4 h-4 bg-cyan-400 rounded-full" />
    </motion.div>
  );
}

function CardReveal({ content }: { content: any }) {
  return (
    <motion.div
      className="bg-gray-800/90 border border-cyan-500/50 rounded-xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <span className="text-xl font-semibold text-white">
        {content.cardId || 'Card'}
      </span>
    </motion.div>
  );
}

function LetterRevealMicro({ content }: { content: any }) {
  const index = content.index || 0;

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div
        className="text-6xl md:text-8xl font-black text-cyan-400"
        style={{ textShadow: '0 0 40px currentColor' }}
      >
        {String.fromCharCode(65 + index)}
      </div>
    </motion.div>
  );
}
