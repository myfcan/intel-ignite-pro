import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, Save, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { V10BpaPipeline } from '@/types/v10.types';

interface Stage6AssemblyProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

type ChecklistKey =
  | 'score_ok'
  | 'structure_ok'
  | 'steps_have_frames'
  | 'steps_have_liv'
  | 'intro_slides_ok'
  | 'images_ok'
  | 'mockups_ok'
  | 'audios_ok'
  | 'narration_a_ok'
  | 'narration_c_ok'
  | 'metadata_ok';

interface ChecklistItem {
  key: ChecklistKey;
  label: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'score_ok', label: 'Score de viabilidade ≥ 70' },
  { key: 'structure_ok', label: 'Estrutura auditada e aprovada' },
  { key: 'steps_have_frames', label: 'Todos os passos têm frames' },
  { key: 'steps_have_liv', label: 'Todos os passos têm dicas LIV (tip, analogy, sos)' },
  { key: 'intro_slides_ok', label: 'Slides de introdução configurados' },
  { key: 'images_ok', label: 'Todos os passos têm imagem (verificação real nos frames)' },
  { key: 'mockups_ok', label: 'Todos os frames têm mockup_url (verificação real)' },
  { key: 'audios_ok', label: 'Todos os passos têm audio_url (verificação real)' },
  { key: 'narration_a_ok', label: 'Narração Parte A configurada' },
  { key: 'narration_c_ok', label: 'Narração Parte C configurada' },
  { key: 'metadata_ok', label: 'Metadados da aula completos (título, descrição, tools)' },
];

