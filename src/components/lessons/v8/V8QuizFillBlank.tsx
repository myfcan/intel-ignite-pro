import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V8InlineQuiz } from "@/types/v8Lesson";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { scheduleCTAScroll } from "./v8ScrollUtils";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";
import { useAudioFirstLock } from "./useAudioFirstLock";
import { V8AudioLockOverlay } from "./V8AudioLockOverlay";

interface V8QuizFillBlankProps {
  quiz: V8InlineQuiz;
  onAnswer: (correct: boolean) => void;
  onContinue?: () => void;
  isActiveAudio?: boolean;
  isActive?: boolean;
}

type QuizState = "answering" | "correct" | "wrong" | "reinforcement";

/** Normalize for comparison: lowercase, trim, remove accents */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const V8QuizFillBlank = ({
  quiz,
  onAnswer,
  onContinue,
  isActiveAudio = false,
  isActive = true,
}: V8QuizFillBlankProps) => {
  const [userInput, setUserInput] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>("answering");
  const ctaRef = useRef<HTMLButtonElement>(null);
  const { playSound } = useV7SoundEffects(0.6, true);
  const { audioLocked, justUnlocked, onAudioEnded } = useAudioFirstLock(quiz.audioUrl, isActiveAudio);

  const hasChips = Array.isArray(quiz.chipOptions) && quiz.chipOptions.length > 0;
  const currentAnswer = hasChips ? (selectedChip || "") : userInput;

  useEffect(() => {
    if (!isActive) return;
    if (!currentAnswer && state === "answering") return;
    return scheduleCTAScroll(() => ctaRef.current);
  }, [currentAnswer, state, isActive]);

  const handleConfirm = useCallback(() => {
    if (!currentAnswer.trim()) return;

    const normalizedInput = normalize(currentAnswer);
    const allAcceptable = [
      quiz.correctAnswer || "",
      ...(quiz.acceptableAnswers || []),
    ].filter(Boolean);

    const isCorrect = allAcceptable.some(
      (ans) => normalize(ans) === normalizedInput
    );

    if (isCorrect) {
      setState("correct");
      onAnswer(true);
      playSound("quiz-correct");
    } else {
      setState("wrong");
      playSound("quiz-wrong");
    }
  }, [currentAnswer, quiz.correctAnswer, quiz.acceptableAnswers, onAnswer, playSound]);

  const handleTryAgain = useCallback(() => {
    setUserInput("");
    setSelectedChip(null);
    setState("answering");
  }, []);

  const handleContinueAfterWrong = useCallback(() => {
    onAnswer(false);
    onContinue?.();
  }, [onAnswer, onContinue]);

  const handleShowReinforcement = () => setState("reinforcement");
  const isAnswered = state !== "answering";

  const renderSentence = () => {
    const sentence = quiz.sentenceWithBlank || "";
    const parts = sentence.split("_______");
    if (parts.length < 2) return <span>{sentence}</span>;

    return (
      <span>
        {parts[0]}
        {isAnswered ? (
          <span className="font-bold text-indigo-700 underline decoration-2 decoration-indigo-400 underline-offset-4">
            {quiz.correctAnswer}
          </span>
        ) : selectedChip ? (
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-300">
            {selectedChip}
          </span>
        ) : (
          <span className="inline-block min-w-[80px] border-b-2 border-indigo-400 mx-1 animate-pulse" />
        )}
        {parts[1]}
      </span>
    );
  };

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
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200">
          <PenLine className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider">
            Complete a Frase
          </span>
        </div>
      </div>

      {/* Question context */}
      {quiz.question && (
        <p className="text-sm text-slate-500 leading-relaxed">{quiz.question}</p>
      )}

      {/* Sentence with blank */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-lg font-medium text-slate-900 leading-relaxed">
          {renderSentence()}
        </p>
      </div>

      {/* Audio player for narration — locks inputs until finished */}
      {quiz.audioUrl && state === "answering" && isActiveAudio && (
        <V8AudioPlayer audioUrl={quiz.audioUrl} autoPlay onEnded={onAudioEnded} />
      )}

      {/* Audio lock hint */}
      {audioLocked && state === "answering" && <V8AudioLockOverlay />}

      {/* Input: Chips mode OR text input */}
      {!isAnswered && (
        <div className={`transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-indigo-400/60 ring-offset-2 rounded-xl animate-pulse" : ""}`}>
          {hasChips ? (
            <div className="flex flex-wrap gap-2">
              {quiz.chipOptions!.map((chip) => {
                const isSelected = selectedChip === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(isSelected ? null : chip)}
                    disabled={audioLocked}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400 shadow-sm scale-105'
                        : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="Digite sua resposta..."
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus={!audioLocked}
                disabled={audioLocked}
              />
            </div>
          )}
        </div>
      )}

      {/* Confirm */}
      <AnimatePresence>
        {state === "answering" && currentAnswer.trim() && !audioLocked && (
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
            <p className="text-sm text-slate-600 mb-1">
              Resposta correta: <strong className="text-slate-900">{quiz.correctAnswer}</strong>
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{quiz.explanation}</p>
            {quiz.explanationAudioUrl && isActiveAudio && (
              <V8AudioPlayer audioUrl={quiz.explanationAudioUrl} autoPlay />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="w-full"
              >
                Tentar Novamente
              </Button>
              {onContinue && (
                <Button
                  ref={ctaRef}
                  onClick={handleContinueAfterWrong}
                  className="w-full gap-2"
                >
                  Continuar Aula
                  <ArrowRight className="w-4 h-4" />
                </Button>
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
                onClick={handleContinueAfterWrong}
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
