import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Filter, AlertTriangle, Bug, Wrench } from 'lucide-react';
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
        .order('created_at', { ascending: false });

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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/pipeline/lesson-debug/${lesson.id}`)}
                      className="flex-shrink-0"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Debug
                    </Button>
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
      </div>
    </div>
  );
}
