import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline } from '@/types/v10.types';

interface CreateBpaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pipeline: V10BpaPipeline) => void;
}

interface Suggestion {
  title: string;
  description: string;
  difficulty: string;
}

interface PreviewScore {
  score_total: number;
  score_semaphore: 'green' | 'yellow' | 'red';
  score_docs: number;
  score_pedagogy: number;
  score_difficulty: number;
  score_relevance: number;
  justificativa?: Record<string, string>;
}

function toKebabCase(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const difficultyColor: Record<string, string> = {
  'fácil': 'bg-green-100 text-green-700',
  'médio': 'bg-yellow-100 text-yellow-700',
  'difícil': 'bg-red-100 text-red-700',
};

const semaphoreStyle: Record<string, { bg: string; emoji: string; label: string }> = {
  green: { bg: 'bg-green-500', emoji: '\u{1F7E2}', label: 'Viável' },
  yellow: { bg: 'bg-yellow-400', emoji: '\u{1F7E1}', label: 'Revisar' },
  red: { bg: 'bg-red-500', emoji: '\u{1F534}', label: 'Inviável' },
};

export function CreateBpaModal({ open, onOpenChange, onCreated }: CreateBpaModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [toolName, setToolName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI suggestions state
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Preview score state
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewScore | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(toKebabCase(value));
    }
    // Clear preview when title changes
    setPreviewData(null);
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(value);
  }

  function resetForm() {
    setTitle('');
    setSlug('');
    setSlugEdited(false);
    setToolName('');
    setSuggestions([]);
    setPreviewData(null);
  }

  function handleSelectSuggestion(suggestion: Suggestion) {
    setTitle(suggestion.title);
    setSlug(toKebabCase(suggestion.title));
    setSlugEdited(false);
    setPreviewData(null);
  }

  async function handleSuggestTopics() {
    if (toolName.trim().length < 2) {
      toast.error('Digite o nome da ferramenta primeiro (mín. 2 caracteres).');
      return;
    }

    setSuggesting(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('v10-suggest-topics', {
        body: { tool_name: toolName.trim() },
      });

      if (error) throw error;

      const result = data as { suggestions: Suggestion[] };
      setSuggestions(result.suggestions ?? []);

      if (!result.suggestions?.length) {
        toast.info('Nenhuma sugestão gerada. Tente outra ferramenta.');
      }
    } catch {
      toast.error('Erro ao gerar sugestões de temas.');
    } finally {
      setSuggesting(false);
    }
  }

  async function handlePreviewScore() {
    if (title.trim().length < 3) {
      toast.error('Digite um título com pelo menos 3 caracteres.');
      return;
    }

    setPreviewing(true);
    setPreviewData(null);
    try {
      const { data, error } = await supabase.functions.invoke('v10-preview-score', {
        body: { title: title.trim(), tool_name: toolName.trim() || undefined },
      });

      if (error) throw error;

      setPreviewData(data as PreviewScore);
    } catch {
      toast.error('Erro ao calcular preview do score.');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('O título é obrigatório.');
      return;
    }

    setSubmitting(true);

    // If we have preview data, use those scores as initial values
    const initialScores = previewData
      ? {
          score_total: previewData.score_total,
          score_refero: previewData.score_refero,
          score_docs: previewData.score_docs,
          score_pedagogy: previewData.score_pedagogy,
          score_difficulty: previewData.score_difficulty,
          score_relevance: previewData.score_relevance,
          score_semaphore: previewData.score_semaphore,
        }
      : {
          score_total: 0,
          score_refero: 0,
          score_docs: 0,
          score_pedagogy: 0,
          score_difficulty: 0,
          score_relevance: 0,
          score_semaphore: 'red' as const,
        };

    const payload = {
      title: title.trim(),
      slug: slug.trim() || toKebabCase(title),
      status: 'draft' as const,
      current_stage: 1,
      ...initialScores,
      steps_generated: 0,
      steps_audited: 0,
      audit_passed: false,
      images_needed: 0,
      images_generated: 0,
      images_approved: 0,
      mockups_total: 0,
      mockups_from_refero: 0,
      mockups_generic: 0,
      mockups_approved: 0,
      audios_total: 0,
      audios_generated: 0,
      audios_approved: 0,
      assembly_checklist: {},
      assembly_passed: false,
      ...(toolName.trim() ? { docs_manual_input: toolName.trim() } : {}),
    };

    const { data, error } = await supabase
      .from('v10_bpa_pipeline')
      .insert(payload)
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast.error('Erro ao criar pipeline: ' + error.message);
      return;
    }

    const pipeline = data as unknown as V10BpaPipeline;
    toast.success('Pipeline criado com sucesso!');
    resetForm();
    onOpenChange(false);
    onCreated(pipeline);

    // Auto-score in background only if no preview was done
    if (!previewData) {
      supabase.functions.invoke('v10-score-bpa', {
        body: { pipeline_id: pipeline.id },
      }).then(() => {
        toast.info('Score de viabilidade calculado pela IA.');
      }).catch(() => {
        // Silencioso — usuário pode recalcular manualmente na Stage 1
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Pipeline BPA</DialogTitle>
            <DialogDescription>
              Crie um novo pipeline de produção de aula V10.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {/* Ferramenta (moved up) */}
            <div className="space-y-2">
              <Label htmlFor="bpa-tool">Ferramenta (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="bpa-tool"
                  placeholder="Ex: Canva, Google Sheets..."
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-10 px-3"
                  onClick={handleSuggestTopics}
                  disabled={suggesting || toolName.trim().length < 2}
                  title="Sugerir temas com IA"
                >
                  {suggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-indigo-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-indigo-700">Sugestões da IA — clique para usar:</p>
                <div className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-full rounded-md border bg-white px-3 py-2 text-left transition-colors hover:bg-indigo-50 hover:border-indigo-300 ${
                        title === s.title ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200' : ''
                      }`}
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{s.title}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          difficultyColor[s.difficulty] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {s.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="bpa-title">Título *</Label>
              <Input
                id="bpa-title"
                placeholder="Ex: Como usar o Canva"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="bpa-slug">Slug</Label>
              <Input
                id="bpa-slug"
                placeholder="como-usar-o-canva"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Gerado automaticamente a partir do título. Editável.
              </p>
            </div>

            {/* Preview Score */}
            <div className="rounded-lg border bg-gradient-to-r from-indigo-50 to-violet-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Preview de Viabilidade
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={handlePreviewScore}
                  disabled={previewing || title.trim().length < 3}
                >
                  {previewing ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Avaliando...
                    </>
                  ) : (
                    'Avaliar Viabilidade'
                  )}
                </Button>
              </div>

              {previewData ? (
                <div className="space-y-2">
                  {/* Semaphore + total */}
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${semaphoreStyle[previewData.score_semaphore].bg} flex items-center justify-center text-base shadow`}>
                      {semaphoreStyle[previewData.score_semaphore].emoji}
                    </div>
                    <div>
                      <span className="text-2xl font-bold tabular-nums">{previewData.score_total}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {semaphoreStyle[previewData.score_semaphore].label}
                    </span>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Refero</span>
                      <span className="ml-1 font-semibold">{previewData.score_refero}</span>
                    </div>
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Docs</span>
                      <span className="ml-1 font-semibold">{previewData.score_docs}</span>
                    </div>
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Pedagog.</span>
                      <span className="ml-1 font-semibold">{previewData.score_pedagogy}</span>
                    </div>
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Dificul.</span>
                      <span className="ml-1 font-semibold">{previewData.score_difficulty}</span>
                    </div>
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Relev.</span>
                      <span className="ml-1 font-semibold">{previewData.score_relevance}</span>
                    </div>
                    <div className="rounded bg-white px-2 py-1">
                      <span className="text-muted-foreground">Refero</span>
                      <span className="ml-1 font-semibold">{previewData.refero_screens} telas</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Preencha o título e clique "Avaliar Viabilidade" para ver o score antes de criar.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px]"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90"
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Pipeline'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
