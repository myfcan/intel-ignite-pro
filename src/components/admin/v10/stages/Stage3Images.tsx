import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Image, CheckCircle2, Sparkles, Save, AlertTriangle, Loader2, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline } from '@/types/v10.types';

interface Stage3ImagesProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

export function Stage3Images({ pipeline, onUpdate }: Stage3ImagesProps) {
  const [imagesNeeded, setImagesNeeded] = useState(pipeline.images_needed);
  const [imagesGenerated, setImagesGenerated] = useState(pipeline.images_generated);
  const [imagesApproved, setImagesApproved] = useState(pipeline.images_approved);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stepsCount, setStepsCount] = useState(0);

  // Fetch steps count to help auto-calculate images_needed
  useEffect(() => {
    if (!pipeline.lesson_id) return;
    supabase
      .from('v10_lesson_steps')
      .select('id', { count: 'exact', head: true })
      .eq('lesson_id', pipeline.lesson_id as string)
      .then(({ count }) => {
        if (count != null) setStepsCount(count);
      });
  }, [pipeline.lesson_id]);

  const progressPercent = imagesNeeded > 0
    ? Math.round((imagesApproved / imagesNeeded) * 100)
    : 0;

  const barColor = progressPercent === 0
    ? 'bg-red-500'
    : progressPercent >= 100
      ? 'bg-green-500'
      : 'bg-yellow-500';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        images_needed: imagesNeeded,
        images_generated: imagesGenerated,
        images_approved: imagesApproved,
      });
      toast.success('Dados de imagens salvos com sucesso');
    } catch {
      toast.error('Erro ao salvar dados de imagens');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    setImagesApproved(imagesGenerated);
    toast.info('Todas as imagens geradas foram marcadas como aprovadas. Clique em Salvar para confirmar.');
  };

  const handleAutoCalc = async () => {
    if (stepsCount > 0) {
      setImagesNeeded(stepsCount);
      toast.info(`Necessárias atualizado para ${stepsCount} (1 por passo). Clique em Salvar.`);
    } else {
      toast.error('Nenhum passo encontrado');
    }
  };

  const handleGenerate = async () => {
    if (!pipeline.lesson_id) {
      toast.error('Vincule uma aula primeiro');
      return;
    }

    // Auto-set images_needed if still 0
    if (imagesNeeded === 0 && stepsCount > 0) {
      setImagesNeeded(stepsCount);
      await onUpdate({ images_needed: stepsCount });
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-generate-images', {
        body: { pipeline_id: pipeline.id, api: 'openai', batch_size: 2, batch_index: 0 }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data) {
        const successCount = data.success ?? 0;
        const hasMore = data.hasMoreBatches ?? false;
        const totalNeeded = data.total ?? 0;
        setImagesGenerated(prev => prev + successCount);
        if (totalNeeded > 0 && imagesNeeded === 0) {
          setImagesNeeded(totalNeeded);
        }
        toast.success(`${successCount} imagens geradas! ${hasMore ? 'Clique novamente para o próximo lote.' : 'Todos os lotes concluídos.'}`);
      }
    } catch (err) {
      toast.error(`Erro ao gerar imagens: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-indigo-500" />
          Etapa 3 — Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning if no lesson linked */}
        {pipeline.lesson_id === null && (
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
            {imagesApproved} aprovadas de {imagesNeeded} necessárias
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Necessárias */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Necessárias
            </label>
            <Input
              type="number"
              min={0}
              value={imagesNeeded}
              onChange={(e) => setImagesNeeded(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Geradas */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Geradas
            </label>
            <Input
              type="number"
              min={0}
              value={imagesGenerated}
              onChange={(e) => setImagesGenerated(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Aprovadas */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Aprovadas
            </label>
            <Input
              type="number"
              min={0}
              value={imagesApproved}
              onChange={(e) => setImagesApproved(Number(e.target.value))}
              className="bg-white"
            />
          </div>
        </div>

        {/* Auto-calculate hint */}
        {imagesNeeded === 0 && stepsCount > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
            <Calculator className="h-4 w-4 shrink-0" />
            {stepsCount} passos encontrados sem imagens. Clique "Calcular" para definir automaticamente.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {stepsCount > 0 && (
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={handleAutoCalc}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calcular ({stepsCount} passos)
            </Button>
          )}

          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleGenerate}
            disabled={pipeline.lesson_id === null || generating}
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? 'Gerando...' : 'Gerar Imagens'}
          </Button>

          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleApproveAll}
            disabled={imagesGenerated === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar Todas
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
