// V7MinimalControls - Unified minimal player controls
// Single clean control bar with all essential functions
// Design: Floating pill at bottom center, no clutter

import { motion } from "framer-motion";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  X
} from "lucide-react";
import { 
  V7_SPACING, 
  V7_LAYERS, 
  V7_CLASSES,
  V7_TYPOGRAPHY 
} from "../v7-design-tokens";

interface V7MinimalControlsProps {
  // Playback state
  isPlaying: boolean;
  currentTime: string;
  duration: string;
  progress: number; // 0-1
  
  // Volume
  isMuted: boolean;
  volume: number;
  
  // Navigation
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentPhase: number;
  totalPhases: number;
  
  // Callbacks
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onExit?: () => void;
  onSeek?: (progress: number) => void;
  
  // Visibility & State
  isVisible?: boolean;
  isLocked?: boolean; // ✅ Bloqueia controles durante interação
  hidePlayPause?: boolean; // ✅ Esconde play/pause para evitar dessincronização
}

export const V7MinimalControls = ({
  isPlaying,
  currentTime,
  duration,
  progress,
  isMuted,
  volume,
  canGoPrevious,
  canGoNext,
  currentPhase,
  totalPhases,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onPrevious,
  onNext,
  onExit,
  onSeek,
  isVisible = true,
  isLocked = false,
  hidePlayPause = false
}: V7MinimalControlsProps) => {
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(Math.max(0, Math.min(1, percentage)));
  };

  return (
    <>
      {/* Exit Button - Top Left with safe area support */}
      {onExit && (
        <motion.button
          className={`absolute ${V7_CLASSES.exitButton}`}
          style={{
            top: V7_SPACING.positions.exitButton.top,
            left: V7_SPACING.positions.exitButton.left,
            zIndex: V7_LAYERS.exitButton,
          }}
          onClick={onExit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Sair da aula"
        >
          <X className="w-5 h-5" />
        </motion.button>
      )}

      {/* Unified Control Bar - Bottom Center - Safe area support for notch/gestures */}
      <motion.div
        className="fixed left-0 right-0 flex justify-center px-4"
        style={{
          bottom: V7_SPACING.positions.controlBar.bottom,
          paddingLeft: V7_SPACING.positions.controlBar.paddingX,
          paddingRight: V7_SPACING.positions.controlBar.paddingX,
          zIndex: V7_LAYERS.controls,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 30 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className={`w-full max-w-sm ${V7_CLASSES.controlBar}`}>
          {/* Progress Bar - THIN LINE at top of controls */}
          <div 
            className="relative h-1 bg-white/10 cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            {/* Progress Fill - MUST stay h-1, only fills width */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-3 py-2.5 gap-2">
            {/* Left: Time */}
            <div className="flex items-center gap-2 min-w-[80px]">
              <span className={`text-[11px] text-white/50 ${V7_TYPOGRAPHY.mono}`}>
                {currentTime}
              </span>
            </div>

            {/* Center: Main Controls */}
            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={canGoPrevious ? V7_CLASSES.buttonSecondary : `${V7_CLASSES.buttonSecondary} ${V7_CLASSES.buttonDisabled}`}
                aria-label="Seção anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play/Pause - Hidden in V7-vv to prevent desync */}
              {!hidePlayPause && (
                <button
                  onClick={onTogglePlay}
                  disabled={isLocked}
                  className={isLocked 
                    ? `${V7_CLASSES.buttonPrimary} bg-white/30 cursor-not-allowed`
                    : V7_CLASSES.buttonPrimary
                  }
                  aria-label={isLocked ? 'Aguardando interação' : isPlaying ? 'Pausar' : 'Reproduzir'}
                  title={isLocked ? 'Complete a interação para continuar' : undefined}
                >
                  {isPlaying ? (
                    <Pause className={`w-5 h-5 ${isLocked ? 'text-black/40' : 'text-black'}`} />
                  ) : (
                    <Play className={`w-5 h-5 ml-0.5 ${isLocked ? 'text-black/40' : 'text-black'}`} />
                  )}
                </button>
              )}

              {/* Next */}
              <button
                onClick={onNext}
                disabled={!canGoNext}
                className={canGoNext ? V7_CLASSES.buttonSecondary : `${V7_CLASSES.buttonSecondary} ${V7_CLASSES.buttonDisabled}`}
                aria-label="Próxima seção"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Volume + Duration */}
            <div className="flex items-center gap-2 min-w-[80px] justify-end">
              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={onToggleMute}
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                
                {/* Volume slider on hover */}
                <div className="w-0 overflow-hidden group-hover/vol:w-14 transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-2
                               [&::-webkit-slider-thumb]:h-2
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-cyan-400"
                    aria-label="Volume"
                  />
                </div>
              </div>
              
              {/* Duration */}
              <span className={`text-[11px] text-white/50 ${V7_TYPOGRAPHY.mono}`}>
                {duration}
              </span>
            </div>
          </div>

          {/* Phase Indicator - Subtle dots with cyan active */}
          <div className="flex items-center justify-center gap-1.5 pb-2">
            {Array.from({ length: totalPhases }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentPhase 
                    ? 'w-4 bg-cyan-400' 
                    : i < currentPhase 
                      ? 'w-1.5 bg-white/40' 
                      : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};
