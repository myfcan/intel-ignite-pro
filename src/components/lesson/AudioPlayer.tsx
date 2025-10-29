import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export const AudioPlayer = ({ audioUrl, onPlay, onPause }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      onPause?.();
    } else {
      audio.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full p-4 bg-primary/5 rounded-lg border-2 border-primary/10 space-y-3">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlay}
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleMute}
            size="icon"
            variant="ghost"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          <div className="w-20 hidden md:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
            />
          </div>

          <Button
            onClick={changePlaybackRate}
            size="sm"
            variant="outline"
            className="text-xs font-mono"
          >
            {playbackRate}x
          </Button>
        </div>
      </div>
    </div>
  );
};