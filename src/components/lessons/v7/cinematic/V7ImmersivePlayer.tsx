import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { V7MinimalTimeline } from "./V7MinimalTimeline";
import { V7AudioIndicator } from "./V7AudioIndicator";
import { V7AudioControls } from "./V7AudioControls";
import { V7DiscreteNavigation } from "./V7DiscreteNavigation";
import { V7CinematicCanvas } from "./V7CinematicCanvas";
import { useV7CinematicAudio } from "./useV7CinematicAudio";
import { useV7SoundEffects } from "./useV7SoundEffects";
import { V7SynchronizedCaptions } from "../V7SynchronizedCaptions";

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7Act {
  id: string;
  type: "dramatic" | "comparison" | "interaction" | "result" | "playground";
  content: ReactNode;
  autoAdvanceMs?: number;
  audioUrl?: string;
}

interface V7ImmersivePlayerProps {
  acts: V7Act[];
  totalDuration?: string;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  onComplete?: () => void;
  onActChange?: (actIndex: number) => void;
}

export const V7ImmersivePlayer = ({
  acts,
  totalDuration = "8:00",
  audioUrl,
  wordTimestamps = [],
  onComplete,
  onActChange
}: V7ImmersivePlayerProps) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const totalActs = acts.length;
  const currentAct = acts[currentActIndex];

  // Sound effects hook
  const { playSound, unlockAudio } = useV7SoundEffects();

  // Audio hook
  const audio = useV7CinematicAudio({
    onEnded: () => {
      if (currentActIndex < totalActs - 1) {
        goToNext();
      } else {
        playSound('completion');
        onComplete?.();
      }
    }
  });

  // Load audio on mount
  useEffect(() => {
    if (audioUrl) {
      audio.loadAudio(audioUrl);
    }
  }, [audioUrl]);

  // Play sound effect on act change
  useEffect(() => {
    if (currentActIndex > 0) {
      playSound('transition-whoosh');
    }
  }, [currentActIndex]);

  // Unlock audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [unlockAudio]);

  // Auto-advance logic
  useEffect(() => {
    if (currentAct?.autoAdvanceMs && currentActIndex < totalActs - 1 && !audio.isPlaying) {
      const timer = setTimeout(() => {
        goToNext();
      }, currentAct.autoAdvanceMs);

      return () => clearTimeout(timer);
    }
  }, [currentActIndex, currentAct, audio.isPlaying]);

  // Notify parent of act changes
  useEffect(() => {
    onActChange?.(currentActIndex);
  }, [currentActIndex, onActChange]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const goToNext = useCallback(() => {
    if (currentActIndex < totalActs - 1) {
      playSound('transition-whoosh');
      setCurrentActIndex(prev => prev + 1);
    } else {
      playSound('completion');
      onComplete?.();
    }
  }, [currentActIndex, totalActs, onComplete, playSound]);

  const goToPrevious = useCallback(() => {
    if (currentActIndex > 0) {
      playSound('click-soft');
      setCurrentActIndex(prev => prev - 1);
    }
  }, [currentActIndex, playSound]);

  const skipToPlayground = useCallback(() => {
    const playgroundIndex = acts.findIndex(act => act.type === "playground");
    playSound('transition-dramatic');
    if (playgroundIndex !== -1) {
      setCurrentActIndex(playgroundIndex);
    } else {
      setCurrentActIndex(totalActs - 1);
    }
  }, [acts, totalActs, playSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === " ") {
        e.preventDefault();
        audio.togglePlayPause();
      }
      if (e.key === "m" || e.key === "M") {
        audio.toggleMute();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, audio]);

  // Map act type to canvas mood
  const getCanvasMood = (type: V7Act['type']): "dramatic" | "calm" | "energetic" | "mysterious" => {
    switch (type) {
      case 'dramatic': return 'dramatic';
      case 'comparison': return 'mysterious';
      case 'interaction': return 'energetic';
      case 'result': return 'energetic';
      case 'playground': return 'calm';
      default: return 'dramatic';
    }
  };

  return (
    <div 
      className="w-full h-screen relative overflow-hidden cursor-none"
      style={{ 
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)" 
      }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Cinematic Canvas Background */}
      <V7CinematicCanvas 
        mood={getCanvasMood(currentAct.type)}
        intensity={audio.isPlaying ? "high" : "medium"}
      />

      {/* Timeline */}
      <V7MinimalTimeline
        currentAct={currentActIndex + 1}
        totalActs={totalActs}
        currentTime={audio.formattedCurrentTime}
        totalTime={totalDuration}
        isVisible={showControls}
      />

      {/* Audio Indicator */}
      <V7AudioIndicator isPlaying={audio.isPlaying} />

      {/* Audio Controls */}
      {audioUrl && (
        <V7AudioControls
          isPlaying={audio.isPlaying}
          isMuted={audio.isMuted}
          volume={audio.volume}
          currentTime={audio.formattedCurrentTime}
          duration={audio.formattedDuration}
          onTogglePlay={audio.togglePlayPause}
          onToggleMute={audio.toggleMute}
          onVolumeChange={audio.setVolume}
          isVisible={showControls}
        />
      )}

      {/* Acts Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAct.id}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentAct.content}
        </motion.div>
      </AnimatePresence>

      {/* Word-Level Synchronized Captions */}
      {wordTimestamps.length > 0 && (
        <V7SynchronizedCaptions
          wordTimestamps={wordTimestamps}
          currentTime={audio.currentTime}
          isVisible={audio.isPlaying || audio.currentTime > 0}
          maxWords={15}
        />
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <V7DiscreteNavigation
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSkip={skipToPlayground}
          canGoPrevious={currentActIndex > 0}
          canGoNext={currentActIndex < totalActs - 1}
          showSkip={currentActIndex < totalActs - 1}
        />
      </motion.div>
    </div>
  );
};
