// src/components/lessons/v7/V7PerformanceOverlay.tsx
// Development overlay showing performance metrics

import { memo } from 'react';

interface V7PerformanceOverlayProps {
  fps: number;
  loadingTime: number;
  audioLoadTime: number;
  frameDrops: number;
  isLowPerformance: boolean;
  audioProgress: number;
  show?: boolean;
}

export const V7PerformanceOverlay = memo(({
  fps,
  loadingTime,
  audioLoadTime,
  frameDrops,
  isLowPerformance,
  audioProgress,
  show = false,
}: V7PerformanceOverlayProps) => {
  if (!show && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getFPSColor = () => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-2 right-2 z-[100] bg-black/80 text-white text-xs p-3 rounded-lg font-mono backdrop-blur-sm border border-white/10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">FPS:</span>
          <span className={getFPSColor()}>{fps}</span>
          {isLowPerformance && (
            <span className="text-red-400 text-[10px]">⚠️ LOW</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Load:</span>
          <span className={loadingTime < 3000 ? 'text-green-400' : 'text-yellow-400'}>
            {(loadingTime / 1000).toFixed(2)}s
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Audio:</span>
          <span>{(audioLoadTime / 1000).toFixed(2)}s</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Preload:</span>
          <span className={audioProgress >= 100 ? 'text-green-400' : 'text-blue-400'}>
            {audioProgress.toFixed(0)}%
          </span>
        </div>
        
        {frameDrops > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Drops:</span>
            <span className="text-orange-400">{frameDrops}</span>
          </div>
        )}
      </div>
    </div>
  );
});

V7PerformanceOverlay.displayName = 'V7PerformanceOverlay';
