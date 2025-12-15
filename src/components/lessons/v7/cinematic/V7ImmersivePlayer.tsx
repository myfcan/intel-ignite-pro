import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { V7MinimalTimeline } from "./V7MinimalTimeline";
import { V7AudioIndicator } from "./V7AudioIndicator";
import { V7DiscreteNavigation } from "./V7DiscreteNavigation";
import { OptimizedParticlesBackground } from "../OptimizedParticlesBackground";

interface V7Act {
  id: string;
  type: "dramatic" | "comparison" | "interaction" | "result" | "playground";
  content: ReactNode;
  autoAdvanceMs?: number; // Auto-advance after X milliseconds
}

interface V7ImmersivePlayerProps {
  acts: V7Act[];
  totalDuration?: string;
  onComplete?: () => void;
  onActChange?: (actIndex: number) => void;
  isAudioPlaying?: boolean;
}

export const V7ImmersivePlayer = ({
  acts,
  totalDuration = "8:00",
  onComplete,
  onActChange,
  isAudioPlaying = false
}: V7ImmersivePlayerProps) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");

  const totalActs = acts.length;
  const currentAct = acts[currentActIndex];

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setCurrentTimeStr(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-advance logic
  useEffect(() => {
    if (currentAct?.autoAdvanceMs && currentActIndex < totalActs - 1) {
      const timer = setTimeout(() => {
        goToNext();
      }, currentAct.autoAdvanceMs);

      return () => clearTimeout(timer);
    }
  }, [currentActIndex, currentAct]);

  // Notify parent of act changes
  useEffect(() => {
    onActChange?.(currentActIndex);
  }, [currentActIndex, onActChange]);

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
      if (e.key === " ") e.preventDefault(); // Prevent scroll
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  return (
    <div 
      className="w-full h-screen relative overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)" 
      }}
    >
      {/* Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <OptimizedParticlesBackground />
      </div>

      {/* Timeline */}
      <V7MinimalTimeline
        currentAct={currentActIndex + 1}
        totalActs={totalActs}
        currentTime={currentTimeStr}
        totalTime={totalDuration}
      />

      {/* Audio Indicator */}
      <V7AudioIndicator isPlaying={isAudioPlaying} />

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
      <V7DiscreteNavigation
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSkip={skipToPlayground}
        canGoPrevious={currentActIndex > 0}
        canGoNext={currentActIndex < totalActs - 1}
        showSkip={currentActIndex < totalActs - 1}
      />
    </div>
  );
};
