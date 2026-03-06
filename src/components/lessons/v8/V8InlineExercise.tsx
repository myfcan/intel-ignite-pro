import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PASS_SCORE } from "@/constants/v8Rules";
import { ArrowRight, CheckCircle2, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerGamificationEvent } from "@/services/gamification";
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
  exerciseIndex?: number;
  lessonId?: string;
  onContinue?: () => void;
  onScore?: (score: number) => void;
  isActive?: boolean;
  isActiveAudio?: boolean;
}

export const V8InlineExercise = ({ exercise, exerciseIndex, lessonId, onContinue, onScore, isActive = true, isActiveAudio = false }: V8InlineExerciseProps) => {
  const [completed, setCompleted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [exerciseKey, setExerciseKey] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const { audioLocked, justUnlocked, onAudioEnded } = useAudioFirstLock(exercise.audioUrl, isActiveAudio);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const hasRegisteredXp = useRef(false);

  const handleComplete = useCallback((score: number) => {
    setCompleted(true);
    const didPass = score >= PASS_SCORE;
    setPassed(didPass);
    onScore?.(score);

    // Award XP for correct exercise (idempotent via lessonId + exerciseIndex in payload)
    if (didPass && lessonId && exerciseIndex !== undefined && !hasRegisteredXp.current) {
      hasRegisteredXp.current = true;
      registerGamificationEvent("exercise_correct", lessonId, { exercise_index: exerciseIndex })
        .then((result) => {
          if (result && result.xp_delta > 0) {
            setXpAwarded(true);
            setTimeout(() => setXpAwarded(false), 2500);
          }
        })
        .catch(() => {});
    }
  }, [onScore, lessonId, exerciseIndex]);

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
      <div key={exerciseKey} className={`relative transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-indigo-400/60 ring-offset-2 rounded-xl animate-pulse" : ""}`}>
        {renderExercise()}
        {/* XP micro-feedback */}
        <AnimatePresence>
          {xpAwarded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-2 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 z-10"
            >
              <Zap className="w-3 h-3" />
              +5 XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified premium feedback */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-start gap-3 px-4 py-3.5 rounded-xl border-l-4",
            passed
              ? "border-l-emerald-500 bg-emerald-50/80"
              : "border-l-amber-500 bg-amber-50/80"
          )}
        >
          {passed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <RotateCcw className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-bold leading-snug",
              passed ? "text-emerald-800" : "text-amber-800"
            )}>
              {passed ? "Muito bem! 🎉" : "Quase lá!"}
            </p>
            <p className={cn(
              "text-xs leading-relaxed mt-0.5",
              passed ? "text-emerald-700/80" : "text-amber-700/80"
            )}>
              {passed
                ? (exercise.successMessage || "Você acertou o exercício. Continue assim!")
                : (exercise.tryAgainMessage || "Revise o conteúdo e tente novamente.")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Active CTA buttons */}
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
