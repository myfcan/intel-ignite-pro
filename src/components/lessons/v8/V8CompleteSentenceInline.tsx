import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Puzzle, RotateCcw } from "lucide-react";
import { V8InlineCompleteSentence } from "@/types/v8Lesson";
import { scheduleCTAScroll } from "./v8ScrollUtils";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";
import { PASS_SCORE } from "@/constants/v8Rules";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { useAudioFirstLock } from "./useAudioFirstLock";
import { V8AudioLockOverlay } from "./V8AudioLockOverlay";

interface V8CompleteSentenceInlineProps {
  completeSentence: V8InlineCompleteSentence;
  onContinue?: () => void;
  onScore?: (score: number) => void;
  isActive?: boolean;
  isActiveAudio?: boolean;
}

const shuffle = <T,>(input: T[]) => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * V8CompleteSentenceInline — Coursiv Prompt Builder
 *
 * Renders ONE sentence with MULTIPLE inline blanks.
 * The user fills each blank by tapping a blank slot then picking a word from the shuffled word bank.
 *
 * Data contract (from pipeline):
 *   sentences[0].text = "Planeje para _______ com €40/dia para _______ e €50 para _______"
 *   sentences[0].correctAnswers = ["um casal", "refeições", "atrações"]  (ordered by blank position)
 *   sentences[0].options = ["um casal", "refeições", "atrações", "Gótico", "€30"]  (all chips including distractors)
 *
 * Legacy compat: if data has multiple sentences (old format), we join them into one prompt view.
 */
