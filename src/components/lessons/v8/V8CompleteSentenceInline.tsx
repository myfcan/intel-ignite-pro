import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Puzzle } from "lucide-react";
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

export const V8CompleteSentenceInline = ({
  completeSentence,
  onContinue,
  onScore,
  isActive = true,
  isActiveAudio = false,
}: V8CompleteSentenceInlineProps) => {
  const { playSound } = useV7SoundEffects(0.6, true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const ctaRef = useRef<HTMLButtonElement>(null);
  const { audioLocked, onAudioEnded } = useAudioFirstLock(completeSentence.audioUrl, isActiveAudio);

  useEffect(() => {
    if (!isActive || !submitted) return;
    return scheduleCTAScroll(() => ctaRef.current);
  }, [submitted, isActive]);

  const handleChipSelect = useCallback((sentenceId: string, chip: string) => {
    if (submitted || audioLocked) return;
    setAnswers(prev => {
      if (prev[sentenceId] === chip) {
        const next = { ...prev };
        delete next[sentenceId];
        return next;
      }
      return { ...prev, [sentenceId]: chip };
    });
  }, [submitted, audioLocked]);

  const handleSubmit = useCallback(() => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    for (const sentence of completeSentence.sentences) {
      const userAnswer = (answers[sentence.id] || '').toLowerCase().trim();
      const isCorrect = sentence.correctAnswers.some(
        correct => correct.toLowerCase().trim() === userAnswer
      );
      newResults[sentence.id] = isCorrect;
      if (isCorrect) correctCount++;
    }

    setResults(newResults);
    setSubmitted(true);

    const score = Math.round((correctCount / completeSentence.sentences.length) * 100);
    if (score >= PASS_SCORE) playSound("success");
    else playSound("error");
    onScore?.(score);
  }, [answers, completeSentence.sentences, onScore, playSound]);

  const allAnswered = completeSentence.sentences.every(s => answers[s.id]);

  const renderSentence = (sentence: typeof completeSentence.sentences[0]) => {
    const parts = sentence.text.split("_______");
    if (parts.length < 2) return <span>{sentence.text}</span>;

    const selected = answers[sentence.id];
    const isCorrect = submitted ? results[sentence.id] : undefined;

    return (
      <span className="text-base leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-[60px] px-2 py-0.5 mx-1 rounded-lg border-2 font-semibold text-center transition-all ${
          submitted
            ? isCorrect
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-red-400 bg-red-50 text-red-700 line-through'
            : selected
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
              : 'border-dashed border-slate-300 bg-slate-50 text-slate-400 animate-pulse'
        }`}>
          {submitted && !isCorrect
            ? sentence.correctAnswers[0]
            : selected || '___'}
        </span>
        {parts[1]}
      </span>
    );
  };

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
            Complete a Frase
          </span>
        </div>
      </div>

      {/* Title + instruction */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">{completeSentence.title}</h3>
        <p className="text-sm text-slate-500 mt-1">{completeSentence.instruction}</p>
      </div>

      {/* Audio player for narration — locks chips until finished */}
      {completeSentence.audioUrl && !submitted && isActiveAudio && (
        <V8AudioPlayer audioUrl={completeSentence.audioUrl} autoPlay onEnded={onAudioEnded} />
      )}

      {/* Audio lock hint */}
      {audioLocked && !submitted && <V8AudioLockOverlay />}

      {/* Sentences */}
      <div className={`space-y-4 transition-all duration-300 ${audioLocked ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        {completeSentence.sentences.map(sentence => (
          <div key={sentence.id} className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-slate-900 font-medium">{renderSentence(sentence)}</p>
            </div>

            {/* Chip options */}
            {!submitted && (
              <div className="flex flex-wrap gap-2">
                {sentence.options.map(option => {
                  const isSelected = answers[sentence.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleChipSelect(sentence.id, option)}
                      disabled={audioLocked}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400 shadow-sm scale-105'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Submitted: show correct answer if wrong */}
            {submitted && !results[sentence.id] && (
              <p className="text-xs text-red-600 font-medium">
                ❌ Resposta correta: {sentence.correctAnswers[0]}
              </p>
            )}
            {submitted && results[sentence.id] && (
              <p className="text-xs text-emerald-600 font-medium">✅ Correto!</p>
            )}

            {/* Hints */}
            {sentence.hints && sentence.hints.length > 0 && !submitted && (
              <p className="text-xs text-amber-600">💡 {sentence.hints.join(' • ')}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <AnimatePresence>
        {!submitted && allAnswered && !audioLocked && (
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

      {/* Results */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">
              Você acertou {Object.values(results).filter(Boolean).length} de {completeSentence.sentences.length}!
            </span>
          </div>
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
    </motion.div>
  );
};
