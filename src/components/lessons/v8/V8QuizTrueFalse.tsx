import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Scale } from "lucide-react";
import { V8InlineQuiz } from "@/types/v8Lesson";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { scheduleCTAScroll } from "./v8ScrollUtils";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";

interface V8QuizTrueFalseProps {
  quiz: V8InlineQuiz;
  onAnswer: (correct: boolean) => void;
  onContinue?: () => void;
  isActiveAudio?: boolean;
  isActive?: boolean;
}

type QuizState = "answering" | "correct" | "wrong" | "reinforcement";

export const V8QuizTrueFalse = ({
  quiz,
  onAnswer,
  onContinue,
  isActiveAudio = false,
  isActive = true,
}: V8QuizTrueFalseProps) => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [state, setState] = useState<QuizState>("answering");
  const ctaRef = useRef<HTMLButtonElement>(null);
  const { playSound } = useV7SoundEffects(0.6, true);

  useEffect(() => {
    if (!isActive) return;
    if (selected === null && state === "answering") return;
    return scheduleCTAScroll(() => ctaRef.current);
  }, [selected, state, isActive]);

  const handleSelect = useCallback(
    (value: boolean) => {
      if (state !== "answering") return;
      setSelected(value);
    },
    [state]
  );

  const handleConfirm = useCallback(() => {
    if (selected === null) return;
    const isCorrect = selected === quiz.isTrue;
    if (isCorrect) {
      setState("correct");
      onAnswer(true);
      playSound("quiz-correct");
    } else {
      setState("wrong");
      onAnswer(false);
      playSound("quiz-wrong");
    }
  }, [selected, quiz.isTrue, onAnswer, playSound]);

  const handleShowReinforcement = () => setState("reinforcement");
  const isAnswered = state !== "answering";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5 pb-8"
    >
      {/* Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          <Scale className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Verdadeiro ou Falso
          </span>
        </div>
      </div>

      {/* Question context */}
      {quiz.question && (
        <p className="text-sm text-slate-500 leading-relaxed">{quiz.question}</p>
      )}

      {/* Statement */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-lg font-semibold text-slate-900 leading-snug italic">
          "{quiz.statement}"
        </p>
      </div>

      {/* Phase 7: Do NOT autoplay statement audio for true-false (it narrates the full statement).
          Only play explanation/reinforcement audio after answering. */}

      {/* True / False buttons */}
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((value) => {
          const label = value ? "Verdadeiro" : "Falso";
          let borderColor = "border-slate-200";
          let bgColor = "bg-white";
          let textColor = "text-slate-700";

          if (isAnswered) {
            if (value === quiz.isTrue) {
              borderColor = "border-emerald-500/50";
              bgColor = "bg-emerald-50";
              textColor = "text-emerald-700";
            } else if (value === selected) {
              borderColor = "border-red-500/50";
              bgColor = "bg-red-50";
              textColor = "text-red-700";
            } else {
              textColor = "text-slate-400";
            }
          } else if (selected === value) {
            borderColor = "border-indigo-500/50";
            bgColor = "bg-indigo-50";
            textColor = "text-slate-900";
          }

          return (
            <motion.button
              key={String(value)}
              onClick={() => handleSelect(value)}
              disabled={isAnswered}
              whileTap={!isAnswered ? { scale: 0.97 } : undefined}
              className={`w-full text-center px-4 py-4 rounded-xl border-2 ${borderColor} ${bgColor} ${textColor} transition-colors text-base font-semibold`}
            >
              <div className="flex items-center justify-center gap-2">
                {isAnswered && value === quiz.isTrue && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {isAnswered && value === selected && value !== quiz.isTrue && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>{label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm */}
      <AnimatePresence>
        {state === "answering" && selected !== null && (
          <motion.button
            ref={ctaRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25"
          >
            Confirmar
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feedback correct */}
      <AnimatePresence>
        {state === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-emerald-700 text-sm">Correto!</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{quiz.explanation}</p>
            {quiz.explanationAudioUrl && isActiveAudio && (
              <V8AudioPlayer audioUrl={quiz.explanationAudioUrl} autoPlay />
            )}
            {onContinue && (
              <button
                ref={ctaRef}
                onClick={onContinue}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback wrong */}
      <AnimatePresence>
        {state === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-red-700 text-sm">Não foi dessa vez</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{quiz.explanation}</p>
            {quiz.explanationAudioUrl && isActiveAudio && (
              <V8AudioPlayer audioUrl={quiz.explanationAudioUrl} autoPlay />
            )}
            <div className="flex items-center gap-4">
              {quiz.reinforcement && (
                <button
                  onClick={handleShowReinforcement}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Aprender mais
                </button>
              )}
              {onContinue && (
                <button
                  ref={ctaRef}
                  onClick={onContinue}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reinforcement */}
      <AnimatePresence>
        {state === "reinforcement" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3"
          >
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              Reforço
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{quiz.reinforcement}</p>
            {quiz.reinforcementAudioUrl && (
              <V8AudioPlayer audioUrl={quiz.reinforcementAudioUrl} autoPlay={isActiveAudio} />
            )}
            {onContinue && (
              <button
                ref={ctaRef}
                onClick={onContinue}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
