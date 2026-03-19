import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Layout, CheckCircle2, Save, Calculator, Upload, ChevronDown, ChevronUp, ImageIcon, AlertTriangle, Trash2, Search, Monitor, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonStep } from '@/types/v10.types';

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
  const [uploading, setUploading] = useState<string | null>(null);
  const [searchingRefero, setSearchingRefero] = useState(false);
  const [referoScreens, setReferoScreens] = useState<Array<{ id: string; screen_name?: string; app_name?: string; thumbnail_url?: string; url?: string }>>([]);
  const [showReferoResults, setShowReferoResults] = useState(false);
  const [generatingMockups, setGeneratingMockups] = useState(false);
  const [nextBatchIndex, setNextBatchIndex] = useState(0);
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

  // Count frames across all steps (= mockups needed)
  const totalFrames = steps.reduce((sum, s) => sum + (s.frames?.length || 0), 0);

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

  // Upload a mockup screenshot for a specific step frame
  const handleUploadMockup = useCallback(async (step: V10LessonStep, frameIndex: number, file: File) => {
    if (!pipeline.lesson_id) return;

    setUploading(`${step.id}-${frameIndex}`);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const storagePath = `v10/${pipeline.lesson_id}/mockups/step_${step.step_number}_frame_${frameIndex}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(storagePath);

      // Update the frame's mockup_url in the step's frames array
      const updatedFrames = [...step.frames];
      if (updatedFrames[frameIndex]) {
        (updatedFrames[frameIndex] as any).mockup_url = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('v10_lesson_steps')
        .update({ frames: updatedFrames as any })
        .eq('id', step.id);

      if (updateError) throw updateError;

      // Update local state
      setSteps(prev => prev.map(s =>
        s.id === step.id ? { ...s, frames: updatedFrames } : s
      ));

      setMockupsFromRefero(prev => prev + 1);
      toast.success(`Mockup enviado: Passo ${step.step_number}, Frame ${frameIndex + 1}`);
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setUploading(null);
    }
  }, [pipeline.lesson_id]);

  // Delete a mockup from a specific frame
  const handleDeleteMockup = useCallback(async (step: V10LessonStep, frameIndex: number) => {
    if (!confirm('Remover este mockup?')) return;

    const updatedFrames = [...step.frames];
    if (updatedFrames[frameIndex]) {
      (updatedFrames[frameIndex] as any).mockup_url = null;
    }

    const { error } = await supabase
      .from('v10_lesson_steps')
      .update({ frames: updatedFrames as any })
      .eq('id', step.id);

    if (error) {
      toast.error('Erro ao remover mockup');
      return;
    }

    setSteps(prev => prev.map(s =>
      s.id === step.id ? { ...s, frames: updatedFrames } : s
    ));

    setMockupsFromRefero(prev => Math.max(0, prev - 1));
    toast.success('Mockup removido');
  }, []);

  // Search Refero for reference screenshots
  const handleReferoSearch = useCallback(async () => {
    setSearchingRefero(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-refero-search', {
        body: { action: 'search_screens', query: pipeline.title, limit: 20 },
      });
      if (error) throw error;
      const result = data as { screens: typeof referoScreens; total: number };
      setReferoScreens(result.screens ?? []);
      setShowReferoResults(true);
      toast.success(`Refero: ${result.total ?? 0} telas encontradas`);
    } catch {
      toast.error('Erro ao buscar no Refero');
    } finally {
      setSearchingRefero(false);
    }
  }, [pipeline.title]);

  // Import a Refero screenshot as mockup_url for a frame
  const handleImportReferoScreen = useCallback(async (step: V10LessonStep, frameIndex: number, screenUrl: string) => {
    const updatedFrames = [...step.frames];
    if (updatedFrames[frameIndex]) {
      (updatedFrames[frameIndex] as any).mockup_url = screenUrl;
    }

    const { error } = await supabase
      .from('v10_lesson_steps')
      .update({ frames: updatedFrames as any })
      .eq('id', step.id);

    if (error) {
      toast.error('Erro ao importar screenshot do Refero');
      return;
    }

    setSteps(prev => prev.map(s =>
      s.id === step.id ? { ...s, frames: updatedFrames } : s
    ));
    setMockupsFromRefero(prev => prev + 1);
    toast.success(`Screenshot do Refero importado para Passo ${step.step_number}, Frame ${frameIndex + 1}`);
  }, []);

  // Generate mockups via AI (v10-generate-mockups edge function)
  const handleGenerateMockups = async () => {
    if (!pipeline.lesson_id) {
      toast.error('Vincule uma aula primeiro (Etapa 2)');
      return;
    }
    setGeneratingMockups(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-generate-mockups', {
        body: { pipeline_id: pipeline.id, batch_size: 3, batch_index: nextBatchIndex },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data) {
        const successCount = data.success ?? 0;
        const hasMore = data.hasMoreBatches ?? false;

        if (hasMore) {
          setNextBatchIndex(prev => prev + 1);
          toast.success(`${successCount} mockups gerados! Clique novamente para o próximo lote (batch ${nextBatchIndex + 2}).`);
        } else {
          setNextBatchIndex(0);
          toast.success(`${successCount} mockups gerados! Todos os lotes concluídos.`);
        }

        // Refresh steps to show new mockup_urls
        const { data: freshSteps } = await supabase
          .from('v10_lesson_steps')
          .select('*')
          .eq('lesson_id', pipeline.lesson_id as string)
          .order('step_number', { ascending: true });
        if (freshSteps) setSteps(freshSteps as unknown as V10LessonStep[]);
      }
    } catch (err) {
      toast.error(`Erro ao gerar mockups: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGeneratingMockups(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-indigo-500" />
          Etapa 3 — Mockups
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
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {mockupsApproved} aprovados de {mockupsTotal} total
          </p>
        </div>

        {/* Breakdown summary */}
        <div className="rounded-md border bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 text-sm font-medium text-indigo-800">
          Refero: {mockupsFromRefero} | Genéricos: {mockupsGeneric} | Total: {mockupsTotal}
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

        {/* Refero screenshot search */}
        <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-indigo-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Refero — Screenshots Reais (126k+ telas)
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
                <p className="text-xs text-indigo-600">{referoScreens.length} screenshots encontrados. Clique em um frame expandido para importar.</p>
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
              <p className="text-xs text-muted-foreground">Nenhum screenshot encontrado para "{pipeline.title}".</p>
            )
          )}
          {!showReferoResults && (
            <p className="text-xs text-muted-foreground">
              Busque screenshots reais de interfaces no banco Refero para usar como referência nos mockups.
            </p>
          )}
        </div>

        {/* Per-step mockup management */}
        {!loadingSteps && steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-500" />
              Mockups por Passo ({totalFrames} frames)
            </h3>

            <div className="space-y-2">
              {steps.map((step) => {
                const isExpanded = expandedStep === step.id;
                const frameCount = step.frames?.length || 0;
                const mockupCount = step.frames?.filter((f: any) => f.mockup_url).length || 0;

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
                        <span>{mockupCount}/{frameCount} mockups</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-3">
                        {step.frames?.map((frame: any, fi: number) => (
                          <div key={fi} className="flex items-center gap-3 rounded border p-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium">Frame {fi + 1}: {frame.bar_text || 'Sem título'}</p>
                              {frame.mockup_url ? (
                                <div className="mt-2">
                                  <img
                                    src={frame.mockup_url}
                                    alt={`Mockup frame ${fi + 1}`}
                                    className="h-20 rounded border object-cover"
                                  />
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1">Sem mockup</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadMockup(step, fi, file);
                                  }}
                                />
                                <div className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                                  uploading === `${step.id}-${fi}` ? 'opacity-50' : ''
                                }`}>
                                  <Upload className="h-3 w-3" />
                                  {frame.mockup_url ? 'Trocar' : 'Upload'}
                                </div>
                              </label>
                              {referoScreens.length > 0 && !frame.mockup_url && (
                                <select
                                  className="rounded-md border px-2 py-1 text-xs max-w-[140px]"
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleImportReferoScreen(step, fi, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                >
                                  <option value="" disabled>Refero...</option>
                                  {referoScreens.filter(s => s.thumbnail_url || s.url).map((s, si) => (
                                    <option key={s.id || si} value={s.thumbnail_url || s.url || ''}>
                                      {s.screen_name || s.app_name || `Screen ${si + 1}`}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {frame.mockup_url && (
                                <button
                                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                  onClick={() => handleDeleteMockup(step, fi)}
                                  title="Remover mockup"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
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
              {generatingMockups ? 'Gerando Mockups...' : `Gerar Mockups com IA (${totalFrames} frames)`}
            </Button>
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
