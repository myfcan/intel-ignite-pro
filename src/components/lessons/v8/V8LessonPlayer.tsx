import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  // Get label for current timeline item (for header)
  const currentLabel = currentItem
    ? currentItem.type === "section"
      ? lessonData.sections[currentItem.index]?.title || `Seção ${state.currentIndex + 1}`
      : currentItem.type === "quiz"
        ? "Quiz"
        : "Playground"
    : "";

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
          <AnimatePresence mode="wait">
            {/* Phase: Mode Select */}
            {state.phase === "mode-select" && (
              <V8ModeSelector
                key="mode-select"
                title={lessonData.title}
                onSelectMode={selectMode}
              />
            )}

            {/* Phase: Content — ONE item at a time */}
            {state.phase === "content" && currentItem && (
              <motion.div
                key={`timeline-${state.currentIndex}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col"
              >
                {currentItem.type === "section" && (
                  <>
                    <V8ContentSection
                      section={lessonData.sections[currentItem.index]}
                      mode={state.mode}
                      sectionIndex={state.currentIndex}
                      isActiveAudio={state.mode === "listen"}
                      onAudioEnded={state.mode === "listen" ? advance : undefined}
                    />
                    {/* Read mode: show inline "Continuar" button */}
                    {state.mode === "read" && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={advance}
                        className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
                      >
                        Continuar
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </>
                )}

                {currentItem.type === "quiz" && (
                  <V8QuizInline
                    quiz={currentItem.quiz}
                    onAnswer={handleQuizAnswer}
                    onContinue={advance}
                    isActiveAudio={state.mode === "listen"}
                  />
                )}

                {currentItem.type === "playground" && (
                  <V8PlaygroundInline
                    playground={currentItem.playground}
                    onContinue={advance}
                    onScore={(s) => addScore(s)}
                  />
                )}
              </motion.div>
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
