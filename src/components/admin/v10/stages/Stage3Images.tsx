import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Image, CheckCircle2, Sparkles, Save, AlertTriangle, Loader2, Calculator, Trash2, Upload, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10LessonStep } from '@/types/v10.types';

interface Stage3ImagesProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

type ImageStatus = 'generated' | 'approved' | 'rejected';

interface StepImage {
  stepNumber: number;
  title: string;
  src: string;
  alt: string;
  stepId: string;
  elementIndex: number;
  frameIndex: number;
}

export function Stage3Images({ pipeline, onUpdate }: Stage3ImagesProps) {
  const [imagesNeeded, setImagesNeeded] = useState(pipeline.images_needed);
  const [imagesGenerated, setImagesGenerated] = useState(pipeline.images_generated);
  const [imagesApproved, setImagesApproved] = useState(pipeline.images_approved);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stepsCount, setStepsCount] = useState(0);
  const [stepImages, setStepImages] = useState<StepImage[]>([]);
  const [nextBatchIndex, setNextBatchIndex] = useState(0);
  const [imageStatuses, setImageStatuses] = useState<Record<string, ImageStatus>>(
    (pipeline.image_statuses as Record<string, ImageStatus>) || {}
  );
  const [regeneratingStep, setRegeneratingStep] = useState<string | null>(null);
  const [uploadingStep, setUploadingStep] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Build a unique key for each image
  const imageKey = (stepId: string, elementIndex: number) => `${stepId}:${elementIndex}`;

  // Fetch steps count
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

  // Fetch image preview data from step frames
  const fetchImagePreviews = useCallback(async () => {
    if (!pipeline.lesson_id) return;
    const { data } = await supabase
      .from('v10_lesson_steps')
      .select('id, step_number, title, frames')
      .eq('lesson_id', pipeline.lesson_id as string)
      .order('step_number', { ascending: true });

    if (!data) return;

    const images: StepImage[] = [];
    for (const step of data as unknown as V10LessonStep[]) {
      if (!step.frames || !Array.isArray(step.frames)) continue;
      for (let frameIdx = 0; frameIdx < step.frames.length; frameIdx++) {
        const frame = step.frames[frameIdx];
        if (!frame.elements || !Array.isArray(frame.elements)) continue;
        for (let elIdx = 0; elIdx < frame.elements.length; elIdx++) {
          const el = frame.elements[elIdx];
          if (el.type === 'image') {
            images.push({
              stepNumber: step.step_number,
              title: step.title,
              src: (el as { src?: string }).src || '',
              alt: (el as { alt?: string }).alt || '',
              stepId: step.id,
              elementIndex: elIdx,
              frameIndex: frameIdx,
            });
          }
        }
      }
    }
    setStepImages(images);

    // Derive statuses for new images (preserve existing manual statuses)
    setImageStatuses(prev => {
      const next = { ...prev };
      for (const img of images) {
        const key = imageKey(img.stepId, img.elementIndex);
        if (!next[key] && img.src) {
          next[key] = 'generated';
        }
      }
      return next;
    });
  }, [pipeline.lesson_id]);

  // Auto-load images on mount
  useEffect(() => {
    fetchImagePreviews();
  }, [fetchImagePreviews]);

  // Recalculate counters from statuses
  const recalcCounters = useCallback((statuses: Record<string, ImageStatus>) => {
    const generated = Object.values(statuses).filter(s => s === 'generated' || s === 'approved').length;
    const approved = Object.values(statuses).filter(s => s === 'approved').length;
    setImagesGenerated(generated);
    setImagesApproved(approved);
  }, []);

  const progressPercent = imagesNeeded > 0
    ? Math.round((imagesApproved / imagesNeeded) * 100)
    : 0;

  const barColor = progressPercent === 0
    ? 'bg-destructive'
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
        image_statuses: imageStatuses,
      });
      toast.success('Dados de imagens salvos com sucesso');
    } catch {
      toast.error('Erro ao salvar dados de imagens');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    setImageStatuses(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === 'generated') next[key] = 'approved';
      }
      recalcCounters(next);
      return next;
    });
    toast.info('Todas as imagens marcadas como aprovadas. Salve para confirmar.');
  };

  const handleAutoCalc = () => {
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
    if (imagesNeeded === 0 && stepsCount > 0) {
      setImagesNeeded(stepsCount);
      await onUpdate({ images_needed: stepsCount });
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-generate-images', {
        body: { pipeline_id: pipeline.id, batch_size: 15, batch_index: nextBatchIndex }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data) {
        const successCount = data.success ?? 0;
        const hasMore = data.hasMoreBatches ?? false;
        const totalNeeded = data.total ?? 0;
        if (totalNeeded > 0 && imagesNeeded === 0) setImagesNeeded(totalNeeded);
        if (hasMore) {
          setNextBatchIndex(prev => prev + 1);
          toast.success(`${successCount} imagens geradas! Próximo lote (batch ${nextBatchIndex + 2}).`);
        } else {
          setNextBatchIndex(0);
          toast.success(`${successCount} imagens geradas! Todos os lotes concluídos.`);
        }
        await fetchImagePreviews();
      }
    } catch (err) {
      toast.error(`Erro ao gerar imagens: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = (key: string, newStatus: ImageStatus) => {
    setImageStatuses(prev => {
      const next = { ...prev };
      next[key] = prev[key] === newStatus ? 'generated' : newStatus;
      recalcCounters(next);
      return next;
    });
  };

  const handleRegenerateStep = async (img: StepImage) => {
    const key = imageKey(img.stepId, img.elementIndex);
    setRegeneratingStep(key);
    try {
      const { data, error } = await supabase.functions.invoke('v10-generate-images', {
        body: { pipeline_id: pipeline.id, batch_size: 1, step_ids: [img.stepId] }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Imagem do passo ${img.stepNumber} regenerada!`);
      await fetchImagePreviews();
    } catch (err) {
      toast.error(`Erro ao regenerar: ${err instanceof Error ? err.message : 'erro'}`);
    } finally {
      setRegeneratingStep(null);
    }
  };

  const handleUpload = async (img: StepImage, file: File) => {
    const key = imageKey(img.stepId, img.elementIndex);
    setUploadingStep(key);
    try {
      const storagePath = `v10-images/${pipeline.lesson_id}/${img.stepNumber}_${img.elementIndex}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(storagePath, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(storagePath);

      // Update frame element src in DB
      const { data: step } = await supabase
        .from('v10_lesson_steps')
        .select('frames')
        .eq('id', img.stepId)
        .single();

      if (step) {
        const frames = step.frames as any[];
        if (frames[img.frameIndex]?.elements?.[img.elementIndex]) {
          frames[img.frameIndex].elements[img.elementIndex].src = publicUrlData.publicUrl;
          await supabase
            .from('v10_lesson_steps')
            .update({ frames })
            .eq('id', img.stepId);
        }
      }

      toast.success(`Upload concluído para passo ${img.stepNumber}`);
      await fetchImagePreviews();
      // Auto-set as generated
      setImageStatuses(prev => {
        const next = { ...prev, [key]: 'generated' as ImageStatus };
        recalcCounters(next);
        return next;
      });
    } catch (err) {
      toast.error(`Erro no upload: ${err instanceof Error ? err.message : 'erro'}`);
    } finally {
      setUploadingStep(null);
    }
  };

  const handleRemoveImage = async (img: StepImage) => {
    if (!confirm('Remover esta imagem do frame?')) return;
    const { data: step } = await supabase
      .from('v10_lesson_steps')
      .select('frames')
      .eq('id', img.stepId)
      .single();

    if (step) {
      const frames = step.frames as any[];
      if (frames[img.frameIndex]?.elements?.[img.elementIndex]) {
        frames[img.frameIndex].elements[img.elementIndex].src = '';
        await supabase
          .from('v10_lesson_steps')
          .update({ frames })
          .eq('id', img.stepId);
      }
    }
    const key = imageKey(img.stepId, img.elementIndex);
    setImageStatuses(prev => {
      const next = { ...prev };
      delete next[key];
      recalcCounters(next);
      return next;
    });
    toast.success('Imagem removida');
    fetchImagePreviews();
  };

  const statusBadge = (status: ImageStatus | undefined) => {
    if (!status) return null;
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">Rejeitada</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-yellow-500 text-yellow-700">Gerada</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
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
            {imagesApproved} aprovadas de {imagesNeeded} necessárias ({imagesGenerated} geradas)
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Necessárias</label>
            <Input type="number" min={0} value={imagesNeeded} onChange={(e) => setImagesNeeded(Number(e.target.value))} className="bg-white" />
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Geradas</label>
            <Input type="number" min={0} value={imagesGenerated} readOnly className="bg-white opacity-70" />
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">Aprovadas</label>
            <Input type="number" min={0} value={imagesApproved} readOnly className="bg-white opacity-70" />
          </div>
        </div>

        {/* Auto-calculate hint */}
        {imagesNeeded === 0 && stepsCount > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
            <Calculator className="h-4 w-4 shrink-0" />
            {stepsCount} passos encontrados. Clique "Calcular" para definir automaticamente.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {stepsCount > 0 && (
            <Button variant="outline" className="min-h-[44px]" onClick={handleAutoCalc}>
              <Calculator className="mr-2 h-4 w-4" />
              Calcular ({stepsCount})
            </Button>
          )}
          <Button variant="outline" className="min-h-[44px]" onClick={handleGenerate} disabled={pipeline.lesson_id === null || generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? 'Gerando...' : 'Gerar Imagens'}
          </Button>
          <Button variant="outline" className="min-h-[44px]" onClick={handleApproveAll} disabled={imagesGenerated === 0}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar Todas
          </Button>
          <Button className="min-h-[44px]" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        {/* Image Grid — always visible */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Grid de Imagens ({stepImages.length} encontradas)
          </h4>
          {stepImages.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma imagem encontrada nos frames. Gere imagens primeiro.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {stepImages.map((img) => {
                const key = imageKey(img.stepId, img.elementIndex);
                const status = imageStatuses[key];
                const isRegenerating = regeneratingStep === key;
                const isUploading = uploadingStep === key;

                return (
                  <div
                    key={key}
                    className={`group relative rounded-lg border overflow-hidden bg-card transition-all ${
                      status === 'approved' ? 'border-green-400 ring-1 ring-green-200' :
                      status === 'rejected' ? 'border-destructive ring-1 ring-red-200 opacity-60' :
                      'border-border'
                    }`}
                  >
                    {/* Thumbnail */}
                    {img.src ? (
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-muted">
                        <Image className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-1.5 left-1.5">
                      {img.src ? statusBadge(status) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background/80">Sem imagem</Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-foreground truncate">
                        Passo {img.stepNumber}: {img.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate">{img.alt}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 px-2 pb-2">
                      {/* Approve */}
                      <button
                        className={`p-1 rounded transition-colors ${
                          status === 'approved' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-muted-foreground'
                        }`}
                        title="Aprovar"
                        onClick={() => handleToggleStatus(key, 'approved')}
                        disabled={!img.src}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Reject */}
                      <button
                        className={`p-1 rounded transition-colors ${
                          status === 'rejected' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-muted-foreground'
                        }`}
                        title="Rejeitar"
                        onClick={() => handleToggleStatus(key, 'rejected')}
                        disabled={!img.src}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Regenerate */}
                      <button
                        className="p-1 rounded hover:bg-primary/10 text-muted-foreground transition-colors disabled:opacity-40"
                        title="Regenerar"
                        onClick={() => handleRegenerateStep(img)}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      </button>

                      {/* Upload */}
                      <button
                        className="p-1 rounded hover:bg-primary/10 text-muted-foreground transition-colors disabled:opacity-40"
                        title="Upload manual"
                        onClick={() => fileInputRefs.current[key]?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[key] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(img, file);
                          e.target.value = '';
                        }}
                      />

                      {/* Remove */}
                      <button
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground transition-colors ml-auto"
                        title="Remover imagem"
                        onClick={() => handleRemoveImage(img)}
                        disabled={!img.src}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
