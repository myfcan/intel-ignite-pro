import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Eye, Rocket, RefreshCw, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { V10BpaPipeline } from '@/types/v10.types';
import { CreateBpaModal } from '@/components/admin/v10/CreateBpaModal';

// ============================================================
// Types locais (pipeline admin)
// ============================================================
interface BpaPipeline {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'in_progress' | 'ready' | 'published';
  current_stage: number;
  score_total: number | null;
  score_semaphore: 'green' | 'yellow' | 'red' | null;
  steps_generated: number | null;
  steps_audited: number | null;
  audit_passed: boolean | null;
  images_needed: number | null;
  images_generated: number | null;
  images_approved: number | null;
  mockups_total: number | null;
  mockups_from_refero: number | null;
  mockups_approved: number | null;
  audios_total: number | null;
  audios_generated: number | null;
  audios_approved: number | null;
  assembly_passed: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  lesson_id: string | null;
}

// ============================================================
// Constantes do pipeline
// ============================================================
const STAGES = [
  { num: 1, label: 'Score', icon: '📊' },
  { num: 2, label: 'Estrutura', icon: '📝' },
  { num: 3, label: 'Imagens', icon: '🖼️' },
  { num: 4, label: 'Mockups', icon: '📸' },
  { num: 5, label: 'Narração', icon: '🎙️' },
  { num: 6, label: 'Montagem', icon: '🔧' },
  { num: 7, label: 'Publicar', icon: '🚀' },
];

function getStageStatus(pipeline: BpaPipeline, stageNum: number): 'idle' | 'active' | 'partial' | 'complete' | 'error' {
  if (stageNum > pipeline.current_stage) return 'idle';
  if (stageNum < pipeline.current_stage) {
    return 'complete';
  }
  switch (stageNum) {
    case 1:
      if (pipeline.score_semaphore === 'red') return 'error';
      if (pipeline.score_total && pipeline.score_total > 0) return 'complete';
      return 'active';
    case 2:
      if (pipeline.audit_passed) return 'complete';
      if (pipeline.steps_generated && pipeline.steps_generated > 0) return 'partial';
      return 'active';
    case 3:
      if (pipeline.images_approved === pipeline.images_needed && pipeline.images_needed && pipeline.images_needed > 0) return 'complete';
      if (pipeline.images_generated && pipeline.images_generated > 0) return 'partial';
      return 'active';
    case 4:
      if (pipeline.mockups_approved === pipeline.mockups_total && pipeline.mockups_total && pipeline.mockups_total > 0) return 'complete';
      if (pipeline.mockups_from_refero && pipeline.mockups_from_refero > 0) return 'partial';
      return 'active';
    case 5:
      if (pipeline.audios_generated === pipeline.audios_total && pipeline.audios_total && pipeline.audios_total > 0) return 'complete';
      if (pipeline.audios_generated && pipeline.audios_generated > 0) return 'partial';
      return 'active';
    case 6:
      if (pipeline.assembly_passed) return 'complete';
      return 'active';
    case 7:
      if (pipeline.published_at) return 'complete';
      return 'active';
    default:
      return 'idle';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'idle': return '⚪';
    case 'active': return '🔵';
    case 'partial': return '🟡';
    case 'complete': return '✅';
    case 'error': return '🔴';
    default: return '⚪';
  }
}

function getStageDetail(pipeline: BpaPipeline, stageNum: number): string {
  switch (stageNum) {
    case 1: return pipeline.score_total ? `${pipeline.score_total}/100` : '—';
    case 2: return pipeline.steps_generated ? `${pipeline.steps_audited || 0}/${pipeline.steps_generated}` : '—';
    case 3: return pipeline.images_needed ? `${pipeline.images_approved || 0}/${pipeline.images_needed}` : '—';
    case 4: return pipeline.mockups_total ? `${pipeline.mockups_approved || 0}/${pipeline.mockups_total}` : '—';
    case 5: return pipeline.audios_total ? `${pipeline.audios_generated || 0}/${pipeline.audios_total}` : '—';
    case 6: return pipeline.assembly_passed ? '✅' : '—';
    case 7: return pipeline.published_at ? '✅' : '—';
    default: return '—';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-600';
    case 'in_progress': return 'bg-blue-100 text-blue-700';
    case 'ready': return 'bg-yellow-100 text-yellow-700';
    case 'published': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Rascunho';
    case 'in_progress': return 'Em produção';
    case 'ready': return 'Pronto';
    case 'published': return 'Publicado';
    default: return status;
  }
}

