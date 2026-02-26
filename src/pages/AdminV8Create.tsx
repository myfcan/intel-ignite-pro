import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, AlertTriangle, Loader2, Play, Pause, Upload, Save, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { V8LessonData, V8Section, V8InlineQuiz } from "@/types/v8Lesson";
import { Json } from "@/integrations/supabase/types";

// ─── Types ───
interface AudioResult {
  index: number;
  type: "section" | "quiz" | "quiz-reinforcement";
  audioUrl: string;
  durationEstimate: number;
  sizeKB: number;
}

interface GenerateResponse {
  success: boolean;
  lessonId: string;
  results: AudioResult[];
  errors?: Array<{ index: number; type: string; error: string }>;
  stats: { totalAudios: number; totalErrors: number; totalSizeKB: number; elapsedMs: number };
}

type Step = "edit" | "validate" | "generate" | "preview" | "saved";

// ─── Validation ───
interface ValidationResult {
  valid: boolean;
  sectionCount: number;
  quizCount: number;
  exerciseCount: number;
  warnings: string[];
  errors: string[];
}

function validateV8Json(raw: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    sectionCount: 0,
    quizCount: 0,
    exerciseCount: 0,
    warnings: [],
    errors: [],
  };

  if (!raw || typeof raw !== "object") {
    result.valid = false;
    result.errors.push("JSON inválido ou vazio");
    return result;
  }

  const data = raw as Record<string, unknown>;

  if (data.contentVersion !== "v8") {
    result.errors.push('contentVersion deve ser "v8"');
    result.valid = false;
  }

  if (!data.title || typeof data.title !== "string") {
    result.errors.push("title é obrigatório (string)");
    result.valid = false;
  }

  // Sections
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    result.errors.push("sections[] deve ter pelo menos 1 seção");
    result.valid = false;
  } else {
    result.sectionCount = data.sections.length;
    (data.sections as V8Section[]).forEach((s, i) => {
      if (!s.id) result.warnings.push(`Section ${i}: falta id`);
      if (!s.title) result.errors.push(`Section ${i}: falta title`);
      if (!s.content?.trim()) result.warnings.push(`Section ${i}: content vazio`);
    });
  }

  // Inline quizzes
  if (Array.isArray(data.inlineQuizzes)) {
    result.quizCount = data.inlineQuizzes.length;
    (data.inlineQuizzes as V8InlineQuiz[]).forEach((q, i) => {
      if (!q.question) result.errors.push(`Quiz ${i}: falta question`);
      if (!Array.isArray(q.options) || q.options.length < 2) {
        result.errors.push(`Quiz ${i}: mínimo 2 opções`);
      }
      const correct = q.options?.filter((o) => o.isCorrect);
      if (!correct?.length) result.errors.push(`Quiz ${i}: nenhuma opção correta`);
      if (q.afterSectionIndex >= (data.sections as V8Section[]).length) {
        result.warnings.push(`Quiz ${i}: afterSectionIndex (${q.afterSectionIndex}) >= total de sections`);
      }
    });
  }

  // Exercises
  if (Array.isArray(data.exercises)) {
    result.exerciseCount = data.exercises.length;
  }

  if (result.errors.length > 0) result.valid = false;
  return result;
}

// ─── Default JSON Template ───
const DEFAULT_JSON: V8LessonData = {
  contentVersion: "v8",
  title: "Nova Aula V8",
  description: "Descrição da aula",
  sections: [
    {
      id: "section-01",
      title: "Introdução",
      content: "## Bem-vindo\n\nEste é o conteúdo da primeira seção em **markdown**.",
      audioUrl: "",
    },
  ],
  inlineQuizzes: [],
  exercises: [],
};

