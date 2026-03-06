import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { V8LessonData, V8InlineQuiz, V8InlinePlayground, V8InlineCompleteSentence, V8InlineExercise as V8InlineExerciseType, V8LearnAndGrow } from "@/types/v8Lesson";
import { useV8Player } from "@/hooks/useV8Player";
import { V8Header } from "./V8Header";
import { V8ModeSelector } from "./V8ModeSelector";
import { V8ContentSection } from "./V8ContentSection";
import { V8QuizInline } from "./V8QuizInline";
import { V8QuizTrueFalse } from "./V8QuizTrueFalse";
import { V8QuizFillBlank } from "./V8QuizFillBlank";
import { V8PlaygroundInline, V8PlaygroundInlineHandle } from "./V8PlaygroundInline";
import { V8InsightReward } from "./V8InsightReward";
import { V8CompleteSentenceInline } from "./V8CompleteSentenceInline";
import { V8InlineExercise } from "./V8InlineExercise";
import { V8LearnAndGrowBlock } from "./V8LearnAndGrowBlock";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { ArrowRight } from "lucide-react";
import { PASS_SCORE } from "@/constants/v8Rules";

interface V8LessonPlayerProps {
  lessonData: V8LessonData;
  lessonId?: string;
  onComplete: (scores: number[]) => void;
  onBack: () => void;
  renderExercises?: (props: {
    exercises: V8LessonData["exercises"];
    onComplete: (data?: { allExercisesCompleted?: boolean }) => void;
    onScoreUpdate: (scores: number[]) => void;
  }) => React.ReactNode;
  renderCompletion?: (props: {
    scores: number[];
    onContinue: () => void;
  }) => React.ReactNode;
}