// ============================================================
// Componente: Card de BPA individual
// ============================================================
function BpaCard({ pipeline, onRefresh }: { pipeline: BpaPipeline; onRefresh: () => void }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDeletePipeline = async () => {
    const confirmed = window.confirm(
      `⚠️ Excluir pipeline "${pipeline.title}"?\n\n` +
      'Isso vai excluir permanentemente:\n' +
      '• O pipeline e todo o log de atividades\n' +
      (pipeline.lesson_id
        ? '• A aula vinculada e todos os dados (passos, narrações, áudios, slides)\n'
        : '') +
      '\nEssa ação NÃO pode ser desfeita.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      if (pipeline.lesson_id) {
        // Cascade delete lesson data
        const { data: stepIds } = await supabase
          .from('v10_lesson_steps')
          .select('id')
          .eq('lesson_id', pipeline.lesson_id);

        if (stepIds && stepIds.length > 0) {
          const ids = stepIds.map((s: { id: string }) => s.id);
          await supabase.from('v10_lesson_step_anchors').delete().in('step_id', ids);
        }

        await supabase.from('v10_lesson_steps').delete().eq('lesson_id', pipeline.lesson_id);
        await supabase.from('v10_lesson_intro_slides').delete().eq('lesson_id', pipeline.lesson_id);
        await supabase.from('v10_lesson_narrations').delete().eq('lesson_id', pipeline.lesson_id);
        await supabase.from('v10_lessons').delete().eq('id', pipeline.lesson_id);
      }

      // Delete pipeline log
      await supabase.from('v10_bpa_pipeline_log').delete().eq('pipeline_id', pipeline.id);

      // Delete pipeline
      const { error } = await supabase.from('v10_bpa_pipeline').delete().eq('id', pipeline.id);
      if (error) throw error;

      toast.success(`Pipeline "${pipeline.title}" excluído.`);
      onRefresh();
    } catch (err) {
      toast.error(`Erro ao excluir: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{pipeline.title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(pipeline.status)}`}>
              {getStatusLabel(pipeline.status)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDeletePipeline}
              disabled={deleting}
              title="Excluir pipeline"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Slug: {pipeline.slug} | Criado: {new Date(pipeline.created_at).toLocaleDateString('pt-BR')}
        </p>
      </CardHeader>
      <CardContent>
        {/* 7 Etapas do Pipeline */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {STAGES.map((stage) => {
            const status = getStageStatus(pipeline, stage.num);
            const detail = getStageDetail(pipeline, stage.num);
            return (
              <div
                key={stage.num}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                title={`Etapa ${stage.num}: ${stage.label}`}
              >
                <span className="text-xs font-bold text-gray-400">{stage.num}</span>
                <span className="text-lg">{stage.icon}</span>
                <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{stage.label}</span>
                <span className="text-[9px] font-mono">{getStatusIcon(status)} {detail}</span>
              </div>
            );
          })}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={() => navigate(`/admin/v10/${pipeline.id}`)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Abrir pipeline
          </Button>
          {pipeline.lesson_id && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => navigate(`/v10/${pipeline.slug}`)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          )}
          {pipeline.status === 'ready' && (
            <Button
              size="sm"
              className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
              onClick={() => navigate(`/admin/v10/${pipeline.id}`)}
            >
              <Rocket className="w-4 h-4 mr-1" />
              Publicar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Página Principal: Admin V10 Pipeline
// ============================================================
export default function AdminV10Pipeline() {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<BpaPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('v10_bpa_pipeline')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPipelines((data as unknown as BpaPipeline[]) || []);
    } catch (err) {
      console.error('Failed to fetch V10 pipelines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleBpaCreated = (pipeline: V10BpaPipeline) => {
    navigate(`/admin/v10/${pipeline.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900">V10 — Pipeline de Produção</h1>
            <p className="text-sm text-gray-500">Gerencie BPAs: da ideia à publicação em 7 etapas</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={fetchPipelines}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo BPA
          </Button>
        </div>

        {/* Pipeline Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-3 bg-white rounded-lg border text-xs">
          <span>⚪ Não iniciado</span>
          <span>🔵 Em andamento</span>
          <span>🟡 Parcial</span>
          <span>✅ Completo</span>
          <span>🔴 Bloqueado</span>
        </div>

        {/* Pipelines List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : pipelines.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhum BPA criado ainda</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Clique em "Novo BPA" para iniciar o pipeline de produção de uma aula V10.
                A primeira etapa é a análise de viabilidade (Score).
              </p>
              <Button
                className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar primeiro BPA
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <BpaCard
                key={pipeline.id}
                pipeline={pipeline}
                onRefresh={fetchPipelines}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h3 className="font-bold text-sm text-gray-700 mb-2">Pipeline V10 — 7 Etapas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
            <div>1. <b>Score</b> — Análise de viabilidade (5 variáveis + semáforo)</div>
            <div>2. <b>Estrutura</b> — Geração de passos + auditoria do contrato</div>
            <div>3. <b>Imagens</b> — Ilustrações para slides e passos</div>
            <div>4. <b>Mockups</b> — Screenshots via Refero + mockups IA</div>
            <div>5. <b>Narração</b> — Scripts + áudio ElevenLabs</div>
            <div>6. <b>Montagem</b> — Checklist automático (11 itens)</div>
            <div>7. <b>Publicar</b> — Preview completo + 1 clique</div>
          </div>
        </div>
      </div>

      {/* Create BPA Modal */}
      <CreateBpaModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleBpaCreated}
      />
    </div>
  );
}
