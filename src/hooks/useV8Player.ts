import { useState, useCallback, useMemo } from "react";
import { V8LessonData, V8PlayerState, V8InlineQuiz, V8InlinePlayground, V8InsightBlock, V8InlineCompleteSentence, V8InlineExercise, V8LearnAndGrow } from "@/types/v8Lesson";
import { PASS_SCORE } from "@/constants/v8Rules";

/**
 * useV8Player — State machine for V8 lesson navigation.
 *
 * Builds a flat timeline of items (sections + inline quizzes + playgrounds + insights + complete-sentences + inline-exercises)
 * and manages phase transitions: mode-select → content → exercises → completion.
 */

export type TimelineItem =
  | { type: "section"; index: number }
  | { type: "playground"; playground: V8InlinePlayground }
  | { type: "insight"; insight: V8InsightBlock }
  | { type: "quiz"; quiz: V8InlineQuiz }
  | { type: "complete-sentence"; completeSentence: V8InlineCompleteSentence }
  | { type: "inline-exercise"; exercise: V8InlineExercise }
  | { type: "learn-and-grow"; learnAndGrow: V8LearnAndGrow };

const EXERCISE_MARKER_REGEX = /\[EXERCISE:([a-z-]+)\]/i;

const createFallbackInlineExercise = (sectionIndex: number, sectionTitle: string, rawSectionContent: string): V8InlineExercise | null => {
  const markerMatch = rawSectionContent.match(EXERCISE_MARKER_REGEX);
  if (!markerMatch) return null;

  const markerType = markerMatch[1].toLowerCase();
  const cleanedTitle = sectionTitle.replace(/^Seção\s*\d+\s*[—-]\s*/i, '').trim() || 'conteúdo';

  const base = {
    id: `inline-marker-${sectionIndex + 1}-${markerType}`,
    afterSectionIndex: sectionIndex,
    title: cleanedTitle,
    instruction: 'Responda com base no conteúdo da seção.',
    successMessage: 'Boa! Você aplicou o conceito da seção.',
    tryAgainMessage: 'Quase lá — revise a seção e tente novamente.',
  } as const;

  switch (markerType) {
    case 'multiple-choice':
      return {
        ...base,
        type: 'multiple-choice',
        data: {
          question: `Qual alternativa melhor representa "${cleanedTitle}"?`,
          options: [
            { id: 'a', text: 'Definir critério claro antes de pedir resposta', isCorrect: true },
            { id: 'b', text: 'Pedir algo genérico e confiar no acaso', isCorrect: false },
            { id: 'c', text: 'Aumentar o texto sem melhorar a ação', isCorrect: false },
          ],
          explanation: 'Critério explícito aumenta clareza, ação e adequação.',
        },
      };

    case 'true-false':
      return {
        ...base,
        type: 'true-false',
        data: {
          statements: [
            {
              id: 's1',
              text: 'Sem critério, a resposta tende a ficar genérica.',
              correct: true,
              explanation: 'Critérios reduzem respostas vagas e aumentam utilidade prática.',
            },
          ],
          feedback: {
            perfect: 'Perfeito!',
            good: 'Bom trabalho!',
            needsReview: 'Revise o conteúdo da seção.',
          },
        },
      };

    case 'flipcard-quiz':
      return {
        ...base,
        type: 'flipcard-quiz',
        data: {
          cards: [
            {
              id: 'card-1',
              front: { label: 'Clareza', icon: 'Target', color: 'cyan' },
              back: { text: 'Qual opção representa clareza em uma mensagem?' },
              options: [
                { id: 'o1', text: 'Pedido explícito e fácil de entender', isCorrect: true },
                { id: 'o2', text: 'Frase longa e ambígua', isCorrect: false },
              ],
              explanation: 'Clareza significa entendimento rápido e sem ambiguidade.',
            },
          ],
        },
      };

    case 'platform-match':
      return {
        ...base,
        type: 'platform-match',
        data: {
          scenarios: [
            { id: 'sc1', text: 'Pedir reescrita com tom profissional', correctPlatform: 'p1', emoji: '✍️' },
          ],
          platforms: [
            { id: 'p1', name: 'GPT', icon: '🤖', color: '#4F46E5' },
            { id: 'p2', name: 'Planilha', icon: '📊', color: '#16A34A' },
          ],
        },
      };

    default:
      return {
        ...base,
        type: 'multiple-choice',
        data: {
          question: `Com base em "${cleanedTitle}", qual é a melhor prática?`,
          options: [
            { id: 'a', text: 'Definir critério e revisar antes da versão final', isCorrect: true },
            { id: 'b', text: 'Responder sem objetivo claro', isCorrect: false },
          ],
          explanation: 'Usar critério + revisão melhora a qualidade da resposta.',
        },
      };
  }
};

