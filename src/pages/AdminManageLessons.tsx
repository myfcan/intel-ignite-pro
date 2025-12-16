import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, Filter, AlertTriangle, Bug, Wrench, FolderInput, Plus, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Lesson {
  id: string;
  title: string;
  trail_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  estimated_time: number;
  trails?: {
    title: string;
  };
}

interface Trail {
  id: string;
  title: string;
}

export default function AdminManageLessons() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Filtros
  const [filterTrail, setFilterTrail] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Estados para mover lição
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moving, setMoving] = useState(false);
  const [targetTrailId, setTargetTrailId] = useState<string>('');
  const [targetOrderIndex, setTargetOrderIndex] = useState<number>(1);
  const [createNewTrail, setCreateNewTrail] = useState(false);
  const [newTrailName, setNewTrailName] = useState('');
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Buscar trilhas
      const { data: trailsData } = await supabase
        .from('trails')
        .select('id, title')
        .order('title');

      if (trailsData) {
        setTrails(trailsData);
      }

      // Buscar lições com nome da trilha
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          trail_id,
          order_index,
          is_active,
          created_at,
          estimated_time,
          trails (
            title
          )
        `)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar lições:', error);
        toast({
          title: 'Erro ao carregar lições',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setLessons(lessonsData || []);
    } finally {
      setLoading(false);
    }
  }

  function toggleLesson(lessonId: string) {
    const newSelected = new Set(selectedLessons);
    if (newSelected.has(lessonId)) {
      newSelected.delete(lessonId);
    } else {
      newSelected.add(lessonId);
    }
    setSelectedLessons(newSelected);
  }

  function toggleAll() {
    if (selectedLessons.size === filteredLessons.length && filteredLessons.length > 0) {
      setSelectedLessons(new Set());
    } else {
      setSelectedLessons(new Set(filteredLessons.map(l => l.id)));
    }
  }

  function openDeleteModal() {
    if (selectedLessons.size === 0) {
      toast({
        title: 'Nenhuma lição selecionada',
        description: 'Selecione pelo menos uma lição para deletar',
        variant: 'destructive',
      });
      return;
    }
    setShowDeleteModal(true);
    setConfirmDelete(false);
  }

  async function handleDelete() {
    if (!confirmDelete) {
      toast({
        title: 'Confirmação necessária',
        description: 'Marque a caixa de confirmação para prosseguir',
        variant: 'destructive',
      });
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .in('id', Array.from(selectedLessons));

      if (error) {
        throw error;
      }

      toast({
        title: 'Lições deletadas com sucesso',
        description: `${selectedLessons.size} lição(ões) removida(s)`,
      });

      setSelectedLessons(new Set());
      setShowDeleteModal(false);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      toast({
        title: 'Erro ao deletar lições',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  }

  // Função para abrir modal de mover lição
  function openMoveModal() {
    if (selectedLessons.size !== 1) {
      toast({
        title: 'Selecione apenas uma lição',
        description: 'Para mover, selecione exatamente uma lição',
        variant: 'destructive',
      });
      return;
    }
    setTargetTrailId('');
    setTargetOrderIndex(1);
    setCreateNewTrail(false);
    setNewTrailName('');
    setShowMoveModal(true);
  }

  // Função para mover lição para trilha
  async function handleMoveLesson() {
    const lessonId = Array.from(selectedLessons)[0];
    
    if (!createNewTrail && !targetTrailId) {
      toast({
        title: 'Selecione uma trilha',
        description: 'Escolha uma trilha existente ou crie uma nova',
        variant: 'destructive',
      });
      return;
    }

    if (createNewTrail && !newTrailName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome da nova trilha',
        variant: 'destructive',
      });
      return;
    }

    setMoving(true);
    try {
      let finalTrailId = targetTrailId;

      // Criar nova trilha se necessário
      if (createNewTrail) {
        const maxOrderIndex = trails.length > 0 
          ? Math.max(...trails.map((_, i) => i + 1)) 
          : 0;

        const { data: newTrail, error: trailError } = await supabase
          .from('trails')
          .insert({
            title: newTrailName.trim(),
            order_index: maxOrderIndex + 1,
            is_active: true,
          })
          .select('id')
          .single();

        if (trailError) {
          throw trailError;
        }

        finalTrailId = newTrail.id;
        toast({
          title: 'Trilha criada',
          description: `Nova trilha "${newTrailName.trim()}" criada com sucesso`,
        });
      }

      // Atualizar a lição com nova trilha e ordem
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          trail_id: finalTrailId,
          order_index: targetOrderIndex,
        })
        .eq('id', lessonId);

      if (updateError) {
        throw updateError;
      }

      const lesson = lessons.find(l => l.id === lessonId);
      toast({
        title: 'Lição movida com sucesso',
        description: `"${lesson?.title}" agora está na posição ${targetOrderIndex}`,
      });

      setSelectedLessons(new Set());
      setShowMoveModal(false);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao mover lição:', error);
      toast({
        title: 'Erro ao mover lição',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setMoving(false);
    }
  }

  // Função para ativar/desativar lição
  async function handleToggleActive(lessonId: string, currentActive: boolean) {
    setActivating(lessonId);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_active: !currentActive })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: currentActive ? 'Lição desativada' : 'Lição ativada',
        description: currentActive ? 'A lição foi desativada com sucesso' : 'A lição está agora ativa e visível',
      });

      await loadData();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActivating(null);
    }
  }

  const filteredLessons = lessons.filter(lesson => {
    if (filterTrail !== 'all' && lesson.trail_id !== filterTrail) {
      return false;
    }
    if (filterStatus === 'draft' && lesson.is_active) {
      return false;
    }
    if (filterStatus === 'active' && !lesson.is_active) {
      return false;
    }
    return true;
  });

  const selectedLessonsData = lessons.filter(l => selectedLessons.has(l.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pipeline')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="w-8 h-8 text-destructive" />
              Gerenciar Lições
            </h1>
            <p className="text-muted-foreground">
              Visualize, filtre e delete lições existentes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/pipeline/fix-exercises')}
            className="flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Corrigir Exercícios
          </Button>
          {selectedLessons.size === 1 && (
            <Button variant="outline" onClick={openMoveModal} className="border-primary text-primary hover:bg-primary/10">
              <FolderInput className="w-4 h-4 mr-2" />
              Mover para Trilha
            </Button>
          )}
          {selectedLessons.size > 0 && (
            <Button variant="destructive" onClick={openDeleteModal}>
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar {selectedLessons.size} selecionada(s)
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Trilha</label>
              <Select value={filterTrail} onValueChange={setFilterTrail}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as trilhas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as trilhas</SelectItem>
                  {trails.map(trail => (
                    <SelectItem key={trail.id} value={trail.id}>
                      {trail.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">🟡 Draft (não publicadas)</SelectItem>
                  <SelectItem value="active">🟢 Ativas (publicadas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Lições */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lições Encontradas</CardTitle>
                <CardDescription>
                  {filteredLessons.length} lição(ões) • {selectedLessons.size} selecionada(s)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedLessons.size === filteredLessons.length && filteredLessons.length > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm">Selecionar todas</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando lições...
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma lição encontrada
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                      selectedLessons.has(lesson.id) ? 'bg-accent border-primary' : ''
                    }`}
                  >
                    <Checkbox
                      checked={selectedLessons.has(lesson.id)}
                      onCheckedChange={() => toggleLesson(lesson.id)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{lesson.title}</h3>
                        <Badge variant={lesson.is_active ? 'default' : 'secondary'}>
                          {lesson.is_active ? '🟢 Ativa' : '🟡 Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📚 {lesson.trails?.title || 'Sem trilha'}</span>
                        <span>📍 Ordem: {lesson.order_index}</span>
                        <span>⏱️ {lesson.estimated_time || 0} min</span>
                        <span>📅 {new Date(lesson.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant={lesson.is_active ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(lesson.id, lesson.is_active)}
                        disabled={activating === lesson.id}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {activating === lesson.id ? 'Aguarde...' : lesson.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/pipeline/lesson-debug/${lesson.id}`)}
                      >
                        <Bug className="w-4 h-4 mr-2" />
                        Debug
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Confirmação */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Você está prestes a deletar <strong>{selectedLessons.size} lição(ões)</strong>. Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 max-h-60 overflow-y-auto space-y-2">
              {selectedLessonsData.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-2 p-2 border rounded">
                  <Badge variant={lesson.is_active ? 'default' : 'secondary'}>
                    {lesson.is_active ? '🟢' : '🟡'}
                  </Badge>
                  <span className="text-sm">{lesson.title}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <Checkbox
                checked={confirmDelete}
                onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
              />
              <label className="text-sm font-medium cursor-pointer">
                Tenho certeza que quero deletar estas lições
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!confirmDelete || deleting}>
                {deleting ? 'Deletando...' : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Mover Lição */}
        <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-primary" />
                Mover Lição para Trilha
              </DialogTitle>
              <DialogDescription>
                Selecione a trilha de destino e defina a posição da lição
              </DialogDescription>
            </DialogHeader>

            {/* Info da lição selecionada */}
            {selectedLessons.size === 1 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Lição selecionada:</p>
                <p className="text-sm text-muted-foreground">
                  {lessons.find(l => l.id === Array.from(selectedLessons)[0])?.title}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Toggle criar nova trilha */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={createNewTrail}
                  onCheckedChange={(checked) => {
                    setCreateNewTrail(checked as boolean);
                    if (checked) setTargetTrailId('');
                  }}
                />
                <label className="text-sm font-medium cursor-pointer">
                  Criar nova trilha
                </label>
              </div>

              {/* Select trilha existente ou input nova trilha */}
              {createNewTrail ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome da nova trilha</label>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={newTrailName}
                      onChange={(e) => setNewTrailName(e.target.value)}
                      placeholder="Ex: Trilha Avançada de IA"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Trilha de destino</label>
                  <Select value={targetTrailId} onValueChange={setTargetTrailId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma trilha" />
                    </SelectTrigger>
                    <SelectContent>
                      {trails.map(trail => (
                        <SelectItem key={trail.id} value={trail.id}>
                          {trail.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Input ordem */}
              <div>
                <label className="text-sm font-medium mb-2 block">Posição na trilha (order_index)</label>
                <Input
                  type="number"
                  min={1}
                  value={targetOrderIndex}
                  onChange={(e) => setTargetOrderIndex(parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define a ordem de exibição da lição dentro da trilha
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveModal(false)} disabled={moving}>
                Cancelar
              </Button>
              <Button onClick={handleMoveLesson} disabled={moving}>
                {moving ? 'Movendo...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
