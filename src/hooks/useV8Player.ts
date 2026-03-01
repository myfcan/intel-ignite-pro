import { useState, useCallback, useMemo } from "react";
import { V8LessonData, V8PlayerState, V8InlineQuiz, V8InlinePlayground } from "@/types/v8Lesson";

/**
 * useV8Player — State machine for V8 lesson navigation.
 *
 * Builds a flat timeline of items (sections + inline quizzes + playgrounds sorted by position)
 * and manages phase transitions: mode-select → content → exercises → completion.
 *
 * V8 uses vertical scroll — currentIndex tracks the most-advanced section seen (for progress),
 * not which section is rendered (all are rendered).
 */

export type TimelineItem =
  | { type: "section"; index: number }
  | { type: "playground"; playground: V8InlinePlayground }
  | { type: "quiz"; quiz: V8InlineQuiz };

export const useV8Player = (lessonData: V8LessonData) => {
  const [state, setState] = useState<V8PlayerState>({
    currentIndex: 0,
    mode: "read",
    isPlaying: false,
    playbackSpeed: 1,
    phase: "mode-select",
    scores: [],
  });

  // Which timeline item is allowed to autoplay audio (listen mode)
  const [activeAudioIndex, setActiveAudioIndex] = useState(0);

  const advanceAudio = useCallback(() => {
    setActiveAudioIndex((prev) => prev + 1);
  }, []);

  // Build flat timeline: sections interleaved with playgrounds + quizzes
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const quizMap = new Map<number, V8InlineQuiz[]>();
    const playgroundMap = new Map<number, V8InlinePlayground[]>();

    for (const quiz of lessonData.inlineQuizzes) {
      const existing = quizMap.get(quiz.afterSectionIndex) || [];
      existing.push(quiz);
      quizMap.set(quiz.afterSectionIndex, existing);
    }

    for (const pg of (lessonData.inlinePlaygrounds || [])) {
      const existing = playgroundMap.get(pg.afterSectionIndex) || [];
      existing.push(pg);
      playgroundMap.set(pg.afterSectionIndex, existing);
    }

    for (let i = 0; i < lessonData.sections.length; i++) {
      items.push({ type: "section", index: i });

      const playgrounds = playgroundMap.get(i);
      if (playgrounds) {
        for (const pg of playgrounds) {
          items.push({ type: "playground", playground: pg });
        }
      }

      const quizzes = quizMap.get(i);
      if (quizzes) {
        for (const quiz of quizzes) {
          items.push({ type: "quiz", quiz });
        }
      }
    }

    return items;
  }, [lessonData]);

  const totalContentSteps = timeline.length;
  const currentItem = timeline[state.currentIndex] ?? null;
  const hasExercises = lessonData.exercises.length > 0;

  const selectMode = useCallback((mode: "read" | "listen") => {
    setState((prev) => ({ ...prev, mode, phase: "content" }));
  }, []);

  // In vertical scroll mode, "next" moves to exercises/completion
  const next = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: hasExercises ? "exercises" : "completion",
    }));
  }, [hasExercises]);

  // Update progress based on scroll position (highest index seen)
  const goToIndex = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex, index),
    }));
  }, []);

  const goToExercises = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "exercises" }));
  }, []);

  const goToCompletion = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "completion" }));
  }, []);

  const addScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, scores: [...prev.scores, score] }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, isPlaying: playing }));
  }, []);

  return {
    state,
    timeline,
    currentItem,
    totalContentSteps,
    activeAudioIndex,
    advanceAudio,
    selectMode,
    next,
    goToIndex,
    goToExercises,
    goToCompletion,
    addScore,
    setPlaybackSpeed,
    setIsPlaying,
  };
};
