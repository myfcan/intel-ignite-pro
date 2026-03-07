import { useState, useMemo } from "react";
import { V8Section, V8InlineQuiz, V8InlinePlayground } from "@/types/v8Lesson";
import { Image, Brain, Gamepad2, Check, ChevronDown, ChevronUp, Wand2, Pencil, Loader2, RefreshCw, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectionConfig {
  hasImage: boolean;
  imageUrl: string;
  imageMode: "none" | "auto" | "custom";
  customPrompt: string;
  isGenerating: boolean;
  generatedPreview: string;
  hasQuiz: boolean;
  hasPlayground: boolean;
}

interface V8SectionSetupProps {
  sections: V8Section[];
  quizzes: V8InlineQuiz[];
  playgrounds: V8InlinePlayground[];
  onApply: (
    updatedSections: V8Section[],
    updatedQuizzes: V8InlineQuiz[],
    updatedPlaygrounds: V8InlinePlayground[]
  ) => void;
  onBack: () => void;
  lessonId?: string;
}

export function V8SectionSetup({ sections, quizzes, playgrounds, onApply, onBack, lessonId }: V8SectionSetupProps) {
  const [configs, setConfigs] = useState<SectionConfig[]>(() =>
    sections.map((s, i) => ({
      hasImage: !!s.imageUrl,
      imageUrl: s.imageUrl || "",
      imageMode: s.imageUrl ? "auto" as const : "none" as const,
      customPrompt: "",
      isGenerating: false,
      generatedPreview: s.imageUrl || "",
      hasQuiz: quizzes.some((q) => q.afterSectionIndex === i),
      hasPlayground: playgrounds.some((p) => p.afterSectionIndex === i),
    }))
  );

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [reprocessProgress, setReprocessProgress] = useState<string>("");

  const quizMap = useMemo(() => {
    const map = new Map<number, V8InlineQuiz>();
    quizzes.forEach((q) => map.set(q.afterSectionIndex, q));
    return map;
  }, [quizzes]);

  const playgroundMap = useMemo(() => {
    const map = new Map<number, V8InlinePlayground>();
    playgrounds.forEach((p) => map.set(p.afterSectionIndex, p));
    return map;
  }, [playgrounds]);

  const updateConfig = (index: number, partial: Partial<SectionConfig>) => {
    setConfigs((prev) => prev.map((c, i) => (i === index ? { ...c, ...partial } : c)));
  };

  const generateImage = async (index: number, mode: "auto" | "custom") => {
    const cfg = configs[index];
    const section = sections[index];

    if (mode === "custom" && !cfg.customPrompt.trim()) {
      toast.error("Digite uma descrição para a imagem");
      return;
    }

    updateConfig(index, { isGenerating: true });

    try {
      const body: Record<string, unknown> = {
        mode,
        lessonId: lessonId || `draft-${Date.now()}`,
        sectionIndex: index,
      };

      if (mode === "auto") {
        body.content = section.content;
      } else {
        body.customPrompt = cfg.customPrompt.trim();
      }

      const { data, error } = await supabase.functions.invoke("v8-generate-section-image", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const imageUrl = data.imageUrl;
      updateConfig(index, {
        isGenerating: false,
        hasImage: true,
        imageUrl,
        generatedPreview: imageUrl,
        imageMode: mode,
      });
      toast.success(`Imagem da seção ${index + 1} gerada!`);
    } catch (err: any) {
      console.error("[V8SectionSetup] Image generation error:", err);
      updateConfig(index, { isGenerating: false });
      toast.error(err?.message || "Erro ao gerar imagem");
    }
  };

  const handleApply = () => {
    const updatedSections = sections.map((s, i) => ({
      ...s,
      imageUrl: configs[i].hasImage && configs[i].imageUrl.trim() ? configs[i].imageUrl.trim() : undefined,
    }));
    onApply(updatedSections, quizzes, playgrounds);
  };

  const handleReprocessAllImages = async () => {
    if (!lessonId) {
      toast.error("Salve a aula primeiro para reprocessar imagens");
      return;
    }

    setIsReprocessing(true);
    setReprocessProgress("Iniciando reprocessamento...");

    try {
      const { data, error } = await supabase.functions.invoke("v8-reprocess-lesson-images", {
        body: { lessonId, allowText: false },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const report = data.report || [];
      const successCount = report.filter((r: any) => r.status === "ok").length;

      // Update local configs with new image URLs
      report.forEach((r: any) => {
        if (r.status === "ok" && r.imageUrl) {
          updateConfig(r.index, {
            hasImage: true,
            imageUrl: r.imageUrl,
            generatedPreview: r.imageUrl,
          });
        }
      });

      setReprocessProgress("");
      toast.success(`${successCount}/${report.length} imagens reprocessadas com o contrato 1024x1024`);
    } catch (err: any) {
      console.error("[V8SectionSetup] Reprocess error:", err);
      toast.error(err?.message || "Erro ao reprocessar imagens");
      setReprocessProgress("");
    } finally {
      setIsReprocessing(false);
    }
  };

  const getContentPreview = (content: string) => {
    const lines = content.replace(/^#{1,3}\s+.*\n?/gm, "").trim().split("\n").filter(Boolean);
    return lines.slice(0, 2).join(" ").slice(0, 120) + (lines.join(" ").length > 120 ? "..." : "");
  };

  const activeBadges = (cfg: SectionConfig) => {
    const badges: { label: string; color: string }[] = [];
    if (cfg.hasImage) badges.push({ label: "Imagem", color: "bg-sky-500/15 text-sky-600" });
    if (cfg.hasQuiz) badges.push({ label: "Quiz", color: "bg-amber-500/15 text-amber-600" });
    if (cfg.hasPlayground) badges.push({ label: "Playground", color: "bg-violet-500/15 text-violet-600" });
    return badges;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Setup de Seções</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Configure o que cada seção terá antes de gerar o JSON final
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReprocessAllImages}
            disabled={isReprocessing || !lessonId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isReprocessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
            {isReprocessing ? "Reprocessando…" : "Reprocessar Imagens"}
          </button>
          <span className="text-[10px] text-slate-500">{sections.length} seções</span>
        </div>
      </div>

      {/* Reprocess progress */}
      {isReprocessing && reprocessProgress && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
          <span>{reprocessProgress}</span>
        </div>
      )}

      <div className="space-y-2">
        {sections.map((section, i) => {
          const cfg = configs[i] ?? {
            hasImage: false, imageUrl: "", imageMode: "none" as const,
            customPrompt: "", isGenerating: false, generatedPreview: "",
            hasQuiz: quizzes.some((q) => q.afterSectionIndex === i),
            hasPlayground: playgrounds.some((p) => p.afterSectionIndex === i),
          };
          const isExpanded = expandedIndex === i;
          const badges = activeBadges(cfg);
          const quiz = quizMap.get(i);
          const playground = playgroundMap.get(i);

          return (
            <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{section.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{getContentPreview(section.content)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {badges.map((b) => (
                    <span key={b.label} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${b.color}`}>
                      {b.label}
                    </span>
                  ))}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                      {/* Image section */}
                      <ImageGenerationBlock
                        cfg={cfg}
                        index={i}
                        onUpdateConfig={updateConfig}
                        onGenerate={generateImage}
                      />

                      {/* Quiz indicator */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                          cfg.hasQuiz ? "bg-amber-500/15 text-amber-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Quiz após esta seção</span>
                        {quiz ? (
                          <span className="text-[10px] font-normal text-amber-400/70 truncate max-w-[180px]">
                            {quiz.question.slice(0, 50)}...
                          </span>
                        ) : cfg.hasQuiz ? (
                          <span className="text-[10px] font-normal text-amber-400/50">Sem quiz no parse</span>
                        ) : null}
                      </div>

                      {/* Playground indicator */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                          cfg.hasPlayground ? "bg-violet-500/15 text-violet-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Playground após esta seção</span>
                        {playground ? (
                          <span className="text-[10px] font-normal text-violet-400/70 truncate max-w-[180px]">
                            {playground.title}
                          </span>
                        ) : cfg.hasPlayground ? (
                          <span className="text-[10px] font-normal text-violet-400/50">Sem playground no parse</span>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={handleApply}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <Check className="w-3.5 h-3.5" />
          Aplicar Setup e Validar
        </button>
      </div>
    </motion.div>
  );
}

/* ── Extracted sub-component for image generation ── */

function ImageGenerationBlock({
  cfg,
  index,
  onUpdateConfig,
  onGenerate,
}: {
  cfg: SectionConfig;
  index: number;
  onUpdateConfig: (i: number, partial: Partial<SectionConfig>) => void;
  onGenerate: (i: number, mode: "auto" | "custom") => void;
}) {
  const hasPreview = !!cfg.generatedPreview;

  return (
    <div>
      {/* Toggle */}
      <button
        onClick={() => {
          if (cfg.hasImage) {
            onUpdateConfig(index, { hasImage: false, imageMode: "none", generatedPreview: "", imageUrl: "" });
          } else {
            onUpdateConfig(index, { hasImage: true });
          }
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors w-full ${
          cfg.hasImage ? "bg-sky-500/15 text-sky-600" : "bg-slate-100 text-slate-500 hover:text-slate-700"
        }`}
      >
        <Image className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Imagem</span>
        {cfg.hasImage && <Check className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {cfg.hasImage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {/* Preview */}
              {hasPreview && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-2">
                  <img
                    src={cfg.generatedPreview}
                    alt={`Seção ${index + 1}`}
                    className="w-full h-32 object-contain"
                  />
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      onClick={() => onGenerate(index, "auto")}
                      disabled={cfg.isGenerating}
                      title="Regenerar esta imagem"
                      className="w-5 h-5 rounded-full bg-indigo-500/80 flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 text-white ${cfg.isGenerating ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => onUpdateConfig(index, { generatedPreview: "", imageUrl: "" })}
                      className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Generation buttons */}
              {cfg.isGenerating ? (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Gerando imagem… (5-15s)</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onGenerate(index, "auto")}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    {hasPreview ? <RefreshCw className="w-3 h-3" /> : null}
                    Gerar do Conteúdo
                  </button>
                  <button
                    onClick={() =>
                      onUpdateConfig(index, {
                        imageMode: cfg.imageMode === "custom" ? "none" : "custom",
                      })
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                      cfg.imageMode === "custom"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Descrever Imagem
                  </button>
                </div>
              )}

              {/* Custom prompt field */}
              <AnimatePresence>
                {cfg.imageMode === "custom" && !cfg.isGenerating && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={cfg.customPrompt}
                      onChange={(e) => onUpdateConfig(index, { customPrompt: e.target.value })}
                      placeholder="Ex: logo do ChatGPT pegando fogo, estilo futurista"
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-900 focus:outline-none focus:border-emerald-400 placeholder:text-slate-400 resize-none"
                    />
                    <button
                      onClick={() => onGenerate(index, "custom")}
                      disabled={!cfg.customPrompt.trim()}
                      className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Gerar desta descrição
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
