import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type {
  V10BpaPipeline,
  V10BpaPipelineLog,
  V10PipelineStage,
} from '@/types/v10.types';

import { Stage1Score } from '@/components/admin/v10/stages/Stage1Score';
import { Stage2Structure } from '@/components/admin/v10/stages/Stage2Structure';
import { Stage3Images } from '@/components/admin/v10/stages/Stage3Images';
import { Stage4Mockups } from '@/components/admin/v10/stages/Stage4Mockups';
import { Stage5Narration } from '@/components/admin/v10/stages/Stage5Narration';
import { Stage6Assembly } from '@/components/admin/v10/stages/Stage6Assembly';
import { Stage7Publish } from '@/components/admin/v10/stages/Stage7Publish';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES: { num: V10PipelineStage; label: string; icon: string }[] = [
  { num: 1, label: 'Score', icon: '\u{1F4CA}' },
  { num: 2, label: 'Estrutura', icon: '\u{1F4DD}' },
  { num: 3, label: 'Imagens', icon: '\u{1F5BC}\uFE0F' },
  { num: 4, label: 'Mockups', icon: '\u{1F4F8}' },
  { num: 5, label: 'Narração', icon: '\u{1F399}\uFE0F' },
  { num: 6, label: 'Montagem', icon: '\u{1F527}' },
  { num: 7, label: 'Publicar', icon: '\u{1F680}' },
];

const STATUS_LABELS: Record<V10BpaPipeline['status'], string> = {
  draft: 'Rascunho',
  in_progress: 'Em progresso',
  ready: 'Pronto',
  published: 'Publicado',
};

const STATUS_COLORS: Record<V10BpaPipeline['status'], string> = {
  draft: 'bg-gray-200 text-gray-700',
  in_progress: 'bg-amber-100 text-amber-800',
  ready: 'bg-emerald-100 text-emerald-800',
  published: 'bg-indigo-100 text-indigo-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminV10PipelineEditor() {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState<V10BpaPipeline | null>(null);
  const [logs, setLogs] = useState<V10BpaPipelineLog[]>([]);
  const [activeStage, setActiveStage] = useState<V10PipelineStage>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  // ---- Fetch pipeline ---------------------------------------------------
  useEffect(() => {
    if (!pipelineId) return;

    async function fetchPipeline() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('v10_bpa_pipeline')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (fetchError || !data) {
        setError(fetchError?.message ?? 'Pipeline não encontrado.');
        setLoading(false);
        return;
      }

      const fetched = data as unknown as V10BpaPipeline;
      setPipeline(fetched);
      setActiveStage(fetched.current_stage);
      setLoading(false);
    }

    fetchPipeline();
  }, [pipelineId]);

  // ---- Fetch logs -------------------------------------------------------
  useEffect(() => {
    if (!pipelineId) return;

    async function fetchLogs() {
      const { data } = await supabase
        .from('v10_bpa_pipeline_log')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setLogs(data as unknown as V10BpaPipelineLog[]);
      }
    }

    fetchLogs();
  }, [pipelineId, pipeline?.updated_at]);

  // ---- handlePipelineUpdate ---------------------------------------------
  const handlePipelineUpdate = useCallback(
    async (updates: Partial<V10BpaPipeline>) => {
      if (!pipeline) return;

      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('v10_bpa_pipeline')
        .update(payload as Record<string, unknown>)
        .eq('id', pipeline.id)
        .select()
        .single();

      if (updateError) {
        toast.error('Erro ao atualizar pipeline: ' + updateError.message);
        throw updateError;
      }

      const updated = data as unknown as V10BpaPipeline;
      setPipeline(updated);

      // Log the update
      await supabase.from('v10_bpa_pipeline_log').insert({
        pipeline_id: pipeline.id,
        stage: pipeline.current_stage,
        action: 'update',
        details: { updated_fields: Object.keys(updates) },
      });
    },
    [pipeline],
  );

  // ---- Advance stage ----------------------------------------------------
  async function handleAdvanceStage() {
    if (!pipeline) return;
    if (pipeline.current_stage >= 7) {
      toast.info('Já está na última etapa.');
      return;
    }

    const confirmed = window.confirm(
      `Avançar de "${STAGES[pipeline.current_stage - 1].label}" para "${STAGES[pipeline.current_stage].label}"?`,
    );
    if (!confirmed) return;

    setAdvancing(true);

    const nextStage = (pipeline.current_stage + 1) as V10PipelineStage;

    const payload: Record<string, unknown> = {
      current_stage: nextStage,
      status: nextStage === 7 ? 'ready' : 'in_progress',
      updated_at: new Date().toISOString(),
    };

    const { data, error: advanceError } = await supabase
      .from('v10_bpa_pipeline')
      .update(payload)
      .eq('id', pipeline.id)
      .select()
      .single();

    if (advanceError) {
      toast.error('Erro ao avançar etapa: ' + advanceError.message);
      setAdvancing(false);
      return;
    }

    const updated = data as unknown as V10BpaPipeline;
    setPipeline(updated);
    setActiveStage(nextStage);

    // Log the stage advance
    await supabase.from('v10_bpa_pipeline_log').insert({
      pipeline_id: pipeline.id,
      stage: nextStage as number,
      action: 'stage_advance',
      details: { from: pipeline.current_stage, to: nextStage },
    });

    toast.success(`Avançou para a etapa ${nextStage}: ${STAGES[nextStage - 1].label}`);
    setAdvancing(false);
  }

  // ---- Loading / Error states -------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h2 className="text-xl font-semibold">Erro ao carregar pipeline</h2>
          <p className="text-muted-foreground">{error ?? 'Pipeline não encontrado.'}</p>
          <Button
            className="min-h-[44px]"
            variant="outline"
            onClick={() => navigate('/admin/v10')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // ---- Render -----------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          onClick={() => navigate('/admin/v10')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{pipeline.title}</h1>
          <p className="text-sm text-muted-foreground">
            Slug: {pipeline.slug} &middot; Etapa {pipeline.current_stage} de 7
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[pipeline.status]}`}
        >
          {STATUS_LABELS[pipeline.status]}
        </span>
      </div>

      {/* Stage stepper */}
      <nav className="flex items-center gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-2">
        {STAGES.map((stage) => {
          const isAccessible = stage.num <= pipeline.current_stage;
          const isActive = stage.num === activeStage;

          return (
            <button
              key={stage.num}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && setActiveStage(stage.num)}
              className={`
                flex min-h-[44px] flex-1 flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors
                ${isActive ? 'bg-white shadow text-indigo-700' : ''}
                ${isAccessible && !isActive ? 'hover:bg-white/60 text-foreground cursor-pointer' : ''}
                ${!isAccessible ? 'cursor-not-allowed opacity-40' : ''}
              `}
            >
              <span className="text-lg leading-none">{stage.icon}</span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active stage content */}
      <section>
        {activeStage === 1 && <Stage1Score pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 2 && <Stage2Structure pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 3 && <Stage3Images pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 4 && <Stage4Mockups pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 5 && <Stage5Narration pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 6 && <Stage6Assembly pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
        {activeStage === 7 && <Stage7Publish pipeline={pipeline} onUpdate={handlePipelineUpdate} />}
      </section>

      {/* Advance stage button */}
      {pipeline.current_stage < 7 && (
        <div className="flex justify-end">
          <Button
            className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90"
            onClick={handleAdvanceStage}
            disabled={advancing}
          >
            {advancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Avançando...
              </>
            ) : (
              <>
                Avançar Etapa
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Pipeline log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                    E{log.stage}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{log.action}</span>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
