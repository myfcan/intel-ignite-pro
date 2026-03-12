import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CheckCircle2, Clock, Play, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLessonIcon } from '@/utils/lessonIconMap';
import { V8CertificateCard } from '@/components/lessons/v8/V8CertificateCard';

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: number;
  difficulty_level: string;
  is_active: boolean;
  lesson_type?: string;
  model?: string;
}

interface Course {
  id: string;
  trail_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [trailId, setTrailId] = useState<string | null>(null);
  const [trailType, setTrailType] = useState<string | null>(null);
  const [trailTitle, setTrailTitle] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (id) fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Single getSession call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const uid = session.user.id;

      // Step 1: fetch course (need trail_id for next step)
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, trail_id, title, description, icon, order_index')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);
      setTrailId(courseData.trail_id);

      // Step 2: Parallel fetch — trail, lessons, progress, roles
      const [trailResult, lessonsResult, progressResult, rolesResult] = await Promise.all([
        supabase
          .from('trails')
          .select('trail_type, title')
          .eq('id', courseData.trail_id)
          .single(),
        supabase
          .from('lessons')
          .select('id, title, description, order_index, estimated_time, difficulty_level, is_active, lesson_type, model')
          .eq('course_id', id)
          .eq('is_active', true)
          .order('order_index'),
        supabase
          .from('user_progress')
          .select('lesson_id, status')
          .eq('user_id', uid)
          .in('status', ['completed']),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', uid),
      ]);

      setTrailType(trailResult.data?.trail_type ?? null);
      setTrailTitle(trailResult.data?.title ?? null);

      if (lessonsResult.error) throw lessonsResult.error;
      setLessons(lessonsResult.data || []);

      if (progressResult.data) {
        setCompletedLessons(progressResult.data.map(p => p.lesson_id));
      }

      // Inline admin check (replaces useIsAdmin hook)
      const roles = (rolesResult.data || []).map(r => r.role);
      setIsAdmin(roles.includes('admin') || roles.includes('supervisor'));
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast({ title: "Erro ao carregar curso", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
    if (trailType === 'v8') {
      navigate('/dashboard');
    } else if (trailId) {
      navigate(`/trail/${trailId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
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
  const isV8 = trailType === 'v8';
  const allCompleted = completedCount === lessons.length && lessons.length > 0;

  /* ── V8 Layout: Certificate + Coursiv Lessons ── */
  if (isV8) {
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

            {/* Lessons List */}
            <div className="flex-1 min-w-0 space-y-3">
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson, index);
                  const isLocked = status === 'locked';
                  const isCompleted = status === 'completed';

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                      onClick={() => handleLessonClick(lesson, status)}
                      className={`group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-all duration-200 ${
                        isLocked
                          ? 'opacity-60 cursor-not-allowed'
                          : 'cursor-pointer hover:border-violet-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                              : isLocked
                                ? 'bg-gray-100'
                                : 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 group-hover:from-violet-100 group-hover:to-indigo-100'
                          }`}
                        >
                          {isCompleted ? (
                            <Trophy className="w-5 h-5 text-white" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            (() => { const LIcon = getLessonIcon(lesson.title); return <LIcon className="w-5 h-5 text-violet-600" />; })()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                            Aula {index + 1}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{lesson.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Concluída
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.estimated_time || 10}min</span>
                          </div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {!isLocked && (
                        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  Nenhuma aula disponível nesta jornada ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Default (non-V8) Layout ── */
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="relative z-10">
        <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-all mb-4 sm:mb-6 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm sm:text-base text-gray-700">Voltar à Trilha</span>
          </button>

          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #3B82F6 100%)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="flex-1 w-full">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                    {course.title}
                  </h1>
                  {course.description && (
                    <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm mt-3">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {lessons.length} aulas
                    </span>
                  </div>
                </div>
                <div
                  className="w-full md:w-auto text-center md:text-right backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 border"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <div className="text-xs sm:text-sm text-white/80 mb-1">Seu progresso</div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-1">{Math.round(progress)}%</div>
                  <div className="text-xs sm:text-sm text-white/80">{completedCount}/{lessons.length} completas</div>
                </div>
              </div>
              <div
                className="h-2 sm:h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <div
                  className="h-full shadow-lg transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(progress))}%`,
                    background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Aulas</h2>
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson, index);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              const progressPercentage = isCompleted ? 100 : 0;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                  onClick={() => handleLessonClick(lesson, status)}
                  className={`group relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
                    isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden ${
                          isCompleted ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-md' : ''
                        }`}
                        style={
                          !isCompleted && !isLocked
                            ? {
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 139, 250, 0.12) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                              }
                            : isLocked
                              ? { background: '#F1F5F9', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }
                              : undefined
                        }
                      >
                        {isCompleted ? (
                          <Trophy className="w-8 h-8 text-yellow-50 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        ) : isLocked ? (
                          <Lock className="w-8 h-8 text-slate-400" />
                        ) : (
                          (() => { const LIcon = getLessonIcon(lesson.title); return <LIcon className="w-8 h-8 text-primary" />; })()
                        )}
                        {!isLocked && !isCompleted && (
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                          >
                            <Play className="w-6 h-6 text-primary" fill="hsl(var(--primary))" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                              Aula {index + 1}: {lesson.title}
                            </h3>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Concluída
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 line-clamp-1">{lesson.description}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Progresso</span>
                            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.15)' }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${progressPercentage}%`,
                                background: isCompleted
                                  ? 'linear-gradient(to right, #10B981, #14B8A6)'
                                  : 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)',
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              (() => { const LIcon = getLessonIcon(lesson.title); return <LIcon className="w-4 h-4 text-primary" />; })()
                            )}
                            <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-600' : isLocked ? 'text-gray-400' : 'text-primary'}`}>
                              {isCompleted ? 'Concluído' : isLocked ? 'Não Iniciado' : 'Cursando'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{lesson.estimated_time || 10} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetail;
