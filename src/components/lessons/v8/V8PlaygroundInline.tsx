import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { V8InlinePlayground } from "@/types/v8Lesson";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, ArrowRight, Send, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";

interface V8PlaygroundInlineProps {
  playground: V8InlinePlayground;
  onContinue: () => void;
  onScore?: (score: number) => void;
}

type Phase = "intro" | "amateur" | "professional" | "compare" | "challenge" | "done";

export const V8PlaygroundInline = ({ playground, onContinue, onScore }: V8PlaygroundInlineProps) => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [amateurResult, setAmateurResult] = useState(playground.amateurResult || "");
  const [professionalResult, setProfessionalResult] = useState(playground.professionalResult || "");
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  // Challenge state
  const [userPrompt, setUserPrompt] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const maxAttempts = playground.userChallenge?.maxAttempts ?? 3;

  // Generate result via AI if not pre-baked
  const generateResult = useCallback(async (prompt: string, setter: (v: string) => void) => {
    setIsLoadingResult(true);
    try {
      const { data, error } = await supabase.functions.invoke("v8-evaluate-prompt", {
        body: {
          mode: "generate-result",
          prompt,
        },
      });
      if (error) throw error;
      setter(data?.result || "Resultado indisponível.");
    } catch {
      setter(playground.offlineFallback?.exampleAnswer || "Não foi possível gerar o resultado. Continue a aula.");
    } finally {
      setIsLoadingResult(false);
    }
  }, [playground.offlineFallback]);

  const handleNextPhase = useCallback(async () => {
    const phases: Phase[] = ["intro", "amateur", "professional", "compare"];
    if (playground.userChallenge) phases.push("challenge");
    phases.push("done");

    const currentIdx = phases.indexOf(phase);
    const nextPhase = phases[currentIdx + 1] || "done";

    // Load AI results if needed
    if (nextPhase === "amateur" && !amateurResult) {
      await generateResult(playground.amateurPrompt, setAmateurResult);
    }
    if (nextPhase === "professional" && !professionalResult) {
      await generateResult(playground.professionalPrompt, setProfessionalResult);
    }

    setPhase(nextPhase);
  }, [phase, amateurResult, professionalResult, playground, generateResult]);

  // Evaluate user challenge
  const handleEvaluate = useCallback(async () => {
    if (!userPrompt.trim() || !playground.userChallenge) return;

    setIsEvaluating(true);
    setAttempts((prev) => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke("v8-evaluate-prompt", {
        body: {
          mode: "evaluate",
          userPrompt: userPrompt.trim(),
          evaluationCriteria: playground.userChallenge.evaluationCriteria,
          rubric: playground.userChallenge.scoring?.rubric,
          maxScore: playground.userChallenge.scoring?.maxScore ?? 100,
        },
      });

      if (error) throw error;

      const score = data?.score ?? 0;
      setChallengeScore(score);
      setFeedback(data?.feedback || (score >= 70 ? playground.successMessage : playground.tryAgainMessage));

      if (score >= 70) {
        onScore?.(score);
      }
    } catch {
      // Offline fallback
      setFeedback(playground.offlineFallback?.message || "Avaliação indisponível no momento. Continue a aula.");
      setChallengeScore(null);
    } finally {
      setIsEvaluating(false);
    }
  }, [userPrompt, playground, onScore]);

  const canRetry = attempts < maxAttempts && (challengeScore === null || challengeScore < 70);

  const cardClass = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Playground
        </div>
        <h2 className="text-xl font-bold text-white">{playground.title}</h2>
        {playground.subtitle && (
          <p className="text-sm text-slate-400 mt-1">{playground.subtitle}</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Phase: Intro */}
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cardClass}>
            <p className="text-sm text-slate-300 leading-relaxed">{playground.instruction}</p>
            <button
              onClick={handleNextPhase}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Ver Prompt Amador
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Phase: Amateur */}
        {phase === "amateur" && (
          <motion.div key="amateur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className={`${cardClass} border-red-500/20`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold uppercase">Amador</span>
              </div>
              <p className="text-sm text-slate-300 font-mono bg-slate-900/60 rounded-lg p-3">{playground.amateurPrompt}</p>
            </div>
            {amateurResult && (
              <div className={`${cardClass} border-red-500/10`}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Resultado</p>
                <p className="text-sm text-slate-400 leading-relaxed">{amateurResult}</p>
              </div>
            )}
            {isLoadingResult && (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">Gerando resultado...</div>
            )}
            <button
              onClick={handleNextPhase}
              disabled={isLoadingResult}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Agora o Profissional
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Phase: Professional */}
        {phase === "professional" && (
          <motion.div key="professional" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className={`${cardClass} border-emerald-500/20`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">Profissional</span>
              </div>
              <p className="text-sm text-slate-300 font-mono bg-slate-900/60 rounded-lg p-3">{playground.professionalPrompt}</p>
            </div>
            {professionalResult && (
              <div className={`${cardClass} border-emerald-500/10`}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Resultado</p>
                <p className="text-sm text-slate-400 leading-relaxed">{professionalResult}</p>
              </div>
            )}
            {isLoadingResult && (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">Gerando resultado...</div>
            )}
            <button
              onClick={handleNextPhase}
              disabled={isLoadingResult}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Comparar
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Phase: Compare */}
        {phase === "compare" && (
          <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className={`${cardClass} border-red-500/20`}>
                <p className="text-[10px] font-bold text-red-400 uppercase mb-2">❌ Amador</p>
                <p className="text-xs text-slate-400 line-clamp-4">{playground.amateurPrompt}</p>
              </div>
              <div className={`${cardClass} border-emerald-500/20`}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2">✅ Profissional</p>
                <p className="text-xs text-slate-400 line-clamp-4">{playground.professionalPrompt}</p>
              </div>
            </div>
            <button
              onClick={handleNextPhase}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {playground.userChallenge ? "Sua Vez!" : "Continuar"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Phase: Challenge */}
        {phase === "challenge" && playground.userChallenge && (
          <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className={cardClass}>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">{playground.userChallenge.instruction}</p>

              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Digite seu prompt aqui..."
                className="w-full h-28 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                disabled={isEvaluating || (!canRetry && challengeScore !== null)}
              />

              {/* Hints */}
              {playground.userChallenge.hints.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHints ? "Esconder dicas" : "Ver dicas"}
                  </button>
                  {showHints && (
                    <ul className="mt-2 space-y-1">
                      {playground.userChallenge.hints.map((hint, i) => (
                        <li key={i} className="text-xs text-amber-300/70 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`mt-3 p-3 rounded-xl text-sm ${challengeScore !== null && challengeScore >= 70 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-amber-500/10 border border-amber-500/20 text-amber-300"}`}>
                  {feedback}
                  {challengeScore !== null && (
                    <p className="text-xs mt-1 opacity-70">Score: {challengeScore}/100</p>
                  )}
                </div>
              )}

              {/* Hint on fail */}
              {feedback && challengeScore !== null && challengeScore < 70 && playground.hintOnFail && attempts <= playground.hintOnFail.length && (
                <div className="mt-2 flex items-start gap-2 text-xs text-violet-300">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {playground.hintOnFail[attempts - 1]}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {canRetry && (
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating || !userPrompt.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <span className="animate-pulse">Avaliando...</span>
                    ) : attempts > 0 ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Tentar Novamente ({maxAttempts - attempts} restantes)
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Avaliar Meu Prompt
                      </>
                    )}
                  </button>
                )}
                {(!canRetry || (challengeScore !== null && challengeScore >= 70)) && (
                  <button
                    onClick={() => setPhase("done")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-2">
                {attempts}/{maxAttempts} tentativas
              </p>
            </div>
          </motion.div>
        )}

        {/* Phase: Done */}
        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`${cardClass} text-center`}>
            <p className={`text-sm font-semibold mb-3 ${challengeScore !== null && challengeScore >= 70 ? "text-emerald-300" : "text-amber-300"}`}>
              {challengeScore !== null && challengeScore >= 70 ? playground.successMessage : (attempts > 0 ? playground.tryAgainMessage : playground.successMessage)}
            </p>
            <button
              onClick={onContinue}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Continuar Aula
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
