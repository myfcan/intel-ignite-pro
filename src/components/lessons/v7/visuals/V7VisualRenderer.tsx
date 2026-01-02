/**
 * V7VisualRenderer - Renderiza o visual principal de uma fase
 *
 * Mapeia o tipo de visual para o componente correto.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { V7VisualContent, V7PhaseType } from '@/types/V7Contract';

interface V7VisualRendererProps {
  visual: V7VisualContent;
  effects?: Record<string, unknown>;
  phaseType: V7PhaseType;
}

export default function V7VisualRenderer({ visual, effects, phaseType }: V7VisualRendererProps) {
  const mood = effects?.mood as string || 'neutral';

  const moodColors = {
    danger: 'from-red-900/30 to-black',
    success: 'from-green-900/30 to-black',
    warning: 'from-yellow-900/30 to-black',
    dramatic: 'from-purple-900/30 to-black',
    mysterious: 'from-blue-900/30 to-black',
    neutral: 'from-gray-900/30 to-black',
  };

  const bgClass = moodColors[mood as keyof typeof moodColors] || moodColors.neutral;

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br ${bgClass}`}>
      {/* Render based on visual type */}
      {visual.type === 'number-reveal' && (
        <NumberReveal content={visual.content} effects={effects} />
      )}

      {visual.type === 'text-reveal' && (
        <TextReveal content={visual.content} effects={effects} />
      )}

      {visual.type === 'split-screen' && (
        <SplitScreen content={visual.content} effects={effects} />
      )}

      {visual.type === 'letter-reveal' && (
        <LetterReveal content={visual.content} effects={effects} />
      )}

      {visual.type === 'cards-reveal' && (
        <CardsReveal content={visual.content} effects={effects} />
      )}

      {visual.type === 'quiz' && (
        <QuizIntro content={visual.content} effects={effects} />
      )}

      {visual.type === 'playground' && (
        <PlaygroundIntro content={visual.content} effects={effects} />
      )}

      {visual.type === 'result' && (
        <Result content={visual.content} effects={effects} />
      )}

      {/* Particles effect */}
      {effects?.particles && effects.particles !== 'none' && (
        <ParticlesEffect type={effects.particles as string} />
      )}

      {/* Glow effect */}
      {effects?.glow && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 to-transparent" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISUAL COMPONENTS
// ============================================================================

function NumberReveal({ content, effects }: { content: any; effects?: any }) {
  const mood = effects?.mood || content?.mood || 'neutral';
  const numberColor = mood === 'danger' ? 'text-red-500' : mood === 'success' ? 'text-green-500' : 'text-cyan-400';

  // ✅ FIX: Support showSecondaryAsMain flag - quando true, mostra secondaryNumber como principal
  const mainNumber = content.showSecondaryAsMain && content.secondaryNumber 
    ? content.secondaryNumber 
    : content.number;
  
  const secondaryNumber = content.showSecondaryAsMain && content.secondaryNumber 
    ? content.number 
    : content.secondaryNumber;

  return (
    <div className="text-center px-8">
      {content.hookQuestion && (
        <motion.div
          className="text-2xl text-gray-400 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {content.hookQuestion}
        </motion.div>
      )}

      <motion.div
        className={`text-[120px] md:text-[180px] font-black ${numberColor}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{
          textShadow: `0 0 60px currentColor`,
        }}
      >
        {mainNumber}
      </motion.div>

      {secondaryNumber && (
        <motion.div
          className={`text-4xl md:text-6xl font-bold mt-2 ${
            content.showSecondaryAsMain ? 'text-cyan-400' : 'text-green-400'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {secondaryNumber}
        </motion.div>
      )}

      {content.subtitle && (
        <motion.div
          className="text-xl md:text-2xl text-gray-300 mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {content.subtitle}
        </motion.div>
      )}
    </div>
  );
}

function TextReveal({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8 max-w-4xl">
      {content.title && (
        <motion.div
          className="text-3xl md:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {content.title}
        </motion.div>
      )}

      {content.mainText && (
        <motion.div
          className="text-2xl md:text-4xl font-semibold text-gray-200 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {content.mainText}
        </motion.div>
      )}

      {content.items && (
        <div className="space-y-4">
          {content.items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              className="flex items-center gap-4 text-xl text-gray-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
            >
              {item.icon && <span className="text-2xl">{item.icon}</span>}
              <span>{typeof item === 'string' ? item : item.text}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SplitScreen({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* Left side */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center p-8 bg-red-900/20 border-r border-red-500/30"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-4xl mb-4">{content.left?.emoji || '😂'}</div>
        <div className="text-2xl font-bold text-red-400 mb-4">{content.left?.label}</div>
        <div className="space-y-2">
          {content.left?.items?.map((item: string, idx: number) => (
            <div key={idx} className="text-gray-400">{item}</div>
          ))}
        </div>
      </motion.div>

      {/* Right side */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center p-8 bg-green-900/20"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="text-4xl mb-4">{content.right?.emoji || '💰'}</div>
        <div className="text-2xl font-bold text-green-400 mb-4">{content.right?.label}</div>
        <div className="space-y-2">
          {content.right?.items?.map((item: string, idx: number) => (
            <div key={idx} className="text-gray-300">{item}</div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function LetterReveal({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8">
      <div className="flex justify-center gap-2 md:gap-4 mb-8">
        {content.letters?.map((letter: any, idx: number) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.3 }}
          >
            <div
              className="text-4xl md:text-6xl font-black text-cyan-400"
              style={{ textShadow: '0 0 20px currentColor' }}
            >
              {letter.letter}
            </div>
            <div className="text-sm md:text-base text-gray-400 mt-2">
              {letter.meaning}
            </div>
          </motion.div>
        ))}
      </div>

      {content.finalStamp && (
        <motion.div
          className="text-xl md:text-2xl font-bold text-white mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: content.letters?.length * 0.3 + 0.5 }}
        >
          {content.finalStamp}
        </motion.div>
      )}
    </div>
  );
}

function CardsReveal({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8">
      {content.title && (
        <motion.div
          className="text-2xl md:text-4xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {content.title}
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {content.cards?.map((card: any, idx: number) => (
          <motion.div
            key={card.id}
            className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6 min-w-[150px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
          >
            {card.icon && <div className="text-3xl mb-2">{card.icon}</div>}
            <div className="text-lg font-semibold text-white">{card.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function QuizIntro({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8">
      <motion.div
        className="text-4xl md:text-6xl mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      >
        🎯
      </motion.div>

      <motion.div
        className="text-2xl md:text-4xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {content.question || 'HORA DE TESTAR'}
      </motion.div>

      {content.subtitle && (
        <motion.div
          className="text-lg text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {content.subtitle}
        </motion.div>
      )}
    </div>
  );
}

function PlaygroundIntro({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8">
      <motion.div
        className="text-4xl md:text-6xl mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      >
        ⚔️
      </motion.div>

      <motion.div
        className="text-2xl md:text-4xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {content.title || 'DESAFIO PRÁTICO'}
      </motion.div>

      {content.subtitle && (
        <motion.div
          className="text-lg text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {content.subtitle}
        </motion.div>
      )}
    </div>
  );
}

function Result({ content, effects }: { content: any; effects?: any }) {
  return (
    <div className="text-center px-8">
      {content.emoji && (
        <motion.div
          className="text-6xl md:text-8xl mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' }}
        >
          {content.emoji}
        </motion.div>
      )}

      <motion.div
        className="text-3xl md:text-5xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {content.title}
      </motion.div>

      {content.message && (
        <motion.div
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {content.message}
        </motion.div>
      )}

      {content.metrics && (
        <div className="flex flex-wrap justify-center gap-6">
          {content.metrics.map((metric: any, idx: number) => (
            <motion.div
              key={idx}
              className={`bg-gray-800/50 rounded-xl p-4 ${metric.isHighlight ? 'border border-cyan-500' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
            >
              <div className="text-sm text-gray-400">{metric.label}</div>
              <div className={`text-2xl font-bold ${metric.isHighlight ? 'text-cyan-400' : 'text-white'}`}>
                {metric.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticlesEffect({ type }: { type: string }) {
  // Simplified particle effect - in production you'd use a proper particle system
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            type === 'confetti' ? 'bg-yellow-400' :
            type === 'sparks' ? 'bg-cyan-400' :
            type === 'ember' ? 'bg-orange-400' :
            'bg-white'
          }`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
            opacity: 1,
          }}
          animate={{
            y: -20,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
