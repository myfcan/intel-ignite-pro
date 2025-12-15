// src/components/lessons/v7/CinematicActRenderer.tsx
// Renders individual cinematic acts with full visual layers, animations, and transitions

import { useEffect, useState, useMemo } from 'react';
import {
  CinematicAct,
  V7CinematicLesson,
  V7PlayerState,
  VisualLayer,
} from '@/types/v7-cinematic.types';
import { ComparativePlaygroundSplit } from './ComparativePlaygroundSplit';

interface CinematicActRendererProps {
  act: CinematicAct;
  currentTime: number;
  isTransitioning: boolean;
  transitionType: string | null;
  lesson: V7CinematicLesson;
  playerState: V7PlayerState;
}

export const CinematicActRenderer = ({
  act,
  currentTime,
  isTransitioning,
  transitionType,
  lesson,
  playerState,
}: CinematicActRendererProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const [layerStates, setLayerStates] = useState<Map<string, any>>(new Map());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Calculate time within current act
  const actTime = useMemo(() => {
    return currentTime - act.startTime;
  }, [currentTime, act.startTime]);

  // Determine which animations should be active
  useEffect(() => {
    const newActiveAnimations = new Set<string>();

    act.content.animations.forEach((animation) => {
      const animStart = (animation.delay || 0) / 1000;
      const animEnd = animStart + animation.duration / 1000;

      if (actTime >= animStart && actTime <= animEnd) {
        newActiveAnimations.add(animation.id);
      }
    });

    setActiveAnimations(newActiveAnimations);
  }, [actTime, act.content.animations]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBackground = () => {
    const bg = act.content.visual.background;
    if (!bg) return null;

    switch (bg.type) {
      case 'color':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: bg.value,
              opacity: bg.opacity || 1,
            }}
          />
        );

      case 'gradient':
        return (
          <div
            className="absolute inset-0"
            style={{
              background: bg.value,
              opacity: bg.opacity || 1,
            }}
          />
        );

      case 'image':
        return (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bg.value})`,
              opacity: bg.opacity || 1,
              filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
            }}
          />
        );

      case 'video':
        return (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={bg.value}
            autoPlay
            loop
            muted
            style={{
              opacity: bg.opacity || 1,
              filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
            }}
          />
        );

      default:
        return null;
    }
  };

  const renderLayer = (layer: VisualLayer) => {
    const isAnimating = layer.animation && activeAnimations.has(layer.id);

    const getAnimationClass = () => {
      if (!layer.animation || !isAnimating) return '';

      const animType = layer.animation.type;
      const duration = layer.animation.duration;
      const easing = layer.animation.easing || 'ease-in-out';

      return `animate-${animType}`;
    };

    const getLayerStyle = (): React.CSSProperties => {
      return {
        position: 'absolute',
        zIndex: layer.zIndex,
        left: layer.position.x,
        top: layer.position.y,
        width: layer.position.width,
        height: layer.position.height,
        transition: layer.animation
          ? `all ${layer.animation.duration}ms ${layer.animation.easing || 'ease-in-out'}`
          : undefined,
      };
    };

    switch (layer.type) {
      case 'text':
        return (
          <div
            key={layer.id}
            className={`layer-text ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            <div
              className="text-content"
              dangerouslySetInnerHTML={{ __html: layer.content }}
            />
          </div>
        );

      case 'image':
        return (
          <div
            key={layer.id}
            className={`layer-image ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            <img
              src={layer.content.url}
              alt={layer.content.alt || ''}
              className="w-full h-full object-contain"
            />
          </div>
        );

      case 'code':
        return (
          <div
            key={layer.id}
            className={`layer-code ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-full font-mono text-sm">
              <code>{layer.content.code}</code>
            </pre>
          </div>
        );

      case 'playground':
        return (
          <div
            key={layer.id}
            className={`layer-playground ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            {/* Placeholder for playground component */}
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <p className="text-white">Playground: {layer.content.playgroundId}</p>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div
            key={layer.id}
            className={`layer-comparison ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            <ComparativePlaygroundSplit
              comparisonData={layer.content}
              lesson={lesson}
              playerState={playerState}
            />
          </div>
        );

      case 'animation':
        return (
          <div
            key={layer.id}
            className={`layer-animation ${getAnimationClass()}`}
            style={getLayerStyle()}
          >
            {/* Custom animation rendering */}
            <div className="animation-content">{/* Animation goes here */}</div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderParticles = () => {
    if (!act.content.particles) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-50">
        {act.content.particles.map((particle) => (
          <div
            key={particle.id}
            className={`particle-effect particle-${particle.type}`}
          >
            {/* Particle rendering logic */}
          </div>
        ))}
      </div>
    );
  };

  const renderOverlay = () => {
    if (!act.content.overlay) return null;

    const overlay = act.content.overlay;
    const positionClasses = {
      top: 'top-8 left-0 right-0',
      bottom: 'bottom-8 left-0 right-0',
      center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      custom: '',
    };

    return (
      <div
        className={`absolute z-40 ${positionClasses[overlay.position]}`}
        style={overlay.style}
      >
        {overlay.type === 'subtitle' && (
          <div className="bg-black/70 backdrop-blur-sm text-white text-center px-6 py-3 mx-auto max-w-4xl rounded">
            <p className="text-lg">{overlay.content}</p>
          </div>
        )}

        {overlay.type === 'caption' && (
          <div className="text-white text-sm text-center px-4 py-2">
            <p className="opacity-80">{overlay.content}</p>
          </div>
        )}

        {overlay.type === 'tooltip' && (
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
            {overlay.content}
          </div>
        )}

        {overlay.type === 'notification' && (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {overlay.content}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // TRANSITION STYLES
  // ============================================================================

  const getTransitionClass = () => {
    if (!isTransitioning) return '';

    switch (transitionType) {
      case 'fade':
        return 'animate-fadeIn';
      case 'slide':
        return 'animate-slideInRight';
      case 'zoom':
        return 'animate-scaleIn';
      case 'dissolve':
        return 'animate-dissolve';
      default:
        return 'animate-fadeIn';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`cinematic-act-renderer absolute inset-0 ${getTransitionClass()}`}
      data-act-id={act.id}
      data-act-type={act.type}
    >
      {/* Background layer */}
      {renderBackground()}

      {/* Visual layers (sorted by zIndex) */}
      <div className="relative w-full h-full">
        {act.content.visual.layers
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((layer) => renderLayer(layer))}
      </div>

      {/* Particle effects */}
      {renderParticles()}

      {/* Overlay content (subtitles, captions, etc.) */}
      {renderOverlay()}

      {/* Act type indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Act: {act.type} | Time: {actTime.toFixed(2)}s
        </div>
      )}
    </div>
  );
};
