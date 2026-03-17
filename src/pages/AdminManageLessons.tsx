import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, AlertTriangle, Bug, Wrench, FolderInput, Plus, Power, ChevronDown, ChevronRight, BookOpen, Layers, GraduationCap, Play } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Lesson {
  id: string;
  title: string;
  trail_id: string | null;
  course_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  estimated_time: number;
  model: string | null;
}

interface V10Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  trail_id: string | null;
  course_id: string | null;
  order_in_trail: number;
  total_steps: number;
  estimated_minutes: number;
  tools: string[];
  badge_icon: string | null;
  status: string;
  created_at: string;
}

interface Course {
  id: string;
  trail_id: string | null;
  title: string;
  order_index: number;
  is_active: boolean;
}

interface Trail {
  id: string;
  title: string;
  order_index: number;
  trail_type: string | null;
  is_active: boolean;
}

export default function AdminManageLessons() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [v10Lessons, setV10Lessons] = useState<V10Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  // Expanded state for trails and courses
  const [expandedTrails, setExpandedTrails] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Move modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moving, setMoving] = useState(false);
  const [targetTrailId, setTargetTrailId] = useState<string>('');
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [targetOrderIndex, setTargetOrderIndex] = useState<number>(1);

  // Create course modal
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTrailId, setNewCourseTrailId] = useState<string>('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseIcon, setNewCourseIcon] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // V10 Move modal
  const [showV10MoveModal, setShowV10MoveModal] = useState(false);
  const [v10MoveTarget, setV10MoveTarget] = useState<string>('');
  const [v10TargetTrailId, setV10TargetTrailId] = useState<string>('');
  const [v10TargetCourseId, setV10TargetCourseId] = useState<string>('');
  const [v10TargetOrder, setV10TargetOrder] = useState<number>(0);
  const [movingV10, setMovingV10] = useState(false);

  // Move course (jornada) modal
  const [showMoveCourseModal, setShowMoveCourseModal] = useState(false);
  const [moveCourseTarget, setMoveCourseTarget] = useState<string>('');
  const [moveCourseTrailId, setMoveCourseTrailId] = useState<string>('');
  const [movingCourse, setMovingCourse] = useState(false);

  // Create trail inline
  const [createNewTrail, setCreateNewTrail] = useState(false);
  const [newTrailTitle, setNewTrailTitle] = useState('');
  const [newTrailIcon, setNewTrailIcon] = useState('');
  const [newTrailType, setNewTrailType] = useState<'v7' | 'v8' | 'v10'>('v8');
  const [showCreateTrailModal, setShowCreateTrailModal] = useState(false);
  const [soloTrailTitle, setSoloTrailTitle] = useState('');
  const [soloTrailIcon, setSoloTrailIcon] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [trailsRes, coursesRes, lessonsRes, v10Res] = await Promise.all([
        supabase.from('trails').select('id, title, order_index, trail_type, is_active').eq('is_active', true).order('order_index'),
        supabase.from('courses').select('id, trail_id, title, order_index, is_active').order('order_index'),
        supabase.from('lessons').select('id, title, trail_id, course_id, order_index, is_active, created_at, estimated_time, model').order('order_index'),
        supabase.from('v10_lessons').select('id, slug, title, description, trail_id, course_id, order_in_trail, total_steps, estimated_minutes, tools, badge_icon, status, created_at').order('order_in_trail'),
      ]);

      if (trailsRes.data) setTrails(trailsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (lessonsRes.data) setLessons(lessonsRes.data);
      if (v10Res.data) setV10Lessons(v10Res.data);
    } finally {
      setLoading(false);
    }
  }

  // Build hierarchy
  const hierarchy = useMemo(() => {
    const activeTrailIds = new Set(trails.map(t => t.id));

    const trailMap = trails.map(trail => {
      const trailCourses = courses
        .filter(c => c.trail_id === trail.id)
        .map(course => ({
          ...course,
          lessons: lessons.filter(l => l.course_id === course.id).sort((a, b) => a.order_index - b.order_index),
          v10Lessons: v10Lessons.filter(l => l.course_id === course.id).sort((a, b) => a.order_in_trail - b.order_in_trail),
        }));

      const orphanedLessons = lessons.filter(l => l.trail_id === trail.id && !l.course_id);
      const trailV10Lessons = v10Lessons.filter(l => l.trail_id === trail.id && !l.course_id);

      return { ...trail, courses: trailCourses, orphanedLessons, v10Lessons: trailV10Lessons };
    });

    // Orphaned courses: trail_id is NULL or points to an inactive trail
    const orphanedCourses = courses.filter(c => !c.trail_id || !activeTrailIds.has(c.trail_id));

    // Fully orphaned lessons: no trail_id OR trail_id points to inactive trail (and no course_id in active)
    const fullyOrphaned = lessons.filter(l => {
      if (!l.trail_id) return true;
      if (!activeTrailIds.has(l.trail_id) && !l.course_id) return true;
      return false;
    });

    // V10 orphaned: no trail_id or trail points to inactive
    const v10Orphaned = v10Lessons.filter(l => {
      if (!l.trail_id && !l.course_id) return true;
      if (l.trail_id && !activeTrailIds.has(l.trail_id) && !l.course_id) return true;
      return false;
    });

    return { trails: trailMap, orphanedCourses, fullyOrphaned, v10Orphaned };
  }, [trails, courses, lessons, v10Lessons]);

  function toggleLesson(id: string) {
    const s = new Set(selectedLessons);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedLessons(s);
  }

  function openDeleteModal() {
    if (selectedLessons.size === 0) {
      toast({ title: 'Nenhuma lição selecionada', variant: 'destructive' });
      return;
    }
    setShowDeleteModal(true);
    setConfirmDelete(false);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('lessons').delete().in('id', Array.from(selectedLessons));
      if (error) throw error;
      toast({ title: `${selectedLessons.size} lição(ões) deletada(s)` });
      setSelectedLessons(new Set());
      setShowDeleteModal(false);
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(lessonId: string, currentActive: boolean) {
    setActivating(lessonId);
    try {
      const { error } = await supabase.from('lessons').update({ is_active: !currentActive }).eq('id', lessonId);
      if (error) throw error;
      toast({ title: currentActive ? 'Lição desativada' : 'Lição ativada' });
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActivating(null);
    }
  }

  // Move lesson
  function openMoveModal() {
    if (selectedLessons.size !== 1) {
      toast({ title: 'Selecione exatamente uma lição para mover', variant: 'destructive' });
      return;
    }
    setTargetTrailId('');
    setTargetCourseId('');
    setTargetOrderIndex(1);
    setShowMoveModal(true);
  }

  const coursesForSelectedTrail = useMemo(() => {
    if (!targetTrailId) return [];
    return courses.filter(c => c.trail_id === targetTrailId);
  }, [targetTrailId, courses]);

  async function handleMoveLesson() {
    const lessonId = Array.from(selectedLessons)[0];

    if (!targetTrailId) {
      toast({ title: 'Selecione uma trilha', variant: 'destructive' });
      return;
    }

    // Both V7 and V8 require course (jornada)
    if (coursesForSelectedTrail.length === 0) {
      toast({
        title: '⚠️ Trilha sem Jornada',
        description: 'Esta trilha não possui jornadas (cursos). Crie uma jornada primeiro para poder mover aulas.',
        variant: 'destructive',
      });
      return;
    }

    if (!targetCourseId) {
      toast({ title: 'Selecione uma jornada', variant: 'destructive' });
      return;
    }

    setMoving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          trail_id: targetTrailId,
          course_id: targetCourseId,
          order_index: targetOrderIndex,
        })
        .eq('id', lessonId);

      if (error) throw error;

      const lesson = lessons.find(l => l.id === lessonId);
      toast({ title: 'Lição movida', description: `"${lesson?.title}" → posição ${targetOrderIndex}` });
      setSelectedLessons(new Set());
      setShowMoveModal(false);
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro ao mover', description: error.message, variant: 'destructive' });
    } finally {
      setMoving(false);
    }
  }

  // Move V10 lesson
  async function handleMoveV10Lesson() {
    if (!v10MoveTarget || !v10TargetTrailId) {
      toast({ title: 'Selecione uma trilha', variant: 'destructive' });
      return;
    }
    setMovingV10(true);
    try {
      const updatePayload: Record<string, unknown> = {
        trail_id: v10TargetTrailId,
        order_in_trail: v10TargetOrder,
        course_id: v10TargetCourseId || null,
      };
      const { error } = await (supabase as any)
        .from('v10_lessons')
        .update(updatePayload)
        .eq('id', v10MoveTarget);
      if (error) throw error;
      const lesson = v10Lessons.find(l => l.id === v10MoveTarget);
      toast({ title: 'Aula V10 movida', description: `"${lesson?.title}" atribuída à jornada` });
      setShowV10MoveModal(false);
      setV10MoveTarget('');
      setV10TargetCourseId('');
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro ao mover V10', description: error.message, variant: 'destructive' });
    } finally {
      setMovingV10(false);
    }
  }

  // Move course (jornada) to a trail
  async function handleMoveCourse() {
    if (!moveCourseTarget || !moveCourseTrailId) {
      toast({ title: 'Selecione uma trilha', variant: 'destructive' });
      return;
    }
    setMovingCourse(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ trail_id: moveCourseTrailId })
        .eq('id', moveCourseTarget);
      if (error) throw error;
      const course = courses.find(c => c.id === moveCourseTarget);
      toast({ title: 'Jornada movida', description: `"${course?.title}" vinculada à trilha` });
      setShowMoveCourseModal(false);
      setMoveCourseTarget('');
      setMoveCourseTrailId('');
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro ao mover jornada', description: error.message, variant: 'destructive' });
    } finally {
      setMovingCourse(false);
    }
  }

  async function handleCreateCourse() {
    let trailId = newCourseTrailId;

    // If creating a new trail first
    if (createNewTrail) {
      if (!newTrailTitle.trim()) {
        toast({ title: 'Nome da trilha obrigatório', variant: 'destructive' });
        return;
      }
    } else {
      if (!trailId) {
        toast({ title: 'Selecione uma trilha', variant: 'destructive' });
        return;
      }
    }

    // All trail types support courses/jornadas
    const effectiveIsV8 = true; // Legacy — all trails now treated uniformly

    if (!effectiveIsV8 && !newCourseTitle.trim()) {
      toast({ title: 'Nome da jornada obrigatório', variant: 'destructive' });
      return;
    }

    setCreatingCourse(true);
    try {
      // Create trail if needed
      if (createNewTrail) {
        const maxOrder = trails.length > 0 ? Math.max(...trails.map(t => t.order_index)) + 1 : 1;
        const { data: newTrail, error: trailError } = await supabase.from('trails').insert({
          title: newTrailTitle.trim(),
          icon: newTrailIcon.trim() || null,
          order_index: maxOrder,
          is_active: true,
          trail_type: newTrailType,
        }).select('id').single();
        if (trailError) throw trailError;
        trailId = newTrail.id;
        toast({ title: 'Trilha criada', description: `"${newTrailTitle.trim()}"` });
      }

      // Both V7 and V8: create course/jornada
      if (effectiveIsV8 && !newCourseTitle.trim()) {
        // V8 trail created without a course title — just create trail
        toast({ title: 'Trilha V8 pronta', description: 'Crie jornadas para organizar as aulas.' });
      } else {
        const existingCourses = courses.filter(c => c.trail_id === trailId);
        const nextOrder = existingCourses.length > 0
          ? Math.max(...existingCourses.map(c => c.order_index)) + 1
          : 1;

        const { error } = await supabase.from('courses').insert({
          trail_id: trailId,
          title: newCourseTitle.trim(),
          icon: newCourseIcon.trim() || null,
          order_index: nextOrder,
          is_active: true,
        });

        if (error) throw error;

        toast({ title: 'Jornada criada', description: `"${newCourseTitle.trim()}"` });
      }
      setShowCreateCourseModal(false);
      setNewCourseTitle('');
      setNewCourseIcon('');
      setNewCourseTrailId('');
      setCreateNewTrail(false);
      setNewTrailTitle('');
      setNewTrailIcon('');
      setNewTrailType('v7');
      await loadData();
    } catch (error: any) {
      toast({ title: 'Erro ao criar jornada', description: error.message, variant: 'destructive' });
    } finally {
      setCreatingCourse(false);
    }
  }

  function toggleTrail(id: string) {
    const s = new Set(expandedTrails);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedTrails(s);
  }

  function toggleCourse(id: string) {
    const s = new Set(expandedCourses);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedCourses(s);
  }

  const selectedLessonsData = lessons.filter(l => selectedLessons.has(l.id));

  // V10 Lesson row component
  function V10LessonRow({ lesson }: { lesson: V10Lesson }) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-medium text-sm truncate">{lesson.badge_icon} {lesson.title}</h4>
            <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'} className="text-xs">
              {lesson.status === 'published' ? '🟢 Publicada' : '🟡 Draft'}
            </Badge>
            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">v10</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>📍 Pos: {lesson.order_in_trail}</span>
            <span>⏱️ {lesson.estimated_minutes}min</span>
            <span>📝 {lesson.total_steps} passos</span>
            <span>📅 {new Date(lesson.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => {
            setV10MoveTarget(lesson.id);
            setV10TargetTrailId(lesson.trail_id || '');
            setV10TargetOrder(lesson.order_in_trail);
            setShowV10MoveModal(true);
          }}>
            <FolderInput className="w-3 h-3 mr-1" />
            Mover
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/v10/${lesson.slug}`)}>
            <Play className="w-3 h-3 mr-1" />
            Assistir
          </Button>
        </div>
      </div>
    );
  }

  // Lesson row component
  function LessonRow({ lesson }: { lesson: Lesson }) {
    return (
      <div
        className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors ${
          selectedLessons.has(lesson.id) ? 'bg-accent border-primary' : ''
        }`}
      >
        <Checkbox checked={selectedLessons.has(lesson.id)} onCheckedChange={() => toggleLesson(lesson.id)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
            <Badge variant={lesson.is_active ? 'default' : 'secondary'} className="text-xs">
              {lesson.is_active ? '🟢 Ativa' : '🟡 Draft'}
            </Badge>
            {lesson.model && <Badge variant="outline" className="text-xs">{lesson.model}</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>📍 Pos: {lesson.order_index}</span>
            <span>⏱️ {lesson.estimated_time || 0}min</span>
            <span>📅 {new Date(lesson.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant={lesson.is_active ? 'secondary' : 'default'}
            size="sm"
            onClick={() => handleToggleActive(lesson.id, lesson.is_active)}
            disabled={activating === lesson.id}
          >
            <Power className="w-3 h-3 mr-1" />
            {activating === lesson.id ? '...' : lesson.is_active ? 'Off' : 'On'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedLessons(new Set([lesson.id]));
            setTargetTrailId('');
            setTargetCourseId('');
            setTargetOrderIndex(lesson.order_index);
            setShowMoveModal(true);
          }}>
            <FolderInput className="w-3 h-3 mr-1" />
            Mover
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(lesson.model === 'v8' ? `/v8/${lesson.id}` : `/admin/v7/play/${lesson.id}`)}>
            <Play className="w-3 h-3 mr-1" />
            Assistir
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/pipeline/lesson-debug/${lesson.id}`)}>
            <Bug className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pipeline')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layers className="w-8 h-8 text-primary" />
              Gerenciar Lições
            </h1>
            <p className="text-muted-foreground text-sm">
              Trilhas → Jornadas → Aulas • Hierarquia completa (V7 + V8 + V10)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/pipeline/fix-exercises')}>
              <Wrench className="w-4 h-4 mr-1" />
              Corrigir Exercícios
            </Button>
            <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => setShowCreateTrailModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nova Trilha
            </Button>
            <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => setShowCreateCourseModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nova Jornada
            </Button>
            {selectedLessons.size === 1 && (
              <Button variant="outline" size="sm" className="border-primary text-primary" onClick={openMoveModal}>
                <FolderInput className="w-4 h-4 mr-1" />
                Mover
              </Button>
            )}
            {selectedLessons.size > 0 && (
              <Button variant="destructive" size="sm" onClick={openDeleteModal}>
                <Trash2 className="w-4 h-4 mr-1" />
                Deletar ({selectedLessons.size})
              </Button>
            )}
          </div>
        </div>

        {/* Hierarchy Tree */}
        {loading ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando...</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {hierarchy.trails.map(trail => (
              <Card key={trail.id} className="overflow-hidden">
                <Collapsible open={expandedTrails.has(trail.id)} onOpenChange={() => toggleTrail(trail.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors py-3 px-4">
                      <div className="flex items-center gap-3">
                        {expandedTrails.has(trail.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         <GraduationCap className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {trail.title}
                            {trail.trail_type && <Badge variant="outline" className="text-xs">{trail.trail_type}</Badge>}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {trail.courses.length} jornada(s) • {trail.courses.reduce((acc, c) => acc + c.lessons.length, 0) + trail.v10Lessons.length} aula(s)
                            {trail.v10Lessons.length > 0 && (
                              <span className="text-emerald-500 ml-2">🟢 {trail.v10Lessons.length} V10</span>
                            )}
                            {trail.orphanedLessons.length > 0 && (
                              <span className="text-amber-500 ml-2">⚠️ {trail.orphanedLessons.length} aula(s) sem jornada</span>
                            )}
                          </CardDescription>
                        </div>
                        {trail.courses.length === 0 && (
                          <Badge variant="outline" className="border-amber-400 text-amber-600 text-xs">
                            Sem jornadas
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                   <CollapsibleContent>
                    <CardContent className="pt-0 pb-3 px-4 space-y-3">
                      {/* Courses (Jornadas) inside trail — same for V7 and V8 */}
                      {trail.courses.length === 0 && (
                        <div className="p-4 border border-dashed border-amber-300 rounded-lg bg-amber-50/50 text-center">
                          <p className="text-sm text-amber-700 mb-2">
                            ⚠️ Esta trilha não possui jornadas. Crie uma jornada para organizar as aulas.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-400"
                            onClick={() => {
                              setNewCourseTrailId(trail.id);
                              setShowCreateCourseModal(true);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Criar Jornada
                          </Button>
                        </div>
                      )}

                      {trail.courses.map(course => (
                        <Collapsible key={course.id} open={expandedCourses.has(course.id)} onOpenChange={() => toggleCourse(course.id)}>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer ml-4">
                              {expandedCourses.has(course.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-sm flex-1">{course.title}</span>
                              <Badge variant="outline" className="text-xs">{course.lessons.length + (course.v10Lessons?.length || 0)} aulas</Badge>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-10 space-y-1 mt-1">
                              {course.lessons.length === 0 && (!course.v10Lessons || course.v10Lessons.length === 0) ? (
                                <p className="text-xs text-muted-foreground py-2">Nenhuma aula nesta jornada</p>
                              ) : (
                                <>
                                  {course.lessons.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)}
                                  {course.v10Lessons?.map(lesson => <V10LessonRow key={lesson.id} lesson={lesson} />)}
                                </>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}

                      {/* V10 lessons in this trail */}
                      {trail.v10Lessons.length > 0 && (
                        <div className="ml-4 mt-2">
                          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md mb-1">
                            <Layers className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">Aulas V10 sem jornada ({trail.v10Lessons.length})</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {trail.v10Lessons.map(lesson => <V10LessonRow key={lesson.id} lesson={lesson} />)}
                          </div>
                        </div>
                      )}

                      {/* Orphaned lessons in this trail */}
                      {trail.orphanedLessons.length > 0 && (
                        <div className="ml-4 mt-2">
                          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md mb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">Aulas sem jornada ({trail.orphanedLessons.length})</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {trail.orphanedLessons.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}

            {/* Jornadas Órfãs (courses sem trilha ativa) */}
            {hierarchy.orphanedCourses.length > 0 && (
              <Card className="border-amber-400">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    Jornadas Órfãs (sem trilha)
                  </CardTitle>
                  <CardDescription className="text-xs">{hierarchy.orphanedCourses.length} jornada(s) sem trilha ativa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hierarchy.orphanedCourses.map(course => {
                    const courseLessons = lessons.filter(l => l.course_id === course.id).sort((a, b) => a.order_index - b.order_index);
                    const courseV10 = v10Lessons.filter(l => l.course_id === course.id).sort((a, b) => a.order_in_trail - b.order_in_trail);
                    return (
                      <Collapsible key={course.id} open={expandedCourses.has(course.id)} onOpenChange={() => toggleCourse(course.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                            {expandedCourses.has(course.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <BookOpen className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-sm flex-1">{course.title}</span>
                            <Badge variant="outline" className="text-xs">{courseLessons.length + courseV10.length} aulas</Badge>
                            <Button variant="outline" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              setMoveCourseTarget(course.id);
                              setMoveCourseTrailId('');
                              setShowMoveCourseModal(true);
                            }}>
                              <FolderInput className="w-3 h-3 mr-1" />
                              Mover
                            </Button>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-10 space-y-1 mt-1">
                            {courseLessons.length === 0 && courseV10.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">Nenhuma aula nesta jornada</p>
                            ) : (
                              <>
                                {courseLessons.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)}
                                {courseV10.map(lesson => <V10LessonRow key={lesson.id} lesson={lesson} />)}
                              </>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {hierarchy.fullyOrphaned.length > 0 && (
              <Card className="border-red-300">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Aulas Órfãs (sem trilha)
                  </CardTitle>
                  <CardDescription className="text-xs">{hierarchy.fullyOrphaned.length} aula(s) sem trilha nem jornada</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {hierarchy.fullyOrphaned.map(lesson => <LessonRow key={lesson.id} lesson={lesson} />)}
                </CardContent>
              </Card>
            )}

            {/* V10 orphaned lessons (no trail) */}
            {hierarchy.v10Orphaned.length > 0 && (
              <Card className="border-emerald-300">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
                    <Layers className="w-5 h-5" />
                    Aulas V10 (sem trilha)
                  </CardTitle>
                  <CardDescription className="text-xs">{hierarchy.v10Orphaned.length} aula(s) V10 sem trilha atribuída</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {hierarchy.v10Orphaned.map(lesson => <V10LessonRow key={lesson.id} lesson={lesson} />)}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Delete Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Deletar <strong>{selectedLessons.size} lição(ões)</strong>. Ação irreversível.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 max-h-60 overflow-y-auto space-y-2">
              {selectedLessonsData.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <Badge variant={lesson.is_active ? 'default' : 'secondary'}>{lesson.is_active ? '🟢' : '🟡'}</Badge>
                  {lesson.title}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <Checkbox checked={confirmDelete} onCheckedChange={(c) => setConfirmDelete(c as boolean)} />
              <label className="text-sm font-medium cursor-pointer">Tenho certeza que quero deletar</label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!confirmDelete || deleting}>
                {deleting ? 'Deletando...' : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Lesson Modal */}
        <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-primary" />
                Mover Lição
              </DialogTitle>
              <DialogDescription>Selecione trilha → jornada → posição</DialogDescription>
            </DialogHeader>

            {selectedLessons.size === 1 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Lição:</p>
                <p className="text-sm text-muted-foreground">{lessons.find(l => l.id === Array.from(selectedLessons)[0])?.title}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Trail */}
              <div>
                <label className="text-sm font-medium mb-2 block">Trilha</label>
                <Select value={targetTrailId} onValueChange={(v) => { setTargetTrailId(v); setTargetCourseId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
                  <SelectContent>
                    {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Course (Jornada) - shown for all trail types */}
              {targetTrailId && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Jornada</label>
                  {coursesForSelectedTrail.length === 0 ? (
                    <div className="p-3 border border-dashed border-amber-300 rounded-lg bg-amber-50/50">
                      <p className="text-sm text-amber-700 mb-2">⚠️ Esta trilha não possui jornadas.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowMoveModal(false);
                          setNewCourseTrailId(targetTrailId);
                          setShowCreateCourseModal(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Criar Jornada Primeiro
                      </Button>
                    </div>
                  ) : (
                    <Select value={targetCourseId} onValueChange={setTargetCourseId}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma jornada" /></SelectTrigger>
                      <SelectContent>
                        {coursesForSelectedTrail.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Order */}
              <div>
                <label className="text-sm font-medium mb-2 block">Posição (order_index)</label>
                <Input type="number" min={1} value={targetOrderIndex} onChange={(e) => setTargetOrderIndex(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveModal(false)} disabled={moving}>Cancelar</Button>
              <Button onClick={handleMoveLesson} disabled={moving || !targetCourseId}>
                {moving ? 'Movendo...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Course (Jornada) Modal */}
        <Dialog open={showCreateCourseModal} onOpenChange={setShowCreateCourseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Criar Nova Jornada
              </DialogTitle>
              <DialogDescription>Uma jornada agrupa aulas dentro de uma trilha</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Toggle: usar existente ou criar nova */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={!createNewTrail ? 'default' : 'outline'}
                  onClick={() => setCreateNewTrail(false)}
                >
                  Trilha existente
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={createNewTrail ? 'default' : 'outline'}
                  onClick={() => { setCreateNewTrail(true); setNewCourseTrailId(''); }}
                >
                  + Criar trilha nova
                </Button>
              </div>

              {!createNewTrail ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Trilha</label>
                  <Select value={newCourseTrailId} onValueChange={setNewCourseTrailId}>
                    <SelectTrigger><SelectValue placeholder="Selecione a trilha" /></SelectTrigger>
                    <SelectContent>
                      {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome da Trilha</label>
                    <Input value={newTrailTitle} onChange={(e) => setNewTrailTitle(e.target.value)} placeholder="Ex: Dominando IA Generativa" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ícone da Trilha (opcional)</label>
                    <Input value={newTrailIcon} onChange={(e) => setNewTrailIcon(e.target.value)} placeholder="Ex: 🚀 ou Brain" />
                  </div>
                </div>
              )}

              {/* Journey fields — shown for all trail types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Jornada</label>
                <Input value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="Ex: Aterrizando nas IAs" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ícone (opcional)</label>
                <Input value={newCourseIcon} onChange={(e) => setNewCourseIcon(e.target.value)} placeholder="Ex: Brain, Zap, Rocket..." />
                <p className="text-xs text-muted-foreground mt-1">Nome do ícone Lucide</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCourseModal(false)} disabled={creatingCourse}>Cancelar</Button>
              <Button onClick={handleCreateCourse} disabled={creatingCourse || (!createNewTrail && !newCourseTrailId) || (createNewTrail && !newTrailTitle.trim())}>
                {creatingCourse ? 'Criando...' : 'Criar Jornada'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* V10 Move Modal */}
        <Dialog open={showV10MoveModal} onOpenChange={setShowV10MoveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-primary" />
                Mover Aula V10
              </DialogTitle>
              <DialogDescription>Atribua uma trilha e posição para esta aula V10</DialogDescription>
            </DialogHeader>

            {v10MoveTarget && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Aula:</p>
                <p className="text-sm text-muted-foreground">{v10Lessons.find(l => l.id === v10MoveTarget)?.title}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trilha (N1)</label>
                <Select value={v10TargetTrailId} onValueChange={(val) => { setV10TargetTrailId(val); setV10TargetCourseId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
                  <SelectContent>
                    {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {v10TargetTrailId && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Jornada (N2)</label>
                  <Select value={v10TargetCourseId} onValueChange={setV10TargetCourseId}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma jornada" /></SelectTrigger>
                    <SelectContent>
                      {courses.filter(c => c.trail_id === v10TargetTrailId).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Obrigatório para respeitar N1→N2→N3</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">Posição (order_in_trail)</label>
                <Input type="number" min={0} value={v10TargetOrder} onChange={(e) => setV10TargetOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowV10MoveModal(false)} disabled={movingV10}>Cancelar</Button>
              <Button onClick={handleMoveV10Lesson} disabled={movingV10 || !v10TargetTrailId || !v10TargetCourseId}>
                {movingV10 ? 'Movendo...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Trail Modal (standalone) */}
        <Dialog open={showCreateTrailModal} onOpenChange={setShowCreateTrailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Criar Nova Trilha
              </DialogTitle>
              <DialogDescription>Uma trilha é a seção principal (N1) que agrupa jornadas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Trilha</label>
                <Input value={soloTrailTitle} onChange={(e) => setSoloTrailTitle(e.target.value)} placeholder="Ex: Renda Extra PRO" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ícone (opcional)</label>
                <Input value={soloTrailIcon} onChange={(e) => setSoloTrailIcon(e.target.value)} placeholder="Ex: 🚀 ou Brain" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTrailModal(false)}>Cancelar</Button>
              <Button
                disabled={!soloTrailTitle.trim()}
                onClick={async () => {
                  const maxOrder = trails.length > 0 ? Math.max(...trails.map(t => t.order_index)) + 1 : 1;
                  const { error } = await supabase.from('trails').insert({
                    title: soloTrailTitle.trim(),
                    icon: soloTrailIcon.trim() || null,
                    order_index: maxOrder,
                    is_active: true,
                    trail_type: 'v8',
                  });
                  if (error) {
                    toast({ title: 'Erro ao criar trilha', description: error.message, variant: 'destructive' });
                  } else {
                    toast({ title: 'Trilha criada', description: `"${soloTrailTitle.trim()}"` });
                    setShowCreateTrailModal(false);
                    setSoloTrailTitle('');
                    setSoloTrailIcon('');
                    await loadData();
                  }
                }}
              >
                Criar Trilha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Course (Jornada) Modal */}
        <Dialog open={showMoveCourseModal} onOpenChange={setShowMoveCourseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-primary" />
                Mover Jornada
              </DialogTitle>
              <DialogDescription>Selecione a trilha destino para esta jornada</DialogDescription>
            </DialogHeader>

            {moveCourseTarget && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Jornada:</p>
                <p className="text-sm text-muted-foreground">{courses.find(c => c.id === moveCourseTarget)?.title}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trilha destino (N1)</label>
                <Select value={moveCourseTrailId} onValueChange={setMoveCourseTrailId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
                  <SelectContent>
                    {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveCourseModal(false)} disabled={movingCourse}>Cancelar</Button>
              <Button onClick={handleMoveCourse} disabled={movingCourse || !moveCourseTrailId}>
                {movingCourse ? 'Movendo...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
