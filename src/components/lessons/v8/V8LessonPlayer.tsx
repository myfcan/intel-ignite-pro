import { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { V8LessonData } from "@/types/v8Lesson";
import { useV8Player } from "@/hooks/useV8Player";
import { V8Header } from "./V8Header";
import { V8ModeSelector } from "./V8ModeSelector";
import { V8ContentSection } from "./V8ContentSection";
import { V8QuizInline } from "./V8QuizInline";

interface V8LessonPlayerProps {
  lessonData: V8LessonData;
  onComplete: (scores: number[]) => void;
  onBack: () => void;
  /** Render prop for exercises phase */
  renderExercises?: (props: {
    exercises: V8LessonData["exercises"];
    onComplete: (data?: { allExercisesCompleted?: boolean }) => void;
    onScoreUpdate: (scores: number[]) => void;
  }) => React.ReactNode;
  /** Render prop for completion phase */
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
    currentItem,
    totalContentSteps,
    selectMode,
    next,
    goToCompletion,
    addScore,
  } = useV8Player(lessonData);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header — hidden during mode select */}
      {state.phase !== "mode-select" && (
        <V8Header
          title={lessonData.title}
          currentIndex={state.phase === "content" ? state.currentIndex : totalContentSteps - 1}
          totalSteps={totalContentSteps}
          onBack={onBack}
        />
      )}

      {/* Content area with top padding for fixed header */}
      <div className={state.phase !== "mode-select" ? "pt-16" : ""}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {/* Phase: Mode Select */}
            {state.phase === "mode-select" && (
              <V8ModeSelector
                key="mode-select"
                title={lessonData.title}
                onSelectMode={selectMode}
              />
            )}

            {/* Phase: Content */}
            {state.phase === "content" && currentItem && (
              <>
                {currentItem.type === "section" && (
                  <V8ContentSection
                    key={`section-${currentItem.index}`}
                    section={lessonData.sections[currentItem.index]}
                    mode={state.mode}
                    onContinue={next}
                    isLast={state.currentIndex === totalContentSteps - 1}
                  />
                )}
                {currentItem.type === "quiz" && (
                  <V8QuizInline
                    key={`quiz-${currentItem.quiz.id}`}
                    quiz={currentItem.quiz}
                    onAnswer={handleQuizAnswer}
                    onContinue={next}
                  />
                )}
              </>
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

            {/* Fallback completion if no render prop */}
            {state.phase === "completion" && !renderCompletion && (
              <div key="completion-fallback" className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-white">Aula Concluída!</h2>
                <button
                  onClick={handleFinalContinue}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold"
                >
                  Continuar
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