export const useV8Player = (lessonData: V8LessonData) => {
  const [state, setState] = useState<V8PlayerState>({
    currentIndex: 0,
    mode: "read",
    isPlaying: false,
    playbackSpeed: 1,
    phase: "mode-select",
    scores: [],
    playgroundScores: {},
  });

  // Build flat timeline: sections interleaved with interactions
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const quizMap = new Map<number, V8InlineQuiz[]>();
    const playgroundMap = new Map<number, V8InlinePlayground[]>();
    const insightMap = new Map<number, V8InsightBlock[]>();
    const completeSentenceMap = new Map<number, V8InlineCompleteSentence[]>();
    const inlineExerciseMap = new Map<number, V8InlineExercise[]>();

    // V8-C01 update: Section 6 (index 5) must not render exercises/quizzes
    const DISABLED_EXERCISE_SECTION_INDEXES = new Set<number>([]);

    for (const quiz of lessonData.inlineQuizzes) {
      if (DISABLED_EXERCISE_SECTION_INDEXES.has(quiz.afterSectionIndex)) continue;
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

    for (const cs of (lessonData.inlineCompleteSentences || [])) {
      if (DISABLED_EXERCISE_SECTION_INDEXES.has(cs.afterSectionIndex)) continue;
      const existing = completeSentenceMap.get(cs.afterSectionIndex) || [];
      existing.push(cs);
      completeSentenceMap.set(cs.afterSectionIndex, existing);
    }

    for (const ex of (lessonData.inlineExercises || [])) {
      if (DISABLED_EXERCISE_SECTION_INDEXES.has(ex.afterSectionIndex)) continue;
      const existing = inlineExerciseMap.get(ex.afterSectionIndex) || [];
      existing.push(ex);
      inlineExerciseMap.set(ex.afterSectionIndex, existing);
    }

    // Order: Section[i] → CompleteSentence(s)[i] → InlineExercise(s)[i] → Playground(s)[i] → Insight(s)[i] → Quiz(zes)[i]
    // DEDUP: If a quiz already exists at a given sectionIndex, skip inline exercises at that same index
    // to avoid redundant interactions on the same topic.
    for (let i = 0; i < lessonData.sections.length; i++) {
      const sectionTitle = lessonData.sections[i]?.title || '';
      const sectionContent = (lessonData.sections[i]?.content || '').trim();

      // Detect if this section is ONLY a marker (e.g. "[EXERCISE:multiple-choice]")
      const isMarkerOnly = EXERCISE_MARKER_REGEX.test(sectionContent) && sectionContent.length < 50;

      // Check for real (DB-stored) inline exercises at this section index
      const realExercisesAtSection = inlineExerciseMap.get(i) || [];

      // Only use fallback if NO real exercises exist at this section
      const markerFallbackExercise = realExercisesAtSection.length === 0
        ? createFallbackInlineExercise(i, sectionTitle, sectionContent)
        : null;

      const effectiveInlineExercises = realExercisesAtSection.length > 0
        ? realExercisesAtSection
        : (markerFallbackExercise ? [markerFallbackExercise] : []);

      // Skip short residual sections (<100 chars) only if there are absolutely no interactions
      const hasInteractions =
        quizMap.has(i) ||
        playgroundMap.has(i) ||
        insightMap.has(i) ||
        completeSentenceMap.has(i) ||
        effectiveInlineExercises.length > 0;

      if (sectionContent.length < 100 && sectionContent.length > 0 && !hasInteractions) {
        console.log(`[useV8Player] Skipping short residual section ${i}: "${sectionTitle}" (${sectionContent.length} chars)`);
        continue;
      }

      // If section is marker-only, skip the section card but still render its interactions
      if (!isMarkerOnly) {
        items.push({ type: "section", index: i });
      } else {
        console.log(`[useV8Player] Marker-only section ${i}: "${sectionTitle}" — skipping section card, rendering exercise directly`);
      }

      const completeSentences = completeSentenceMap.get(i);
      if (completeSentences) {
        for (const cs of completeSentences) {
          items.push({ type: "complete-sentence", completeSentence: cs });
        }
      }

      const hasExerciseAtSection = effectiveInlineExercises.length > 0;

      for (const ex of effectiveInlineExercises) {
        items.push({ type: "inline-exercise", exercise: ex });
      }

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

      // Only add quizzes if there's no inline exercise at the same section (exercise has priority per V8-C01)
      if (!hasExerciseAtSection) {
        const quizzes = quizMap.get(i);
        if (quizzes) {
          for (const quiz of quizzes) {
            items.push({ type: "quiz", quiz });
          }
        }
      }
    }

    // Append "Aprender e Crescer" block as the last timeline item (after all sections)
    if (lessonData.learnAndGrow) {
      items.push({ type: "learn-and-grow", learnAndGrow: lessonData.learnAndGrow });
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

  const advance = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= timeline.length) {
        return { ...prev, phase: hasExercises ? "exercises" : "completion" };
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, [timeline.length, hasExercises]);

  const goToExercises = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "exercises" }));
  }, []);

  const goToIndex = useCallback((idx: number) => {
    setState((prev) => ({ ...prev, currentIndex: Math.min(idx, timeline.length - 1), phase: "content" }));
  }, [timeline.length]);

  const goToCompletion = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "completion" }));
  }, []);

  const addScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, scores: [...prev.scores, score] }));
  }, []);

  // Phase 4 (Gap 3): Track playground scores by ID for conditional insight unlock
  const addPlaygroundScore = useCallback((playgroundId: string, score: number) => {
    setState((prev) => ({
      ...prev,
      playgroundScores: { ...prev.playgroundScores, [playgroundId]: score },
      scores: [...prev.scores, score],
    }));
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
    goToIndex,
    goToCompletion,
    addScore,
    addPlaygroundScore,
    setPlaybackSpeed,
    setIsPlaying,
  };
};
