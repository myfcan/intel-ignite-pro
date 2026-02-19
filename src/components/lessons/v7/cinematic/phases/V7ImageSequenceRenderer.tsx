/**
 * V7ImageSequenceRenderer — C12.1_PIPELINE_IMAGE_SEQUENCE
 * 
 * Controlled renderer for image sequences with crossfade transitions.
 * Supports two modes:
 *   - ANCHOR MODE: activeFrameIndex controlled externally by Player via onTrigger
 *   - TIMER FALLBACK: legacy mode using durationMs-based setTimeout (enableTimerFallback=true)
 * 
 * Supports two display modes:
 *   - fullscreen: object-cover, aspect-video (default)
 *   - mockup: device frame with object-contain, 65/35 grid on desktop
 * 
 * OVERLAY POLICY (C12.1):
 * MicroVisuals (z-50, fixed inset-0) anchor to viewport, NOT to this component.
 * In mockup mode, overlays may appear over the title column -- intentional.
 * The mockup frame (z-0) never obscures overlays.
 * 
 * @contract C12.1_PIPELINE_IMAGE_SEQUENCE
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { pushV7DebugLog } from '@/components/lessons/v7/cinematic/v7DebugLogger';

// ============= TYPES =============

interface ImageSequenceFrame {
  id: string;
  promptScene: string;
  durationMs: number;
  presetKey?: string;
  storagePath?: string;
  assetId?: string;
}

interface V7ImageSequenceRendererProps {
  frames: ImageSequenceFrame[];
  activeFrameIndex: number | null;       // controlled externally by Player (anchor mode)
  displayMode?: 'fullscreen' | 'mockup'; // default: 'fullscreen'
  enableTimerFallback?: boolean;         // true only for legacy (no triggers)
  fadeMs?: number;                       // default: 800
  effects?: {
    mood?: string;
    glow?: boolean;
    particles?: boolean | string;
    vignette?: boolean;
  };
  phaseId: string;
  currentTime: number;
  phaseTitle?: string;                   // for mockup desktop layout
}

// ============= PRELOAD HOOK =============

function usePreloadFrame(storagePath: string | null) {
  const signedUrl = useSignedUrl(storagePath);
  
  useEffect(() => {
    if (signedUrl) {
      const img = new Image();
      img.src = signedUrl;
    }
  }, [signedUrl]);
}

// ============= FRAME IMAGE =============

function FrameImage({ 
  storagePath, 
  isActive, 
  index, 
  fadeSeconds,
  objectFit 
}: { 
  storagePath?: string; 
  isActive: boolean; 
  index: number; 
  fadeSeconds: number;
  objectFit: 'object-cover' | 'object-contain';
}) {
  const signedUrl = useSignedUrl(storagePath || null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!storagePath || error || !signedUrl) {
    return (
      <motion.div
        key={`placeholder-${index}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeSeconds, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-br from-muted/40 via-background to-muted/60 flex items-center justify-center"
      >
        <div className="text-muted-foreground/40 text-sm">Frame {index + 1}</div>
      </motion.div>
    );
  }

  return (
    <motion.img
      key={`frame-${index}-${storagePath}`}
      src={signedUrl}
      alt={`Sequence frame ${index + 1}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeSeconds, ease: 'easeInOut' }}
      className={`absolute inset-0 w-full h-full ${objectFit} rounded-lg`}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setError(true);
        pushV7DebugLog('IMAGE_SEQUENCE_FALLBACK', {
          frameIndex: index,
          storagePath,
          currentTime: -1,
        });
      }}
      loading="eager"
    />
  );
}

// ============= MOCKUP FRAME =============

function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/95 rounded-2xl p-4 md:p-8 shadow-2xl">
      <div className="absolute top-3 left-4 flex gap-1.5 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      </div>
      <div className="w-full h-full mt-6 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ============= MAIN RENDERER =============

export default function V7ImageSequenceRenderer({
  frames,
  activeFrameIndex,
  displayMode = 'fullscreen',
  enableTimerFallback = false,
  fadeMs = 800,
  effects,
  phaseId,
  currentTime,
  phaseTitle,
}: V7ImageSequenceRendererProps) {
  // Timer fallback state (only used when activeFrameIndex === null && enableTimerFallback)
  const [timerIndex, setTimerIndex] = useState(0);
  const hasLoggedStart = useRef(false);
  const currentTimeRef = useRef(currentTime);
  const prevDisplayIndex = useRef(0);

  // Keep ref in sync without triggering re-renders
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Compute displayIndex
  const isAnchorMode = activeFrameIndex !== null;
  let displayIndex: number;
  
  if (isAnchorMode) {
    displayIndex = activeFrameIndex;
  } else if (enableTimerFallback) {
    displayIndex = timerIndex;
  } else {
    displayIndex = 0;
  }

  // Clamp to valid range
  displayIndex = Math.max(0, Math.min(displayIndex, frames.length - 1));

  // Log start once
  useEffect(() => {
    if (!hasLoggedStart.current) {
      hasLoggedStart.current = true;
      pushV7DebugLog('IMAGE_SEQUENCE_START', {
        phaseId,
        frameCount: frames.length,
        mode: isAnchorMode ? 'anchor' : 'timer',
        displayMode,
        currentTime,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId, frames.length]);

  // Log frame changes
  useEffect(() => {
    if (prevDisplayIndex.current !== displayIndex) {
      pushV7DebugLog('IMAGE_SEQUENCE_FRAME_RENDER', {
        phaseId,
        frameId: frames[displayIndex]?.id,
        fromIndex: prevDisplayIndex.current,
        toIndex: displayIndex,
        source: isAnchorMode ? 'anchor' : 'timer',
        currentTime: currentTimeRef.current,
      });
      prevDisplayIndex.current = displayIndex;
    }
  }, [displayIndex, phaseId, frames, isAnchorMode]);

  // Timer-based frame progression — ONLY active in timer fallback mode
  useEffect(() => {
    if (isAnchorMode) return; // anchor mode: Player controls frames
    if (!enableTimerFallback) return;
    if (frames.length <= 1) return;

    const frame = frames[timerIndex];
    if (!frame) return;

    const timer = setTimeout(() => {
      const nextIndex = timerIndex + 1;
      if (nextIndex < frames.length) {
        setTimerIndex(nextIndex);
      } else {
        pushV7DebugLog('IMAGE_SEQUENCE_END', {
          phaseId,
          currentTime: currentTimeRef.current,
        });
      }
    }, frame.durationMs);

    return () => clearTimeout(timer);
  }, [timerIndex, frames, phaseId, isAnchorMode, enableTimerFallback]);

  // Preload next frame
  const nextFramePath = frames[displayIndex + 1]?.storagePath || null;
  usePreloadFrame(nextFramePath);

  const fadeSeconds = fadeMs / 1000;
  const objectFit = displayMode === 'mockup' ? 'object-contain' as const : 'object-cover' as const;

  const moodClasses = effects?.mood === 'danger' ? 'border-destructive/20'
    : effects?.mood === 'success' ? 'border-green-500/20'
    : effects?.mood === 'dramatic' ? 'border-primary/20'
    : 'border-border/10';

  // ============= RENDER: Frame content (shared between fullscreen and mockup) =============

  const frameContent = (
    <>
      {/* Glow effect */}
      {effects?.glow && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none z-10" />
      )}

      {/* Vignette */}
      {effects?.vignette && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      )}

      {/* Frames with crossfade */}
      <AnimatePresence mode="sync">
        {frames.map((frame, index) => (
          <FrameImage
            key={frame.id || `frame-${index}`}
            storagePath={frame.storagePath}
            isActive={index === displayIndex}
            index={index}
            fadeSeconds={fadeSeconds}
            objectFit={objectFit}
          />
        ))}
      </AnimatePresence>

      {/* Frame indicator dots */}
      {frames.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {frames.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === displayIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );

  // ============= RENDER: Mockup layout =============

  if (displayMode === 'mockup') {
    return (
      <div className="relative z-0 w-full">
        {/* Desktop: 65/35 grid. Mobile: stacked */}
        <div className="flex flex-col lg:grid lg:grid-cols-[65%_35%] gap-4 w-full">
          {/* Left: Mockup frame with image */}
          <div className={`relative aspect-video rounded-lg overflow-hidden border ${moodClasses}`}>
            <MockupFrame>
              <div className="relative w-full h-full">
                {frameContent}
              </div>
            </MockupFrame>
          </div>

          {/* Right: Title area (desktop only, mobile title goes above) */}
          {phaseTitle && (
            <div className="flex items-center justify-center p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-foreground text-center lg:text-left">
                {phaseTitle}
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============= RENDER: Fullscreen layout (default) =============

  return (
    <div className={`relative z-0 w-full aspect-video rounded-lg overflow-hidden border ${moodClasses}`}>
      {frameContent}
    </div>
  );
}
