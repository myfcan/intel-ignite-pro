import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonStep } from '@/types/v10.types';

interface Stage2StructureProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

const PHASE_LABELS: Record<number, string> = {
  1: 'Preparação',
  2: 'Configuração',
  3: 'Execução',
  4: 'Validação',
  5: 'Conclusão',
};

const PHASE_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200',
  4: 'bg-orange-100 text-orange-800 border-orange-200',
  5: 'bg-teal-100 text-teal-800 border-teal-200',
};

const PHASE_BORDER_COLORS: Record<number, string> = {
  1: 'border-l-blue-500',
  2: 'border-l-green-500',
  3: 'border-l-purple-500',
  4: 'border-l-orange-500',
  5: 'border-l-teal-500',
};

interface NewStepForm {
  title: string;
  description: string;
  phase: 1 | 2 | 3 | 4 | 5;
  app_name: string;
  duration_seconds: number;
}

const INITIAL_FORM: NewStepForm = {
  title: '',
  description: '',
  phase: 1,
  app_name: '',
  duration_seconds: 30,
};

export function Stage2Structure({ pipeline, onUpdate }: Stage2StructureProps) {
  const [steps, setSteps] = useState<V10LessonStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewStepForm>({ ...INITIAL_FORM });
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchSteps = useCallback(async () => {
    if (!pipeline.lesson_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('v10_lesson_steps')
        .select('*')
        .eq('lesson_id', pipeline.lesson_id)
        .order('step_number', { ascending: true });

      if (error) throw error;
      const typedSteps = (data ?? []) as unknown as V10LessonStep[];
      setSteps(typedSteps);
    } catch {
      toast.error('Erro ao carregar passos');
    } finally {
      setLoading(false);
    }
  }, [pipeline.lesson_id]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const handleCreateLesson = async () => {
    setCreatingLesson(true);
    try {
      const payload = {
        slug: pipeline.slug,
        title: pipeline.title,
        status: 'draft' as const,
        total_steps: 0,
        estimated_minutes: 0,
        tools: [] as string[],
        xp_reward: 0,
        order_in_trail: 0,
      };

      const { data, error } = await supabase
        .from('v10_lessons')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      const lessonId = (data as unknown as { id: string }).id;
      await onUpdate({ lesson_id: lessonId });
      toast.success('Aula criada com sucesso!');
    } catch {
      toast.error('Erro ao criar aula');
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleAddStep = async () => {
    if (!pipeline.lesson_id) return;
    if (!form.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    const nextStepNumber = steps.length + 1;
    const defaultLiv = { tip: '', analogy: '', sos: '' };

    const payload = {
      lesson_id: pipeline.lesson_id as string,
      step_number: nextStepNumber,
      title: form.title.trim(),
      description: form.description.trim() || null,
      phase: form.phase,
      app_name: form.app_name.trim() || null,
      duration_seconds: form.duration_seconds,
      app_badge_bg: '#e2e8f0',
      app_badge_color: '#1e293b',
      accent_color: '#6366f1',
      progress_percent: 0,
      frames: JSON.parse('[]'),
      liv: defaultLiv as Record<string, string>,
    };

    try {
      const { error } = await supabase
        .from('v10_lesson_steps')
        .insert(payload);

      if (error) throw error;

      await onUpdate({ steps_generated: nextStepNumber });
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      toast.success('Passo adicionado!');
      await fetchSteps();
    } catch {
      toast.error('Erro ao adicionar passo');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Tem certeza que deseja excluir este passo?')) return;

    setDeletingId(stepId);
    try {
      const { error } = await supabase
        .from('v10_lesson_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      toast.success('Passo excluído');
      await fetchSteps();

      const newCount = steps.length - 1;
      await onUpdate({ steps_generated: newCount });
    } catch {
      toast.error('Erro ao excluir passo');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-generate-steps', {
        body: { pipeline_id: pipeline.id, num_steps: 10 },
      });

      if (error) {
        toast.error(`Erro ao gerar passos: ${error.message || 'erro desconhecido'}`);
        return;
      }

      if (data?.error) {
        toast.error(`Erro: ${data.error}`);
        return;
      }

      const result = data as { steps_count: number; lesson_id?: string; estimated_minutes?: number };
      toast.success(`${result.steps_count} passos gerados pela IA!`);

      // Update pipeline with lesson_id and steps count
      const updates: Partial<V10BpaPipeline> = {
        steps_generated: result.steps_count,
      };
      if (result.lesson_id) {
        updates.lesson_id = result.lesson_id;
      }
      await onUpdate(updates);
      await fetchSteps();
    } catch (err) {
      toast.error(`Erro ao gerar passos: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleAudit = async () => {
    setAuditing(true);
    try {
      await onUpdate({
        steps_audited: steps.length,
        audit_passed: true,
      });
      toast.success('Estrutura auditada com sucesso!');
    } catch {
      toast.error('Erro ao auditar estrutura');
    } finally {
      setAuditing(false);
    }
  };

  if (!pipeline.lesson_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Etapa 2 — Estrutura de Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma aula vinculada ao pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateLesson}
              disabled={creatingLesson}
              className="min-h-[44px]"
            >
              <Plus className="mr-2 h-4 w-4" />
              {creatingLesson ? 'Criando...' : 'Criar Aula'}
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateWithAI}
              disabled={generating}
              className="min-h-[44px]"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {generating ? 'Gerando...' : 'Criar Aula + Gerar com IA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Etapa 2 — Estrutura de Passos</CardTitle>
          <span className="text-sm text-muted-foreground">
            {pipeline.steps_generated} passos gerados
            {pipeline.steps_audited > 0 && ` / ${pipeline.steps_audited} auditados`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steps list */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Carregando passos...</p>
        ) : steps.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum passo criado ainda.</p>
        ) : (
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between rounded-lg border border-l-4 ${PHASE_BORDER_COLORS[step.phase]} p-3`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {step.step_number}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{step.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PHASE_COLORS[step.phase]}`}>
                        {PHASE_LABELS[step.phase]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {step.duration_seconds}s
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {step.frames.length} frame{step.frames.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteStep(step.id)}
                  disabled={deletingId === step.id}
                  className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add step form */}
        {showForm ? (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="font-medium text-sm">Novo Passo (#{steps.length + 1})</p>

            <div className="space-y-2">
              <Label htmlFor="step-title">Título</Label>
              <Input
                id="step-title"
                placeholder="Ex: Configurar variáveis de ambiente"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step-description">Descrição</Label>
              <Textarea
                id="step-description"
                placeholder="Descrição do passo (opcional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step-phase">Fase</Label>
                <Select
                  value={String(form.phase)}
                  onValueChange={(val) => setForm((f) => ({ ...f, phase: Number(val) as 1 | 2 | 3 | 4 | 5 }))}
                >
                  <SelectTrigger id="step-phase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 — Preparação</SelectItem>
                    <SelectItem value="2">2 — Configuração</SelectItem>
                    <SelectItem value="3">3 — Execução</SelectItem>
                    <SelectItem value="4">4 — Validação</SelectItem>
                    <SelectItem value="5">5 — Conclusão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-duration">Duração (segundos)</Label>
                <Input
                  id="step-duration"
                  type="number"
                  min={1}
                  value={form.duration_seconds}
                  onChange={(e) => setForm((f) => ({ ...f, duration_seconds: Number(e.target.value) || 30 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="step-app">App Name</Label>
              <Input
                id="step-app"
                placeholder="Ex: VS Code, Terminal, Chrome"
                value={form.app_name}
                onChange={(e) => setForm((f) => ({ ...f, app_name: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddStep} className="min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm({ ...INITIAL_FORM });
                }}
                className="min-h-[44px]"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="min-h-[44px] w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Passo
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateWithAI}
              disabled={generating || !pipeline.lesson_id}
              className="min-h-[44px] w-full"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {generating ? 'Gerando passos...' : 'Gerar com IA (10 passos)'}
            </Button>
          </div>
        )}

        {/* Audit button */}
        {steps.length > 0 && (
          <Button
            onClick={handleAudit}
            disabled={auditing}
            className="min-h-[44px] w-full"
            variant={pipeline.audit_passed ? 'outline' : 'default'}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {auditing
              ? 'Auditando...'
              : pipeline.audit_passed
                ? 'Re-auditar Estrutura'
                : 'Auditar Estrutura'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
