import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { V10BpaPipeline, V10LessonStep, V10LessonNarration, V10IntroSlide, V10Lesson } from '@/types/v10.types';

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
  { key: 'images_ok', label: 'Todas as imagens aprovadas' },
  { key: 'mockups_ok', label: 'Todos os mockups aprovados' },
  { key: 'audios_ok', label: 'Todos os áudios gerados' },
  { key: 'narration_a_ok', label: 'Narração Parte A configurada' },
  { key: 'narration_c_ok', label: 'Narração Parte C configurada' },
  { key: 'metadata_ok', label: 'Metadados da aula completos (título, descrição, tools, badge)' },
];

export function Stage6Assembly({ pipeline, onUpdate }: Stage6AssemblyProps) {
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const results: Record<string, boolean> = {};

      // score_ok
      results.score_ok = pipeline.score_total >= 70;

      // structure_ok
      results.structure_ok = pipeline.audit_passed === true;

      // Fetch steps
      const { data: stepsRaw } = await supabase
        .from('v10_lesson_steps')
        .select('*')
        .eq('lesson_id', pipeline.lesson_id);

      const steps = (stepsRaw ?? []) as unknown as V10LessonStep[];

      // steps_have_frames
      results.steps_have_frames =
        steps.length > 0 && steps.every((s) => s.frames && s.frames.length > 0);

      // steps_have_liv
      results.steps_have_liv =
        steps.length > 0 &&
        steps.every(
          (s) =>
            s.liv &&
            s.liv.tip.trim().length > 0 &&
            s.liv.analogy.trim().length > 0 &&
            s.liv.sos.trim().length > 0
        );

      // Fetch intro slides
      const { data: slidesRaw } = await supabase
        .from('v10_lesson_intro_slides')
        .select('id')
        .eq('lesson_id', pipeline.lesson_id);

      const slides = (slidesRaw ?? []) as unknown as Pick<V10IntroSlide, 'id'>[];
      results.intro_slides_ok = slides.length > 0;

      // images_ok
      results.images_ok =
        pipeline.images_needed > 0 &&
        pipeline.images_approved >= pipeline.images_needed;

      // mockups_ok
      results.mockups_ok =
        pipeline.mockups_total > 0 &&
        pipeline.mockups_approved >= pipeline.mockups_total;

      // audios_ok
      results.audios_ok =
        pipeline.audios_total > 0 &&
        pipeline.audios_generated >= pipeline.audios_total;

      // Fetch narrations
      const { data: narrationsRaw } = await supabase
        .from('v10_lesson_narrations')
        .select('*')
        .eq('lesson_id', pipeline.lesson_id);

      const narrations = (narrationsRaw ?? []) as unknown as V10LessonNarration[];

      const narrationA = narrations.find((n) => n.part === 'A');
      const narrationC = narrations.find((n) => n.part === 'C');

      results.narration_a_ok = narrationA != null && narrationA.audio_url != null;
      results.narration_c_ok = narrationC != null && narrationC.audio_url != null;

      // Fetch lesson metadata
      const { data: lessonRaw } = await supabase
        .from('v10_lessons')
        .select('*')
        .eq('id', pipeline.lesson_id)
        .single();

      const lesson = lessonRaw as unknown as V10Lesson | null;

      results.metadata_ok =
        lesson != null &&
        lesson.title.trim().length > 0 &&
        (lesson.description ?? '').trim().length > 0 &&
        lesson.tools.length > 0;

      const allItemsPassed = CHECKLIST_ITEMS.every((item) => results[item.key] === true);

      await onUpdate({
        assembly_checklist: results as Record<string, boolean>,
        assembly_passed: allItemsPassed,
      } as Partial<V10BpaPipeline>);

      toast.success(`Verificação concluída: ${Object.values(results).filter(Boolean).length}/11 itens aprovados`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro na verificação: ${message}`);
    } finally {
      setRunning(false);
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
        </div>
      </CardContent>
    </Card>
  );
}
