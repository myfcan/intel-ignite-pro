import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, Save, Wrench, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { V10BpaPipeline } from '@/types/v10.types';

interface Stage6AssemblyProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
  onNavigateStage?: (stage: number) => void;
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
  | 'metadata_ok'
  | 'gamification_ok'
  | 'v1_tools_ok'
  | 'v2_frames_ok'
  | 'v3_structure_ok'
  | 'v5_narration_ok';

interface ChecklistItem {
  key: ChecklistKey;
  label: string;
  fixStage?: number;
  fixLabel?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'score_ok', label: 'Score de viabilidade ≥ 70', fixStage: 1, fixLabel: 'Ajustar Score' },
  { key: 'structure_ok', label: 'Estrutura auditada e aprovada', fixStage: 2, fixLabel: 'Auditar Estrutura' },
  { key: 'steps_have_frames', label: 'Todos os passos têm frames', fixStage: 2, fixLabel: 'Editar Passos' },
  { key: 'steps_have_liv', label: 'Todos os passos têm dicas LIV (tip, analogy, sos)', fixStage: 2, fixLabel: 'Editar Passos' },
  { key: 'intro_slides_ok', label: 'Slides de introdução configurados' },
  { key: 'images_ok', label: 'Todos os passos têm imagem (verificação real nos frames)', fixStage: 4, fixLabel: 'Gerar Imagens' },
  { key: 'mockups_ok', label: 'Todos os frames têm elements suficientes (≥3)', fixStage: 3, fixLabel: 'Enriquecer Frames' },
  { key: 'audios_ok', label: 'Todos os passos têm audio_url (verificação real)', fixStage: 5, fixLabel: 'Gerar Áudios' },
  { key: 'narration_a_ok', label: 'Narração Parte A configurada', fixStage: 5, fixLabel: 'Editar Narração A' },
  { key: 'narration_c_ok', label: 'Narração Parte C configurada', fixStage: 5, fixLabel: 'Editar Narração C' },
  { key: 'metadata_ok', label: 'Metadados da aula completos (título, descrição, tools)' },
  { key: 'gamification_ok', label: 'Gamificação configurada (xp_reward > 0)' },
  // V1-V5 Prompt Master validations
  { key: 'v1_tools_ok', label: 'V1: Ferramentas usadas são apenas as declaradas', fixStage: 2, fixLabel: 'Editar Passos' },
  { key: 'v2_frames_ok', label: 'V2: Frames válidos (chrome_header, bar_text, action/check)', fixStage: 3, fixLabel: 'Enriquecer Frames' },
  { key: 'v3_structure_ok', label: 'V3: Estrutura (3 fases, AILIV último, celebrations 3-5)', fixStage: 2, fixLabel: 'Editar Passos' },
  { key: 'v5_narration_ok', label: 'V5: Narração com anchors obrigatórios', fixStage: 5, fixLabel: 'Gerar Narrações' },
];

