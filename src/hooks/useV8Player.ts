import { useState, useCallback, useMemo } from "react";
import { V8LessonData, V8PlayerState, V8InlineQuiz, V8InlinePlayground, V8InsightBlock } from "@/types/v8Lesson";

/**
 * useV8Player — State machine for V8 lesson navigation.
 *
 * Builds a flat timeline of items (sections + inline quizzes + playgrounds + insights sorted by position)
 * and manages phase transitions: mode-select → content → exercises → completion.
 *
 * V8 uses a single-section model — only one item is visible at a time.
 * `currentIndex` tracks which timeline item is currently displayed.
 */

export type TimelineItem =
  | { type: "section"; index: number }
  | { type: "playground"; playground: V8InlinePlayground }
  | { type: "insight"; insight: V8InsightBlock }
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

  // Build flat timeline: sections interleaved with playgrounds + quizzes
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const quizMap = new Map<number, V8InlineQuiz[]>();
    const playgroundMap = new Map<number, V8InlinePlayground[]>();
    const insightMap = new Map<number, V8InsightBlock[]>();

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

    for (const ins of (lessonData.inlineInsights || [])) {
      const existing = insightMap.get(ins.afterSectionIndex) || [];
      existing.push(ins);
      insightMap.set(ins.afterSectionIndex, existing);
    }

    // Order: Section[i] → Playground(s)[i] → Insight(s)[i] → Quiz(zes)[i]
    for (let i = 0; i < lessonData.sections.length; i++) {
      items.push({ type: "section", index: i });

      const playgrounds = playgroundMap.get(i);
      if (playgrounds) {
        for (const pg of playgrounds) {
          items.push({ type: "playground", playground: pg });
        }
      }

      const insights = insightMap.get(i);
      if (insights) {
        for (const ins of insights) {
          items.push({ type: "insight", insight: ins });
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
  const isLastItem = state.currentIndex >= timeline.length - 1;

  const selectMode = useCallback((mode: "read" | "listen") => {
    setState((prev) => ({ ...prev, mode, phase: "content", currentIndex: 0 }));
  }, []);

  // Advance to next timeline item (used by both modes)
  const advance = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= timeline.length) {
        // Timeline finished → go to exercises or completion
        return {
          ...prev,
          phase: hasExercises ? "exercises" : "completion",
        };
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, [timeline.length, hasExercises]);

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
    isLastItem,
    selectMode,
    advance,
    goToExercises,
    goToCompletion,
    addScore,
    setPlaybackSpeed,
    setIsPlaying,
  };
};
