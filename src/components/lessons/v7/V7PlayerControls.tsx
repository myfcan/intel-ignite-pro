// src/components/lessons/v7/V7PlayerControls.tsx
// Player control interface for V7 Cinematic Player

import { useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface V7PlayerControlsProps {
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  onPlay: () => void;
  onPause: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
}

export const V7PlayerControls = ({
  isPlaying,
  volume,
  playbackRate,
  onPlay,
  onPause,
  onVolumeChange,
  onPlaybackRateChange,
}: V7PlayerControlsProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [isPlaying, onPlay, onPause]);

  const handleVolumeChange = useCallback(
    (newVolume: number[]) => {
      const vol = newVolume[0];
      onVolumeChange(vol);
      setIsMuted(vol === 0);
    },
    [onVolumeChange]
  );

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume, onVolumeChange]);

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      onPlaybackRateChange(rate);
    },
    [onPlaybackRateChange]
  );

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  // Note: These would be better implemented in the parent component
  // with a global keyboard event listener

  // ============================================================================
  // RENDER
  // ============================================================================

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="v7-player-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/70 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10 text-white h-12 w-12"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" fill="white" />
          ) : (
            <Play className="h-6 w-6" fill="white" />
          )}
        </Button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleMuteToggle}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/10 text-white h-10 w-10"
            onMouseEnter={() => setShowVolumeSlider(true)}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          {/* Volume Slider - shows on hover */}
          {showVolumeSlider && (
            <div
              className="volume-slider-container relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="bg-black/80 rounded-full px-4 py-2 flex items-center gap-2">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-24"
                />
                <span className="text-white text-xs w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Playback Rate - Visible Buttons */}
        <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
          <Settings className="h-4 w-4 text-gray-400 mr-1" />
          {playbackRates.map((rate) => (
            <Button
              key={rate}
              onClick={() => handlePlaybackRateChange(rate)}
              variant="ghost"
              size="sm"
              className={`rounded-full h-8 min-w-[40px] px-2 text-xs font-medium transition-all ${
                playbackRate === rate
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {rate}x
            </Button>
          ))}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="hidden lg:flex items-center gap-2 ml-2 text-gray-400 text-xs">
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Space</kbd>
          <span>Play/Pause</span>
        </div>
      </div>

      {/* Keyboard shortcuts overlay (optional) */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <p>Atalhos: Space (Play/Pause) | ← → (Retroceder/Avançar) | ↑ ↓ (Volume)</p>
      </div>
    </div>
  );
};