export function Stage6Assembly({ pipeline, onUpdate }: Stage6AssemblyProps) {
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const checklist = pipeline.assembly_checklist as Record<string, boolean>;

  const passedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.key] === true).length;
  const allPassed = passedCount === CHECKLIST_ITEMS.length;

  async function runAutomaticCheck() {
    if (!pipeline.lesson_id) {
      toast.error('Pipeline não tem aula vinculada');
      return;
    }

    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-assembly-check', {
        body: { pipeline_id: pipeline.id }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const results = data.checklist as Record<string, boolean>;
      const allItemsPassed = data.all_passed as boolean;

      await onUpdate({
        assembly_checklist: results,
        assembly_passed: allItemsPassed,
      } as Partial<V10BpaPipeline>);

      const passCount = Object.values(results).filter(Boolean).length;
      toast.success(`Verificação concluída: ${passCount}/11 itens aprovados`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro na verificação: ${message}`);
    } finally {
      setRunning(false);
    }
  }

  async function handleFixMissing() {
    if (!pipeline.lesson_id) {
      toast.error('Nenhuma aula vinculada');
      return;
    }

    setFixing(true);
    try {
      // Fetch steps to extract tools
      const { data: steps } = await supabase
        .from('v10_lesson_steps')
        .select('app_name, duration_seconds')
        .eq('lesson_id', pipeline.lesson_id as string);

      const stepsData = steps || [];

      // Extract unique tools
      const toolsSet = new Set<string>();
      for (const step of stepsData) {
        if (step.app_name?.trim()) toolsSet.add(step.app_name.trim());
      }
      const tools = Array.from(toolsSet);

      // Calculate duration
      const totalSeconds = stepsData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const estimatedMinutes = Math.ceil(totalSeconds / 60);

      // Update lesson metadata
      const description = `Aula prática de ${pipeline.title} com ${stepsData.length} passos interativos. Ferramentas: ${tools.join(', ') || 'diversas'}. Duração estimada: ${estimatedMinutes} minutos.`;

      const { error: lessonError } = await supabase
        .from('v10_lessons')
        .update({ description, tools } as any)
        .eq('id', pipeline.lesson_id as string);

      if (lessonError) throw lessonError;

      // Check if intro slides exist
      const { count: slidesCount } = await supabase
        .from('v10_lesson_intro_slides')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', pipeline.lesson_id as string);

      if (!slidesCount || slidesCount === 0) {
        // Create intro slides
        const lessonId = pipeline.lesson_id as string;
        const toolColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const introSlides: any[] = [
          {
            lesson_id: lessonId,
            slide_order: 1,
            icon: 'BookOpen',
            tool_name: null,
            tool_color: '#6366f1',
            title: pipeline.title,
            subtitle: `${stepsData.length} passos | ${estimatedMinutes} min`,
            description: `Bem-vindo! Nesta aula você vai aprender ${pipeline.title.toLowerCase()}.`,
            label: 'Introdução',
            appear_at_seconds: 0,
          },
        ];

        tools.forEach((tool, idx) => {
          introSlides.push({
            lesson_id: lessonId,
            slide_order: idx + 2,
            icon: 'Wrench',
            tool_name: tool,
            tool_color: toolColors[idx % toolColors.length],
            title: tool,
            subtitle: 'Ferramenta utilizada',
            description: `Você vai usar ${tool} nesta aula.`,
            label: 'Ferramenta',
            appear_at_seconds: (idx + 1) * 3,
          });
        });

        introSlides.push({
          lesson_id: lessonId,
          slide_order: tools.length + 2,
          icon: 'Rocket',
          tool_name: null,
          tool_color: '#10B981',
          title: 'Vamos começar!',
          subtitle: 'Tudo pronto para iniciar',
          description: 'Clique em continuar para começar o tutorial.',
          label: 'Início',
          appear_at_seconds: (tools.length + 1) * 3,
        });

        const { error: slidesError } = await supabase
          .from('v10_lesson_intro_slides')
          .insert(introSlides);

        if (slidesError) {
          console.error('Intro slides error:', slidesError);
          toast.error(`Intro slides: ${slidesError.message}`);
        } else {
          toast.success(`${introSlides.length} intro slides criados`);
        }
      }

      toast.success('Metadados e intro slides corrigidos. Executando verificação...');

      // Auto-run verification (no second click needed)
      const { data: checkData, error: checkError } = await supabase.functions.invoke('v10-assembly-check', {
        body: { pipeline_id: pipeline.id }
      });

      if (!checkError && checkData?.checklist) {
        await onUpdate({
          assembly_checklist: checkData.checklist,
          assembly_passed: checkData.all_passed,
        } as Partial<V10BpaPipeline>);

        const passCount = Object.values(checkData.checklist as Record<string, boolean>).filter(Boolean).length;
        toast.success(`Verificação concluída: ${passCount}/11 itens aprovados`);
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setFixing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate({
        assembly_checklist: checklist as Record<string, boolean>,
        assembly_passed: allPassed,
      } as Partial<V10BpaPipeline>);
      toast.success('Checklist salvo com sucesso');
    } catch {
      toast.error('Erro ao salvar checklist');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Etapa 6 — Montagem (Checklist)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Checklist items */}
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => {
            const passed = checklist[item.key] === true;
            const checked = checklist[item.key] != null;
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {checked ? (
                  passed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={checked && !passed ? 'text-red-600' : ''}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">
            {passedCount}/11 verificações passaram
          </p>
          {Object.keys(checklist).length > 0 && (
            <p className={`mt-1 text-sm font-semibold ${allPassed ? 'text-green-600' : 'text-red-600'}`}>
              {allPassed ? 'Montagem aprovada' : 'Montagem com pendências'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runAutomaticCheck}
            disabled={running}
            className="min-h-[44px]"
          >
            {running ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="mr-2 h-4 w-4" />
            )}
            Executar Verificação Automática
          </Button>

          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Checklist
          </Button>

          {/* Fix missing metadata/intro slides */}
          {(!checklist.intro_slides_ok || !checklist.metadata_ok) && (
            <Button
              variant="outline"
              onClick={handleFixMissing}
              disabled={fixing || !pipeline.lesson_id}
              className="min-h-[44px] border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {fixing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="mr-2 h-4 w-4" />
              )}
              {fixing ? 'Corrigindo...' : 'Corrigir Pendências (Metadados + Intro Slides)'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
