import { useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { V8LessonData } from "@/types/v8Lesson";
import { useV8Player } from "@/hooks/useV8Player";
import { V8Header } from "./V8Header";
import { V8ModeSelector } from "./V8ModeSelector";
import { V8ContentSection } from "./V8ContentSection";
import { V8QuizInline } from "./V8QuizInline";
import { V8PlaygroundInline } from "./V8PlaygroundInline";
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

  // Auto-scroll to new section
  useEffect(() => {
    if (state.phase === "content" && state.currentIndex > 0) {
      const timer = setTimeout(() => {
        itemRefs.current[state.currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.currentIndex, state.phase]);

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
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Phase: Mode Select */}
          {state.phase === "mode-select" && (
            <V8ModeSelector
              key="mode-select"
              title={lessonData.title}
              onSelectMode={selectMode}
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
                          isActiveAudio={state.mode === "listen" && isLast}
                          onAudioEnded={state.mode === "listen" && isLast ? advance : undefined}
                        />
                      )}

                      {item.type === "quiz" && (
                        <V8QuizInline
                          quiz={item.quiz}
                          onAnswer={handleQuizAnswer}
                          onContinue={isLast ? advance : undefined}
                          isActiveAudio={state.mode === "listen" && isLast}
                        />
                      )}

                      {item.type === "playground" && (
                        <V8PlaygroundInline
                          playground={item.playground}
                          onContinue={isLast ? advance : undefined}
                          onScore={(s) => addScore(s)}
                        />
                      )}
                    </motion.div>
                  </div>
                );
              })}

              {/* "Continuar" button — read mode + current is section */}
              {state.mode === "read" && currentItem?.type === "section" && (
                <motion.button
                  key={`continue-${state.currentIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={advance}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
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
    </div>
  );
};
