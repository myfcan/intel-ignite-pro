import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { V8InlinePlayground } from "@/types/v8Lesson";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, ArrowRight, Send, RotateCcw, Sparkles, AlertTriangle, CheckCircle2, XCircle, Copy, Loader2 } from "lucide-react";
import { scheduleCTAScroll } from "./v8ScrollUtils";
import { V8AudioPlayer } from "./V8AudioPlayer";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";
interface V8PlaygroundInlineProps {
  playground: V8InlinePlayground;
  onContinue?: () => void;
  onScore?: (score: number) => void;
  isActive?: boolean;
}

type Phase = "intro" | "amateur" | "professional" | "compare" | "challenge" | "done";

const PHASE_ORDER: Phase[] = ["intro", "amateur", "professional", "compare", "challenge", "done"];
const phaseToIndex = (p: Phase) => PHASE_ORDER.indexOf(p);

export const V8PlaygroundInline = ({ playground, onContinue, onScore, isActive = true }: V8PlaygroundInlineProps) => {
  const { playSound } = useV7SoundEffects(0.6, true);
  const [phase, setPhase] = useState<Phase>("intro");
  const [amateurResult, setAmateurResult] = useState(playground.amateurResult || "");
  const [professionalResult, setProfessionalResult] = useState(playground.professionalResult || "");
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  // Challenge state
  const [userPrompt, setUserPrompt] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [structuredFeedback, setStructuredFeedback] = useState<{
    verdict?: string;
    feedback?: string;
    criteriaBreakdown?: Array<{ criterion: string; met: boolean; detail: string }>;
    suggestions?: string[];
    improvedExample?: string;
  } | null>(null);
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
      // Play SFX only at evaluation moment (not in done phase)
      if (score >= 70) {
        playSound("success");
      } else {
        playSound("error");
      }
      setFeedback(data?.feedback || (score >= 70 ? playground.successMessage : playground.tryAgainMessage));
      setStructuredFeedback({
        verdict: data?.verdict || "",
        feedback: data?.feedback || "",
        criteriaBreakdown: data?.criteriaBreakdown || [],
        suggestions: data?.suggestions || [],
        improvedExample: data?.improvedExample || "",
      });

      if (score >= 70) {
        onScore?.(score);
      }
    } catch {
      // Offline fallback
      setFeedback(playground.offlineFallback?.message || "Avaliação indisponível no momento. Continue a aula.");
      setStructuredFeedback(null);
      setChallengeScore(null);
    } finally {
      setIsEvaluating(false);
    }
  }, [userPrompt, playground, onScore]);

  const canRetry = attempts < maxAttempts && (challengeScore === null || challengeScore < 70);

  const bottomRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll: ensure CTA button is visible after phase transitions
  // Only scroll when this is the active item to prevent stale items from hijacking scroll
  useEffect(() => {
    if (!isActive) return;
    if (phase === "intro") return;
    if (isLoadingResult || isEvaluating) return;

    return scheduleCTAScroll(
      () => ctaRef.current,
      () => bottomRef.current
    );
  }, [phase, isLoadingResult, isEvaluating, feedback, challengeScore, isActive]);

  const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm p-5";

  const pi = phaseToIndex(phase);
  // For challenge skip: if no userChallenge, treat challenge(4) as done(5)
  const hasChallenge = !!playground.userChallenge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Playground
        </div>
        <h2 className="text-xl font-bold text-slate-900">{playground.title}</h2>
        {playground.subtitle && (
          <p className="text-sm text-slate-500 mt-1">{playground.subtitle}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Phase: Intro (index 0) — always visible */}
        {pi >= 0 && (
          <motion.div
            key="intro"
            initial={pi === 0 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className={cardClass}
          >
            <p className="text-sm text-slate-700 leading-relaxed">{playground.instruction}</p>
            {pi === 0 && (
              <button
                onClick={handleNextPhase}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {isLoadingResult ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                ) : (
                  <>Ver Prompt Amador <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </motion.div>
        )}

        {/* Phase: Amateur (index 1) */}
        {pi >= 1 && (
          <motion.div
            key="amateur"
            initial={pi === 1 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className={`${cardClass} border-red-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase">Amador</span>
              </div>
              <p className="text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-3">{playground.amateurPrompt}</p>
            </div>
            {amateurResult && (
              <div className={`${cardClass} border-red-100`}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Resultado</p>
                <p className="text-sm text-slate-600 leading-relaxed">{amateurResult}</p>
              </div>
            )}
            {isLoadingResult && pi === 1 && (
              <div className="text-center py-4 text-xs text-slate-400 animate-pulse">Gerando resultado...</div>
            )}
            {pi === 1 && (
              <button
                ref={ctaRef}
                onClick={handleNextPhase}
                disabled={isLoadingResult}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoadingResult ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                ) : (
                  <>Agora o Profissional <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </motion.div>
        )}

        {/* Phase: Professional (index 2) */}
        {pi >= 2 && (
          <motion.div
            key="professional"
            initial={pi === 2 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className={`${cardClass} border-emerald-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">Profissional</span>
              </div>
              <p className="text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-3">{playground.professionalPrompt}</p>
            </div>
            {professionalResult && (
              <div className={`${cardClass} border-emerald-100`}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Resultado</p>
                <p className="text-sm text-slate-600 leading-relaxed">{professionalResult}</p>
              </div>
            )}
            {isLoadingResult && pi === 2 && (
              <div className="text-center py-4 text-xs text-slate-400 animate-pulse">Gerando resultado...</div>
            )}
            {pi === 2 && (
              <button
                ref={ctaRef}
                onClick={handleNextPhase}
                disabled={isLoadingResult}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoadingResult ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                ) : (
                  <>Comparar <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </motion.div>
        )}

        {/* Phase: Compare (index 3) */}
        {pi >= 3 && (
          <motion.div
            key="compare"
            initial={pi === 3 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className={`${cardClass} border-red-200`}>
                <p className="text-[10px] font-bold text-red-500 uppercase mb-2">❌ Amador</p>
                <p className="text-xs text-slate-600 line-clamp-4">{playground.amateurPrompt}</p>
              </div>
              <div className={`${cardClass} border-emerald-200`}>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-2">✅ Profissional</p>
                <p className="text-xs text-slate-600 line-clamp-4">{playground.professionalPrompt}</p>
              </div>
            </div>
            {pi === 3 && (
              <button
                ref={ctaRef}
                onClick={handleNextPhase}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {hasChallenge ? "Sua Vez!" : "Continuar"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}

        {/* Phase: Challenge (index 4) */}
        {pi >= 4 && hasChallenge && playground.userChallenge && (
          <motion.div
            key="challenge"
            initial={pi === 4 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className={cardClass}>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{playground.userChallenge.instruction}</p>

              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Digite seu prompt aqui..."
                className={`w-full h-28 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 resize-none ${pi >= 5 ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isEvaluating || (!canRetry && challengeScore !== null) || pi >= 5}
                readOnly={pi >= 5}
              />

              {/* Hints */}
              {playground.userChallenge.hints.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHints ? "Esconder dicas" : "Ver dicas"}
                  </button>
                  {showHints && (
                    <ul className="mt-2 space-y-1">
                      {playground.userChallenge.hints.map((hint, i) => (
                         <li key={i} className="text-xs text-amber-600/70 flex items-start gap-2">
                           <span className="text-amber-500 mt-0.5">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Structured Feedback */}
              {feedback && (
                <div className="mt-3 space-y-3">
                  {/* Header: verdict + score */}
                  <div className={`p-4 rounded-xl border ${challengeScore !== null && challengeScore >= 70 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${challengeScore !== null && challengeScore >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                        {structuredFeedback?.verdict || (challengeScore !== null && challengeScore >= 70 ? "Excelente!" : "Quase lá!")}
                      </span>
                      {challengeScore !== null && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${challengeScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {challengeScore}/100
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${challengeScore !== null && challengeScore >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                      {structuredFeedback?.feedback || feedback}
                    </p>
                  </div>

                  {/* Criteria breakdown */}
                  {structuredFeedback?.criteriaBreakdown && structuredFeedback.criteriaBreakdown.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-4 pt-3 pb-1">Análise por Critério</p>
                      <div className="divide-y divide-slate-100">
                        {structuredFeedback.criteriaBreakdown.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                            {item.met ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold ${item.met ? "text-emerald-700" : "text-red-600"}`}>
                                {item.criterion}
                              </p>
                              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {structuredFeedback?.suggestions && structuredFeedback.suggestions.length > 0 && (
                     <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                      <p className="text-[10px] font-bold text-violet-500 uppercase mb-1.5">💡 Sugestões para melhorar</p>
                      <ul className="space-y-1.5">
                        {structuredFeedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-xs text-violet-700 leading-relaxed flex items-start gap-2">
                            <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved example */}
                  {structuredFeedback?.improvedExample && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase">✨ Versão Melhorada</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(structuredFeedback.improvedExample || "")}
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                      </div>
                      <p className="text-xs text-indigo-700 font-mono leading-relaxed bg-white/60 rounded-lg p-2 border border-indigo-100">
                        {structuredFeedback.improvedExample}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Hint on fail */}
              {feedback && challengeScore !== null && challengeScore < 70 && playground.hintOnFail && attempts <= playground.hintOnFail.length && (
                <div className="mt-2 flex items-start gap-2 text-xs text-violet-600">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {playground.hintOnFail[attempts - 1]}
                </div>
              )}

              {/* Buttons — only when challenge is the active phase */}
              {pi === 4 && (
                <div className="mt-3 flex flex-col gap-2">
                  {attempts === 0 && canRetry && (
                    <button
                      ref={ctaRef}
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !userPrompt.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Avaliando...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Avaliar Meu Prompt
                        </>
                      )}
                    </button>
                  )}

                  {attempts > 0 && canRetry && challengeScore !== null && challengeScore < 70 && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        ref={ctaRef}
                        onClick={handleEvaluate}
                        disabled={isEvaluating || !userPrompt.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Avaliando...</>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            Tentar Novamente ({maxAttempts - attempts})
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPhase("done")}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Continuar Aula
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {((!canRetry && attempts > 0) || (challengeScore !== null && challengeScore >= 70)) && (
                    <button
                      ref={ctaRef}
                      onClick={() => setPhase("done")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center mt-2">
                {attempts}/{maxAttempts} tentativas
              </p>
            </div>
          </motion.div>
        )}

        {/* Phase: Done (index 5) */}
        {pi >= 5 && (
          <motion.div
            key="done"
            initial={pi === 5 ? { opacity: 0, scale: 0.95 } : false}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardClass} text-center`}
          >
            {/* Badge: Tarefa concluída or Playground concluído */}
            <div className="flex justify-center mb-3">
              {challengeScore !== null && challengeScore >= 70 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tarefa concluída
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Playground concluído
                </div>
              )}
            </div>
            <p className={`text-sm font-semibold mb-3 ${challengeScore !== null && challengeScore >= 70 ? "text-emerald-600" : "text-slate-600"}`}>
              {challengeScore !== null && challengeScore >= 70 ? playground.successMessage : "Você concluiu o playground. Continue a aula para aprender mais!"}
            </p>
            {/* Play success or tryAgain audio */}
            {challengeScore !== null && challengeScore >= 70 && playground.successAudioUrl && (
              <V8AudioPlayer audioUrl={playground.successAudioUrl} autoPlay />
            )}
            {(challengeScore === null || challengeScore < 70) && playground.tryAgainAudioUrl && (
              <V8AudioPlayer audioUrl={playground.tryAgainAudioUrl} autoPlay />
            )}
            {onContinue && (
              <button
                ref={ctaRef}
                onClick={onContinue}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Continuar Aula
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </motion.div>
  );
};
