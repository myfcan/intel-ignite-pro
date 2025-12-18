// V7AudioControls - Minimal, modern audio controls
// Clean design that doesn't interfere with content

import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface V7AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: string;
  duration: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  isVisible?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export const V7AudioControls = ({
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  isVisible = true,
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true
}: V7AudioControlsProps) => {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Minimal pill-shaped control bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
        {/* Navigation - Previous */}
        {onPrevious && (
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
              ${canGoPrevious
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-white/20 cursor-not-allowed'
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Play/Pause Button - Main action */}
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                     hover:bg-white/20 transition-all duration-200 group"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Navigation - Next */}
        {onNext && (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
              ${canGoNext
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-white/20 cursor-not-allowed'
              }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Volume */}
        <div className="flex items-center gap-1 group">
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Volume Slider - appears on hover */}
          <div className="w-0 overflow-hidden group-hover:w-16 transition-all duration-200">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-2.5
                         [&::-webkit-slider-thumb]:h-2.5
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white
                         [&::-webkit-slider-thumb]:shadow-sm"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Time Display - Minimal */}
        <div className="text-xs text-white/40 font-mono tabular-nums min-w-[70px] text-center">
          {currentTime} / {duration}
        </div>
      </div>
    </motion.div>
  );
};
