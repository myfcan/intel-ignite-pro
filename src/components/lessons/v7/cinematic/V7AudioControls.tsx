import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

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
  isVisible = true
}: V7AudioControlsProps) => {
  return (
    <motion.div
      className="absolute bottom-10 left-10 flex items-center gap-3 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md
                   border border-white/20 flex items-center justify-center
                   hover:bg-white/20 transition-all duration-300"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      {/* Volume Controls */}
      <div className="flex items-center gap-2 group">
        <button
          onClick={onToggleMute}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center
                     hover:bg-white/10 transition-all duration-300"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-white/70" />
          ) : (
            <Volume2 className="w-4 h-4 text-white/70" />
          )}
        </button>

        {/* Volume Slider - appears on hover */}
        <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-xs text-white/50 font-mono ml-2">
        {currentTime} / {duration}
      </div>
    </motion.div>
  );
};
