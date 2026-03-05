import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PASS_SCORE } from "@/constants/v8Rules";
import { ArrowRight, RotateCcw } from "lucide-react";
import { V8InlineExercise as V8InlineExerciseType } from "@/types/v8Lesson";
import { TrueFalseExercise } from "@/components/lessons/TrueFalseExercise";
import { FillInBlanksExercise } from "@/components/lessons/FillInBlanksExercise";
import { CompleteSentenceExercise } from "@/components/lessons/CompleteSentenceExercise";
import { MultipleChoiceExercise } from "@/components/lesson/MultipleChoiceExercise";
import { FlipCardQuizExercise } from "@/components/lessons/FlipCardQuizExercise";
import { ScenarioSelectionExercise } from "@/components/lessons/ScenarioSelectionExercise";
import { PlatformMatchExercise } from "@/components/lessons/PlatformMatchExercise";
import { TimedQuizExercise } from "@/components/lessons/TimedQuizExercise";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { useAudioFirstLock } from "./useAudioFirstLock";
import { V8AudioLockOverlay } from "./V8AudioLockOverlay";
import { scheduleCTAScroll } from "./v8ScrollUtils";

interface V8InlineExerciseProps {
  exercise: V8InlineExerciseType;
  onContinue?: () => void;
  onScore?: (score: number) => void;
  isActive?: boolean;
  isActiveAudio?: boolean;
}

export const V8InlineExercise = ({ exercise, onContinue, onScore, isActive = true, isActiveAudio = false }: V8InlineExerciseProps) => {
  const [completed, setCompleted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [exerciseKey, setExerciseKey] = useState(0);
  const { audioLocked, justUnlocked, onAudioEnded } = useAudioFirstLock(exercise.audioUrl, isActiveAudio);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const handleComplete = useCallback((score: number) => {
    setCompleted(true);
    setPassed(score >= PASS_SCORE);
    onScore?.(score);
  }, [onScore]);

  const handleRetry = useCallback(() => {
    setCompleted(false);
    setPassed(false);
    setExerciseKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isActive || !completed || !onContinue) return;
    return scheduleCTAScroll(() => ctaRef.current);
  }, [completed, isActive, onContinue]);

  const renderExercise = () => {
    const { type, data, title, instruction } = exercise;

    switch (type) {
      case "true-false":
        return (
          <TrueFalseExercise
            title={title}
            instruction={instruction}
            statements={data.statements || []}
            feedback={data.feedback || { perfect: "Perfeito! 🎉", good: "Bom trabalho! 👏", needsReview: "Revise o conteúdo acima 📖" }}
            onComplete={handleComplete}
          />
        );

      case "fill-in-blanks":
        return (
          <FillInBlanksExercise
            title={title}
            instruction={instruction}
            sentences={data.sentences || []}
            feedback={data.feedback || { allCorrect: "Perfeito! 🎉", someCorrect: "Quase lá! 👏", needsReview: "Revise o conteúdo 📖" }}
            onComplete={handleComplete}
          />
        );

      case "complete-sentence":
        return (
          <CompleteSentenceExercise
            title={title}
            instruction={instruction}
            sentences={data.sentences || []}
            onComplete={handleComplete}
          />
        );

      case "multiple-choice":
        // Format with question + options array [{id, text, isCorrect}]
        if (data.question && Array.isArray(data.options) && data.options.length > 0 && typeof data.options[0] === 'object' && 'text' in data.options[0]) {
          const correctOpt = data.options.find((o: any) => o.isCorrect);
          return (
            <MultipleChoiceExercise
              question={data.question}
              options={data.options.map((o: any) => o.text)}
              correctAnswer={correctOpt?.text || data.options[0].text}
              explanation={data.explanation || ""}
              onComplete={(isCorrect: boolean) => {
                handleComplete(isCorrect ? 100 : 0);
              }}
            />
          );
        }
        // Format with statements (legacy/TrueFalse adapter)
        if (data.statements) {
          return (
            <TrueFalseExercise
              title={title}
              instruction={instruction}
              statements={data.statements}
              feedback={data.feedback || { perfect: "Perfeito! 🎉", good: "Bom trabalho! 👏", needsReview: "Revise o conteúdo 📖" }}
              onComplete={handleComplete}
            />
          );
        }
        return (
          <div className="rounded-xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
            Exercício não renderizável (formato incompatível)
          </div>
        );

      case "flipcard-quiz":
        return (
          <FlipCardQuizExercise
            title={title}
            instruction={instruction}
            data={data as any}
            onComplete={(score: number) => onScore?.(score)}
            onContinue={onContinue}
          />
        );

      case "scenario-selection":
        return (
          <ScenarioSelectionExercise
            title={title}
            instruction={instruction}
            data={data as any}
            onComplete={handleComplete}
          />
        );

      case "platform-match":
        return (
          <PlatformMatchExercise
            title={title}
            instruction={instruction}
            scenarios={data.scenarios || []}
            platforms={data.platforms || []}
            onComplete={handleComplete}
          />
        );

      case "timed-quiz":
        return (
          <TimedQuizExercise
            title={title}
            instruction={instruction}
            data={data as any}
            onComplete={handleComplete}
          />
        );

      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
            Tipo de exercício não suportado: {type}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Audio player for narration — locks exercise until finished */}
      {exercise.audioUrl && isActiveAudio && !completed && (
        <V8AudioPlayer audioUrl={exercise.audioUrl} autoPlay onEnded={onAudioEnded} />
      )}

      {/* Audio lock hint */}
      {audioLocked && !completed && <V8AudioLockOverlay />}

      {/* Exercise content */}
      <div key={exerciseKey} className={`transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-indigo-400/60 ring-offset-2 rounded-xl animate-pulse" : ""}`}>
        {renderExercise()}
      </div>

      {completed && onContinue && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`grid gap-2 ${!passed ? "grid-cols-2" : ""}`}
        >
          {!passed && (
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
          )}
          <button
            ref={ctaRef}
            onClick={onContinue}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Continuar Aula
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
