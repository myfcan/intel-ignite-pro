import { useCallback, useRef, useEffect } from "react";
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
    activeAudioIndex,
    advanceAudio,
    selectMode,
    next,
    goToCompletion,
    addScore,
    goToIndex,
  } = useV8Player(lessonData);

  const sectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track which sections are visible for progress
  useEffect(() => {
    if (state.phase !== "content") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-timeline-index"));
            if (!isNaN(idx)) {
              goToIndex(idx);
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [state.phase, goToIndex, timeline.length]);

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

  const scrollToSection = useCallback((timelineIdx: number) => {
    const el = sectionRefs.current.get(timelineIdx);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const setRef = useCallback((idx: number, el: HTMLDivElement | null) => {
    if (el) {
      el.setAttribute("data-timeline-index", String(idx));
      sectionRefs.current.set(idx, el);
    } else {
      sectionRefs.current.delete(idx);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header — hidden during mode select */}
      {state.phase !== "mode-select" && (
        <V8Header
          title={lessonData.title}
          currentIndex={state.phase === "content" ? state.currentIndex : totalContentSteps - 1}
          totalSteps={totalContentSteps}
          onBack={onBack}
          sectionTitles={state.phase === "content" ? timeline.map((item, i) => {
            if (item.type === "section") return lessonData.sections[item.index]?.title || `Seção ${i + 1}`;
            if (item.type === "quiz") return "Quiz";
            return "Playground";
          }) : undefined}
          onNavigateToSection={scrollToSection}
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
          </AnimatePresence>

          {/* Phase: Content — ALL items rendered vertically */}
          {state.phase === "content" && (
            <div className="flex flex-col gap-10 pb-32">
              {timeline.map((item, idx) => {
                if (item.type === "section") {
                  return (
                    <V8ContentSection
                      key={`section-${item.index}`}
                      ref={(el) => setRef(idx, el)}
                      section={lessonData.sections[item.index]}
                      mode={state.mode}
                      sectionIndex={idx}
                      isActiveAudio={idx === activeAudioIndex}
                      onAudioEnded={advanceAudio}
                    />
                  );
                }
                if (item.type === "quiz") {
                  return (
                    <div key={`quiz-${item.quiz.id}`} ref={(el) => setRef(idx, el)} data-timeline-index={idx}>
                      <V8QuizInline
                        quiz={item.quiz}
                        onAnswer={handleQuizAnswer}
                        onContinue={advanceAudio}
                        isActiveAudio={idx === activeAudioIndex && state.mode === "listen"}
                      />
                    </div>
                  );
                }
                if (item.type === "playground") {
                  return (
                    <div key={`pg-${item.playground.id}`} ref={(el) => setRef(idx, el)} data-timeline-index={idx}>
                      <V8PlaygroundInline
                        playground={item.playground}
                        onContinue={advanceAudio}
                        onScore={(s) => addScore(s)}
                      />
                    </div>
                  );
                }
                return null;
              })}

              {/* Finish content button — fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent">
                <div className="max-w-2xl mx-auto">
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={next}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
                  >
                    Finalizar conteúdo
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
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
