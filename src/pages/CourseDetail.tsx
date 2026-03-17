import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock } from 'lucide-react';
import { V8CertificateCard } from '@/components/lessons/v8/V8CertificateCard';
import { V8SkillTree } from '@/components/lessons/v8/V8SkillTree';
import { CourseDetailSkeleton } from '@/components/skeletons';
import { useCourseDetailQuery, type Lesson } from '@/hooks/useCourseDetailQuery';
import type { NodeStatus } from '@/components/lessons/v8/V8SkillNode';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, error } = useCourseDetailQuery(id);

  // Handle auth error
  useEffect(() => {
    if (error?.message === 'NOT_AUTHENTICATED') {
      navigate('/auth');
    } else if (error) {
      toast({ title: "Erro ao carregar curso", description: error.message, variant: "destructive" });
    }
  }, [error]);

  const course = data?.course ?? null;
  const trailTitle = data?.trailTitle ?? null;
  const lessons = data?.lessons ?? [];
  const completedLessons = data?.completedLessonIds ?? [];
  const isAdmin = data?.isAdmin ?? false;

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (completedLessons.includes(lesson.id)) return 'completed';
    if (isAdmin) return 'unlocked';
    if (index === 0 || completedLessons.includes(lessons[index - 1]?.id)) return 'unlocked';
    return 'locked';
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (status === 'locked') {
      toast({ title: "Aula bloqueada", description: "Complete a aula anterior para desbloquear.", variant: "destructive" });
      return;
    }
    if (lesson.model === 'v8') {
      navigate(`/v8/${lesson.id}`);
      return;
    }
    if (lesson.model === 'v7' || lesson.model === 'v7-cinematic' || lesson.lesson_type === 'v7-cinematic') {
      navigate(`/v7/${lesson.id}`);
      return;
    }
    const hasInteractiveContent = lesson.lesson_type && lesson.lesson_type !== '';
    navigate(hasInteractiveContent ? `/lessons-interactive/${lesson.id}` : `/lessons/${lesson.id}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Curso não encontrado</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = lessons.length > 0 ? (completedLessons.filter(lid => lessons.some(l => l.id === lid)).length / lessons.length) * 100 : 0;
  const completedCount = completedLessons.filter(lid => lessons.some(l => l.id === lid)).length;
  const allCompleted = completedCount === lessons.length && lessons.length > 0;

  /* ── Unified Layout: Certificate + SkillTree ── */
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Compact App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[240px]">
            {course.title}
          </h1>
          <div className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            {Math.round(progress)}%
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        {/* Trail + Journey Context */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-1">
            {trailTitle && (
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                Trilha: {trailTitle}
              </p>
            )}
            <p className="text-sm font-semibold text-gray-900">{course.title}</p>
            {course.description && (
              <p className="text-xs text-gray-500 mt-0.5">{course.description}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{lessons.length} aulas</span>
            </div>
          </div>
        </div>

        {/* Certificate + Lessons */}
        <div className="flex flex-col lg:flex-row gap-5">
          <V8CertificateCard
            completedCount={completedCount}
            totalLessons={lessons.length}
            allCompleted={allCompleted}
            trailTitle={trailTitle || course.title}
          />

          {/* Skill Tree */}
          <div className="flex-1 min-w-0">
            {lessons.length > 0 ? (
              <V8SkillTree
                lessons={lessons.map((lesson, index) => {
                  const rawStatus = getLessonStatus(lesson, index);
                  const status: NodeStatus = rawStatus === 'unlocked'
                    ? 'available'
                    : rawStatus as NodeStatus;
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description || undefined,
                    estimatedTime: lesson.estimated_time || undefined,
                    status,
                  };
                })}
                onLessonClick={(lessonId) => {
                  const lesson = lessons.find(l => l.id === lessonId);
                  if (lesson) handleLessonClick(lesson, getLessonStatus(lesson, lessons.indexOf(lesson)));
                }}
                allCompleted={allCompleted}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Nenhuma aula disponível nesta jornada ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
