import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Anchor,
  Play,
  Pencil,
  Trash2,
  Plus,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import type { StepAnchor, AnchorType } from '@/types/v10.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminAnchorTimelineProps {
  stepId: string;
  stepNumber: number;
  stepTitle: string;
  audioUrl: string | null;
  duration: number;
}

interface EditingAnchor {
  id: string | null; // null = new anchor
  anchor_type: AnchorType;
  timestamp_seconds: number;
  match_phrase: string;
  label: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ANCHOR_ICONS: Record<AnchorType, string> = {
  pontos_atencao: '\u26A0\uFE0F',
  confirmacao: '\u2705',
  troca_frame: '\uD83D\uDCC4',
  troca_ferramenta: '\u2699\uFE0F',
};

const ANCHOR_LABELS: Record<AnchorType, string> = {
  pontos_atencao: 'Pontos de atenção',
  confirmacao: 'Confirmação',
  troca_frame: 'Troca de frame',
  troca_ferramenta: 'Troca de ferramenta',
};

const ANCHOR_COLORS: Record<AnchorType, string> = {
  pontos_atencao: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmacao: 'bg-green-100 text-green-800 border-green-200',
  troca_frame: 'bg-blue-100 text-blue-800 border-blue-200',
  troca_ferramenta: 'bg-purple-100 text-purple-800 border-purple-200',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminAnchorTimeline({
  stepId,
  stepNumber,
  stepTitle,
  audioUrl,
  duration,
}: AdminAnchorTimelineProps) {
  const [anchors, setAnchors] = useState<StepAnchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingAnchor | null>(null);
  const [saving, setSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Fetch anchors ─────────────────────────────────────────────────────────

  const fetchAnchors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('v10_lesson_step_anchors')
      .select('*')
      .eq('step_id', stepId)
      .order('timestamp_seconds', { ascending: true });

    if (error) {
      console.error('Error fetching anchors:', error);
      toast.error('Erro ao carregar anchors');
    }

    setAnchors((data as unknown as StepAnchor[]) || []);
    setLoading(false);
  }, [stepId]);

  useEffect(() => {
    fetchAnchors();
  }, [fetchAnchors]);

  // ── Play from timestamp ───────────────────────────────────────────────────

  const playFrom = useCallback((timestamp: number) => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    // Start 2 seconds before the anchor for context
    const startAt = Math.max(0, timestamp - 2);
    audio.currentTime = startAt;
    audio.play().catch(() => {});
  }, [audioUrl]);

  // ── Delete anchor ─────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (anchorId: string) => {
    const { error } = await (supabase as any)
      .from('v10_lesson_step_anchors')
      .delete()
      .eq('id', anchorId);

    if (error) {
      toast.error(`Erro ao remover anchor: ${error.message}`);
      return;
    }

    toast.success('Anchor removido');
    fetchAnchors();
  }, [fetchAnchors]);

  // ── Save anchor (edit or create) ──────────────────────────────────────────

  const handleSaveAnchor = useCallback(async () => {
    if (!editing) return;
    setSaving(true);

    try {
      if (editing.id) {
        // Update existing
        const { error } = await (supabase as any)
          .from('v10_lesson_step_anchors')
          .update({
            timestamp_seconds: editing.timestamp_seconds,
            match_phrase: editing.match_phrase,
            label: editing.label || null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Anchor atualizado');
      } else {
        // Create new
        const { error } = await supabase
          .from('v10_lesson_step_anchors')
          .insert({
            step_id: stepId,
            anchor_type: editing.anchor_type,
            timestamp_seconds: editing.timestamp_seconds,
            match_phrase: editing.match_phrase,
            label: editing.label || null,
          });

        if (error) throw error;
        toast.success('Anchor criado');
      }

      setEditing(null);
      fetchAnchors();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [editing, stepId, fetchAnchors]);

  // ── Format time ───────────────────────────────────────────────────────────

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando anchors...
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Anchor className="h-4 w-4 text-indigo-500" />
          Anchors — Passo {stepNumber}: {stepTitle}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {anchors.length} anchor{anchors.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline visualization */}
        {duration > 0 && anchors.length > 0 && (
          <div className="relative">
            {/* Track */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: '100%' }}
              />
            </div>
            {/* Anchor markers */}
            {anchors.map((anchor) => {
              const position = duration > 0
                ? (anchor.timestamp_seconds / duration) * 100
                : 0;
              return (
                <button
                  key={anchor.id}
                  type="button"
                  onClick={() => playFrom(anchor.timestamp_seconds)}
                  className="absolute -top-1 transform -translate-x-1/2 cursor-pointer"
                  style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
                  title={`${ANCHOR_LABELS[anchor.anchor_type]} — ${formatTime(anchor.timestamp_seconds)}`}
                >
                  <span className="text-base">{ANCHOR_ICONS[anchor.anchor_type]}</span>
                </button>
              );
            })}
            {/* Time labels */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* No anchors state */}
        {anchors.length === 0 && (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
            Nenhum anchor para este passo. Gere o áudio com tags [ANCHOR:*] no script.
          </div>
        )}

        {/* Anchor list */}
        {anchors.length > 0 && (
          <div className="space-y-2">
            {anchors.map((anchor, i) => (
              <div
                key={anchor.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${ANCHOR_COLORS[anchor.anchor_type]}`}
              >
                <span className="text-lg shrink-0">{ANCHOR_ICONS[anchor.anchor_type]}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{i + 1}.</span>
                    <span className="text-xs font-semibold">
                      {ANCHOR_LABELS[anchor.anchor_type]}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {formatTime(anchor.timestamp_seconds)}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 truncate mt-0.5">
                    &ldquo;{anchor.match_phrase}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => playFrom(anchor.timestamp_seconds)}
                      title="Ouvir"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditing({
                      id: anchor.id,
                      anchor_type: anchor.anchor_type,
                      timestamp_seconds: anchor.timestamp_seconds,
                      match_phrase: anchor.match_phrase,
                      label: anchor.label || '',
                    })}
                    title="Ajustar"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(anchor.id)}
                    title="Remover"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Create modal inline */}
        {editing && (
          <div className="rounded-lg border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {editing.id ? 'Editar Anchor' : 'Novo Anchor'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setEditing(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!editing.id && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={editing.anchor_type}
                  onChange={(e) => setEditing({ ...editing, anchor_type: e.target.value as AnchorType })}
                >
                  <option value="pontos_atencao">Pontos de atenção</option>
                  <option value="confirmacao">Confirmação</option>
                  <option value="troca_frame">Troca de frame</option>
                  <option value="troca_ferramenta">Troca de ferramenta</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Timestamp (segundos)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={editing.timestamp_seconds}
                onChange={(e) => setEditing({ ...editing, timestamp_seconds: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Frase de match
              </label>
              <Input
                value={editing.match_phrase}
                onChange={(e) => setEditing({ ...editing, match_phrase: e.target.value })}
                placeholder="Primeiras palavras após o anchor..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Label (opcional)
              </label>
              <Input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Descrição legível..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveAnchor}
                disabled={saving || !editing.match_phrase}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                Salvar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Add manual anchor button */}
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing({
              id: null,
              anchor_type: 'confirmacao',
              timestamp_seconds: 0,
              match_phrase: '',
              label: '',
            })}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar anchor manual
          </Button>
        )}

        {/* Hidden audio for preview */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} preload="none" />
        )}
      </CardContent>
    </Card>
  );
}
