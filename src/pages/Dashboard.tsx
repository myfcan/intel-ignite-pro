import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, DollarSign, Award, Bot, Code, PieChart, BarChart3, Layers, Palette, Database, Brain, Zap, TrendingUp, Rocket, Target, Sparkles, Crown, Gem, ChevronRight } from "lucide-react";
import { usePrefetchCourseDetail } from "@/hooks/usePrefetch";
import DashboardHeader from "@/components/DashboardHeader";
import { V8TrailCard } from "@/components/lessons/v8/V8TrailCard";
import { MissoesDiarias } from "@/components/gamification/MissoesDiarias";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { motion } from "framer-motion";
import { GamificationHeader } from "@/components/gamification/GamificationHeader";
import { AnimatedStatCard } from "@/components/gamification/AnimatedStatCard";
import { CourseProgressCard } from "@/components/dashboard/CourseProgressCard";
import { PointsCard } from "@/components/dashboard/PointsCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileQuickStats } from "@/components/dashboard/MobileQuickStats";
import { MobileQuickAccess } from "@/components/dashboard/MobileQuickAccess";
import { DashboardTour } from "@/components/onboarding/DashboardTour";
import { BuildBadge } from "@/components/BuildBadge";
import { DASHBOARD_LAYOUT_ID, logRuntimeSignature } from "@/lib/runtimeSignature";
import { TrailSection } from "@/components/dashboard/TrailSection";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  streak_days: number;
  total_points: number;
  total_lessons_completed: number;
  daily_interaction_limit: number;
  interactions_used_today: number;
}

interface Trail {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  trail_type: string | null;
}

interface TrailProgress {
  trailId: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  status: 'active' | 'completed' | 'locked';
}

interface V8Course {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  trail_id: string;
  completedLessons: number;
  totalLessons: number;
}

// ══════ MODULE-LEVEL CONSTANTS (Fase 5: avoid re-creation per render) ══════
const TRAIL_ICONS: Record<string, any> = {
  'Brain': Brain,
  'Target': Target,
  'Zap': Zap,
  'Rocket': Rocket,
  'TrendingUp': TrendingUp,
  'Crown': Crown,
  'Code': Code,
  '🎓': GraduationCap,
  '📱': Zap,
  '💼': Target,
  '💰': DollarSign,
};

const TRAIL_CATEGORY_MAP: Record<number, string> = {
  1: 'Fundamentos',
  2: 'Profissionais',
  3: 'Negócios',
  4: 'Copyright',
  5: 'Renda Extra',
  6: 'Vendas',
  9: 'Maestria',
  10: 'Renda Extra PRO',
};

const PATENT_NAMES: Record<number, string> = {
  0: 'Sem patente',
  1: 'Operador Básico de I.A.',
  2: 'Executor de Sistemas',
  3: 'Estrategista em I.A.',
};

