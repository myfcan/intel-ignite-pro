// src/components/lessons/v7/V7PlayerControls.tsx
// Player control interface for V7 Cinematic Player with separate volume controls

import { useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Mic, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface VolumeSettings {
  master: number;
  narration: number;
  music: number;
  effects: number;
}

interface V7PlayerControlsProps {
  isPlaying: boolean;
  volume: number;
  volumeSettings?: VolumeSettings;
  playbackRate: number;
  hasBackgroundMusic?: boolean;
  hasSoundEffects?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onVolumeChange: (volume: number) => void;
  onVolumeSettingsChange?: (settings: VolumeSettings) => void;
  onPlaybackRateChange: (rate: number) => void;
}

export const V7PlayerControls = ({
  isPlaying,
  volume,
  volumeSettings = { master: 1, narration: 1, music: 0.3, effects: 1 },
  playbackRate,
  hasBackgroundMusic = false,
  hasSoundEffects = false,
  onPlay,
  onPause,
  onVolumeChange,
  onVolumeSettingsChange,
  onPlaybackRateChange,
}: V7PlayerControlsProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const [showVolumePanel, setShowVolumePanel] = useState(false);
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

  const handleMasterVolumeChange = useCallback(
    (newVolume: number[]) => {
      const vol = newVolume[0];
      onVolumeChange(vol);
      setIsMuted(vol === 0);
      
      if (onVolumeSettingsChange) {
        onVolumeSettingsChange({ ...volumeSettings, master: vol });
      }
    },
    [onVolumeChange, onVolumeSettingsChange, volumeSettings]
  );

  const handleChannelVolumeChange = useCallback(
    (channel: 'narration' | 'music' | 'effects', value: number[]) => {
      if (onVolumeSettingsChange) {
        onVolumeSettingsChange({ ...volumeSettings, [channel]: value[0] });
      }
    },
    [onVolumeSettingsChange, volumeSettings]
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
  // RENDER
  // ============================================================================

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="v7-player-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/70 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 shadow-2xl">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10 text-white h-10 w-10 sm:h-12 sm:w-12"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 sm:h-6 sm:w-6" fill="white" />
          ) : (
            <Play className="h-5 w-5 sm:h-6 sm:w-6" fill="white" />
          )}
        </Button>

        {/* Volume Controls with Popover */}
        <Popover open={showVolumePanel} onOpenChange={setShowVolumePanel}>
          <PopoverTrigger asChild>
            <Button
              onClick={handleMuteToggle}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10 text-white h-9 w-9 sm:h-10 sm:w-10"
              onContextMenu={(e) => {
                e.preventDefault();
                setShowVolumePanel(true);
              }}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 bg-gray-900/95 backdrop-blur-lg border-gray-700 p-4"
            side="top"
            align="start"
          >
            <div className="space-y-4">
              <h4 className="text-white text-sm font-medium mb-3">Controles de Áudio</h4>
              
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-white" />
                    <span className="text-white text-xs">Master</span>
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">
                    {Math.round(volumeSettings.master * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volumeSettings.master]}
                  onValueChange={handleMasterVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Narration Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-400" />
                    <span className="text-white text-xs">Narração</span>
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">
                    {Math.round(volumeSettings.narration * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volumeSettings.narration]}
                  onValueChange={(v) => handleChannelVolumeChange('narration', v)}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Music Volume */}
              <div className={`space-y-2 ${!hasBackgroundMusic ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-400" />
                    <span className="text-white text-xs">Música</span>
                    {!hasBackgroundMusic && (
                      <span className="text-gray-500 text-xs">(não disponível)</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">
                    {Math.round(volumeSettings.music * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volumeSettings.music]}
                  onValueChange={(v) => handleChannelVolumeChange('music', v)}
                  max={1}
                  step={0.01}
                  className="w-full"
                  disabled={!hasBackgroundMusic}
                />
              </div>

              {/* Sound Effects Volume */}
              <div className={`space-y-2 ${!hasSoundEffects ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-white text-xs">Efeitos</span>
                    {!hasSoundEffects && (
                      <span className="text-gray-500 text-xs">(não disponível)</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">
                    {Math.round(volumeSettings.effects * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volumeSettings.effects]}
                  onValueChange={(v) => handleChannelVolumeChange('effects', v)}
                  max={1}
                  step={0.01}
                  className="w-full"
                  disabled={!hasSoundEffects}
                />
              </div>

              {/* Quick tip */}
              <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-700">
                Clique no ícone para mutar. Clique novamente para abrir este painel.
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Playback Rate - Visible Buttons */}
        <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
          {playbackRates.map((rate) => (
            <Button
              key={rate}
              onClick={() => handlePlaybackRateChange(rate)}
              variant="ghost"
              size="sm"
              className={`rounded-full h-7 sm:h-8 min-w-[32px] sm:min-w-[40px] px-1.5 sm:px-2 text-xs font-medium transition-all ${
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