export function Stage6Assembly({ pipeline, onUpdate, onNavigateStage }: Stage6AssemblyProps) {
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
      toast.success(`Verificação concluída: ${passCount}/${CHECKLIST_ITEMS.length} itens aprovados`);
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
    const lessonId = pipeline.lesson_id as string;
    const fixes: string[] = [];

    try {
      // ── Fetch all steps ──
      const { data: stepsRaw } = await supabase
        .from('v10_lesson_steps')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('step_number');
      const steps = (stepsRaw || []) as any[];

      // ── 1. FIX LIV: fill empty tip/analogy/sos ──
      let livFixed = 0;
      for (const step of steps) {
        const liv = step.liv || {};
        const needsFix =
          !liv.tip?.trim() ||
          !liv.analogy?.trim() ||
          !liv.sos?.trim();
        if (needsFix) {
          const updatedLiv = {
            tip: liv.tip?.trim() || `Dica para ${step.title}: siga as instruções com atenção`,
            analogy: liv.analogy?.trim() || `${step.title} funciona como seguir uma receita passo a passo`,
            sos: liv.sos?.trim() || `Se algo der errado, tente recarregar a página e refazer este passo`,
          };
          await supabase
            .from('v10_lesson_steps')
            .update({ liv: updatedLiv } as any)
            .eq('id', step.id);
          livFixed++;
        }
      }
      if (livFixed > 0) fixes.push(`LIV: ${livFixed} passos corrigidos`);

      // ── 2. FIX V2 FRAMES: inject chrome_header, fill action/check ──
      let v2Fixed = 0;
      for (const step of steps) {
        const frames = [...(step.frames || [])] as any[];
        let modified = false;
        for (const frame of frames) {
          if (!frame.elements) frame.elements = [];
          // Inject chrome_header if missing as first element
          if (frame.elements.length === 0 || frame.elements[0]?.type !== 'chrome_header') {
            const url = frame.bar_text ? `https://${frame.bar_text.toLowerCase().replace(/\s/g, '')}` : 'https://app.example.com';
            frame.elements.unshift({ type: 'chrome_header', url });
            modified = true;
          }
          // Fill action if empty
          if (!frame.action && step.description) {
            frame.action = step.description;
            modified = true;
          }
          // Fill check if empty
          if (!frame.check) {
            frame.check = `Você completou: ${step.title}`;
            modified = true;
          }
        }
        if (modified) {
          await supabase
            .from('v10_lesson_steps')
            .update({ frames } as any)
            .eq('id', step.id);
          v2Fixed++;
        }
      }
      if (v2Fixed > 0) fixes.push(`V2 Frames: ${v2Fixed} passos corrigidos`);

      // ── 3. FIX V3 STRUCTURE: phases, AILIV last, celebrations, dependency ──
      // Re-fetch steps after V2 fix
      const { data: stepsAfterV2 } = await supabase
        .from('v10_lesson_steps')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('step_number');
      const stepsV3 = (stepsAfterV2 || []) as any[];
      let v3Fixed = 0;

      // ── 3a. FIX PHASES: ensure exactly 3 phases ──
      const existingPhases = new Set(stepsV3.map((s: any) => s.phase));
      if (existingPhases.size !== 3 && stepsV3.length >= 3) {
        const third = Math.ceil(stepsV3.length / 3);
        const twoThirds = Math.ceil((stepsV3.length * 2) / 3);
        for (let i = 0; i < stepsV3.length; i++) {
          const newPhase = i < third ? 1 : i < twoThirds ? 2 : 3;
          if (stepsV3[i].phase !== newPhase) {
            await supabase
              .from('v10_lesson_steps')
              .update({ phase: newPhase } as any)
              .eq('id', stepsV3[i].id);
            stepsV3[i].phase = newPhase;
            v3Fixed++;
          }
        }
        if (v3Fixed > 0) fixes.push(`Fases redistribuídas em 3`);
      }

      // ── 3b. FIX LAST STEP: app_name must be AILIV ──
      const lastStep = stepsV3[stepsV3.length - 1];
      if (lastStep && lastStep.app_name !== 'AILIV') {
        await supabase
          .from('v10_lesson_steps')
          .update({ app_name: 'AILIV' } as any)
          .eq('id', lastStep.id);
        lastStep.app_name = 'AILIV';
        v3Fixed++;
        fixes.push(`Último passo: app_name → AILIV`);
      }

      // ── 3c. FIX CELEBRATIONS: ensure 3-5, last has, first doesn't ──
      const hasCelebration = (step: any) =>
        step?.frames?.some((f: any) => f.elements?.some((e: any) => e.type === 'celebration'));

      const saveStepFrames = async (stepIndex: number, frames: any[]) => {
        const step = stepsV3[stepIndex];
        await supabase.from('v10_lesson_steps').update({ frames } as any).eq('id', step.id);
        stepsV3[stepIndex].frames = frames;
      };

      // Remove celebration from first step if present
      if (stepsV3[0] && hasCelebration(stepsV3[0])) {
        const firstFrames = [...(stepsV3[0].frames || [])] as any[];
        for (const frame of firstFrames) {
          if (!Array.isArray(frame.elements)) continue;
          frame.elements = frame.elements.filter((e: any) => e.type !== 'celebration');
        }
        await saveStepFrames(0, firstFrames);
        v3Fixed++;
      }

      // Protected celebration steps: phase transitions + last step
      const protectedCelebrationSteps = new Set<number>();
      for (let i = 1; i < stepsV3.length; i++) {
        if (stepsV3[i - 1].phase !== stepsV3[i].phase) {
          protectedCelebrationSteps.add(stepsV3[i].step_number);
        }
      }

      // Ensure last step has celebration
      if (lastStep) {
        protectedCelebrationSteps.add(lastStep.step_number);
        const lastIndex = stepsV3.length - 1;
        const frames = [...(stepsV3[lastIndex].frames || [])] as any[];
        const lastFrame = frames[frames.length - 1];
        const hasCeleb = lastFrame?.elements?.some((e: any) => e.type === 'celebration');
        if (!hasCeleb && lastFrame) {
          if (!Array.isArray(lastFrame.elements)) lastFrame.elements = [];
          lastFrame.elements.push({
            type: 'celebration',
            text: 'Parabéns! Aula completa! 🎉',
            next: 'Você dominou todas as etapas.',
          });
          await saveStepFrames(lastIndex, frames);
          v3Fixed++;
        }
      }

      // Ensure transition steps (phase changes) have celebration
      for (let i = 1; i < stepsV3.length - 1; i++) {
        const prev = stepsV3[i - 1];
        const curr = stepsV3[i];
        if (prev.phase !== curr.phase) {
          const frames = [...(curr.frames || [])] as any[];
          const firstFrame = frames[0];
          const hasCeleb = firstFrame?.elements?.some((e: any) => e.type === 'celebration');
          if (!hasCeleb && firstFrame) {
            if (!Array.isArray(firstFrame.elements)) firstFrame.elements = [];
            firstFrame.elements.push({
              type: 'celebration',
              text: `Fase ${prev.phase} concluída! 🎉`,
              next: `Iniciando fase ${curr.phase}.`,
            });
            await saveStepFrames(i, frames);
            v3Fixed++;
          }
        }
      }

      // If less than 3 celebrations, add on strategic middle steps
      let celebrationSteps = stepsV3.filter((s: any) => hasCelebration(s));
      if (celebrationSteps.length < 3 && stepsV3.length >= 5) {
        const middleIndexes = [Math.floor(stepsV3.length * 0.33), Math.floor(stepsV3.length * 0.66)];
        for (const idx of middleIndexes) {
          if (idx <= 0 || idx >= stepsV3.length - 1) continue;
          if (hasCelebration(stepsV3[idx])) continue;
          const frames = [...(stepsV3[idx].frames || [])] as any[];
          if (!frames[0]) continue;
          if (!Array.isArray(frames[0].elements)) frames[0].elements = [];
          frames[0].elements.push({
            type: 'celebration',
            text: 'Ótimo progresso! Continue assim! 🚀',
            next: 'Próximo passo a caminho.',
          });
          await saveStepFrames(idx, frames);
          v3Fixed++;

          celebrationSteps = stepsV3.filter((s: any) => hasCelebration(s));
          if (celebrationSteps.length >= 3) break;
        }
      }

      // If more than 5 celebrations, remove excess from non-protected steps
      celebrationSteps = stepsV3.filter((s: any) => hasCelebration(s));
      if (celebrationSteps.length > 5) {
        const removableIndexes = stepsV3
          .map((step: any, idx: number) => ({ step, idx }))
          .filter(({ step }) => hasCelebration(step) && !protectedCelebrationSteps.has(step.step_number))
          .sort((a, b) => b.step.step_number - a.step.step_number);

        for (const { idx } of removableIndexes) {
          if (celebrationSteps.length <= 5) break;
          const frames = [...(stepsV3[idx].frames || [])] as any[];
          let changed = false;
          for (const frame of frames) {
            if (!Array.isArray(frame.elements)) continue;
            const before = frame.elements.length;
            frame.elements = frame.elements.filter((e: any) => e.type !== 'celebration');
            if (frame.elements.length < before) changed = true;
          }
          if (changed) {
            await saveStepFrames(idx, frames);
            v3Fixed++;
            celebrationSteps = stepsV3.filter((s: any) => hasCelebration(s));
          }
        }
      }

      // Inject dependency elements on steps 2+ if missing
      for (let i = 1; i < stepsV3.length; i++) {
        const step = stepsV3[i];
        const frames = [...(step.frames || [])] as any[];
        const allElements = frames.flatMap((f: any) => f.elements || []);
        const hasDep = allElements.some((e: any) => e.type === 'dependency');
        if (!hasDep && frames[0]) {
          const prevStep = stepsV3[i - 1];
          // Insert after chrome_header (position 1)
          const insertIdx = frames[0].elements?.[0]?.type === 'chrome_header' ? 1 : 0;
          frames[0].elements.splice(insertIdx, 0, {
            type: 'dependency',
            text: `Usando o resultado do passo ${prevStep.step_number}.`,
          });
          await supabase.from('v10_lesson_steps').update({ frames } as any).eq('id', step.id);
          v3Fixed++;
        }
      }
      if (v3Fixed > 0) fixes.push(`V3 Estrutura: ${v3Fixed} correções`);

      // ── 4. FIX TOOLS: sync pipeline.tools from step app_names ──
      const toolsSet = new Set<string>();
      for (const step of steps) {
        if (step.app_name?.trim()) toolsSet.add(step.app_name.trim());
      }
      const tools = Array.from(toolsSet);

      // Update pipeline tools
      await supabase
        .from('v10_bpa_pipeline')
        .update({ tools } as any)
        .eq('id', pipeline.id);

      // ── 5. FIX METADATA: description + tools on lesson ──
      const totalSeconds = steps.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
      const estimatedMinutes = Math.ceil(totalSeconds / 60);
      const description = `Aula prática de ${pipeline.title} com ${steps.length} passos interativos. Ferramentas: ${tools.join(', ') || 'diversas'}. Duração estimada: ${estimatedMinutes} minutos.`;

      await supabase
        .from('v10_lessons')
        .update({ description, tools } as any)
        .eq('id', lessonId);
      fixes.push('Metadados atualizados');

      // ── 6. FIX GAMIFICATION: set xp_reward ──
      const xpReward = steps.length * 10; // 10 XP per step
      await supabase
        .from('v10_lessons')
        .update({ xp_reward: xpReward } as any)
        .eq('id', lessonId);
      fixes.push(`Gamificação: ${xpReward} XP configurado`);

      // ── 7. FIX INTRO SLIDES ──
      const { count: slidesCount } = await supabase
        .from('v10_lesson_intro_slides')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      if (!slidesCount || slidesCount === 0) {
        const toolColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const introSlides: any[] = [
          {
            lesson_id: lessonId,
            slide_order: 1,
            icon: '📖',
            tool_name: null,
            tool_color: '#6366f1',
            title: pipeline.title,
            subtitle: `${steps.length} passos | ${estimatedMinutes} min`,
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

        await supabase
          .from('v10_lesson_intro_slides')
          .insert(introSlides);
        fixes.push(`${introSlides.length} intro slides criados`);
      }

      toast.success(`Correções aplicadas: ${fixes.join(' | ')}`);

      // ── Auto re-verify ──
      const { data: checkData, error: checkError } = await supabase.functions.invoke('v10-assembly-check', {
        body: { pipeline_id: pipeline.id }
      });

      if (!checkError && checkData?.checklist) {
        await onUpdate({
          assembly_checklist: checkData.checklist,
          assembly_passed: checkData.all_passed,
          tools,
        } as Partial<V10BpaPipeline>);

        const passCount = Object.values(checkData.checklist as Record<string, boolean>).filter(Boolean).length;
        toast.success(`Re-verificação: ${passCount}/${CHECKLIST_ITEMS.length} itens aprovados`);
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
            const failed = checked && !passed;
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
                <span className={`flex-1 ${failed ? 'text-red-600' : ''}`}>
                  {item.label}
                </span>
                {failed && item.fixStage && onNavigateStage && (
                  <button
                    type="button"
                    onClick={() => onNavigateStage(item.fixStage!)}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {item.fixLabel || `Ir pra Etapa ${item.fixStage}`}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">
            {passedCount}/{CHECKLIST_ITEMS.length} verificações passaram
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

          {/* Fix all auto-fixable issues */}
          {!allPassed && (
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
              {fixing ? 'Corrigindo tudo...' : 'Corrigir Todas as Pendências'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
