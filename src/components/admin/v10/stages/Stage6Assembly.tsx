import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, Save } from 'lucide-react';
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
