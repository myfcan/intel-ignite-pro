import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Image, CheckCircle2, Sparkles, Save, AlertTriangle } from 'lucide-react';
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

  const handleGenerate = () => {
    toast.info('Geração de imagens em implementação futura');
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleGenerate}
            disabled={pipeline.lesson_id === null}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Imagens
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