// Dashboard component - main user dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  usePrefetchCourseDetail();
  const [user, setUser] = useState<User | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [trailsProgress, setTrailsProgress] = useState<TrailProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [gamificationStats, setGamificationStats] = useState<{
    powerScore: number; coins: number; patentLevel: number; patentName: string;
    streakDays: number; lessonsCompleted: number;
  } | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [showPatentCelebration, setShowPatentCelebration] = useState(false);
  const prevPatentLevelRef = useRef<number | null>(null);
  const [dashboardAccessCount, setDashboardAccessCount] = useState<number>(0);
  
  // All courses from all trails
  const [v8Courses, setV8Courses] = useState<V8Course[]>([]);
  
  // Dynamic trail sections: group courses by trail_id, Maestria first then by order_index
  const maestriaTrailId = trails.find(t => t.order_index === 9)?.id;

  const trailSections = useMemo(() => {
    // Group courses by trail_id
    const grouped = new Map<string, V8Course[]>();
    for (const course of v8Courses) {
      if (!grouped.has(course.trail_id)) {
        grouped.set(course.trail_id, []);
      }
      grouped.get(course.trail_id)!.push(course);
    }

    // Build sections: only trails with courses
    const sections: { trail: Trail; courses: V8Course[] }[] = [];
    
    // Maestria first
    if (maestriaTrailId && grouped.has(maestriaTrailId)) {
      const maestriaTrail = trails.find(t => t.id === maestriaTrailId);
      if (maestriaTrail) {
        sections.push({ trail: maestriaTrail, courses: grouped.get(maestriaTrailId)! });
      }
    }

    // Then other ALLOWED trails sorted by order_index (only N1: Maestria=9, IA Profissionais=2, Renda Extra PRO=3)
    const allowedOrderIndexes = new Set([9, 2, 3]);
    const otherTrails = trails
      .filter(t => t.id !== maestriaTrailId && grouped.has(t.id) && allowedOrderIndexes.has(t.order_index))
      .sort((a, b) => a.order_index - b.order_index);

    for (const trail of otherTrails) {
      sections.push({ trail, courses: grouped.get(trail.id)! });
    }

    return sections;
  }, [v8Courses, trails, maestriaTrailId]);

  // Fase 3: Guarda anti-stale — valida fingerprint no mount do dashboard
  useEffect(() => {
    logRuntimeSignature({ route: '/dashboard', layoutId: DASHBOARD_LAYOUT_ID });
    
    const guardKey = `ailiv_dashboard_guard_${DASHBOARD_LAYOUT_ID}`;
    const el = document.querySelector(`[data-layout-id]`);
    if (el) {
      const actual = el.getAttribute('data-layout-id');
      if (actual && actual !== DASHBOARD_LAYOUT_ID) {
        console.error(`[AIliv:AntiStale] Layout mismatch: DOM=${actual} vs expected=${DASHBOARD_LAYOUT_ID}`);
        if (!sessionStorage.getItem(guardKey)) {
          sessionStorage.setItem(guardKey, '1');
          if ('caches' in window) caches.keys().then(n => n.forEach(k => caches.delete(k)));
          window.location.reload();
          return;
        }
      }
    }
    
    checkAuth();
  }, []);

  // CRITICAL FIX: useMemo recalcula quando isAdmin muda
  const trailsProgressWithStatus = useMemo(() => {
    console.log('[Dashboard] Recalculando trailsProgressWithStatus. isAdmin:', isAdmin, 'adminLoading:', adminLoading);
    
    return trailsProgress.map((tp, index) => {
      const trail = trails.find(t => t.id === tp.trailId);
      if (!trail) return tp;

      let status: 'active' | 'completed' | 'locked';
      if (tp.progress === 100) {
        status = 'completed';
      } else if (isAdmin) {
        console.log('[Dashboard] Admin bypass - trilha desbloqueada:', trail.title);
        status = 'active';
      } else if (trail.order_index === 1) {
        status = 'active';
      } else {
        const previousProgress = trailsProgress[index - 1];
        status = previousProgress?.progress === 100 ? 'active' : 'locked';
      }

      return { ...tp, status };
    });
  }, [trailsProgress, trails, isAdmin, adminLoading]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth?reason=session_missing&redirect=/dashboard');
        return;
      }

      const userId = session.user.id;

      const today = new Date().toISOString().slice(0, 10);
      const [userResult, rolesResult, dailyUsageResult] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('v10_user_daily_usage').select('interactions_used, interactions_limit').eq('user_id', userId).eq('usage_date', today).maybeSingle(),
      ]);

      if (userResult.error) {
        console.error('Error fetching user:', userResult.error);
        throw userResult.error;
      }

      const roles = (rolesResult.data || []).map((r: any) => r.role);
      const hasAdmin = roles.includes('admin');
      const hasSupervisor = roles.includes('supervisor');
      setIsAdmin(hasAdmin);
      setCanAccessAdmin(hasAdmin || hasSupervisor);
      setAdminLoading(false);

      let finalUser = userResult.data;

      if (!finalUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            onboarding_completed: false,
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }
        finalUser = newUser;
      }

      if (dailyUsageResult.data) {
        finalUser.interactions_used_today = (dailyUsageResult.data as Record<string, number>).interactions_used;
        finalUser.daily_interaction_limit = (dailyUsageResult.data as Record<string, number>).interactions_limit;
      } else {
        finalUser.interactions_used_today = 0;
      }

      setUser(finalUser);
      
      const lastSignInAt = session.user.last_sign_in_at || new Date().toISOString();
      const { data: loginResult, error: loginError } = await supabase
        .rpc('register_dashboard_login', { p_last_sign_in_at: lastSignInAt });

      if (!loginError && loginResult && loginResult.length > 0) {
        const { access_count, is_first_access } = loginResult[0];
        setDashboardAccessCount(access_count);
        if (is_first_access) {
          sessionStorage.setItem('ailiv_show_tour_now', '1');
        }
      } else {
        setDashboardAccessCount(finalUser.dashboard_access_count ?? 0);
      }

      const patentLevel = finalUser.patent_level || 0;
      const newStats = {
        powerScore: finalUser.power_score || 0,
        coins: finalUser.coins || 0,
        patentLevel,
        patentName: PATENT_NAMES[patentLevel] || PATENT_NAMES[0],
        streakDays: finalUser.streak_days || 0,
        lessonsCompleted: finalUser.total_lessons_completed || 0,
      };
      setGamificationStats(newStats);
      setGamificationLoading(false);

      if (prevPatentLevelRef.current !== null && patentLevel > prevPatentLevelRef.current) {
        setShowPatentCelebration(true);
        setTimeout(() => setShowPatentCelebration(false), 3500);
      }
      prevPatentLevelRef.current = patentLevel;

      await fetchTrailsWithProgress(userId);
    } catch (error: any) {
      console.error('Error checking auth:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      navigate('/auth?reason=error&redirect=/dashboard');
    } finally {
      setLoading(false);
    }
  };


  const fetchTrailsWithProgress = async (userId: string) => {
    try {
      const [trailsResult, lessonsResult, progressResult, v10LessonsResult, v10ProgressResult] = await Promise.all([
        supabase.from('trails').select('*').eq('is_active', true).order('order_index'),
        supabase.from('lessons').select('id, trail_id, course_id').eq('is_active', true),
        supabase.from('user_progress').select('lesson_id, status').eq('user_id', userId).eq('status', 'completed'),
        (supabase as any).from('v10_lessons').select('id, trail_id, course_id, status').eq('status', 'published'),
        (supabase as any).from('v10_user_lesson_progress').select('lesson_id, completed').eq('user_id', userId).eq('completed', true),
      ]);

      if (trailsResult.error) throw trailsResult.error;
      
      const trailsData = trailsResult.data || [];
      const allLessons = lessonsResult.data || [];
      const allProgress = progressResult.data || [];
      const v10LessonsData = (v10LessonsResult.data || []) as Array<{ id: string; trail_id: string | null; course_id: string | null; status: string }>;
      const v10ProgressData = (v10ProgressResult.data || []) as Array<{ lesson_id: string; completed: boolean }>;

      setTrails(trailsData);

      const completedLessonIds = new Set([
        ...allProgress.map(p => p.lesson_id),
        ...v10ProgressData.map(p => p.lesson_id),
      ]);

      const allLessonsUnified = [
        ...allLessons,
        ...v10LessonsData.map(l => ({ id: l.id, trail_id: l.trail_id, course_id: l.course_id })),
      ];

      const lessonsByTrail = new Map<string, string[]>();
      allLessonsUnified.forEach(lesson => {
        if (lesson.trail_id && !lessonsByTrail.has(lesson.trail_id)) {
          lessonsByTrail.set(lesson.trail_id, []);
        }
        if (lesson.trail_id) {
          lessonsByTrail.get(lesson.trail_id)!.push(lesson.id);
        }
      });

      const progressData: TrailProgress[] = [];
      
      for (const trail of trailsData) {
        const lessonIds = lessonsByTrail.get(trail.id) || [];
        const totalLessons = lessonIds.length;
        const completedLessons = lessonIds.filter(id => completedLessonIds.has(id)).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        let status: 'active' | 'completed' | 'locked';
        if (progress === 100) {
          status = 'completed';
        } else if (trail.order_index === 1) {
          status = 'active';
        } else {
          const previousTrailProgress = progressData[progressData.length - 1];
          status = previousTrailProgress?.status === 'completed' ? 'active' : 'locked';
        }

        progressData.push({ trailId: trail.id, completedLessons, totalLessons, progress, status });
      }

      setTrailsProgress(progressData);

      // Fetch courses from ALL trails (system-agnostic)
      const allTrailIds = trailsData.map(t => t.id);
      if (allTrailIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('trail_id', allTrailIds)
          .eq('is_active', true)
          .order('order_index');

        if (coursesData && coursesData.length > 0) {
          const allCoursesWithProgress: V8Course[] = coursesData.map(course => {
            const courseLessons = allLessonsUnified.filter(l => l.course_id === course.id);
            const completed = courseLessons.filter(l => completedLessonIds.has(l.id)).length;
            return {
              id: course.id,
              title: course.title,
              description: course.description,
              icon: course.icon,
              order_index: course.order_index,
              trail_id: course.trail_id,
              completedLessons: completed,
              totalLessons: courseLessons.length,
            };
          });
          setV8Courses(allCoursesWithProgress);
        }
      }
    } catch (error: any) {
      console.error('Error fetching trails with progress:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  // Find active trail for CourseProgressCard
  const activeTrail = trails.find((trail, index) => {
    const tp = trailsProgressWithStatus.find(p => p.trailId === trail.id);
    return tp && tp.status === 'active' && tp.progress < 100;
  });
  const activeTrailProgress = activeTrail
    ? trailsProgressWithStatus.find(p => p.trailId === activeTrail.id)
    : null;

  const hasAnyProgress = (activeTrailProgress?.completedLessons ?? 0) > 0;

  return (
    <div className="min-h-screen relative" data-layout-id={DASHBOARD_LAYOUT_ID} style={{ background: 'linear-gradient(180deg, #F0F1F5 0%, #E8E9EF 50%, #F0F1F5 100%)' }}>
      <DashboardHeader user={user!} showPatentCelebration={showPatentCelebration} />
      <BuildBadge isAdmin={isAdmin} />
      
      {/* Dashboard Tour — triggered on first access only (backend-driven) */}
      <DashboardTour 
        enabled={sessionStorage.getItem('ailiv_show_tour_now') === '1'} 
        onTourSeen={() => {
          sessionStorage.removeItem('ailiv_show_tour_now');
          supabase.rpc('mark_dashboard_tour_seen').then();
        }}
      />
      
      {/* Gamification Header */}
      {!gamificationLoading && gamificationStats && (
        <GamificationHeader
          powerScore={gamificationStats.powerScore}
          coins={gamificationStats.coins}
          patentLevel={gamificationStats.patentLevel}
          patentName={gamificationStats.patentName}
        />
      )}

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-hidden">
        
        {/* Admin Access Button */}
        {canAccessAdmin && (
          <div className="flex justify-end mb-4 relative z-50">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-slate-500 hover:text-slate-700 underline cursor-pointer relative z-50"
            >
              Acessar Painel Admin
            </button>
          </div>
        )}

        {/* ===== 2-COLUMN LAYOUT: Main + Sidebar ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          
          {/* ===== MAIN COLUMN ===== */}
          <div>
            {/* ===== MOBILE: Greeting Card + Quick Stats ===== */}
            <MobileQuickStats
              streakDays={gamificationStats?.streakDays ?? 0}
              userName={user?.name?.split(' ')[0] || 'Aluno'}
              isLoading={gamificationLoading}
              missionsContent={<MissoesDiarias compact />}
              quickAccessContent={<div id="tour-quick-access"><MobileQuickAccess /></div>}
              continueContent={
                activeTrail && activeTrailProgress ? (
                  <div
                    className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-shadow active:scale-[0.99] bg-card/85 backdrop-blur-xl border border-border/80 shadow-sm"
                    onClick={() => navigate(`/trail/${activeTrail.id}`)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary shadow-lg shadow-primary/25"
                    >
                      {(() => {
                        const TrailIcon = TRAIL_ICONS[activeTrail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
                        return <TrailIcon className="w-5 h-5 text-primary-foreground" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-muted-foreground">
                        Continue sua lição
                      </p>
                      <h3 className="font-bold text-sm truncate text-foreground">{activeTrail.title}</h3>
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden bg-muted">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${activeTrailProgress.progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  </div>
                ) : undefined
              }
              accessCount={dashboardAccessCount}
              activeTrail={activeTrail ? { id: activeTrail.id, title: activeTrail.title } : null}
              hasProgress={hasAnyProgress}
              
            />

            {/* ===== PURPLE HERO BANNER - Hidden on mobile ===== */}
            <div
              className="hidden lg:block rounded-[20px] p-6 sm:p-7 md:p-8 mb-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #7C3AED 100%)',
                boxShadow: '0 12px 40px -8px rgba(108, 99, 255, 0.3)',
              }}
            >
              {/* Floating Icon Badges */}
              {[
                { Icon: Code, bg: '#F97316', right: '8%', top: '10%', size: 40, delay: 0 },
                { Icon: Database, bg: '#0EA5E9', right: '22%', top: '5%', size: 36, delay: 0.1 },
                { Icon: PieChart, bg: '#8B5CF6', right: '15%', top: '40%', size: 32, delay: 0.2 },
                { Icon: Palette, bg: '#EC4899', right: '5%', top: '50%', size: 38, delay: 0.3 },
                { Icon: Layers, bg: '#10B981', right: '25%', top: '65%', size: 36, delay: 0.15 },
                { Icon: BarChart3, bg: '#1E40AF', right: '12%', top: '75%', size: 32, delay: 0.25 },
              ].map(({ Icon: FloatIcon, bg, right, top, size, delay: d }, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-2xl flex items-center justify-center shadow-lg hidden sm:flex"
                  style={{ 
                    background: bg, 
                    right, 
                    top, 
                    width: size, 
                    height: size,
                  }}
                  initial={{ opacity: 0, scale: 0, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + d, type: 'spring', stiffness: 180, damping: 15 }}
                >
                  <FloatIcon className="text-white" style={{ width: size * 0.45, height: size * 0.45 }} />
                </motion.div>
              ))}

              {/* Hero content */}
              <div className="relative z-10 max-w-md">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  Pronto para aprender?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-purple-200 text-sm sm:text-base mb-4 leading-relaxed"
                >
                  Continue sua jornada de aprendizado. Você está a um passo dos seus objetivos.
                </motion.p>
                <div className="flex gap-3">
                  <button
                    onClick={() => activeTrail && navigate(`/trail/${activeTrail.id}`)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-indigo-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Continuar Última Aula
                  </button>
                  <button
                    onClick={() => {
                      const trailsSection = document.getElementById('suas-trilhas');
                      trailsSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    Explorar Trilhas
                  </button>
                </div>
              </div>
            </div>

            {/* ===== 4 STAT CARDS - Hidden on mobile (redundant with GamificationHeader) ===== */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-6">
              <AnimatedStatCard
                value={gamificationStats?.lessonsCompleted ?? 0}
                label="Aulas Concluídas"
                icon={BookOpen}
                gradientFrom="#6366F1"
                gradientTo="#818CF8"
                delay={0.1}
                isLoading={gamificationLoading || !gamificationStats}
                variant="white"
              />
              <AnimatedStatCard
                value={gamificationStats?.powerScore ?? 0}
                label="Power Score"
                icon={Trophy}
                gradientFrom="#EC4899"
                gradientTo="#F472B6"
                delay={0.15}
                isLoading={gamificationLoading || !gamificationStats}
                variant="white"
              />
              <AnimatedStatCard
                value={gamificationStats?.coins ?? 0}
                label="Créditos"
                icon={Award}
                gradientFrom="#10B981"
                gradientTo="#34D399"
                delay={0.2}
                isLoading={gamificationLoading || !gamificationStats}
                variant="white"
              />
              <AnimatedStatCard
                value={gamificationStats?.streakDays ?? 0}
                label="Streak (Dias)"
                icon={Flame}
                gradientFrom="#F97316"
                gradientTo="#FB923C"
                delay={0.25}
                isLoading={gamificationLoading || !gamificationStats}
                variant="white"
              />
            </div>

            {/* ===== CONTINUE LEARNING (desktop/tablet only - mobile version is above) ===== */}
            <div className="hidden lg:block">
              {activeTrail && activeTrailProgress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Continue Sua Lição</h2>
                    <span onClick={() => document.getElementById('suas-trilhas')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs sm:text-sm text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todas</span>
                  </div>
                  <div
                    className="bg-white rounded-[20px] p-4 sm:p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ border: '1px solid hsl(230 15% 92%)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
                    onClick={() => navigate(`/trail/${activeTrail.id}`)}
                  >
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                      }}
                    >
                      {(() => {
                        const TrailIcon = TRAIL_ICONS[activeTrail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
                        return <TrailIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold mb-1" style={{ background: '#6366F115', color: '#6366F1' }}>
                        {TRAIL_CATEGORY_MAP[activeTrail.order_index] || 'Curso'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{activeTrail.title}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Próximo módulo: Aula {activeTrailProgress.completedLessons + 1}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-xs">
                        <motion.div className="h-full rounded-full" style={{ background: '#6366F1' }} initial={{ width: 0 }} animate={{ width: `${activeTrailProgress.progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                      </div>
                    </div>
                    <button className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex-shrink-0 hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                      Continuar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===== DYNAMIC TRAIL SECTIONS ===== */}
            {trailSections.length > 0 && (
              <div id="suas-trilhas">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 tracking-tight">Trilhas</h2>

                {trailSections.map((section, idx) => (
                  <TrailSection
                    key={section.trail.id}
                    trailTitle={section.trail.id === maestriaTrailId ? 'Seu caminho para Maestria' : section.trail.title}
                    courses={section.courses}
                    sectionId={idx === 0 ? 'tour-trilhas' : undefined}
                    isMaestria={section.trail.id === maestriaTrailId}
                  />
                ))}
              </div>
            )}

            {/* ===== FOR YOU - Feature Cards ===== */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Para Você</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* AI Playground - Premium */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  onClick={() => navigate('/ai-playground')}
                  className="cursor-pointer group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    boxShadow: '0 8px 32px -4px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="h-40 sm:h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 40%, #4338CA 100%)' }}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', top: '-10%', left: '10%' }} />
                      <div className="absolute w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', bottom: '5%', right: '15%' }} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2.5 w-4/5 max-w-[240px]">
                      <div className="self-start rounded-2xl rounded-bl-md px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="text-[12px] font-medium text-white/90">Crie um resumo...</span>
                      </div>
                      <div className="self-end rounded-2xl rounded-br-md px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                        <span className="text-[12px] font-medium text-gray-700">Aqui está o resumo...</span>
                      </div>
                      <div className="self-start flex items-center gap-1.5 px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <div className="w-1 h-1 rounded-full bg-indigo-300 animate-pulse" />
                        <span className="text-[10px] text-indigo-200">IA digitando...</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}>
                        <Bot className="w-3 h-3" /> IA
                      </span>
                      <span className="text-[10px] font-medium text-green-500">● Online</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-0.5">AI Playground</h3>
                    <p className="text-gray-400 text-xs">Converse com IA em tempo real e crie conteúdo</p>
                  </div>
                </motion.div>

                {/* Desafios 21 Dias - Premium */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="cursor-pointer group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    boxShadow: '0 8px 32px -4px rgba(245, 158, 11, 0.1), 0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="h-40 sm:h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #7C2D12 0%, #B45309 40%, #D97706 100%)' }}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)', top: '-15%', right: '10%' }} />
                      <div className="absolute w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)', bottom: '0%', left: '15%' }} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <Flame className="w-8 h-8 text-amber-300 mb-1" />
                      </div>
                      <span className="text-7xl font-black text-white leading-none" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>21</span>
                      <span className="text-sm font-bold uppercase tracking-[0.3em] text-amber-200/80 mt-1">DIAS</span>
                      <div className="flex gap-1 mt-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < 3 ? '#FCD34D' : 'rgba(255,255,255,0.2)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}>
                        🔥 DESAFIO
                      </span>
                      <span className="text-[10px] font-medium text-amber-500">21 aulas</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-0.5">Desafios 21 Dias</h3>
                    <p className="text-gray-400 text-xs">1 aula por dia. Transformação garantida.</p>
                  </div>
                </motion.div>
              </div>
            </div>


          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="hidden lg:block lg:row-span-full lg:col-start-2 lg:row-start-1">
            <DashboardSidebar
              streakDays={gamificationStats?.streakDays ?? 0}
              userName={user?.name?.split(' ')[0] || 'Aluno'}
              isLoading={gamificationLoading}
              missionsContent={<MissoesDiarias compact />}
            />
          </div>
        </div>

      </main>

      {/* Notification Prompt */}
      <NotificationPrompt />
      <BuildBadge isAdmin={isAdmin} />
    </div>
  );
};

export default Dashboard;
