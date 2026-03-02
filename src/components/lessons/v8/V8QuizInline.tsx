import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from "lucide-react";
import { V8InlineQuiz } from "@/types/v8Lesson";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { scheduleCTAScroll } from "./v8ScrollUtils";

interface V8QuizInlineProps {
  quiz: V8InlineQuiz;
  onAnswer: (correct: boolean) => void;
  onContinue?: () => void;
  isActiveAudio?: boolean;
  isActive?: boolean;
}

type QuizState = "answering" | "correct" | "wrong" | "reinforcement";

export const V8QuizInline = ({
  quiz,
  onAnswer,
  onContinue,
  isActiveAudio = false,
  isActive = true,
}: V8QuizInlineProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>("answering");
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Deterministic geometric scroll when state changes
  // Only scroll when this is the active item to prevent stale items from hijacking scroll
  useEffect(() => {
    if (!isActive) return;
    if (!selected && state === "answering") return;

    return scheduleCTAScroll(() => ctaRef.current);
  }, [selected, state, isActive]);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const option = quiz.options.find((o) => o.id === selected);
    if (!option) return;

    if (option.isCorrect) {
      setState("correct");
      onAnswer(true);
    } else {
      setState("wrong");
      onAnswer(false);
    }
  }, [selected, quiz.options, onAnswer]);

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
      {/* Header badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
            Quiz Rápido
          </span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold text-slate-900 leading-snug">
        {quiz.question}
      </h3>

      {/* Question audio */}
      {quiz.audioUrl && state === "answering" && isActiveAudio && (
        <V8AudioPlayer audioUrl={quiz.audioUrl} autoPlay />
      )}

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {quiz.options.map((option) => {
          let borderColor = "border-slate-200";
          let bgColor = "bg-white";
          let textColor = "text-slate-700";

          if (isAnswered) {
            if (option.isCorrect) {
              borderColor = "border-emerald-500/50";
              bgColor = "bg-emerald-50";
              textColor = "text-emerald-700";
            } else if (option.id === selected && !option.isCorrect) {
              borderColor = "border-red-500/50";
              bgColor = "bg-red-50";
              textColor = "text-red-700";
            } else {
              textColor = "text-slate-400";
            }
          } else if (option.id === selected) {
            borderColor = "border-indigo-500/50";
            bgColor = "bg-indigo-50";
            textColor = "text-slate-900";
          }

          return (
            <motion.button
              key={option.id}
              onClick={() => !isAnswered && setSelected(option.id)}
              disabled={isAnswered}
              whileTap={!isAnswered ? { scale: 0.98 } : undefined}
              className={`w-full text-left px-4 py-3.5 rounded-xl border ${borderColor} ${bgColor} ${textColor} transition-colors text-[15px] leading-snug`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-1">{option.text}</span>
                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
                {isAnswered && option.id === selected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button */}
      <AnimatePresence>
        {state === "answering" && selected && (
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

      {/* Feedback — correct */}
      <AnimatePresence>
        {state === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-emerald-700 text-sm">
                Correto!
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {quiz.explanation}
            </p>
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

      {/* Feedback — wrong */}
      <AnimatePresence>
        {state === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-red-700 text-sm">
                Não foi dessa vez
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {quiz.explanation}
            </p>
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

      {/* Reinforcement card */}
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
            <p className="text-sm text-slate-700 leading-relaxed">
              {quiz.reinforcement}
            </p>
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
