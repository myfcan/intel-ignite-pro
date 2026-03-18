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
import { Plus, Trash2, CheckCircle, AlertCircle, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
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
  const [deletingLesson, setDeletingLesson] = useState(false);

  // Trail/Course selectors for lesson creation
  const [trails, setTrails] = useState<Array<{ id: string; title: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; trail_id: string; title: string }>>([]);
  const [selectedTrailId, setSelectedTrailId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    async function fetchTrailsCourses() {
      const [t, c] = await Promise.all([
        supabase.from('trails').select('id, title').eq('is_active', true).order('order_index'),
        supabase.from('courses').select('id, trail_id, title').eq('is_active', true).order('order_index'),
      ]);
      if (t.data) setTrails(t.data);
      if (c.data) setCourses(c.data);
    }
    if (!pipeline.lesson_id) fetchTrailsCourses();
  }, [pipeline.lesson_id]);

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
      const payload: Record<string, unknown> = {
        slug: pipeline.slug,
        title: pipeline.title,
        status: 'draft' as const,
        total_steps: 0,
        estimated_minutes: 0,
        tools: [] as string[],
        xp_reward: 0,
        order_in_trail: 0,
        ...(selectedTrailId ? { trail_id: selectedTrailId } : {}),
        ...(selectedCourseId ? { course_id: selectedCourseId } : {}),
      };

      const { data, error } = await (supabase as any)
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
      interface AuditResult {
        c1: boolean;
        c2: boolean;
        c3: boolean;
        c4: boolean;
        c6: boolean;
        c7: boolean;
        c8: boolean;
        c9: boolean;
        details: string[];
      }

      const auditResults: Record<string, AuditResult> = {};
      let allPassed = true;

      for (const step of steps) {
        const details: string[] = [];
        const desc = step.description || '';
        const frames = step.frames || [];
        const allElements = frames.flatMap((f: any) => f.elements || []);

        // C1: description > 30 chars
        const c1 = desc.length > 30;
        if (!c1) details.push(`C1: description tem ${desc.length} chars (mín: 30)`);

        // C2: tooltip_term exists when description is substantial (>50 chars = likely has tech terms)
        const tooltipTerms = allElements.filter((el: any) => el.type === 'tooltip_term');
        const c2 = tooltipTerms.length > 0 || desc.length < 50;
        if (!c2) details.push(`C2: description substancial sem tooltip_term nos frames`);

        // C3: if bar_sub changes between frames, nav_breadcrumb must exist
        const barSubValues = frames.map((f: any) => f.bar_sub).filter(Boolean);
        const barSubChanges = new Set(barSubValues).size > 1;
        const hasNavBreadcrumb = allElements.some((el: any) => el.type === 'nav_breadcrumb');
        const c3 = !barSubChanges || hasNavBreadcrumb;
        if (!c3) details.push(`C3: bar_sub muda entre frames mas falta nav_breadcrumb`);

        // C4: at least 1 frame per step
        const c4 = frames.length > 0;
        if (!c4) details.push(`C4: passo sem frames (${frames.length})`);

        // C5 REMOVIDA: narration_script só existe na Etapa 5, verificar aqui é falso positivo

        // C6: duration > 0
        const c6 = step.duration_seconds > 0;
        if (!c6) details.push(`C6: duration_seconds = ${step.duration_seconds}`);

        // C7: title meaningful (> 5 chars)
        const c7 = (step.title || '').trim().length > 5;
        if (!c7) details.push(`C7: título muito curto (${step.title?.length || 0} chars)`);

        // C8: phase valid (1-5)
        const c8 = step.phase >= 1 && step.phase <= 5;
        if (!c8) details.push(`C8: phase inválida (${step.phase})`);

        // C9: LIV fields present
        const liv = step.liv as unknown as Record<string, string> | null;
        const c9 = !!(liv && (liv.tip || liv.analogy || liv.sos));
        if (!c9) details.push(`C9: campos LIV vazios (tip/analogy/sos)`);

        auditResults[step.id] = { c1, c2, c3, c4, c6, c7, c8, c9, details };
        if (details.length > 0) allPassed = false;
      }

      // Count failures per clause
      const clauseCounts: Record<string, number> = {};
      Object.values(auditResults).forEach(r => {
        r.details.forEach(d => {
          const clause = d.substring(0, 2);
          clauseCounts[clause] = (clauseCounts[clause] || 0) + 1;
        });
      });

      await onUpdate({
        steps_audited: steps.length,
        audit_passed: allPassed,
      });

      // Log audit results
      await supabase.from('v10_bpa_pipeline_log').insert({
        pipeline_id: pipeline.id,
        stage: 2,
        action: 'audit_c1_c9',
        details: {
          total_steps: steps.length,
          all_passed: allPassed,
          clause_failures: clauseCounts,
          per_step: Object.fromEntries(
            Object.entries(auditResults)
              .filter(([_, r]) => r.details.length > 0)
              .map(([id, r]) => [id, r.details])
          ),
        },
      });

      if (allPassed) {
        toast.success(`Auditoria C1-C9 completa: ${steps.length}/${steps.length} passos aprovados`);
      } else {
        const failedSteps = Object.values(auditResults).filter(r => r.details.length > 0).length;
        const clauseSummary = Object.entries(clauseCounts)
          .map(([c, n]) => `${c}:${n}`)
          .join(', ');
        toast.warning(
          `Auditoria: ${steps.length - failedSteps}/${steps.length} aprovados. Falhas: ${clauseSummary}`,
          { duration: 8000 }
        );
      }
    } catch {
      toast.error('Erro ao auditar estrutura');
    } finally {
      setAuditing(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!pipeline.lesson_id) return;
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Isso vai excluir permanentemente a aula e TODOS os dados vinculados:\n\n' +
      '• Todos os passos (steps)\n' +
      '• Todos os slides de introdução\n' +
      '• Todas as narrações (Parte A e C)\n' +
      '• Todos os áudios gerados\n' +
      '• Todos os anchors\n\n' +
      'O pipeline voltará ao estado inicial (sem aula vinculada).\n\n' +
      'Tem certeza?'
    );
    if (!confirmed) return;

    setDeletingLesson(true);
    try {
      const lessonId = pipeline.lesson_id;

      // 1. Delete anchors (depend on steps)
      const { data: stepIds } = await supabase
        .from('v10_lesson_steps')
        .select('id')
        .eq('lesson_id', lessonId);

      if (stepIds && stepIds.length > 0) {
        const ids = stepIds.map((s: { id: string }) => s.id);
        await supabase
          .from('v10_lesson_step_anchors')
          .delete()
          .in('step_id', ids);
      }

      // 2. Delete steps
      await supabase
        .from('v10_lesson_steps')
        .delete()
        .eq('lesson_id', lessonId);

      // 3. Delete intro slides
      await supabase
        .from('v10_lesson_intro_slides')
        .delete()
        .eq('lesson_id', lessonId);

      // 4. Delete narrations
      await supabase
        .from('v10_lesson_narrations')
        .delete()
        .eq('lesson_id', lessonId);

      // 5. Delete the lesson itself
      await supabase
        .from('v10_lessons')
        .delete()
        .eq('id', lessonId);

      // 6. Reset pipeline counters and clear lesson_id
      await onUpdate({
        lesson_id: null,
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
        assembly_checklist: {} as Record<string, boolean>,
        assembly_passed: false,
      } as Partial<V10BpaPipeline>);

      // 7. Log the deletion
      await supabase.from('v10_bpa_pipeline_log').insert({
        pipeline_id: pipeline.id,
        stage: 2,
        action: 'lesson_deleted',
        details: { lesson_id: lessonId, reason: 'manual_delete' },
      });

      setSteps([]);
      toast.success('Aula excluída com sucesso. Pipeline resetado.');
    } catch (err) {
      toast.error(`Erro ao excluir aula: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setDeletingLesson(false);
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

          {/* Trail/Course selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trilha (N1)</Label>
              <Select value={selectedTrailId} onValueChange={(val) => { setSelectedTrailId(val); setSelectedCourseId(''); }}>
                <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
                <SelectContent>
                  {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedTrailId && (
              <div className="space-y-2">
                <Label>Jornada (N2)</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma jornada" /></SelectTrigger>
                  <SelectContent>
                    {courses.filter(c => c.trail_id === selectedTrailId).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

        {/* Delete lesson */}
        <div className="border-t pt-4 mt-4">
          <Button
            variant="outline"
            onClick={handleDeleteLesson}
            disabled={deletingLesson}
            className="min-h-[44px] w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {deletingLesson ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            {deletingLesson ? 'Excluindo aula...' : 'Excluir Aula e Resetar Pipeline'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Remove a aula, todos os passos, narrações e áudios vinculados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
