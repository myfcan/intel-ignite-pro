import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mic, CheckCircle2, Sparkles, Save, Volume2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonNarration, V10LessonStep } from '@/types/v10.types';

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

  const partANarration = narrations.find((n) => n.part === 'A');
  const partCNarration = narrations.find((n) => n.part === 'C');
  const stepsWithAudio = steps.filter((s) => s.audio_url !== null);
  const stepsWithoutAudio = steps.filter((s) => s.audio_url === null);

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
                  <div className="mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Parte A — Introdução</span>
                  </div>
                  {partANarration ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {partANarration.audio_url ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> Áudio disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                            <AlertCircle className="h-3 w-3" /> Sem áudio
                          </span>
                        )}
                      </div>
                      {partANarration.script_text && (
                        <div className="flex items-start gap-1">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <p className="line-clamp-3 text-xs text-muted-foreground">
                            {partANarration.script_text}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma narração cadastrada</p>
                  )}
                </div>

                {/* Part C */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Parte C — Encerramento</span>
                  </div>
                  {partCNarration ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {partCNarration.audio_url ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> Áudio disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                            <AlertCircle className="h-3 w-3" /> Sem áudio
                          </span>
                        )}
                      </div>
                      {partCNarration.script_text && (
                        <div className="flex items-start gap-1">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <p className="line-clamp-3 text-xs text-muted-foreground">
                            {partCNarration.script_text}
                          </p>
                        </div>
                      )}
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleGenerate}
            disabled={!pipeline.lesson_id || generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? 'Gerando áudios...' : 'Gerar Áudios'}
          </Button>

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
      </CardContent>
    </Card>
  );
}
