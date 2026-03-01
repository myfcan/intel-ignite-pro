import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, AlertTriangle, Loader2, Play, Pause, Upload, Save, Zap, FileText, Code } from "lucide-react";
import { motion } from "framer-motion";
import { V8LessonData, V8Section, V8InlineQuiz, V8InlinePlayground } from "@/types/v8Lesson";
import { Json } from "@/integrations/supabase/types";
import { V7PipelineMonitor, PipelineStep, PipelineLog } from "@/components/admin/V7PipelineMonitor";
import { parseFullContent } from "@/lib/v8ContentParser";
import { V8SectionSetup } from "@/components/admin/V8SectionSetup";

// ─── Types ───
interface AudioResult {
  index: number;
  type: "section" | "quiz" | "quiz-reinforcement" | "playground";
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

type Step = "edit" | "setup" | "validate" | "generate" | "preview" | "saved";

// ─── Validation ───
interface ValidationResult {
  valid: boolean;
  sectionCount: number;
  quizCount: number;
  playgroundCount: number;
  exerciseCount: number;
  warnings: string[];
  errors: string[];
}

function validateV8Json(raw: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    sectionCount: 0,
    quizCount: 0,
    playgroundCount: 0,
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

  const sectionsLength = Array.isArray(data.sections) ? data.sections.length : 0;

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
      if (q.afterSectionIndex < 0 || q.afterSectionIndex >= sectionsLength) {
        result.errors.push(`Quiz ${i}: afterSectionIndex (${q.afterSectionIndex}) fora do range [0, ${sectionsLength - 1}]`);
      }
    });
  }

  // Inline playgrounds
  if (Array.isArray(data.inlinePlaygrounds)) {
    result.playgroundCount = (data.inlinePlaygrounds as V8InlinePlayground[]).length;
    (data.inlinePlaygrounds as V8InlinePlayground[]).forEach((pg, i) => {
      if (!pg.title) result.errors.push(`Playground ${i}: falta title`);
      if (!pg.instruction || pg.instruction.length < 40) {
        result.errors.push(`Playground ${i}: instruction deve ter >= 40 caracteres`);
      }
      if (!pg.amateurPrompt) result.errors.push(`Playground ${i}: falta amateurPrompt`);
      if (!pg.professionalPrompt) result.errors.push(`Playground ${i}: falta professionalPrompt`);
      if (pg.amateurPrompt === pg.professionalPrompt) {
        result.errors.push(`Playground ${i}: amateurPrompt e professionalPrompt são iguais`);
      }
      if (pg.amateurPrompt?.length > 2000) result.warnings.push(`Playground ${i}: amateurPrompt muito longo (>2000 chars)`);
      if (pg.professionalPrompt?.length > 2000) result.warnings.push(`Playground ${i}: professionalPrompt muito longo (>2000 chars)`);
      if (!pg.successMessage) result.errors.push(`Playground ${i}: falta successMessage`);
      if (!pg.tryAgainMessage) result.errors.push(`Playground ${i}: falta tryAgainMessage`);
      if (pg.afterSectionIndex < 0 || pg.afterSectionIndex >= sectionsLength) {
        result.errors.push(`Playground ${i}: afterSectionIndex (${pg.afterSectionIndex}) fora do range [0, ${sectionsLength - 1}]`);
      }
      if (pg.userChallenge) {
        if (pg.userChallenge.hints?.length > 3) {
          result.errors.push(`Playground ${i}: máximo 3 hints`);
        }
        if (!pg.userChallenge.evaluationCriteria?.length) {
          result.warnings.push(`Playground ${i}: challenge sem evaluationCriteria`);
        }
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
  inlinePlaygrounds: [],
  exercises: [],
};

// ─── Default V8 Pipeline Steps ───
const DEFAULT_V8_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'validate', name: 'Validando JSON de entrada', status: 'pending' },
  { id: 'create-draft', name: 'Criando rascunho no banco', status: 'pending' },
  { id: 'call-api', name: 'Conectando com ElevenLabs', status: 'pending' },
  { id: 'process-results', name: 'Processando áudios gerados', status: 'pending' },
  { id: 'update-content', name: 'Atualizando conteúdo com URLs de áudio', status: 'pending' },
  { id: 'finalize', name: 'Finalizando', status: 'pending' },
];

// ─── Component ───
export default function AdminV8Create() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [lessonTitle, setLessonTitle] = useState("Nova Aula V8");
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

  // Content mode
  const [editorMode, setEditorMode] = useState<"content" | "json">("content");
  const [contentText, setContentText] = useState("");
  
  // Parsed data for setup wizard
  const [parsedSections, setParsedSections] = useState<V8Section[]>([]);
  const [parsedQuizzes, setParsedQuizzes] = useState<V8InlineQuiz[]>([]);
  const [parsedPlaygrounds, setParsedPlaygrounds] = useState<V8InlinePlayground[]>([]);

  // Pipeline monitor state
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Pipeline helpers
  const updateStep = useCallback((id: string, status: PipelineStep['status'], message?: string) => {
    setPipelineSteps(prev => prev.map(s => s.id === id ? { ...s, status, message } : s));
  }, []);

  const addLog = useCallback((level: PipelineLog['level'], message: string) => {
    setPipelineLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
  }, []);

  const resetPipeline = useCallback(() => {
    setPipelineSteps(DEFAULT_V8_PIPELINE_STEPS.map(s => ({ ...s })));
    setPipelineLogs([]);
    setPipelineProgress(0);
    setPipelineError(null);
  }, []);

  // ─── Handlers ───
  const handleValidate = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = validateV8Json(parsed);
      setValidation(result);
      if (result.valid) {
        setLessonTitle(parsed.title || lessonTitle);
        setStep("validate");
        toast({ title: "✅ JSON válido", description: `${result.sectionCount} seções, ${result.quizCount} quizzes, ${result.playgroundCount} playgrounds, ${result.exerciseCount} exercícios` });
      } else {
        toast({ title: "❌ Erros encontrados", description: result.errors.join("; "), variant: "destructive" });
      }
    } catch (e) {
      setValidation({ valid: false, sectionCount: 0, quizCount: 0, playgroundCount: 0, exerciseCount: 0, warnings: [], errors: ["JSON parse error: " + (e as Error).message] });
      toast({ title: "❌ JSON inválido", description: (e as Error).message, variant: "destructive" });
    }
  }, [jsonText, lessonTitle, toast]);

  const handleGenerateAudio = useCallback(async () => {
    if (!validation?.valid) return;

    setIsGenerating(true);
    setStep("generate");
    resetPipeline();

    try {
      // Step 1: Validate
      updateStep('validate', 'running');
      addLog('info', 'Validando JSON de entrada...');
      const parsed: V8LessonData = JSON.parse(jsonText);
      updateStep('validate', 'completed', `${parsed.sections.length} seções`);
      addLog('success', `JSON válido: ${parsed.sections.length} seções, ${parsed.inlineQuizzes?.length || 0} quizzes`);
      setPipelineProgress(10);

      // Step 2: Create draft
      updateStep('create-draft', 'running');
      addLog('info', 'Criando rascunho no banco de dados...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      let lessonId = savedLessonId;
      if (!lessonId) {
        const { data: draftId, error: draftError } = await supabase.rpc("create_lesson_draft", {
          p_title: lessonTitle,
          p_trail_id: null as unknown as string,
          p_order_index: 0,
          p_estimated_time: estimatedTime,
          p_content: parsed as unknown as Json,
          p_exercises: [] as unknown as Json,
          p_audio_url: null as unknown as string,
          p_word_timestamps: null as unknown as Json,
        });
        if (draftError) throw draftError;
        lessonId = draftId;
        setSavedLessonId(lessonId);
      }
      updateStep('create-draft', 'completed', `ID: ${lessonId?.slice(0, 8)}...`);
      addLog('success', `Rascunho criado: ${lessonId}`);
      setPipelineProgress(25);

      // Step 3: Call API
      updateStep('call-api', 'running');
      addLog('info', 'Conectando com ElevenLabs...');
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
            playgrounds: parsed.inlinePlaygrounds || [],
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`v8-generate failed: ${response.status} - ${errBody}`);
      }

      updateStep('call-api', 'completed');
      addLog('success', 'Conectado — resposta recebida');
      setPipelineProgress(60);

      // Step 4: Process results
      updateStep('process-results', 'running');
      addLog('info', 'Processando resultados...');
      const result: GenerateResponse = await response.json();
      setGenerateResult(result);
      updateStep('process-results', 'completed', `${result.stats.totalAudios} áudios`);
      addLog('success', `${result.stats.totalAudios} áudios gerados (${result.stats.totalSizeKB}KB)`);
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(e => addLog('warning', `Erro em ${e.type} ${e.index}: ${e.error}`));
      }
      setPipelineProgress(80);

      // Step 5: Update content
      updateStep('update-content', 'running');
      addLog('info', 'Atualizando JSON com URLs de áudio...');
      const updatedData = { ...parsed };
      const cacheBuster = `?t=${Date.now()}`;
      for (const r of result.results) {
        const urlWithCacheBuster = r.audioUrl + cacheBuster;
        if (r.type === "section" && updatedData.sections[r.index]) {
          updatedData.sections[r.index].audioUrl = urlWithCacheBuster;
          updatedData.sections[r.index].audioDurationSeconds = r.durationEstimate;
        } else if (r.type === "quiz" && updatedData.inlineQuizzes[r.index]) {
          updatedData.inlineQuizzes[r.index].audioUrl = urlWithCacheBuster;
        } else if (r.type === "quiz-reinforcement" && updatedData.inlineQuizzes[r.index]) {
          updatedData.inlineQuizzes[r.index].reinforcementAudioUrl = urlWithCacheBuster;
        } else if (r.type === "playground" && updatedData.inlinePlaygrounds?.[r.index]) {
          updatedData.inlinePlaygrounds[r.index].audioUrl = urlWithCacheBuster;
        }
      }
      setJsonText(JSON.stringify(updatedData, null, 2));
      updateStep('update-content', 'completed');
      addLog('success', 'Conteúdo atualizado com URLs de áudio');
      setPipelineProgress(95);

      // Step 6: Finalize
      updateStep('finalize', 'running');
      addLog('info', 'Finalizando...');
      setStep("preview");
      updateStep('finalize', 'completed');
      addLog('success', `Pipeline concluído em ${(result.stats.elapsedMs / 1000).toFixed(1)}s`);
      setPipelineProgress(100);

      toast({
        title: result.success ? "✅ Áudios gerados!" : "⚠️ Gerado com erros",
        description: `${result.stats.totalAudios} áudios (${result.stats.totalSizeKB}KB) em ${(result.stats.elapsedMs / 1000).toFixed(1)}s`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 
                  typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
      
      // Mark current running step as error
      setPipelineSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' as const } : s));
      setPipelineError(msg);
      addLog('error', msg);
      
      toast({ title: "❌ Erro na geração", description: msg, variant: "destructive" });
      setStep("validate");
    } finally {
      setIsGenerating(false);
    }
  }, [validation, jsonText, lessonTitle, estimatedTime, savedLessonId, toast, resetPipeline, updateStep, addLog]);

  const handleSave = useCallback(async (activate: boolean) => {
    setIsSaving(true);
    try {
      const parsed: V8LessonData = JSON.parse(jsonText);

      if (savedLessonId) {
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lessonTitle,
            content: parsed as unknown as Json,
            exercises: (parsed.exercises || []) as unknown as Json,
            estimated_time: estimatedTime,
            order_index: 0,
            trail_id: null,
            model: "v8",
            lesson_type: "guided",
            is_active: activate,
            status: activate ? "publicado" : "rascunho",
          })
          .eq("id", savedLessonId);
        if (error) throw error;
      } else {
        const { data: draftId, error: draftError } = await supabase.rpc("create_lesson_draft", {
          p_title: lessonTitle,
          p_trail_id: null as unknown as string,
          p_order_index: 0,
          p_estimated_time: estimatedTime,
          p_content: parsed as unknown as Json,
          p_exercises: (parsed.exercises || []) as unknown as Json,
          p_audio_url: null as unknown as string,
          p_word_timestamps: null as unknown as Json,
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
      const msg = err instanceof Error ? err.message : 
                  typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
      toast({ title: "❌ Erro ao salvar", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [jsonText, savedLessonId, lessonTitle, estimatedTime, toast]);

  const handleConvertContent = useCallback(() => {
    if (!contentText.trim()) {
      toast({ title: "❌ Conteúdo vazio", description: "Cole o conteúdo bruto no editor.", variant: "destructive" });
      return;
    }
    try {
      const data = parseFullContent(contentText);
      setParsedSections(data.sections);
      setParsedQuizzes(data.inlineQuizzes);
      setParsedPlaygrounds(data.inlinePlaygrounds || []);
      setLessonTitle(data.title);
      setStep("setup");
      toast({
        title: "✅ Conteúdo convertido!",
        description: `${data.sections.length} seções detectadas — configure o setup`,
      });
    } catch (e) {
      toast({ title: "❌ Erro na conversão", description: (e as Error).message, variant: "destructive" });
    }
  }, [contentText, toast]);

  const handleSetupApply = useCallback((
    updatedSections: V8Section[],
    updatedQuizzes: V8InlineQuiz[],
    updatedPlaygrounds: V8InlinePlayground[]
  ) => {
    const data: V8LessonData = {
      contentVersion: "v8",
      title: lessonTitle,
      description: "",
      sections: updatedSections,
      inlineQuizzes: updatedQuizzes,
      inlinePlaygrounds: updatedPlaygrounds,
      exercises: [],
    };
    setJsonText(JSON.stringify(data, null, 2));
    setEditorMode("json");
    setValidation(null);
    setStep("edit");
    toast({ title: "✅ Setup aplicado!", description: "JSON atualizado — valide para continuar" });
  }, [lessonTitle, toast]);

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
  const cardStyle = "rounded-2xl border border-slate-200 bg-white shadow-sm p-5";

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Criar Aula V8</h1>
            <p className="text-xs text-slate-500">Read & Listen Premium</p>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(["edit", "setup", "validate", "generate", "preview", "saved"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === s ? "bg-indigo-500" : i < ["edit", "setup", "validate", "generate", "preview", "saved"].indexOf(step) ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* ─── METADATA ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Metadados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Título</label>
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Tempo estimado (min)</label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                min={1}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">💡 Após criar, use o Gerenciador de Lições para mover a aula para uma trilha.</p>
        </motion.div>

        {/* ─── EDITOR (Content / JSON toggle) ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            {/* Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
              <button
                onClick={() => setEditorMode("content")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${editorMode === "content" ? "bg-indigo-500/20 text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                <FileText className="w-3.5 h-3.5" />
                Conteúdo
              </button>
              <button
                onClick={() => setEditorMode("json")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${editorMode === "json" ? "bg-indigo-500/20 text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Code className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>

            {editorMode === "content" ? (
              <button
                onClick={handleConvertContent}
                disabled={!contentText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-3.5 h-3.5" />
                Converter para JSON
              </button>
            ) : (
              <button
                onClick={handleValidate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 text-xs font-semibold hover:bg-indigo-500/25 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Validar JSON
              </button>
            )}
          </div>

          {editorMode === "content" ? (
            <>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder={"# Título da Aula\n\nDescrição opcional...\n\n## Seção 1 — Introdução\nConteúdo markdown aqui...\n\n[PLAYGROUND]\ntitle: Teste na Prática\ninstruction: Compare os dois prompts...\n...\n\n[QUIZ]\nquestion: Qual a diferença?\noptions:\n- [x] Resposta correta\n- [ ] Errada\nexplanation: Porque..."}
                className="w-full h-96 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-y placeholder:text-slate-600"
                spellCheck={false}
              />
              <p className="text-[10px] text-slate-500 mt-2">
                💡 Use <code className="text-slate-600">## Título</code> para seções, <code className="text-slate-600">[PLAYGROUND]</code> e <code className="text-slate-600">[QUIZ]</code> para interações inline. Clique "Converter" para gerar o JSON automaticamente.
              </p>
            </>
          ) : (
            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setValidation(null); setStep("edit"); }}
              className="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-y"
              spellCheck={false}
            />
          )}
        </motion.div>

        {/* ─── SETUP WIZARD ─── */}
        {step === "setup" && parsedSections.length > 0 && (
          <V8SectionSetup
            sections={parsedSections}
            quizzes={parsedQuizzes}
            playgrounds={parsedPlaygrounds}
            onApply={handleSetupApply}
            onBack={() => { setStep("edit"); setEditorMode("content"); }}
          />
        )}

        {/* ─── VALIDATION RESULT ─── */}
        {validation && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Validação</h2>
            <div className="flex items-center gap-4 mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${validation.valid ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}`}>
                {validation.valid ? "✅ Válido" : "❌ Inválido"}
              </span>
              <span className="text-xs text-slate-500">
                {validation.sectionCount} seções · {validation.quizCount} quizzes · {validation.playgroundCount} playgrounds · {validation.exerciseCount} exercícios
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Gerar Áudios</h2>
            {isGenerating && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Gerando...
              </span>
            )}
          </div>

          {!generateResult && !isGenerating && (
            <button
              onClick={handleGenerateAudio}
              disabled={!validation?.valid || step === "edit"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              {!validation?.valid ? "Valide o JSON primeiro" : "Gerar Aula"}
            </button>
          )}

          {/* Pipeline Monitor */}
          {pipelineSteps.length > 0 && (
            <V7PipelineMonitor
              isRunning={isGenerating}
              steps={pipelineSteps}
              logs={pipelineLogs}
              progress={pipelineProgress}
              error={pipelineError}
            />
          )}
        </motion.div>

        {/* ─── AUDIO PREVIEW ─── */}
        {generateResult && step === "preview" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Preview de Áudios</h2>
            <div className="space-y-2">
              {generateResult.results.map((r) => (
                <div key={`${r.type}-${r.index}`} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <button
                    onClick={() => toggleAudioPreview(r.audioUrl)}
                    className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center hover:bg-indigo-500/25 transition-colors flex-shrink-0"
                  >
                    {playingAudioUrl === r.audioUrl ? (
                      <Pause className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-indigo-600 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {r.type === "section" ? `Seção ${r.index + 1}` : r.type === "quiz" ? `Quiz ${r.index + 1}` : r.type === "playground" ? `Playground ${r.index + 1}` : `Quiz ${r.index + 1} (reforço)`}
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
        {step !== "saved" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || !validation?.valid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Rascunho
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !validation?.valid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Salvar e Ativar
            </button>
          </motion.div>
        )}

        {/* ─── SAVED CONFIRMATION ─── */}
        {step === "saved" && savedLessonId && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${cardStyle} text-center`}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Aula salva com sucesso!</h2>
            <p className="text-sm text-slate-500 mb-4">ID: {savedLessonId}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/v8/${savedLessonId}`)}
                className="px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-600 text-sm font-semibold hover:bg-indigo-500/25 transition-colors"
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
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
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
