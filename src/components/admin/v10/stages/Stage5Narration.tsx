import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mic, CheckCircle2, Sparkles, Save, Volume2, FileText, AlertCircle, Loader2, Anchor, Play, ChevronDown, ChevronUp, Upload, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonNarration, V10LessonStep, StepAnchor } from '@/types/v10.types';
import { AdminAnchorTimeline } from '../AdminAnchorTimeline';
import { ImportFullScriptModal } from './ImportFullScriptModal';

interface Stage5NarrationProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

export function Stage5Narration({ pipeline, onUpdate }: Stage5NarrationProps) {
  const [audiosTotal, setAudiosTotal] = useState(pipeline.audios_total);
  const [audiosGenerated, setAudiosGenerated] = useState(pipeline.audios_generated);
  const [audiosApproved, setAudiosApproved] = useState(pipeline.audios_approved);
  const [saving, setSaving] = useState(false);

  const [narrations, setNarrations] = useState<V10LessonNarration[]>([]);
  const [steps, setSteps] = useState<V10LessonStep[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [generating, setGenerating] = useState(false);

  const progressPercent = audiosTotal > 0
    ? Math.round((audiosGenerated / audiosTotal) * 100)
    : 0;

  const barColor = progressPercent === 0
    ? 'bg-red-500'
    : progressPercent >= 100
      ? 'bg-green-500'
      : 'bg-yellow-500';

  useEffect(() => {
    if (!pipeline.lesson_id) return;

    const fetchLessonData = async () => {
      setLoadingData(true);
      try {
        const [narrResult, stepsResult] = await Promise.all([
          supabase
            .from('v10_lesson_narrations')
            .select('*')
            .eq('lesson_id', pipeline.lesson_id as string),
          supabase
            .from('v10_lesson_steps')
            .select('*')
            .eq('lesson_id', pipeline.lesson_id as string)
            .order('step_number', { ascending: true }),
        ]);

        if (narrResult.data) {
          setNarrations(narrResult.data as unknown as V10LessonNarration[]);
        }
        if (stepsResult.data) {
          setSteps(stepsResult.data as unknown as V10LessonStep[]);
        }
      } catch {
        toast.error('Erro ao carregar dados da aula');
      } finally {
        setLoadingData(false);
      }
    };

    fetchLessonData();
  }, [pipeline.lesson_id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        audios_total: audiosTotal,
        audios_generated: audiosGenerated,
        audios_approved: audiosApproved,
      });
      toast.success('Dados de narração salvos com sucesso');
    } catch {
      toast.error('Erro ao salvar dados de narração');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    setAudiosApproved(audiosGenerated);
    toast.info('Todos os áudios gerados foram marcados como aprovados. Clique em Salvar para confirmar.');
  };

  const handleGenerate = async () => {
    if (!pipeline.lesson_id) {
      toast.error('Vincule uma aula primeiro');
      return;
    }
    setGenerating(true);
    try {
      // Generate Part A narration
      toast.info('Gerando narração Parte A...');
      const { error: errA } = await supabase.functions.invoke('v10-generate-audio', {
        body: { pipeline_id: pipeline.id, target: 'part_a' }
      });
      if (errA) console.error('Part A error:', errA);

      // Generate Part C narration
      toast.info('Gerando narração Parte C...');
      const { error: errC } = await supabase.functions.invoke('v10-generate-audio', {
        body: { pipeline_id: pipeline.id, target: 'part_c' }
      });
      if (errC) console.error('Part C error:', errC);

      // Generate step audios
      const stepNumbers = steps.filter(s => !s.audio_url).map(s => s.step_number);
      if (stepNumbers.length > 0) {
        toast.info(`Gerando áudio para ${stepNumbers.length} passos...`);
        const { error: errS } = await supabase.functions.invoke('v10-generate-audio', {
          body: { pipeline_id: pipeline.id, target: 'steps', step_numbers: stepNumbers }
        });
        if (errS) console.error('Steps audio error:', errS);
      }

      toast.success('Geração de áudios concluída!');
      // Refresh data
      if (pipeline.lesson_id) {
        const [narrResult, stepsResult] = await Promise.all([
          supabase.from('v10_lesson_narrations').select('*').eq('lesson_id', pipeline.lesson_id as string),
          supabase.from('v10_lesson_steps').select('*').eq('lesson_id', pipeline.lesson_id as string).order('step_number', { ascending: true }),
        ]);
        if (narrResult.data) setNarrations(narrResult.data as unknown as V10LessonNarration[]);
        if (stepsResult.data) setSteps(stepsResult.data as unknown as V10LessonStep[]);
      }
    } catch (err) {
      toast.error(`Erro ao gerar áudios: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGenerating(false);
    }
  };

  const [anchorCounts, setAnchorCounts] = useState<Record<string, number>>({});
  const [anchorErrors, setAnchorErrors] = useState<string[]>([]);
  const [expandedAnchorStep, setExpandedAnchorStep] = useState<string | null>(null);

  // Narration script state
  const [expandedScriptStep, setExpandedScriptStep] = useState<string | null>(null);
  const [editingScripts, setEditingScripts] = useState<Record<string, string>>({});
  const [savingScript, setSavingScript] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [reprocessExisting, setReprocessExisting] = useState(false);
  const [editingPartA, setEditingPartA] = useState(false);
  const [editingPartC, setEditingPartC] = useState(false);
  const [partAText, setPartAText] = useState<string | undefined>(undefined);
  const [partCText, setPartCText] = useState<string | undefined>(undefined);
  const [savingPartNarration, setSavingPartNarration] = useState(false);
  const [generatingPart, setGeneratingPart] = useState<string | null>(null);

  const handleGeneratePartAudio = async (part: 'A' | 'C') => {
    if (!pipeline.lesson_id) {
      toast.error('Vincule uma aula primeiro');
      return;
    }
    const target = part === 'A' ? 'part_a' : 'part_c';
    setGeneratingPart(part);
    try {
      toast.info(`Gerando áudio Parte ${part}...`);
      const { error } = await supabase.functions.invoke('v10-generate-audio', {
        body: { pipeline_id: pipeline.id, target }
      });
      if (error) throw error;
      toast.success(`Áudio da Parte ${part} gerado!`);
      // Refresh narrations
      const { data } = await supabase
        .from('v10_lesson_narrations')
        .select('*')
        .eq('lesson_id', pipeline.lesson_id as string);
      if (data) setNarrations(data as unknown as V10LessonNarration[]);
    } catch (err) {
      toast.error(`Erro ao gerar áudio Parte ${part}: ${err instanceof Error ? err.message : 'erro'}`);
    } finally {
      setGeneratingPart(null);
    }
  };

  // Fetch anchor counts per step
  useEffect(() => {
    if (!steps.length) return;

    async function fetchAnchorStats() {
      const stepIds = steps.map(s => s.id);
      const { data, error } = await (supabase as any)
        .from('v10_lesson_step_anchors')
        .select('step_id')
        .in('step_id', stepIds);

      if (!error && data) {
        const counts: Record<string, number> = {};
        for (const row of data as any[]) {
          counts[row.step_id] = (counts[row.step_id] || 0) + 1;
        }
        setAnchorCounts(counts);
      }
    }

    fetchAnchorStats();
  }, [steps]);

  // ── Save narration script ───────────────────────────────────────────────
  const handleSaveScript = useCallback(async (stepId: string) => {
    const script = editingScripts[stepId];
    if (script === undefined) return;

    setSavingScript(stepId);
    try {
      const { error } = await supabase
        .from('v10_lesson_steps')
        .update({ narration_script: script || null } as any)
        .eq('id', stepId);

      if (error) throw error;

      // Update local state
      setSteps(prev => prev.map(s =>
        s.id === stepId ? { ...s, narration_script: script || null } : s
      ));
      toast.success('Script salvo');
    } catch (err: any) {
      toast.error(`Erro ao salvar script: ${err.message}`);
    } finally {
      setSavingScript(null);
    }
  }, [editingScripts]);

  // ── Process step: send script to ElevenLabs + extract anchors ──────────
  const handleProcessStep = useCallback(async (step: V10LessonStep) => {
    const script = editingScripts[step.id] ?? step.narration_script;
    if (!script?.trim()) {
      toast.error('Passo sem script de narração');
      return;
    }

    setProcessingStep(step.id);
    try {
      toast.info(`Processando passo ${step.step_number}...`);

      const { data, error } = await supabase.functions.invoke('v10-process-anchors', {
        body: {
          pipeline_id: pipeline.id,
          step_id: step.id,
          script,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(`Erro: ${data.error}`);
        return;
      }

      toast.success(
        `Passo ${step.step_number}: áudio gerado, ${data.anchors_saved || 0} anchors salvos`
      );

      // Refresh steps and anchor counts
      const [stepsResult] = await Promise.all([
        supabase
          .from('v10_lesson_steps')
          .select('*')
          .eq('lesson_id', pipeline.lesson_id as string)
          .order('step_number', { ascending: true }),
      ]);
      if (stepsResult.data) {
        setSteps(stepsResult.data as unknown as V10LessonStep[]);
      }

      // Refresh anchor counts
      const stepIds = steps.map(s => s.id);
      const { data: anchorData } = await (supabase as any)
        .from('v10_lesson_step_anchors')
        .select('step_id')
        .in('step_id', stepIds);
      if (anchorData) {
        const counts: Record<string, number> = {};
        for (const row of anchorData as any[]) {
          counts[row.step_id] = (counts[row.step_id] || 0) + 1;
        }
        setAnchorCounts(counts);
      }
    } catch (err: any) {
      toast.error(`Erro ao processar: ${err.message}`);
    } finally {
      setProcessingStep(null);
    }
  }, [editingScripts, pipeline.id, pipeline.lesson_id, steps]);

  // ── Process all steps sequentially ─────────────────────────────────────
  const [processingAll, setProcessingAll] = useState(false);

  const handleProcessAll = useCallback(async () => {
    const stepsWithScript = steps.filter(s => {
      const script = editingScripts[s.id] ?? s.narration_script;
      return script?.trim() && (reprocessExisting || !s.audio_url);
    });

    if (stepsWithScript.length === 0) {
      toast.error('Nenhum passo com script pendente de processamento');
      return;
    }

    setProcessingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const step of stepsWithScript) {
      const script = editingScripts[step.id] ?? step.narration_script;
      setProcessingStep(step.id);

      try {
        const { data, error } = await supabase.functions.invoke('v10-process-anchors', {
          body: {
            pipeline_id: pipeline.id,
            step_id: step.id,
            script,
          },
        });

        if (error || data?.error) {
          errorCount++;
          console.error(`Step ${step.step_number} error:`, error || data?.error);
        } else {
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setProcessingStep(null);
    setProcessingAll(false);

    toast.success(`Processamento concluído: ${successCount} ok, ${errorCount} erros`);

    // Refresh all data
    if (pipeline.lesson_id) {
      const [stepsResult] = await Promise.all([
        supabase
          .from('v10_lesson_steps')
          .select('*')
          .eq('lesson_id', pipeline.lesson_id as string)
          .order('step_number', { ascending: true }),
      ]);
      if (stepsResult.data) setSteps(stepsResult.data as unknown as V10LessonStep[]);
    }
  }, [steps, editingScripts, pipeline.id, pipeline.lesson_id]);

  const totalAnchors = Object.values(anchorCounts).reduce((sum, c) => sum + c, 0);
  const stepsWithAnchors = Object.keys(anchorCounts).length;

  const partANarration = narrations.find((n) => n.part === 'A');
  const partCNarration = narrations.find((n) => n.part === 'C');
  const stepsWithAudio = steps.filter((s) => s.audio_url !== null);
  const stepsWithoutAudio = steps.filter((s) => s.audio_url === null);
  const hasManualScripts = steps.some((s) => !!s.narration_script);

  // ── Refresh helper ──
  const refreshAllData = useCallback(async () => {
    if (!pipeline.lesson_id) return;
    const [narrResult, stepsResult] = await Promise.all([
      supabase.from('v10_lesson_narrations').select('*').eq('lesson_id', pipeline.lesson_id as string),
      supabase.from('v10_lesson_steps').select('*').eq('lesson_id', pipeline.lesson_id as string).order('step_number', { ascending: true }),
    ]);
    if (narrResult.data) setNarrations(narrResult.data as unknown as V10LessonNarration[]);
    if (stepsResult.data) setSteps(stepsResult.data as unknown as V10LessonStep[]);
    setEditingScripts({});
    setPartAText(undefined);
    setPartCText(undefined);
  }, [pipeline.lesson_id]);

  // ── Save Part A/C narration script ──
  const handleSavePartNarration = useCallback(async (part: 'A' | 'C') => {
    const text = part === 'A' ? partAText : partCText;
    if (text === undefined) return;
    const existing = narrations.find((n) => n.part === part);

    setSavingPartNarration(true);
    try {
      if (existing) {
        const { error } = await supabase
          .from('v10_lesson_narrations')
          .update({ script_text: text || null } as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else if (pipeline.lesson_id) {
        const { error } = await supabase
          .from('v10_lesson_narrations')
          .insert({ lesson_id: pipeline.lesson_id, part, script_text: text || null } as any);
        if (error) throw error;
      }
      toast.success(`Script Parte ${part} salvo`);
      await refreshAllData();
      if (part === 'A') setEditingPartA(false);
      else setEditingPartC(false);
    } catch (err: any) {
      toast.error(`Erro ao salvar Parte ${part}: ${err.message}`);
    } finally {
      setSavingPartNarration(false);
    }
  }, [partAText, partCText, narrations, pipeline.lesson_id, refreshAllData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-indigo-500" />
          Etapa 5 — Narração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {audiosGenerated} gerados de {audiosTotal} total
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total de Áudios */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Total de Áudios
            </label>
            <Input
              type="number"
              min={0}
              value={audiosTotal}
              onChange={(e) => setAudiosTotal(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Gerados */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Gerados
            </label>
            <Input
              type="number"
              min={0}
              value={audiosGenerated}
              onChange={(e) => setAudiosGenerated(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Aprovados */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Aprovados
            </label>
            <Input
              type="number"
              min={0}
              value={audiosApproved}
              onChange={(e) => setAudiosApproved(Number(e.target.value))}
              className="bg-white"
            />
          </div>
        </div>

        {/* Lesson narrations (Part A & C) */}
        {pipeline.lesson_id && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Narrações da Aula</h3>

            {loadingData ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Part A */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium">Parte A — Introdução</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        setEditingPartA(!editingPartA);
                        if (!editingPartA) setPartAText(partANarration?.script_text ?? '');
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  {partANarration ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {partANarration.audio_url ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> Áudio disponível
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                              <AlertCircle className="h-3 w-3" /> Sem áudio
                            </span>
                            {partANarration.script_text && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                disabled={generatingPart === 'A'}
                                onClick={() => handleGeneratePartAudio('A')}
                              >
                                {generatingPart === 'A' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                                Gerar Áudio
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      {editingPartA ? (
                        <div className="space-y-2">
                          <Textarea
                            className="min-h-[150px] font-mono text-xs"
                            value={partAText ?? ''}
                            onChange={(e) => setPartAText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleSavePartNarration('A')} disabled={savingPartNarration}>
                              {savingPartNarration ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                              Salvar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingPartA(false)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : partANarration.script_text ? (
                        <div className="flex items-start gap-1">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <p className="line-clamp-3 text-xs text-muted-foreground">
                            {partANarration.script_text}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma narração cadastrada</p>
                  )}
                </div>

                {/* Part C */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium">Parte C — Encerramento</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        setEditingPartC(!editingPartC);
                        if (!editingPartC) setPartCText(partCNarration?.script_text ?? '');
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  {partCNarration ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {partCNarration.audio_url ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> Áudio disponível
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                              <AlertCircle className="h-3 w-3" /> Sem áudio
                            </span>
                            {partCNarration.script_text && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                disabled={generatingPart === 'C'}
                                onClick={() => handleGeneratePartAudio('C')}
                              >
                                {generatingPart === 'C' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                                Gerar Áudio
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      {editingPartC ? (
                        <div className="space-y-2">
                          <Textarea
                            className="min-h-[150px] font-mono text-xs"
                            value={partCText ?? ''}
                            onChange={(e) => setPartCText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleSavePartNarration('C')} disabled={savingPartNarration}>
                              {savingPartNarration ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                              Salvar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingPartC(false)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : partCNarration.script_text ? (
                        <div className="flex items-start gap-1">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <p className="line-clamp-3 text-xs text-muted-foreground">
                            {partCNarration.script_text}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma narração cadastrada</p>
                  )}
                </div>
              </div>
            )}

            {/* Steps audio status */}
            {!loadingData && steps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Áudios dos Steps</h3>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Com áudio: {stepsWithAudio.length}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertCircle className="h-3 w-3" />
                      Sem áudio: {stepsWithoutAudio.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {steps.map((step) => (
                      <span
                        key={step.id}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                          step.audio_url
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={`Step ${step.step_number}: ${step.title}`}
                      >
                        {step.step_number}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Narration Scripts per Step */}
        {!loadingData && steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Scripts de Narração (com [ANCHOR:*] tags)
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                  disabled={!pipeline.lesson_id}
                >
                  <Upload className="h-3 w-3 mr-1" /> Importar Script Completo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProcessAll}
                  disabled={processingAll || !pipeline.lesson_id}
                >
                  {processingAll
                    ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Processando...</>
                    : <><Sparkles className="h-3 w-3 mr-1" /> Processar Todos</>
                  }
                </Button>
              </div>
            </div>

            {/* Reprocess checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="reprocess-existing"
                checked={reprocessExisting}
                onCheckedChange={(v) => setReprocessExisting(!!v)}
              />
              <label htmlFor="reprocess-existing" className="text-xs text-muted-foreground cursor-pointer">
                Incluir steps já processados (reprocessar áudios existentes)
              </label>
            </div>

            <div className="space-y-2">
              {steps.map((step) => {
                const isExpanded = expandedScriptStep === step.id;
                const hasScript = !!(editingScripts[step.id] ?? step.narration_script);
                const hasAudio = !!step.audio_url;
                const isProcessing = processingStep === step.id;
                const isSaving = savingScript === step.id;
                const currentScript = editingScripts[step.id] ?? step.narration_script ?? '';
                const tagCount = (currentScript.match(/\[ANCHOR:[^\]]+\]/g) || []).length;

                return (
                  <div key={step.id} className="rounded-lg border">
                    {/* Step header */}
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${
                        isExpanded ? 'border-b' : ''
                      }`}
                      onClick={() => setExpandedScriptStep(isExpanded ? null : step.id)}
                    >
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                        hasAudio
                          ? 'bg-green-100 text-green-700'
                          : hasScript
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {step.step_number}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{step.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {tagCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600">
                            <Anchor className="h-2.5 w-2.5" /> {tagCount}
                          </span>
                        )}
                        {hasAudio && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-green-600">
                            <CheckCircle2 className="h-2.5 w-2.5" /> áudio
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Expanded script editor */}
                    {isExpanded && (
                      <div className="p-3 space-y-3">
                        <Textarea
                          className="min-h-[200px] font-mono text-xs leading-relaxed"
                          value={currentScript}
                          onChange={(e) => setEditingScripts(prev => ({
                            ...prev,
                            [step.id]: e.target.value,
                          }))}
                          placeholder="Cole o script de narração aqui. Use tags [ANCHOR:pontos_atencao], [ANCHOR:confirmacao], [ANCHOR:troca_frame], [ANCHOR:troca_ferramenta] para marcar eventos visuais."
                        />

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveScript(step.id)}
                            disabled={isSaving || editingScripts[step.id] === undefined}
                          >
                            {isSaving
                              ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              : <Save className="h-3 w-3 mr-1" />
                            }
                            Salvar Script
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleProcessStep(step)}
                            disabled={isProcessing || !hasScript}
                          >
                            {isProcessing
                              ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Processando...</>
                              : <><Play className="h-3 w-3 mr-1" /> Processar (ElevenLabs + Anchors)</>
                            }
                          </Button>
                        </div>

                        {hasAudio && step.audio_url && (
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-3 w-3 text-green-600" />
                            <audio controls className="h-8 flex-1" src={step.audio_url} preload="none" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Anchor Text System */}
        {!loadingData && steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Anchor className="h-4 w-4 text-indigo-500" />
              Anchors (Sincronização Áudio ↔ Visual)
            </h3>

            {/* Anchor stats */}
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1 text-indigo-700">
                  <Anchor className="h-3 w-3" />
                  Total: {totalAnchors} anchors em {stepsWithAnchors} passos
                </span>
              </div>

              {/* Step anchor grid */}
              <div className="flex flex-wrap gap-1.5">
                {steps.map((step) => {
                  const count = anchorCounts[step.id] || 0;
                  const hasAudio = !!step.audio_url;
                  const isExpanded = expandedAnchorStep === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setExpandedAnchorStep(isExpanded ? null : step.id)}
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                        count > 0
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          : hasAudio
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } ${isExpanded ? 'ring-2 ring-indigo-400' : ''}`}
                      title={`Step ${step.step_number}: ${step.title} — ${count} anchors`}
                    >
                      {step.step_number}
                      {count > 0 && (
                        <span className="ml-0.5 text-[9px] opacity-70">({count})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expanded anchor timeline for selected step */}
            {expandedAnchorStep && (() => {
              const step = steps.find(s => s.id === expandedAnchorStep);
              if (!step) return null;
              return (
                <AdminAnchorTimeline
                  stepId={step.id}
                  stepNumber={step.step_number}
                  stepTitle={step.title}
                  audioUrl={step.audio_url}
                  duration={step.duration_seconds}
                />
              );
            })()}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleGenerate}
            disabled={!pipeline.lesson_id || generating || hasManualScripts}
            title={hasManualScripts ? 'Use "Processar Todos" para steps com script manual' : ''}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? 'Gerando áudios...' : 'Gerar Áudios (IA)'}
          </Button>

          {hasManualScripts && (
            <p className="flex items-center text-xs text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Scripts manuais detectados — use "Processar Todos" acima
            </p>
          )}

          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleApproveAll}
            disabled={audiosGenerated === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar Todos
          </Button>

          <Button
            className="min-h-[44px]"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        {/* Import Full Script Modal */}
        {pipeline.lesson_id && (
          <ImportFullScriptModal
            open={showImportModal}
            onClose={() => setShowImportModal(false)}
            lessonId={pipeline.lesson_id}
            steps={steps.map(s => ({ id: s.id, step_number: s.step_number, title: s.title }))}
            narrations={narrations.map(n => ({ id: n.id, part: n.part, script_text: n.script_text }))}
            onImportComplete={refreshAllData}
          />
        )}
      </CardContent>
    </Card>
  );
}
