import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Puzzle, RotateCcw, Sparkles } from "lucide-react";
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

  const { promptParts, correctAnswers, wordBank } = useMemo(() => {
    const sentences = completeSentence.sentences;

    if (sentences.length === 1) {
      const parts = sentences[0].text.split("_______");
      const correct = sentences[0].correctAnswers || [];
      return {
        promptParts: parts,
        correctAnswers: correct.map((a) => a.trim().toLowerCase()),
        wordBank: shuffle([...correct]),
      };
    }

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
        const existingIdx = next.indexOf(word);
        if (existingIdx >= 0) {
          next[existingIdx] = null;
          if (existingIdx === activeBlank) return next;
        }
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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <Puzzle className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Monte o Prompt
          </span>
        </div>
      </div>

      {/* Title & instruction */}
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">{completeSentence.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{completeSentence.instruction}</p>
      </div>

      {/* Audio */}
      {completeSentence.audioUrl && !submitted && isActiveAudio && (
        <V8AudioPlayer audioUrl={completeSentence.audioUrl} autoPlay onEnded={onAudioEnded} />
      )}
      {audioLocked && !submitted && <V8AudioLockOverlay />}

      {/* Prompt with inline blanks */}
      <div
        className={`transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"} ${justUnlocked ? "ring-2 ring-primary/40 ring-offset-2 rounded-2xl animate-pulse" : ""}`}
      >
        <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-muted/20 p-3.5 sm:p-5 shadow-sm">
          <p className="text-[13px] sm:text-base leading-[2.4] sm:leading-[2.2] text-foreground font-medium">
            {promptParts.map((part, i) => (
              <span key={i}>
                {part.trim()}{" "}
                {i < blankCount && (
                  <button
                    type="button"
                    onClick={() => handleBlankTap(i)}
                    className={`inline-flex items-center justify-center min-w-[60px] sm:min-w-[72px] px-2 py-0.5 mx-0.5 rounded-lg border-2 font-semibold text-xs sm:text-sm text-center transition-all align-baseline ${
                      submitted
                        ? results[i]
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "border-destructive/60 bg-destructive/5 text-destructive"
                        : fills[i]
                          ? activeBlank === i
                            ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/30"
                            : "border-primary/60 bg-primary/5 text-primary"
                          : activeBlank === i
                            ? "border-primary/50 bg-primary/5 text-primary/40 ring-2 ring-primary/20 border-dashed"
                            : "border-dashed border-muted-foreground/25 bg-background text-muted-foreground/40"
                    }`}
                  >
                    {submitted && !results[i] ? (
                      <span className="text-[11px] sm:text-xs">
                        <span className="line-through opacity-50">{fills[i]}</span>
                        {" → "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {correctAnswers[i]}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm">{fills[i] || "___"}</span>
                    )}
                  </button>
                )}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Word bank */}
      {!submitted && (
        <div className={`space-y-1.5 transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Toque na lacuna e depois na palavra
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {wordBank.map((word) => {
              const isUsed = fills.includes(word);
              return (
                <motion.button
                  key={word}
                  onClick={() => handleWordSelect(word)}
                  disabled={audioLocked}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isUsed
                      ? "bg-muted text-muted-foreground/40 border border-muted scale-95"
                      : "bg-background text-foreground border border-border hover:border-primary hover:bg-primary/5 shadow-sm"
                  }`}
                >
                  {word}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit button */}
      <AnimatePresence>
        {!submitted && allFilled && !audioLocked && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Verificar Respostas
          </motion.button>
        )}
      </AnimatePresence>

      {/* Result feedback */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2.5"
        >
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${
            correctCount === blankCount
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 dark:border-emerald-800"
              : "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10 dark:border-amber-800"
          }`}>
            <CheckCircle2 className={`w-4 h-4 ${correctCount === blankCount ? "text-emerald-500" : "text-amber-500"}`} />
            <span className={`text-xs sm:text-sm font-bold ${correctCount === blankCount ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
              {correctCount}/{blankCount} acertos!
            </span>
          </div>

          {onContinue && (
            <div className={`grid gap-2 ${correctCount < blankCount ? "grid-cols-2" : ""}`}>
              {correctCount < blankCount && (
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Tentar Novamente
                </button>
              )}
              <button
                ref={ctaRef}
                onClick={onContinue}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Continuar Aula
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
