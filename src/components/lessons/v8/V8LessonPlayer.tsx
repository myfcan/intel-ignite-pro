import { useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { V8LessonData } from "@/types/v8Lesson";
import { useV8Player } from "@/hooks/useV8Player";
import { V8Header } from "./V8Header";
import { V8ModeSelector } from "./V8ModeSelector";
import { V8ContentSection } from "./V8ContentSection";
import { V8QuizInline } from "./V8QuizInline";
import { V8PlaygroundInline } from "./V8PlaygroundInline";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { ArrowRight } from "lucide-react";

interface V8LessonPlayerProps {
  lessonData: V8LessonData;
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
    goToCompletion,
    addScore,
  } = useV8Player(lessonData);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const SECTION_TOP_OFFSET = 88; // header (56px) + visual breathing room (32px)

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

  // Derive audio URL for the current section (used by fixed bottom bar)
  const currentSectionAudioUrl = useMemo(() => {
    if (state.phase !== "content" || !currentItem || currentItem.type !== "section") return null;
    return lessonData.sections[currentItem.index]?.audioUrl ?? null;
  }, [state.phase, currentItem, lessonData.sections]);

  // Auto-scroll to new section using STATIC anchor (immune to framer-motion transforms)
  useEffect(() => {
    if (state.phase === "content" && state.currentIndex > 0) {
      const anchor = anchorRefs.current[state.currentIndex];
      if (!anchor) return;

      // Double RAF ensures React has committed DOM + layout is calculated
      const rafId1 = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });

          // Anti-drift correction after animation completes (~420ms)
          const driftTimer = setTimeout(() => {
            const rect = anchor.getBoundingClientRect();
            const drift = rect.top - SECTION_TOP_OFFSET;
            if (Math.abs(drift) > 4) {
              window.scrollBy({ top: drift, behavior: "auto" });
            }
          }, 420);

          // Store for cleanup
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

  // Whether the fixed bottom bar should be visible
  const showFixedBar = state.phase === "content" && currentItem?.type === "section";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header — hidden during mode select */}
      {state.phase !== "mode-select" && (
        <V8Header
          title={lessonData.title}
          currentIndex={state.phase === "content" ? state.currentIndex : totalContentSteps - 1}
          totalSteps={totalContentSteps}
          onBack={onBack}
        />
      )}

      {/* Content area */}
      <div className={state.phase !== "mode-select" ? "pt-16" : ""}>
        <div className={`max-w-2xl mx-auto px-4 py-6 ${showFixedBar ? "pb-32" : ""}`}>
          {/* Phase: Mode Select */}
          {state.phase === "mode-select" && (
            <V8ModeSelector
              key="mode-select"
              title={lessonData.title}
              onSelectMode={selectMode}
              onBack={onBack}
            />
          )}

          {/* Phase: Content — continuous scroll (rolo) */}
          {state.phase === "content" && (
            <div className="flex flex-col gap-[7px]">
              {timeline.slice(0, state.currentIndex + 1).map((item, idx) => {
                const isLast = idx === state.currentIndex;
                return (
                  <div key={`timeline-${idx}`}>
                    {idx > 0 && <hr className="border-slate-100 mb-[7px]" />}
                    {/* Static scroll anchor — NOT affected by framer-motion transforms */}
                    <div
                      ref={(el) => { anchorRefs.current[idx] = el; }}
                      className="h-px"
                      style={{ scrollMarginTop: `${SECTION_TOP_OFFSET}px` }}
                      aria-hidden="true"
                    />
                    <motion.div
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      initial={idx === state.currentIndex ? { opacity: 0, y: 30 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
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
                        <V8QuizInline
                          quiz={item.quiz}
                          onAnswer={handleQuizAnswer}
                          onContinue={isLast ? advance : undefined}
                          isActiveAudio={state.mode === "listen" && isLast}
                          isActive={isLast}
                        />
                      )}

                      {item.type === "playground" && (
                        <V8PlaygroundInline
                          playground={item.playground}
                          onContinue={isLast ? advance : undefined}
                          onScore={(s) => addScore(s)}
                          isActive={isLast}
                        />
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phase: Exercises */}
          {state.phase === "exercises" && renderExercises && (
            <div key="exercises">
              {renderExercises({
                exercises: lessonData.exercises,
                onComplete: handleExercisesComplete,
                onScoreUpdate: handleExerciseScores,
              })}
            </div>
          )}

          {/* Phase: Completion */}
          {state.phase === "completion" && renderCompletion && (
            <div key="completion">
              {renderCompletion({
                scores: state.scores,
                onContinue: handleFinalContinue,
              })}
            </div>
          )}

          {/* Fallback completion */}
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

      {/* Fixed bottom bar — audio player + Continuar button */}
      {showFixedBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Audio player for active section */}
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

            {/* Continuar button — read mode only */}
            {state.mode === "read" && (
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
