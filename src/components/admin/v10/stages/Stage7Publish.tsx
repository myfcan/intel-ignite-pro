import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Ban,
  PartyPopper,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { V10BpaPipeline } from '@/types/v10.types';

interface Stage7PublishProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SemaphoreBadge({ semaphore }: { semaphore: V10BpaPipeline['score_semaphore'] }) {
  const colors: Record<V10BpaPipeline['score_semaphore'], string> = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colors[semaphore]}`}>
      {semaphore}
    </span>
  );
}

export function Stage7Publish({ pipeline, onUpdate }: Stage7PublishProps) {
  const [approving, setApproving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  const isPublished = pipeline.status === 'published';
  const isReady = pipeline.status === 'ready';
  const canPublish = pipeline.assembly_passed === true;

  async function handlePreview() {
    window.open(`/v10/${pipeline.slug}`, '_blank');
    await onUpdate({
      preview_at: new Date().toISOString(),
    } as Partial<V10BpaPipeline>);
  }

  async function handleApprove() {
    if (!window.confirm('Confirma aprovação para publicação?')) return;

    setApproving(true);
    try {
      await onUpdate({
        approved_at: new Date().toISOString(),
        approved_by: 'fernando',
        status: 'ready',
      } as Partial<V10BpaPipeline>);
      toast.success('Pipeline aprovado para publicação');
    } catch {
      toast.error('Erro ao aprovar pipeline');
    } finally {
      setApproving(false);
    }
  }

  async function handlePublish() {
    if (!pipeline.lesson_id) {
      toast.error('Pipeline não tem aula vinculada');
      return;
    }

    if (!window.confirm('Confirma a publicação da aula? Esta ação tornará a aula visível para os alunos.')) return;

    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-publish-lesson', {
        body: { pipeline_id: pipeline.id, action: 'publish' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await onUpdate({
        published_at: data.published_at,
        status: 'published',
      } as Partial<V10BpaPipeline>);

      toast.success('Aula publicada com sucesso! 🎉🎊');
    } catch (err) {
      toast.error(`Erro ao publicar: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!pipeline.lesson_id) {
      toast.error('Pipeline não tem aula vinculada');
      return;
    }

    if (!window.confirm('Confirma a despublicação? A aula ficará indisponível para os alunos.')) return;

    setUnpublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-publish-lesson', {
        body: { pipeline_id: pipeline.id, action: 'unpublish' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await onUpdate({
        published_at: null,
        status: 'ready',
      } as Partial<V10BpaPipeline>);

      toast.success('Aula despublicada');
    } catch (err) {
      toast.error(`Erro ao despublicar: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setUnpublishing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Etapa 7 — Publicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre-flight summary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-lg font-semibold">
              {pipeline.score_total}/100{' '}
              <SemaphoreBadge semaphore={pipeline.score_semaphore} />
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Steps</p>
            <p className="text-lg font-semibold">{pipeline.steps_generated} passos</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Images</p>
            <p className="text-lg font-semibold">
              {pipeline.images_approved}/{pipeline.images_needed} aprovadas
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Mockups</p>
            <p className="text-lg font-semibold">
              {pipeline.mockups_approved}/{pipeline.mockups_total} aprovados
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Áudios</p>
            <p className="text-lg font-semibold">
              {pipeline.audios_generated}/{pipeline.audios_total} gerados
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Montagem</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              {pipeline.assembly_passed ? (
                <><CheckCircle2 className="h-5 w-5 text-green-500" /> Aprovada</>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" /> Pendente</>
              )}
            </p>
          </div>
        </div>

        {/* Assembly warning */}
        {!canPublish && !isPublished && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              A montagem precisa ser aprovada antes de publicar
            </p>
          </div>
        )}

        {/* Published notice */}
        {isPublished && pipeline.published_at && (
          <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
            <PartyPopper className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Aula publicada em {formatDate(pipeline.published_at)}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="min-h-[44px]"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          {!isPublished && !isReady && (
            <Button
              onClick={handleApprove}
              disabled={!canPublish || approving}
              className="min-h-[44px]"
            >
              {approving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Aprovar para Publicação
            </Button>
          )}

          {isReady && (
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="min-h-[44px] bg-green-600 hover:bg-green-700"
            >
              {publishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Publicar Aula
            </Button>
          )}

          {isPublished && (
            <Button
              variant="destructive"
              onClick={handleUnpublish}
              disabled={unpublishing}
              className="min-h-[44px]"
            >
              {unpublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Despublicar
            </Button>
          )}
        </div>

        {/* Publication timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Timeline de Publicação</h4>
          <div className="relative space-y-4 pl-6">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-border" />

            <TimelineItem
              label="Preview"
              date={pipeline.preview_at}
              active={pipeline.preview_at != null}
            />
            <TimelineItem
              label="Aprovação"
              date={pipeline.approved_at}
              active={pipeline.approved_at != null}
            />
            <TimelineItem
              label="Publicação"
              date={pipeline.published_at}
              active={pipeline.published_at != null}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ label, date, active }: { label: string; date: string | null; active: boolean }) {
  return (
    <div className="relative flex items-center gap-3">
      <div
        className={`absolute -left-6 h-4 w-4 rounded-full border-2 ${
          active ? 'border-green-500 bg-green-500' : 'border-muted-foreground/30 bg-background'
        }`}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
      </div>
    </div>
  );
}
