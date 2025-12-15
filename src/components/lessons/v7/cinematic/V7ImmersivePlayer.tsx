import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { V7MinimalTimeline } from "./V7MinimalTimeline";
import { V7AudioIndicator } from "./V7AudioIndicator";
import { V7AudioControls } from "./V7AudioControls";
import { V7DiscreteNavigation } from "./V7DiscreteNavigation";
import { OptimizedParticlesBackground } from "../OptimizedParticlesBackground";
import { useV7CinematicAudio } from "./useV7CinematicAudio";

interface V7Act {
  id: string;
  type: "dramatic" | "comparison" | "interaction" | "result" | "playground";
  content: ReactNode;
  autoAdvanceMs?: number;
  audioUrl?: string; // Audio URL for this act
}

interface V7ImmersivePlayerProps {
  acts: V7Act[];
  totalDuration?: string;
  audioUrl?: string; // Single audio URL for entire lesson
  onComplete?: () => void;
  onActChange?: (actIndex: number) => void;
}

export const V7ImmersivePlayer = ({
  acts,
  totalDuration = "8:00",
  audioUrl,
  onComplete,
  onActChange
}: V7ImmersivePlayerProps) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const totalActs = acts.length;
  const currentAct = acts[currentActIndex];

  // Audio hook
  const audio = useV7CinematicAudio({
    onEnded: () => {
      if (currentActIndex < totalActs - 1) {
        goToNext();
      } else {
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

  // Auto-advance logic (when no audio or audio not playing)
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
      setCurrentActIndex(prev => prev + 1);
    } else {
      onComplete?.();
    }
  }, [currentActIndex, totalActs, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentActIndex > 0) {
      setCurrentActIndex(prev => prev - 1);
    }
  }, [currentActIndex]);

  const skipToPlayground = useCallback(() => {
    const playgroundIndex = acts.findIndex(act => act.type === "playground");
    if (playgroundIndex !== -1) {
      setCurrentActIndex(playgroundIndex);
    } else {
      setCurrentActIndex(totalActs - 1);
    }
  }, [acts, totalActs]);

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

  return (
    <div 
      className="w-full h-screen relative overflow-hidden cursor-none"
      style={{ 
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)" 
      }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <OptimizedParticlesBackground />
      </div>

      {/* Timeline */}
      <V7MinimalTimeline
        currentAct={currentActIndex + 1}
        totalActs={totalActs}
        currentTime={audio.formattedCurrentTime}
        totalTime={totalDuration}
        isVisible={showControls}
      />

      {/* Audio Indicator (animated bars when playing) */}
      <V7AudioIndicator isPlaying={audio.isPlaying} />

      {/* Audio Controls (play/pause, volume) */}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {currentAct.content}
        </motion.div>
      </AnimatePresence>

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
