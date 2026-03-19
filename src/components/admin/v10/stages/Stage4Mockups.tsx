import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Layout, CheckCircle2, Save, Calculator, ChevronDown, ChevronUp, ImageIcon, AlertTriangle, Search, Monitor, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonStep } from '@/types/v10.types';
import FrameRenderer from '@/components/lessons/v10/PartB/FrameRenderer';

interface Stage4MockupsProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

export function Stage4Mockups({ pipeline, onUpdate }: Stage4MockupsProps) {
  const [mockupsTotal, setMockupsTotal] = useState(pipeline.mockups_total);
  const [mockupsFromRefero, setMockupsFromRefero] = useState(pipeline.mockups_from_refero);
  const [mockupsGeneric, setMockupsGeneric] = useState(pipeline.mockups_generic);
  const [mockupsApproved, setMockupsApproved] = useState(pipeline.mockups_approved);
  const [saving, setSaving] = useState(false);

  const [steps, setSteps] = useState<V10LessonStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [searchingRefero, setSearchingRefero] = useState(false);
  const [referoScreens, setReferoScreens] = useState<Array<{ id: string; screen_name?: string; app_name?: string; thumbnail_url?: string; url?: string }>>([]);
  const [showReferoResults, setShowReferoResults] = useState(false);
  const [generatingMockups, setGeneratingMockups] = useState(false);
  const [mockupProgress, setMockupProgress] = useState<{ current: number; total: number } | null>(null);

  const progressPercent = mockupsTotal > 0
    ? Math.round((mockupsApproved / mockupsTotal) * 100)
    : 0;

  const barColor = progressPercent === 0
    ? 'bg-red-500'
    : progressPercent >= 100
      ? 'bg-green-500'
      : 'bg-yellow-500';

  // Fetch steps
  useEffect(() => {
    if (!pipeline.lesson_id) return;
    setLoadingSteps(true);
    supabase
      .from('v10_lesson_steps')
      .select('*')
      .eq('lesson_id', pipeline.lesson_id as string)
      .order('step_number', { ascending: true })
      .then(({ data }) => {
        if (data) setSteps(data as unknown as V10LessonStep[]);
        setLoadingSteps(false);
      });
  }, [pipeline.lesson_id]);

  // Count frames across all steps
  const totalFrames = steps.reduce((sum, s) => sum + (s.frames?.length || 0), 0);

  // Count enriched frames
  const enrichedFrames = steps.reduce((sum, s) => {
    return sum + (s.frames?.filter((f: any) => f.enriched === true || (f.elements && f.elements.length >= 3)).length || 0);
  }, 0);

  const handleAutoCalc = () => {
    setMockupsTotal(totalFrames);
    toast.info(`Total atualizado para ${totalFrames} (frames totais). Clique em Salvar.`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        mockups_total: mockupsTotal,
        mockups_from_refero: mockupsFromRefero,
        mockups_generic: mockupsGeneric,
        mockups_approved: mockupsApproved,
      });
      toast.success('Dados de mockups salvos com sucesso');
    } catch {
      toast.error('Erro ao salvar dados de mockups');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    setMockupsApproved(mockupsTotal);
    toast.info('Todos os mockups foram marcados como aprovados. Clique em Salvar para confirmar.');
  };

  // Search Refero for reference screenshots
  const handleReferoSearch = async () => {
    setSearchingRefero(true);
    try {
      // Extrair app_names únicos dos steps — busca por app, não pelo título genérico
      const appNames = [...new Set(
        steps.map(s => s.app_name).filter(Boolean)
      )] as string[];

      if (appNames.length === 0) {
        toast.warning('Nenhum app_name encontrado nos passos. Defina app_name nos steps primeiro.');
        setSearchingRefero(false);
        return;
      }

      const allScreens: typeof referoScreens = [];
      for (const appName of appNames) {
        const { data, error } = await supabase.functions.invoke('v10-refero-search', {
          body: { action: 'search_screens', query: appName, limit: 10 },
        });
        if (!error && data?.screens) {
          allScreens.push(...data.screens);
        }
      }

      setReferoScreens(allScreens);
      setShowReferoResults(true);
      toast.success(`Refero: ${allScreens.length} telas de ${appNames.join(', ')}`);
    } catch {
      toast.error('Erro ao buscar no Refero');
    } finally {
      setSearchingRefero(false);
    }
  };

  // Enrich frames via AI — auto-loop through all batches
  const handleGenerateMockups = async () => {
    if (!pipeline.lesson_id) {
      toast.error('Vincule uma aula primeiro (Etapa 2)');
      return;
    }
    setGeneratingMockups(true);
    setMockupProgress({ current: 0, total: totalFrames });

    let batchIdx = 0;
    let totalEnriched = 0;

    try {
      while (true) {
        const { data, error } = await supabase.functions.invoke('v10-enrich-frames', {
          body: { pipeline_id: pipeline.id, batch_size: 5, batch_index: batchIdx },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const successCount = data?.success ?? 0;
        const hasMore = data?.hasMoreBatches ?? false;
        totalEnriched += successCount;

        setMockupProgress({ current: totalEnriched, total: data?.total ?? totalFrames });

        if (!hasMore || successCount === 0) {
          toast.success(`${totalEnriched} frames enriquecidos! Todos os lotes concluídos.`);
          break;
        }

        batchIdx++;
      }

      // Refresh steps to show enriched frames
      const { data: freshSteps } = await supabase
        .from('v10_lesson_steps')
        .select('*')
        .eq('lesson_id', pipeline.lesson_id as string)
        .order('step_number', { ascending: true });
      if (freshSteps) setSteps(freshSteps as unknown as V10LessonStep[]);
    } catch (err) {
      toast.error(`Erro ao enriquecer frames (batch ${batchIdx + 1}): ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGeneratingMockups(false);
      setMockupProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-indigo-500" />
          Etapa 3 — Mockups (Enriquecimento de Frames)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning if no lesson linked */}
        {!pipeline.lesson_id && (
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Vincule uma aula primeiro (Etapa 2)
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Progresso</span>
            <span>{totalFrames > 0 ? Math.round((enrichedFrames / totalFrames) * 100) : 0}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${enrichedFrames >= totalFrames && totalFrames > 0 ? 'bg-green-500' : enrichedFrames > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${totalFrames > 0 ? Math.min(100, Math.round((enrichedFrames / totalFrames) * 100)) : 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {enrichedFrames} enriquecidos de {totalFrames} frames totais
          </p>
        </div>

        {/* Breakdown summary */}
        <div className="rounded-md border bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 text-sm font-medium text-indigo-800">
          Enriquecidos: {enrichedFrames} | Total: {totalFrames} | Aprovados: {mockupsApproved}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Total</label>
            <Input type="number" min={0} value={mockupsTotal} onChange={(e) => setMockupsTotal(Number(e.target.value))} className="bg-white" />
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Via Refero</label>
            <Input type="number" min={0} value={mockupsFromRefero} onChange={(e) => setMockupsFromRefero(Number(e.target.value))} className="bg-white" />
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Genéricos</label>
            <Input type="number" min={0} value={mockupsGeneric} onChange={(e) => setMockupsGeneric(Number(e.target.value))} className="bg-white" />
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Aprovados</label>
            <Input type="number" min={0} value={mockupsApproved} onChange={(e) => setMockupsApproved(Number(e.target.value))} className="bg-white" />
          </div>
        </div>

        {/* Refero screenshot search — reference only */}
        <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-indigo-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Refero — Referência Visual (126k+ telas)
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReferoSearch}
              disabled={searchingRefero}
              className="h-8"
            >
              {searchingRefero ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Search className="mr-1 h-3 w-3" />}
              {searchingRefero ? 'Buscando...' : 'Buscar Referências'}
            </Button>
          </div>
          {showReferoResults && (
            referoScreens.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-indigo-600">{referoScreens.length} screenshots encontrados como referência visual.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {referoScreens.map((screen, idx) => (
                    <div key={screen.id || idx} className="rounded border bg-white p-1 text-center">
                      {screen.thumbnail_url ? (
                        <img src={screen.thumbnail_url} alt={screen.screen_name || ''} className="h-16 w-full object-cover rounded" />
                      ) : (
                        <div className="h-16 w-full bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <p className="text-[9px] text-gray-600 truncate mt-1">{screen.screen_name || screen.app_name || 'Screen'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum screenshot encontrado para "{[...new Set(steps.map(s => s.app_name).filter(Boolean))].join(', ') || pipeline.title}".</p>
            )
          )}
          {!showReferoResults && (
            <p className="text-xs text-muted-foreground">
              Busque screenshots reais no Refero como referência visual para os frames.
            </p>
          )}
        </div>

        {/* Per-step frame management with FrameRenderer preview */}
        {!loadingSteps && steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-500" />
              Frames por Passo ({totalFrames} frames — {enrichedFrames} enriquecidos)
            </h3>

            <div className="space-y-2">
              {steps.map((step) => {
                const isExpanded = expandedStep === step.id;
                const frameCount = step.frames?.length || 0;
                const enrichedCount = step.frames?.filter((f: any) => f.enriched === true || (f.elements && f.elements.length >= 3)).length || 0;

                return (
                  <div key={step.id} className="rounded-lg border">
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${isExpanded ? 'border-b' : ''}`}
                      onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold bg-indigo-100 text-indigo-700">
                        {step.step_number}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{step.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={enrichedCount === frameCount && frameCount > 0 ? 'text-green-600 font-medium' : ''}>
                          {enrichedCount}/{frameCount} enriquecidos
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-3">
                        {step.frames?.map((frame: any, fi: number) => {
                          const isEnriched = frame.enriched === true || (frame.elements && frame.elements.length >= 3);
                          return (
                            <div key={fi} className="rounded border p-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">
                                  Frame {fi + 1}: {frame.bar_text || 'Sem título'}
                                  {isEnriched && <span className="ml-2 text-green-600">✓ Enriquecido</span>}
                                </p>
                                <span className="text-[10px] text-muted-foreground">
                                  {frame.elements?.length || 0} elements
                                </span>
                              </div>
                              {/* FrameRenderer preview — scaled down */}
                              {frame.elements && frame.elements.length > 0 ? (
                                <div className="relative w-full overflow-hidden rounded border bg-white" style={{ height: '180px' }}>
                                  <div className="origin-top-left" style={{ transform: 'scale(0.35)', width: `${100 / 0.35}%` }}>
                                    <FrameRenderer frame={frame} accentColor={frame.bar_color || '#6366F1'} />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">Sem elements — precisa enriquecimento</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {pipeline.lesson_id && totalFrames > 0 && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="min-h-[44px] bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                onClick={handleGenerateMockups}
                disabled={generatingMockups}
              >
                {generatingMockups ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {generatingMockups && mockupProgress
                  ? `Enriquecendo Frames... ${mockupProgress.current}/${mockupProgress.total}`
                  : `Enriquecer Frames com IA (${totalFrames - enrichedFrames} pendentes)`}
              </Button>
              {generatingMockups && mockupProgress && mockupProgress.total > 0 && (
                <div className="w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((mockupProgress.current / mockupProgress.total) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((mockupProgress.current / mockupProgress.total) * 100)}% concluído
                  </p>
                </div>
              )}
            </div>
          )}

          {totalFrames > 0 && (
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={handleAutoCalc}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calcular ({totalFrames} frames)
            </Button>
          )}

          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleApproveAll}
            disabled={mockupsTotal === 0}
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