export const V8LessonPlayer = ({
  lessonData,
  lessonId,
  onComplete,
  onBack,
  renderExercises,
  renderCompletion,
}: V8LessonPlayerProps) => {
  const {
    state,
    timeline,
    totalContentSteps,
    currentItem,
    selectMode,
    advance,
    goToIndex,
    goToCompletion,
    addScore,
    addPlaygroundScore,
  } = useV8Player(lessonData);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playgroundRefs = useRef<Map<number, V8PlaygroundInlineHandle>>(new Map());

  const SECTION_TOP_OFFSET = 88;

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      addScore(correct ? 100 : 0);
    },
    [addScore]
  );

  const handleExercisesComplete = useCallback(() => {
    goToCompletion();
  }, [goToCompletion]);

  const handleExerciseScores = useCallback(
    (scores: number[]) => {
      scores.forEach((s) => addScore(s));
    },
    [addScore]
  );

  const handleFinalContinue = useCallback(() => {
    onComplete(state.scores);
  }, [onComplete, state.scores]);

  // Derive audio URL for the current section
  const currentSectionAudioUrl = useMemo(() => {
    if (state.phase !== "content" || !currentItem || currentItem.type !== "section") return null;
    const section = lessonData.sections[currentItem.index];
    if (!section) return null;
    return section.audioUrl ?? null;
  }, [state.phase, currentItem, lessonData.sections]);

  // Preload next timeline item's audio to eliminate latency
  const nextAudioUrl = useMemo(() => {
    if (state.phase !== "content") return null;
    const nextIdx = state.currentIndex + 1;
    if (nextIdx >= timeline.length) return null;
    const nextItem = timeline[nextIdx];
    switch (nextItem.type) {
      case "section": return lessonData.sections[nextItem.index]?.audioUrl ?? null;
      case "quiz": return nextItem.quiz.audioUrl ?? null;
      case "playground": return nextItem.playground.audioUrl ?? null;
      case "complete-sentence": return nextItem.completeSentence.audioUrl ?? null;
      case "inline-exercise": return nextItem.exercise.audioUrl ?? null;
      case "insight": return nextItem.insight.audioUrl ?? null;
      case "learn-and-grow": return nextItem.learnAndGrow.audioUrl ?? null;
      default: return null;
    }
  }, [state.phase, state.currentIndex, timeline, lessonData.sections]);

  // Preload audio into browser cache
  useEffect(() => {
    if (!nextAudioUrl) return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = nextAudioUrl;
    // Just loading into cache, no play
    return () => { audio.src = ""; };
  }, [nextAudioUrl]);

  // Phase 4 (Gap 3): Compute whether an insight at timeline index is unlockable
  const isInsightUnlockable = useCallback((timelineIdx: number): boolean => {
    for (let i = timelineIdx - 1; i >= 0; i--) {
      const prevItem = timeline[i];
      if (prevItem.type === 'playground') {
        const score = state.playgroundScores[prevItem.playground.id];
        return score !== undefined && score >= PASS_SCORE;
      }
      if (prevItem.type === 'section') break;
    }
    return true; // No preceding playground found, allow unlock
  }, [timeline, state.playgroundScores]);

  // Find the timeline index of the playground preceding a given insight index
  const findPrecedingPlaygroundIndex = useCallback((timelineIdx: number): number | null => {
    for (let i = timelineIdx - 1; i >= 0; i--) {
      if (timeline[i].type === 'playground') return i;
      if (timeline[i].type === 'section') break;
    }
    return null;
  }, [timeline]);

  // Get playgroundId for the playground preceding a given insight index
  const getPrecedingPlaygroundId = useCallback((timelineIdx: number): string | null => {
    for (let i = timelineIdx - 1; i >= 0; i--) {
      const item = timeline[i];
      if (item.type === 'playground') return item.playground.id;
      if (item.type === 'section') break;
    }
    return null;
  }, [timeline]);

  // Auto-scroll to new section
  useEffect(() => {
    if (state.phase === "content" && state.currentIndex > 0) {
      const anchor = anchorRefs.current[state.currentIndex];
      if (!anchor) return;

      const rafId1 = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });

          const driftTimer = setTimeout(() => {
            const rect = anchor.getBoundingClientRect();
            const drift = rect.top - SECTION_TOP_OFFSET;
            if (Math.abs(drift) > 4) {
              window.scrollBy({ top: drift, behavior: "auto" });
            }
          }, 420);

          (anchor as any).__driftTimer = driftTimer;
        });
        (anchor as any).__rafId2 = rafId2;
      });

      return () => {
        cancelAnimationFrame(rafId1);
        cancelAnimationFrame((anchor as any).__rafId2);
        clearTimeout((anchor as any).__driftTimer);
      };
    }
  }, [state.currentIndex, state.phase]);

  const showFixedBar = state.phase === "content" && (currentItem?.type === "section" || currentItem?.type === "learn-and-grow");
  const contentContainerPadding = state.phase === "content"
    ? showFixedBar
      ? "pb-32"
      : "pb-72"
    : "";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {state.phase !== "mode-select" && (
        <V8Header
          title={lessonData.title}
          currentIndex={state.phase === "content" ? state.currentIndex : totalContentSteps - 1}
          totalSteps={totalContentSteps}
          onBack={onBack}
          lessonId={lessonData.title}
          reportContext={{ phase: state.phase, currentIndex: state.currentIndex, mode: state.mode }}
        />
      )}

      <div className={state.phase !== "mode-select" ? "pt-16" : ""}>
        <div className={`max-w-2xl mx-auto px-4 py-6 ${contentContainerPadding}`}>
          {state.phase === "mode-select" && (
            <V8ModeSelector
              key="mode-select"
              title={lessonData.title}
              onSelectMode={selectMode}
              onBack={onBack}
            />
          )}

          {state.phase === "content" && (
            <div className="flex flex-col gap-[7px]">
              {timeline.slice(0, state.currentIndex + 1).map((item, idx) => {
                const isLast = idx === state.currentIndex;
                return (
                  <div key={`timeline-${idx}`}>
                    {idx > 0 && <hr className="border-slate-100 mb-[7px]" />}
                    <div
                      ref={(el) => { anchorRefs.current[idx] = el; }}
                      className="h-px"
                      style={{ scrollMarginTop: `${SECTION_TOP_OFFSET}px` }}
                      aria-hidden="true"
                    />
                    <motion.div
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      initial={idx === state.currentIndex ? { opacity: 0, y: 14 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                      className="flex flex-col"
                    >
                      {item.type === "section" && (
                        <V8ContentSection
                          section={lessonData.sections[item.index]}
                          mode={state.mode}
                          sectionIndex={idx}
                        />
                      )}

                      {item.type === "quiz" && (
                        item.quiz.quizType === 'true-false' ? (
                          <V8QuizTrueFalse
                            quiz={item.quiz}
                            onAnswer={handleQuizAnswer}
                            onContinue={isLast ? advance : undefined}
                            isActiveAudio={state.mode === "listen" && isLast}
                            isActive={isLast}
                          />
                        ) : item.quiz.quizType === 'fill-blank' ? (
                          <V8QuizFillBlank
                            quiz={item.quiz}
                            onAnswer={handleQuizAnswer}
                            onContinue={isLast ? advance : undefined}
                            isActiveAudio={state.mode === "listen" && isLast}
                            isActive={isLast}
                          />
                        ) : (
                          <V8QuizInline
                            quiz={item.quiz}
                            onAnswer={handleQuizAnswer}
                            onContinue={isLast ? advance : undefined}
                            isActiveAudio={state.mode === "listen" && isLast}
                            isActive={isLast}
                          />
                        )
                      )}

                      {item.type === "playground" && (
                        <V8PlaygroundInline
                          ref={(handle) => {
                            if (handle) playgroundRefs.current.set(idx, handle);
                            else playgroundRefs.current.delete(idx);
                          }}
                          playground={item.playground}
                          lessonId={lessonId}
                          onContinue={isLast ? advance : undefined}
                          onScore={(s) => addPlaygroundScore(item.playground.id, s)}
                          isActive={isLast}
                          isActiveAudio={state.mode === "listen" && isLast}
                        />
                      )}

                      {item.type === "insight" && (
                        <V8InsightReward
                          insight={item.insight}
                          onContinue={isLast ? advance : undefined}
                          isActive={isLast}
                          unlockable={isInsightUnlockable(idx)}
                          playgroundId={getPrecedingPlaygroundId(idx) ?? undefined}
                          onRetryPlayground={() => {
                            const pgIdx = findPrecedingPlaygroundIndex(idx);
                            if (pgIdx === null) return;

                            goToIndex(pgIdx);
                            requestAnimationFrame(() => {
                              playgroundRefs.current.get(pgIdx)?.resetPlayground();
                            });
                          }}
                        />
                      )}

                      {item.type === "complete-sentence" && (
                        <V8CompleteSentenceInline
                          completeSentence={item.completeSentence}
                          onContinue={isLast ? advance : undefined}
                          onScore={(s) => addScore(s)}
                          isActive={isLast}
                          isActiveAudio={state.mode === "listen" && isLast}
                        />
                      )}

                      {item.type === "inline-exercise" && (
                        <V8InlineExercise
                          exercise={item.exercise}
                          exerciseIndex={idx}
                          lessonId={lessonId}
                          onContinue={isLast ? advance : undefined}
                          onScore={(s) => addScore(s)}
                          isActive={isLast}
                          isActiveAudio={state.mode === "listen" && isLast}
                        />
                      )}

                      {item.type === "learn-and-grow" && (
                        <V8LearnAndGrowBlock data={item.learnAndGrow} />
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}

          {state.phase === "exercises" && renderExercises && (
            <div key="exercises">
              {renderExercises({
                exercises: lessonData.exercises,
                onComplete: handleExercisesComplete,
                onScoreUpdate: handleExerciseScores,
              })}
            </div>
          )}

          {state.phase === "completion" && renderCompletion && (
            <div key="completion">
              {renderCompletion({
                scores: state.scores,
                onContinue: handleFinalContinue,
              })}
            </div>
          )}

          {state.phase === "completion" && !renderCompletion && (
            <div key="completion-fallback" className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Aula Concluída!</h2>
              <button
                onClick={handleFinalContinue}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>

      {showFixedBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {currentSectionAudioUrl && (
              <div className="flex-1 min-w-0">
                <V8AudioPlayer
                  key={`audio-${state.currentIndex}`}
                  audioUrl={currentSectionAudioUrl}
                  autoPlay={state.mode === "listen"}
                  onEnded={advance}
                />
              </div>
            )}

            {(state.mode === "read" || (state.mode === "listen" && !currentSectionAudioUrl)) && (
              <motion.button
                key={`continue-${state.currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={advance}
                className="flex items-center justify-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
