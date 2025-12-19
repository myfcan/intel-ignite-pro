// useKeywordSync - Pause/Resume audio based on keywords in wordTimestamps
// This replaces the timing-based auto-pause system with keyword detection

import { useEffect, useRef, useCallback } from 'react';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface UseKeywordSyncProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  pauseKeywords?: string[];
  resumeKeywords?: string[];
  isPlaying: boolean;
  onPause: () => void;
  onResume: () => void;
  phaseId: string;
  enabled?: boolean;
}

interface KeywordSyncState {
  pausedForPhase: string | null;
  lastPauseTime: number;
  lastResumeTime: number;
}

export function useKeywordSync({
  wordTimestamps,
  currentTime,
  pauseKeywords = [],
  resumeKeywords = [],
  isPlaying,
  onPause,
  onResume,
  phaseId,
  enabled = true,
}: UseKeywordSyncProps) {
  const stateRef = useRef<KeywordSyncState>({
    pausedForPhase: null,
    lastPauseTime: -1,
    lastResumeTime: -1,
  });

  // Normalize word for comparison (lowercase, remove punctuation)
  const normalizeWord = useCallback((word: string): string => {
    return word.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  }, []);

  // Find if current time is within a keyword's time range
  const findKeywordAtTime = useCallback((keywords: string[], time: number): WordTimestamp | null => {
    if (keywords.length === 0 || wordTimestamps.length === 0) return null;

    const normalizedKeywords = keywords.map(k => normalizeWord(k));
    
    // Look for keywords in a small time window around current time
    // This accounts for slight timing differences
    const timeWindow = 0.5; // seconds
    
    for (const ts of wordTimestamps) {
      const normalizedWord = normalizeWord(ts.word);
      
      // Check if this word matches any keyword
      if (normalizedKeywords.some(kw => normalizedWord.includes(kw) || kw.includes(normalizedWord))) {
        // Check if we're within or just passed this word's time range
        if (time >= ts.start - timeWindow && time <= ts.end + timeWindow) {
          return ts;
        }
        // Also check if we just passed this word (within 1 second after)
        if (time > ts.end && time < ts.end + 1) {
          return ts;
        }
      }
    }
    
    return null;
  }, [wordTimestamps, normalizeWord]);

  // Monitor for pause keywords
  useEffect(() => {
    if (!enabled || pauseKeywords.length === 0 || !isPlaying) return;
    
    // Don't pause if we already paused for this phase
    if (stateRef.current.pausedForPhase === phaseId) return;

    const keyword = findKeywordAtTime(pauseKeywords, currentTime);
    
    if (keyword && currentTime > stateRef.current.lastPauseTime + 2) {
      console.log(`[useKeywordSync] 🔴 PAUSE keyword detected: "${keyword.word}" at ${currentTime.toFixed(1)}s (phase: ${phaseId})`);
      stateRef.current.pausedForPhase = phaseId;
      stateRef.current.lastPauseTime = currentTime;
      onPause();
    }
  }, [enabled, pauseKeywords, currentTime, isPlaying, phaseId, findKeywordAtTime, onPause]);

  // Reset when phase changes
  useEffect(() => {
    // If we were paused for a different phase, reset
    if (stateRef.current.pausedForPhase && stateRef.current.pausedForPhase !== phaseId) {
      console.log(`[useKeywordSync] Phase changed from ${stateRef.current.pausedForPhase} to ${phaseId} - resetting state`);
      stateRef.current.pausedForPhase = null;
    }
  }, [phaseId]);

  // Manual resume function (called by component when user completes interaction)
  const triggerResume = useCallback(() => {
    if (stateRef.current.pausedForPhase === phaseId) {
      console.log(`[useKeywordSync] 🟢 Manual resume triggered for phase: ${phaseId}`);
      stateRef.current.pausedForPhase = null;
      stateRef.current.lastResumeTime = currentTime;
      onResume();
    }
  }, [phaseId, currentTime, onResume]);

  // Check if we're currently paused by this hook
  const isPausedByKeyword = stateRef.current.pausedForPhase === phaseId;

  return {
    isPausedByKeyword,
    triggerResume,
  };
}
