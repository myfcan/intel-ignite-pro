import { useState, useMemo } from "react";
import { V8Section, V8InlineQuiz, V8InlinePlayground } from "@/types/v8Lesson";
import { Image, Brain, Gamepad2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionConfig {
  hasImage: boolean;
  imageUrl: string;
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
}

export function V8SectionSetup({ sections, quizzes, playgrounds, onApply, onBack }: V8SectionSetupProps) {
  const [configs, setConfigs] = useState<SectionConfig[]>(() =>
    sections.map((s, i) => ({
      hasImage: !!s.imageUrl,
      imageUrl: s.imageUrl || "",
      hasQuiz: quizzes.some((q) => q.afterSectionIndex === i),
      hasPlayground: playgrounds.some((p) => p.afterSectionIndex === i),
    }))
  );

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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

  const handleApply = () => {
    const updatedSections = sections.map((s, i) => ({
      ...s,
      imageUrl: configs[i].hasImage && configs[i].imageUrl.trim() ? configs[i].imageUrl.trim() : undefined,
    }));
    onApply(updatedSections, quizzes, playgrounds);
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
        <span className="text-[10px] text-slate-500">{sections.length} seções</span>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => {
          const cfg = configs[i];
          const isExpanded = expandedIndex === i;
          const badges = activeBadges(cfg);
          const quiz = quizMap.get(i);
          const playground = playgroundMap.get(i);

          return (
            <div
              key={section.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 flex-shrink-0">
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
                      {/* Image toggle */}
                      <div>
                        <button
                          onClick={() => updateConfig(i, { hasImage: !cfg.hasImage })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors w-full ${
                            cfg.hasImage
                              ? "bg-sky-500/15 text-sky-600"
                              : "bg-slate-100 text-slate-500 hover:text-slate-700"
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
                              <input
                                value={cfg.imageUrl}
                                onChange={(e) => updateConfig(i, { imageUrl: e.target.value })}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Quiz indicator */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                          cfg.hasQuiz
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Quiz após esta seção</span>
                        {quiz ? (
                          <span className="text-[10px] font-normal text-amber-400/70 truncate max-w-[180px]">
                            {quiz.question.slice(0, 50)}...
                          </span>
                        ) : cfg.hasQuiz ? (
                          <span className="text-[10px] font-normal text-amber-400/50">
                            Sem quiz no parse
                          </span>
                        ) : null}
                      </div>

                      {/* Playground indicator */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                          cfg.hasPlayground
                            ? "bg-violet-500/15 text-violet-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">Playground após esta seção</span>
                        {playground ? (
                          <span className="text-[10px] font-normal text-violet-400/70 truncate max-w-[180px]">
                            {playground.title}
                          </span>
                        ) : cfg.hasPlayground ? (
                          <span className="text-[10px] font-normal text-violet-400/50">
                            Sem playground no parse
                          </span>
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <Check className="w-3.5 h-3.5" />
          Aplicar Setup e Validar
        </button>
      </div>
    </motion.div>
  );
}