// ─── Component ───
export default function AdminV8Create() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [selectedTrailId, setSelectedTrailId] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState("Nova Aula V8");
  const [orderIndex, setOrderIndex] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(10);
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [step, setStep] = useState<Step>("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Fetch V8 trails
  const { data: trails = [] } = useQuery({
    queryKey: ["v8-trails-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trails")
        .select("id, title, order_index, trail_type")
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      // Filter V8 trails (trail_type = 'v8'), but also show all if none are v8 yet
      const v8Trails = (data || []).filter((t) => t.trail_type === "v8");
      return v8Trails.length > 0 ? v8Trails : data || [];
    },
  });

  // ─── Handlers ───
  const handleValidate = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = validateV8Json(parsed);
      setValidation(result);
      if (result.valid) {
        setLessonTitle(parsed.title || lessonTitle);
        setStep("validate");
        toast({ title: "✅ JSON válido", description: `${result.sectionCount} seções, ${result.quizCount} quizzes, ${result.exerciseCount} exercícios` });
      } else {
        toast({ title: "❌ Erros encontrados", description: result.errors.join("; "), variant: "destructive" });
      }
    } catch (e) {
      setValidation({ valid: false, sectionCount: 0, quizCount: 0, exerciseCount: 0, warnings: [], errors: ["JSON parse error: " + (e as Error).message] });
      toast({ title: "❌ JSON inválido", description: (e as Error).message, variant: "destructive" });
    }
  }, [jsonText, lessonTitle, toast]);

  const handleGenerateAudio = useCallback(async () => {
    if (!validation?.valid) return;

    setIsGenerating(true);
    setStep("generate");

    try {
      const parsed: V8LessonData = JSON.parse(jsonText);
      
      // First, save as draft to get a lessonId
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create temporary lesson draft
      let lessonId = savedLessonId;
      if (!lessonId) {
        const { data: draftId, error: draftError } = await supabase.rpc("create_lesson_draft", {
          p_title: lessonTitle,
          p_trail_id: selectedTrailId || trails[0]?.id,
          p_order_index: orderIndex,
          p_estimated_time: estimatedTime,
          p_content: parsed as unknown as Json,
        });
        if (draftError) throw draftError;
        lessonId = draftId;
        setSavedLessonId(lessonId);
      }

      // Call v8-generate edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v8-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            lessonId,
            sections: parsed.sections,
            quizzes: parsed.inlineQuizzes,
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`v8-generate failed: ${response.status} - ${errBody}`);
      }

      const result: GenerateResponse = await response.json();
      setGenerateResult(result);

      // Update JSON with generated audio URLs
      const updatedData = { ...parsed };
      for (const r of result.results) {
        if (r.type === "section" && updatedData.sections[r.index]) {
          updatedData.sections[r.index].audioUrl = r.audioUrl;
          updatedData.sections[r.index].audioDurationSeconds = r.durationEstimate;
        } else if (r.type === "quiz" && updatedData.inlineQuizzes[r.index]) {
          updatedData.inlineQuizzes[r.index].audioUrl = r.audioUrl;
        } else if (r.type === "quiz-reinforcement" && updatedData.inlineQuizzes[r.index]) {
          updatedData.inlineQuizzes[r.index].reinforcementAudioUrl = r.audioUrl;
        }
      }

      setJsonText(JSON.stringify(updatedData, null, 2));
      setStep("preview");

      toast({
        title: result.success ? "✅ Áudios gerados!" : "⚠️ Gerado com erros",
        description: `${result.stats.totalAudios} áudios (${result.stats.totalSizeKB}KB) em ${(result.stats.elapsedMs / 1000).toFixed(1)}s`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "❌ Erro na geração", description: msg, variant: "destructive" });
      setStep("validate");
    } finally {
      setIsGenerating(false);
    }
  }, [validation, jsonText, selectedTrailId, trails, lessonTitle, orderIndex, estimatedTime, savedLessonId, toast]);

  const handleSave = useCallback(async (activate: boolean) => {
    setIsSaving(true);
    try {
      const parsed: V8LessonData = JSON.parse(jsonText);

      if (savedLessonId) {
        // Update existing draft
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lessonTitle,
            content: parsed as unknown as Json,
            exercises: (parsed.exercises || []) as unknown as Json,
            estimated_time: estimatedTime,
            order_index: orderIndex,
            trail_id: selectedTrailId || trails[0]?.id,
            model: "v8",
            lesson_type: "guided",
            is_active: activate,
            status: activate ? "publicado" : "rascunho",
          })
          .eq("id", savedLessonId);
        if (error) throw error;
      } else {
        // Create new
        const { data: draftId, error: draftError } = await supabase.rpc("create_lesson_draft", {
          p_title: lessonTitle,
          p_trail_id: selectedTrailId || trails[0]?.id,
          p_order_index: orderIndex,
          p_estimated_time: estimatedTime,
          p_content: parsed as unknown as Json,
          p_exercises: (parsed.exercises || []) as unknown as Json,
        });
        if (draftError) throw draftError;
        setSavedLessonId(draftId);

        if (activate) {
          await supabase
            .from("lessons")
            .update({ is_active: true, status: "publicado", model: "v8" })
            .eq("id", draftId);
        }
      }

      setStep("saved");
      toast({
        title: activate ? "✅ Aula publicada!" : "💾 Rascunho salvo",
        description: activate ? "A aula está ativa e visível para os alunos." : "Salvo como rascunho.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "❌ Erro ao salvar", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [jsonText, savedLessonId, lessonTitle, selectedTrailId, trails, estimatedTime, orderIndex, toast]);

  const toggleAudioPreview = (url: string) => {
    if (playingAudioUrl === url && audioElement) {
      audioElement.pause();
      setPlayingAudioUrl(null);
      setAudioElement(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => { setPlayingAudioUrl(null); setAudioElement(null); };
      setPlayingAudioUrl(url);
      setAudioElement(audio);
    }
  };

  // ─── Render ───
  const cardStyle = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Criar Aula V8</h1>
            <p className="text-xs text-slate-500">Read & Listen Premium</p>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(["edit", "validate", "generate", "preview", "saved"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === s ? "bg-indigo-500" : i < ["edit", "validate", "generate", "preview", "saved"].indexOf(step) ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* ─── METADATA ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Metadados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Trilha V8</label>
              <select
                value={selectedTrailId}
                onChange={(e) => setSelectedTrailId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Selecione...</option>
                {trails.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Título</label>
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Ordem</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                min={1}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Tempo estimado (min)</label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                min={1}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── JSON EDITOR ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">JSON (V8LessonData)</h2>
            <button
              onClick={handleValidate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Validar JSON
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setValidation(null); setStep("edit"); }}
            className="w-full h-80 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-y"
            spellCheck={false}
          />
        </motion.div>

        {/* ─── VALIDATION RESULT ─── */}
        {validation && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Validação</h2>
            <div className="flex items-center gap-4 mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${validation.valid ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                {validation.valid ? "✅ Válido" : "❌ Inválido"}
              </span>
              <span className="text-xs text-slate-500">
                {validation.sectionCount} seções · {validation.quizCount} quizzes · {validation.exerciseCount} exercícios
              </span>
            </div>
            {validation.errors.length > 0 && (
              <div className="space-y-1 mb-2">
                {validation.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="space-y-1">
                {validation.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── GENERATE AUDIO ─── */}
        {validation?.valid && step !== "edit" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300">Gerar Áudios</h2>
              {isGenerating && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Gerando...
                </span>
              )}
            </div>

            {!generateResult && !isGenerating && (
              <button
                onClick={handleGenerateAudio}
                disabled={!selectedTrailId && trails.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Gerar Áudios ({validation.sectionCount} seções + {validation.quizCount} quizzes)
              </button>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-slate-400">Gerando áudios via ElevenLabs...</p>
                <p className="text-xs text-slate-600">Isso pode levar alguns minutos</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── AUDIO PREVIEW ─── */}
        {generateResult && step === "preview" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Preview de Áudios</h2>
            <div className="space-y-2">
              {generateResult.results.map((r) => (
                <div key={`${r.type}-${r.index}`} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                  <button
                    onClick={() => toggleAudioPreview(r.audioUrl)}
                    className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center hover:bg-indigo-500/30 transition-colors flex-shrink-0"
                  >
                    {playingAudioUrl === r.audioUrl ? (
                      <Pause className="w-3.5 h-3.5 text-indigo-300" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-indigo-300 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {r.type === "section" ? `Seção ${r.index + 1}` : r.type === "quiz" ? `Quiz ${r.index + 1}` : `Quiz ${r.index + 1} (reforço)`}
                    </p>
                    <p className="text-[10px] text-slate-500">~{r.durationEstimate}s · {r.sizeKB}KB</p>
                  </div>
                </div>
              ))}
            </div>

            {generateResult.errors && generateResult.errors.length > 0 && (
              <div className="mt-3 space-y-1">
                {generateResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400">❌ {e.type} {e.index}: {e.error}</p>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500">
              Total: {generateResult.stats.totalAudios} áudios · {generateResult.stats.totalSizeKB}KB · {(generateResult.stats.elapsedMs / 1000).toFixed(1)}s
            </div>
          </motion.div>
        )}

        {/* ─── SAVE ACTIONS ─── */}
        {(step === "preview" || step === "validate") && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Rascunho
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Salvar e Ativar
            </button>
          </motion.div>
        )}

        {/* ─── SAVED CONFIRMATION ─── */}
        {step === "saved" && savedLessonId && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${cardStyle} text-center`}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold mb-1">Aula salva com sucesso!</h2>
            <p className="text-sm text-slate-400 mb-4">ID: {savedLessonId}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/v8/${savedLessonId}`)}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30 transition-colors"
              >
                Preview da Aula
              </button>
              <button
                onClick={() => {
                  setStep("edit");
                  setSavedLessonId(null);
                  setGenerateResult(null);
                  setValidation(null);
                  setJsonText(JSON.stringify(DEFAULT_JSON, null, 2));
                }}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Criar Outra
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
