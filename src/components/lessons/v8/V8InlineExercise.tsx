import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { V8InlineExercise as V8InlineExerciseType } from "@/types/v8Lesson";
import { TrueFalseExercise } from "@/components/lessons/TrueFalseExercise";
import { FillInBlanksExercise } from "@/components/lessons/FillInBlanksExercise";
import { CompleteSentenceExercise } from "@/components/lessons/CompleteSentenceExercise";
import { FlipCardQuizExercise } from "@/components/lessons/FlipCardQuizExercise";
import { ScenarioSelectionExercise } from "@/components/lessons/ScenarioSelectionExercise";
import { PlatformMatchExercise } from "@/components/lessons/PlatformMatchExercise";
import { TimedQuizExercise } from "@/components/lessons/TimedQuizExercise";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { useAudioFirstLock } from "./useAudioFirstLock";
import { V8AudioLockOverlay } from "./V8AudioLockOverlay";

interface V8InlineExerciseProps {
  exercise: V8InlineExerciseType;
  onContinue?: () => void;
  onScore?: (score: number) => void;
  isActive?: boolean;
  isActiveAudio?: boolean;
}

export const V8InlineExercise = ({ exercise, onContinue, onScore, isActive = true, isActiveAudio = false }: V8InlineExerciseProps) => {
  const [completed, setCompleted] = useState(false);
  const { audioLocked, justUnlocked, onAudioEnded } = useAudioFirstLock(exercise.audioUrl, isActiveAudio);

  const handleComplete = useCallback((score: number) => {
    setCompleted(true);
    onScore?.(score);
  }, [onScore]);

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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
            Exercício não renderizável (formato incompatível)
          </div>
        );

      case "flipcard-quiz":
        return (
          <FlipCardQuizExercise
            title={title}
            instruction={instruction}
            data={data as any}
            onComplete={handleComplete}
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
      <div className={`transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-indigo-400/60 ring-offset-2 rounded-xl animate-pulse" : ""}`}>
        {renderExercise()}
      </div>

      {completed && onContinue && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Continuar Aula
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};
