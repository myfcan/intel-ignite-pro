import React from 'react';
import type { V10IntroSlide } from '../../../../types/v10.types';

interface IntroSlideProps {
  slide: V10IntroSlide;
  isActive: boolean;
}

/**
 * IntroSlide — Individual intro/context slide for Part A.
 * Hidden when not active using display:none/flex pattern (NO position:absolute).
 */
const ICON_FALLBACK: Record<string, string> = {
  Wrench: '🔧', BookOpen: '📖', Rocket: '🚀', Calendar: '📅',
  Brain: '🧠', Zap: '⚡', Settings: '⚙️', Target: '🎯',
  Globe: '🌐', Shield: '🛡️', MessageSquare: '💬', Image: '🖼️',
  Video: '🎬', Code: '💻', Search: '🔍', Users: '👥',
};

export const IntroSlide: React.FC<IntroSlideProps> = ({ slide, isActive }) => {
  const gradientStyle = slide.tool_color
    ? { background: `linear-gradient(135deg, ${slide.tool_color}, ${adjustColor(slide.tool_color, 30)})` }
    : { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' };

  const displayIcon = slide.icon ? (ICON_FALLBACK[slide.icon] || slide.icon) : null;

  return (
    <div
      style={{ display: isActive ? 'flex' : 'none' }}
      className="flex-col items-center justify-center w-full px-4 py-6 text-center animate-fade-in"
    >
      {/* Label badge */}
      {slide.label && (
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-white/10 text-indigo-300">
          {slide.label}
        </span>
      )}

      {/* Visual card with gradient */}
      <div
        className="w-full max-w-[340px] rounded-2xl p-6 mb-6 shadow-lg"
        style={gradientStyle}
      >
        {/* Emoji icon */}
        {displayIcon && (
          <div className="text-4xl mb-3" role="img" aria-label={slide.tool_name || 'icon'}>
            {displayIcon}
          </div>
        )}

        {/* Tool name */}
        {slide.tool_name && (
          <h3 className="text-lg font-bold text-white mb-1">
            {slide.tool_name}
          </h3>
        )}

        {/* Description */}
        {slide.description && (
          <p className="text-sm text-white/80 leading-relaxed">
            {slide.description}
          </p>
        )}
      </div>

      {/* Title */}
      {slide.title && (
        <h2 className="text-xl font-bold text-white mb-2 leading-tight max-w-[340px]">
          {slide.title}
        </h2>
      )}

      {/* Subtitle */}
      {slide.subtitle && (
        <p className="text-sm text-white/60 leading-relaxed max-w-[300px]">
          {slide.subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * Shift a hex color's lightness for gradient variation.
 */
function adjustColor(hex: string, amount: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
