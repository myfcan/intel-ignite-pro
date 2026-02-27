import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, BookOpen } from 'lucide-react';
import { LivWelcomeModal } from '@/components/LivWelcomeModal';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import CourseCard from '@/components/CourseCard';
import type { LucideIcon } from 'lucide-react';

interface Course {
  id: string;
  trail_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
}

interface Trail {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const TRAIL_ICONS: Record<string, LucideIcon> = {
  Brain, Zap, Rocket, Target, TrendingUp, GraduationCap, Crown, Code, DollarSign, BookOpen,
  '🎓': GraduationCap, '📱': Zap, '💼': Target, '💰': DollarSign,
};

const TrailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLivModal, setShowLivModal] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [courseStats, setCourseStats] = useState<Record<string, { completed: number; total: number }>>({});

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);
    };
    initializeUser();
  }, []);

  const { isAdmin, canAccessAdmin, loading: adminLoading } = useIsAdmin(userId);

  useEffect(() => {
    if (userId) fetchTrailData();
  }, [id, userId]);

  const fetchTrailData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }

      // Fetch trail
      const { data: trailData, error: trailError } = await supabase
        .from('trails')
        .select('*')
        .eq('id', id)
        .single();

      if (trailError) throw trailError;
      setTrail(trailData);

      // Fetch courses for this trail
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('trail_id', id)
        .eq('is_active', true)
        .order('order_index');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch all lessons for these courses + user progress
      const courseIds = (coursesData || []).map(c => c.id);
      if (courseIds.length > 0) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, course_id')
          .in('course_id', courseIds)
          .eq('is_active', true);

        const { data: progressData } = await supabase
          .from('user_progress')
          .select('lesson_id, status')
          .eq('user_id', session.user.id)
          .eq('status', 'completed');

        const completedIds = new Set(progressData?.map(p => p.lesson_id) || []);
        const stats: Record<string, { completed: number; total: number }> = {};

        for (const courseId of courseIds) {
          const courseLessons = (lessonsData || []).filter(l => l.course_id === courseId);
          stats[courseId] = {
            total: courseLessons.length,
            completed: courseLessons.filter(l => completedIds.has(l.id)).length,
          };
        }
        setCourseStats(stats);
      }
    } catch (error: any) {
      console.error('Error fetching trail:', error);
      toast({ title: "Erro ao carregar trilha", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando trilha...</p>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Trilha não encontrada</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalLessons = Object.values(courseStats).reduce((acc, s) => acc + s.total, 0);
  const totalCompleted = Object.values(courseStats).reduce((acc, s) => acc + s.completed, 0);
  const progress = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  return (
    <>
      {showLivModal && <LivWelcomeModal onClose={() => setShowLivModal(false)} />}

      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="relative z-10">
          {/* Header */}
          <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-all mb-4 sm:mb-6 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm sm:text-base text-gray-700">Voltar</span>
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
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
                        style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                      >
                        {(() => {
                          const TrailIcon = TRAIL_ICONS[trail.icon] || GraduationCap;
                          return <TrailIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                          {trail.title}
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2">
                          {trail.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {totalLessons} aulas
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full md:w-auto text-center md:text-right backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 border"
                    style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    <div className="text-xs sm:text-sm text-white/80 mb-1">Seu progresso</div>
                    <div className="text-4xl sm:text-5xl font-bold text-white mb-1">{Math.round(progress)}%</div>
                    <div className="text-xs sm:text-sm text-white/80">{totalCompleted}/{totalLessons} aulas completas</div>
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

          {/* Courses List */}
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Cursos & Jornadas
            </h2>
            <div className="space-y-4">
              {courses.map((course, index) => {
                const stats = courseStats[course.id] || { completed: 0, total: 0 };
                const courseProgress = stats.total > 0 ? stats.completed / stats.total : 0;
                let courseStatus: 'active' | 'completed' | 'locked' = 'active';

                if (courseProgress >= 1) {
                  courseStatus = 'completed';
                } else if (!isAdmin && index > 0) {
                  const prevStats = courseStats[courses[index - 1]?.id];
                  if (prevStats && prevStats.total > 0 && prevStats.completed < prevStats.total) {
                    courseStatus = 'locked';
                  }
                }

                const IconComponent = TRAIL_ICONS[course.icon || ''] || GraduationCap;

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    Icon={IconComponent}
                    completedLessons={stats.completed}
                    totalLessons={stats.total}
                    status={courseStatus}
                    accentColor="#6366F1"
                    index={index}
                  />
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default TrailDetail;
