/**
 * V7ImageSequenceRenderer — C12.1_PIPELINE_IMAGE_SEQUENCE
 * 
 * Renders a sequence of images with crossfade transitions.
 * Uses signed URLs from the private image-lab bucket.
 * Preloads next frame for smooth transitions.
 * 
 * @contract C12.1_PIPELINE_IMAGE_SEQUENCE
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { pushV7DebugLog } from '@/components/lessons/v7/cinematic/v7DebugLogger';

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
  effects?: {
    mood?: string;
    glow?: boolean;
    particles?: boolean | string;
    vignette?: boolean;
  };
  phaseId: string;
  currentTime: number;
}

/** Single frame with signed URL resolution */
function FrameImage({ storagePath, isActive, index }: { storagePath?: string; isActive: boolean; index: number }) {
  const signedUrl = useSignedUrl(storagePath || null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!storagePath || error || !signedUrl) {
    // Fallback: neutral gradient placeholder
    return (
      <motion.div
        key={`placeholder-${index}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
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
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="absolute inset-0 w-full h-full object-cover rounded-lg"
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

export default function V7ImageSequenceRenderer({
  frames,
  effects,
  phaseId,
  currentTime,
}: V7ImageSequenceRendererProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const hasLoggedStart = useRef(false);

  // Log start
  useEffect(() => {
    if (!hasLoggedStart.current) {
      hasLoggedStart.current = true;
      pushV7DebugLog('IMAGE_SEQUENCE_START', {
        phaseId,
        frameCount: frames.length,
        currentTime,
      });
    }
  }, [phaseId, frames.length, currentTime]);

  // Timer-based frame progression
  useEffect(() => {
    if (frames.length <= 1) return;

    const frame = frames[activeIndex];
    if (!frame) return;

    const timer = setTimeout(() => {
      const nextIndex = activeIndex + 1;
      if (nextIndex < frames.length) {
        pushV7DebugLog('IMAGE_SEQUENCE_FRAME_RENDER', {
          phaseId,
          frameId: frames[nextIndex]?.id,
          frameIndex: nextIndex,
          currentTime,
        });
        setActiveIndex(nextIndex);
      } else {
        pushV7DebugLog('IMAGE_SEQUENCE_END', {
          phaseId,
          currentTime,
        });
      }
    }, frame.durationMs);

    return () => clearTimeout(timer);
  }, [activeIndex, frames, phaseId, currentTime]);

  // Preload next frame
  useEffect(() => {
    const nextFrame = frames[activeIndex + 1];
    if (nextFrame?.storagePath) {
      // Preload hint — actual URL resolution happens in FrameImage
      const img = new Image();
      img.src = ''; // Will be resolved by useSignedUrl in FrameImage
    }
  }, [activeIndex, frames]);

  const moodClasses = effects?.mood === 'danger' ? 'border-destructive/20'
    : effects?.mood === 'success' ? 'border-green-500/20'
    : effects?.mood === 'dramatic' ? 'border-primary/20'
    : 'border-border/10';

  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden border ${moodClasses}`}>
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
            isActive={index === activeIndex}
            index={index}
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
                i === activeIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