export const V8CompleteSentenceInline = ({
  completeSentence,
  onContinue,
  onScore,
  isActive = true,
  isActiveAudio = false,
}: V8CompleteSentenceInlineProps) => {
  const { playSound } = useV7SoundEffects(0.6, true);
  const { audioLocked, justUnlocked, onAudioEnded } = useAudioFirstLock(completeSentence.audioUrl, isActiveAudio);

  // Normalize: merge all sentences into a single prompt with N blanks
  const { promptParts, correctAnswers, wordBank } = useMemo(() => {
    const sentences = completeSentence.sentences;

    if (sentences.length === 1) {
      // New format: 1 sentence, multiple blanks
      const parts = sentences[0].text.split("_______");
      const correct = sentences[0].correctAnswers || [];
      const allChips = sentences[0].options?.length
        ? [...sentences[0].options]
        : [...correct];
      return {
        promptParts: parts,
        correctAnswers: correct.map((a) => a.trim().toLowerCase()),
        wordBank: shuffle(Array.from(new Set(allChips))),
      };
    }

    // Legacy: multiple sentences with 1 blank each → join into 1 prompt
    let combinedText = "";
    const allCorrect: string[] = [];
    const allChips = new Set<string>();

    for (const s of sentences) {
      combinedText += (combinedText ? " " : "") + s.text;
      const correct = (s.correctAnswers?.[0] || "").trim();
      if (correct) {
        allCorrect.push(correct);
        allChips.add(correct);
      }
      for (const opt of s.options || []) {
        allChips.add(opt.trim());
      }
    }

    const parts = combinedText.split("_______");
    return {
      promptParts: parts,
      correctAnswers: allCorrect.map((a) => a.toLowerCase()),
      wordBank: shuffle(Array.from(allChips)),
    };
  }, [completeSentence]);

  const blankCount = correctAnswers.length;
  const [fills, setFills] = useState<(string | null)[]>(() => Array(blankCount).fill(null));
  const [activeBlank, setActiveBlank] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Reset on data change
  useEffect(() => {
    setFills(Array(blankCount).fill(null));
    setActiveBlank(0);
    setSubmitted(false);
    setResults([]);
  }, [completeSentence.id, blankCount]);

  useEffect(() => {
    if (!isActive || !submitted) return;
    return scheduleCTAScroll(() => ctaRef.current);
  }, [submitted, isActive]);

  // Auto-advance active blank to next empty
  useEffect(() => {
    if (submitted || audioLocked) return;
    if (activeBlank !== null && fills[activeBlank] !== null) {
      const nextEmpty = fills.findIndex((f) => f === null);
      setActiveBlank(nextEmpty >= 0 ? nextEmpty : null);
    }
  }, [fills, activeBlank, submitted, audioLocked]);

  const handleWordSelect = useCallback(
    (word: string) => {
      if (submitted || audioLocked) return;

      setFills((prev) => {
        const next = [...prev];

        // If this word is already placed somewhere, remove it
        const existingIdx = next.indexOf(word);
        if (existingIdx >= 0) {
          next[existingIdx] = null;
          if (existingIdx === activeBlank) {
            // Deselect from active blank
            return next;
          }
        }

        // Place in active blank
        const target = activeBlank ?? next.findIndex((f) => f === null);
        if (target >= 0 && target < next.length) {
          next[target] = word;
        }

        return next;
      });
    },
    [submitted, audioLocked, activeBlank],
  );

  const handleBlankTap = useCallback(
    (idx: number) => {
      if (submitted || audioLocked) return;
      if (fills[idx] !== null) {
        // Remove word from this blank
        setFills((prev) => {
          const next = [...prev];
          next[idx] = null;
          return next;
        });
        setActiveBlank(idx);
      } else {
        setActiveBlank(idx);
      }
    },
    [submitted, audioLocked, fills],
  );

  const handleSubmit = useCallback(() => {
    const res = fills.map((fill, i) => {
      if (!fill) return false;
      return fill.trim().toLowerCase() === correctAnswers[i];
    });
    setResults(res);
    setSubmitted(true);

    const correctCount = res.filter(Boolean).length;
    const score = Math.round((correctCount / blankCount) * 100);
    if (score >= PASS_SCORE) playSound("success");
    else playSound("error");
    onScore?.(score);

  }, [fills, correctAnswers, blankCount, onScore, playSound]);

  const handleRetry = useCallback(() => {
    setFills(Array(blankCount).fill(null));
    setActiveBlank(0);
    setSubmitted(false);
    setResults([]);
  }, [blankCount]);

  const allFilled = fills.every((f) => f !== null);
  const correctCount = results.filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5 pb-8"
    >
      {/* Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200">
          <Puzzle className="w-3.5 h-3.5 text-cyan-600" />
          <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wider">
            Monte o Prompt
          </span>
        </div>
      </div>

      {/* Title & instruction */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">{completeSentence.title}</h3>
        <p className="text-sm text-slate-500 mt-1">{completeSentence.instruction}</p>
      </div>

      {/* Audio */}
      {completeSentence.audioUrl && !submitted && isActiveAudio && (
        <V8AudioPlayer audioUrl={completeSentence.audioUrl} autoPlay onEnded={onAudioEnded} />
      )}
      {audioLocked && !submitted && <V8AudioLockOverlay />}

      {/* Single prompt with inline blanks */}
      <div
        className={`transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-indigo-400/60 ring-offset-2 rounded-xl animate-pulse" : ""}`}
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-base leading-[2.2] text-slate-900 font-medium">
            {promptParts.map((part, i) => (
              <span key={i}>
                {part}
                {i < blankCount && (
                  <button
                    type="button"
                    onClick={() => handleBlankTap(i)}
                    className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 mx-1 rounded-lg border-2 font-semibold text-center transition-all align-baseline ${
                      submitted
                        ? results[i]
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : fills[i]
                          ? activeBlank === i
                            ? "border-indigo-500 bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300"
                            : "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : activeBlank === i
                            ? "border-indigo-400 bg-indigo-50/50 text-indigo-400 ring-2 ring-indigo-300 border-dashed"
                            : "border-dashed border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {submitted && !results[i] ? (
                      <span>
                        <span className="line-through opacity-60">{fills[i]}</span>
                        {" → "}
                        <span className="text-emerald-600 font-bold">
                          {correctAnswers[i]}
                        </span>
                      </span>
                    ) : (
                      fills[i] || "___"
                    )}
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Word bank */}
      {!submitted && (
        <div className={`space-y-2 transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Palavras — toque na lacuna e depois na palavra
          </p>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word) => {
              const isUsed = fills.includes(word);
              return (
                <button
                  key={word}
                  onClick={() => handleWordSelect(word)}
                  disabled={audioLocked}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isUsed
                      ? "bg-slate-200 text-slate-400 border border-slate-200 scale-95"
                      : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit button */}
      <AnimatePresence>
        {!submitted && allFilled && !audioLocked && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25"
          >
            Verificar Respostas
          </motion.button>
        )}
      </AnimatePresence>

      {/* Result feedback */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className={`flex items-center gap-2 p-4 rounded-xl border ${
            correctCount === blankCount
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${correctCount === blankCount ? "text-emerald-500" : "text-amber-500"}`} />
            <span className={`text-sm font-semibold ${correctCount === blankCount ? "text-emerald-700" : "text-amber-700"}`}>
              {correctCount}/{blankCount} acertos!
            </span>
          </div>

          {onContinue && (
            <div className={`grid gap-2 ${correctCount < blankCount ? "grid-cols-2" : ""}`}>
              {correctCount < blankCount && (
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
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
