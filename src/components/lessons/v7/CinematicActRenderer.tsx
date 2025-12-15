// src/components/lessons/v7/CinematicActRenderer.tsx
// Renders individual cinematic acts with full visual layers, animations, and transitions

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CinematicAct,
  V7CinematicLesson,
  V7PlayerState,
  VisualLayer,
} from '@/types/v7-cinematic.types';
import { ComparativePlaygroundSplit } from './ComparativePlaygroundSplit';
import { V7CameraEffects, CameraEffect, CameraPresets } from './V7CameraEffects';

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
  const [cameraEffect, setCameraEffect] = useState<CameraEffect>({ type: 'none', duration: 0 });

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

  // Determine camera effect based on act type and timing
  useEffect(() => {
    // Apply camera effects based on act type
    if (actTime < 0.5) {
      // Entry effect
      switch (act.type) {
        case 'narrative':
          setCameraEffect(CameraPresets.kenBurns);
          break;
        case 'revelation':
          setCameraEffect(CameraPresets.dramaticZoomIn);
          break;
        case 'challenge':
          setCameraEffect(CameraPresets.subtleFocus);
          break;
        case 'interactive':
          setCameraEffect({ type: 'zoom-in', duration: 1, intensity: 0.2 });
          break;
        case 'outro':
          setCameraEffect(CameraPresets.dollyReveal);
          break;
        default:
          setCameraEffect({ type: 'none', duration: 0 });
      }
    }
  }, [act.type, act.id]); // Reset on act change

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
        // Check if content is HTML or plain text
        const isHTML = typeof layer.content === 'string' && layer.content.includes('<');
        const textStyle = {
          ...getLayerStyle(),
          ...(layer.style || {}),
        };
        
        return (
          <div
            key={layer.id}
            className={`layer-text ${getAnimationClass()}`}
            style={textStyle}
          >
            {isHTML ? (
              <div
                className="text-content"
                dangerouslySetInnerHTML={{ __html: layer.content }}
              />
            ) : (
              <div className="text-content" style={layer.style}>
                {layer.content}
              </div>
            )}
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

  // Framer Motion variants for act transitions
  const actVariants = {
    initial: { 
      opacity: 0, 
      scale: transitionType === 'zoom' ? 0.9 : 1,
      x: transitionType === 'slide' ? 100 : 0,
      filter: transitionType === 'dissolve' ? 'blur(10px)' : 'blur(0px)',
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      }
    },
    exit: { 
      opacity: 0, 
      scale: transitionType === 'zoom' ? 1.1 : 1,
      x: transitionType === 'slide' ? -100 : 0,
      filter: transitionType === 'dissolve' ? 'blur(10px)' : 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const,
      }
    },
  };

  return (
    <motion.div
      key={act.id}
      variants={actVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="cinematic-act-renderer absolute inset-0"
      data-act-id={act.id}
      data-act-type={act.type}
    >
      <V7CameraEffects
        effect={cameraEffect}
        isActive={!isTransitioning}
        className="absolute inset-0"
      >
        {/* Background layer */}
        {renderBackground()}

        {/* Visual layers - render directly without extra wrapper */}
        {act.content.visual.layers
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((layer, index) => (
            <motion.div
              key={layer.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1, 
                transition: { 
                  delay: index * 0.1, 
                  duration: 0.5,
                  ease: 'easeOut'
                }
              }}
            >
              {renderLayer(layer)}
            </motion.div>
          ))}

        {/* Particle effects */}
        {renderParticles()}

        {/* Overlay content (subtitles, captions, etc.) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
        >
          {renderOverlay()}
        </motion.div>
      </V7CameraEffects>

      {/* Act type indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Act: {act.type} | Time: {actTime.toFixed(2)}s | Camera: {cameraEffect.type}
        </div>
      )}
    </motion.div>
  );
};
