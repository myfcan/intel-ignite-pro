import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, Smartphone, Briefcase, DollarSign, Award, Bot, Calendar, Code, PieChart, BarChart3, Layers, Palette, Database, Brain, Zap, TrendingUp, Rocket, Target, Sparkles, Crown, Gem } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import TrailCard from "@/components/TrailCard";
import { V8TrailCard } from "@/components/lessons/v8/V8TrailCard";
import { MissoesDiarias } from "@/components/gamification/MissoesDiarias";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { motion, AnimatePresence } from "framer-motion";
import { GamificationHeader } from "@/components/gamification/GamificationHeader";
import { useUserGamification } from "@/hooks/useUserGamification";
import { AnimatedStatCard } from "@/components/gamification/AnimatedStatCard";
import { CourseProgressCard } from "@/components/dashboard/CourseProgressCard";
import { PointsCard } from "@/components/dashboard/PointsCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { BuildBadge } from "@/components/BuildBadge";
import { DASHBOARD_LAYOUT_ID, logRuntimeSignature } from "@/lib/runtimeSignature";

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

// Dashboard component - main user dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [trailsProgress, setTrailsProgress] = useState<TrailProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, canAccessAdmin, loading: adminLoading } = useIsAdmin(user?.id);
  const { stats: gamificationStats, isLoading: gamificationLoading, refresh: refreshGamification } = useUserGamification();
  
  // Separar trilhas V7 e V8
  const v7Trails = trails.filter(t => t.trail_type !== 'v8');
  const v8Trails = trails.filter(t => t.trail_type === 'v8');

  // Paginação das trilhas V7 (6 por página = 2 linhas de 3)
  const [trailPage, setTrailPage] = useState(0);
  const TRAILS_PER_PAGE = 6;
  const totalTrailPages = Math.max(1, Math.ceil(v7Trails.length / TRAILS_PER_PAGE));
  const visibleTrails = v7Trails.slice(trailPage * TRAILS_PER_PAGE, (trailPage + 1) * TRAILS_PER_PAGE);
  const totalV8Trails = v8Trails.length;

  // Snap carousel: refs e estado do card ativo
  const snapScrollerRef = useRef<HTMLDivElement | null>(null);
  const snapItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [snapActiveIndex, setSnapActiveIndex] = useState(0);

  // IntersectionObserver para detectar card ativo (>=60% visível)
  useEffect(() => {
    const root = snapScrollerRef.current;
    if (!root || v7Trails.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.snapIndex);
          if (Number.isNaN(idx)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { idx, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.6) {
          setSnapActiveIndex(best.idx);
        }
      },
      {
        root,
        threshold: [0.35, 0.45, 0.55, 0.6, 0.7, 0.85],
      }
    );

    snapItemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [v7Trails]);

  const scrollToSnapIndex = (idx: number) => {
    const el = snapItemRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  useEffect(() => {
    logRuntimeSignature({ route: '/dashboard', layoutId: DASHBOARD_LAYOUT_ID });
    checkAuth();
  }, []);


  // REMOVIDO: refreshGamification duplicado que causava múltiplos fetches
  // O useUserGamification já faz fetch automaticamente via onAuthStateChange

  // CRITICAL FIX: useMemo recalcula quando isAdmin muda
  // Isso garante que as trilhas são recalculadas APÓS admin status ser confirmado
  const trailsProgressWithStatus = useMemo(() => {
    console.log('[Dashboard] Recalculando trailsProgressWithStatus. isAdmin:', isAdmin, 'adminLoading:', adminLoading);
    
    return trailsProgress.map((tp, index) => {
      const trail = trails.find(t => t.id === tp.trailId);
      if (!trail) return tp;

      let status: 'active' | 'completed' | 'locked';
      if (tp.progress === 100) {
        status = 'completed';
      } else if (isAdmin) {
        // Admin tem acesso a todas as trilhas
        console.log('[Dashboard] Admin bypass - trilha desbloqueada:', trail.title);
        status = 'active';
      } else if (trail.order_index === 1) {
        // Primeira trilha sempre desbloqueada
        status = 'active';
      } else {
        // Trilhas seguintes dependem da anterior
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

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }

      // If user doesn't exist, create automatically
      if (!userData) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
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
        setUser(newUser);
        // Fetch trails immediately after setting user
        await fetchTrailsWithProgress(newUser.id);
      } else {
        setUser(userData);
        // Fetch trails immediately after setting user
        await fetchTrailsWithProgress(userData.id);
      }
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
      // Fetch all trails
      const { data: trailsData, error: trailsError } = await supabase
        .from('trails')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (trailsError) throw trailsError;
      setTrails(trailsData || []);

      // OPTIMIZATION: Fetch all data with only 2 queries instead of N queries per trail
      // 1. Fetch all active lessons at once
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, trail_id')
        .eq('is_active', true);

      // 2. Fetch all user progress at once
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Create a map of completed lesson IDs for fast lookup
      const completedLessonIds = new Set(allProgress?.map(p => p.lesson_id) || []);

      // Group lessons by trail_id in memory
      const lessonsByTrail = new Map<string, string[]>();
      allLessons?.forEach(lesson => {
        if (!lessonsByTrail.has(lesson.trail_id)) {
          lessonsByTrail.set(lesson.trail_id, []);
        }
        lessonsByTrail.get(lesson.trail_id)!.push(lesson.id);
      });

      // Calculate progress for each trail in memory
      // NOTE: Usamos isAdmin diretamente aqui, mas será recalculado no useEffect quando isAdmin mudar
      const progressData: TrailProgress[] = [];
      
      for (const trail of trailsData || []) {
        const lessonIds = lessonsByTrail.get(trail.id) || [];
        const totalLessons = lessonIds.length;
        
        // Count how many of this trail's lessons are completed
        const completedLessons = lessonIds.filter(id => completedLessonIds.has(id)).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Determine status - inicialmente sem considerar isAdmin (será recalculado)
        let status: 'active' | 'completed' | 'locked';
        if (progress === 100) {
          status = 'completed';
        } else if (trail.order_index === 1) {
          // A primeira trilha sempre está desbloqueada
          status = 'active';
        } else {
          // Trilhas seguintes só desbloqueiam quando a anterior estiver completa
          const previousTrailProgress = progressData[progressData.length - 1];
          status = previousTrailProgress?.status === 'completed' ? 'active' : 'locked';
        }

        progressData.push({
          trailId: trail.id,
          completedLessons,
          totalLessons,
          progress,
          status
        });
      }

      setTrailsProgress(progressData);
    } catch (error: any) {
      console.error('Error fetching trails with progress:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Esperar loading do dashboard E do status de admin
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

  const TRAIL_GRADIENTS: { [key: string]: string } = {
    'Fundamentos IA': 'from-indigo-500 to-indigo-600',
    'Domando as IAs nos Negócios': 'from-violet-500 to-violet-600',
    'Dominando Copyright Com IA': 'from-purple-500 to-purple-600',
    'Renda Extra com IA': 'from-yellow-500 to-yellow-600',
    'IA para Profissionais': 'from-blue-500 to-blue-600',
    'Expert em vendas com IA': 'from-pink-500 to-pink-600',
    'Dominando as IAs Avançado': 'from-amber-500 to-orange-600',
    'Vibe Code: Criando Apps com IA': 'from-emerald-500 to-teal-600',
  };

  // Find active trail for CourseProgressCard
  const activeTrail = trails.find((trail, index) => {
    const tp = trailsProgressWithStatus.find(p => p.trailId === trail.id);
    return tp && tp.status === 'active' && tp.progress < 100;
  });
  const activeTrailProgress = activeTrail
    ? trailsProgressWithStatus.find(p => p.trailId === activeTrail.id)
    : null;

  const TRAIL_CATEGORY_MAP: Record<number, string> = {
    1: 'Fundamentos',
    2: 'Profissionais',
    3: 'Negócios',
    4: 'Copyright',
    5: 'Renda Extra',
    6: 'Vendas',
  };

  return (
    <div className="min-h-screen relative" data-layout-id={DASHBOARD_LAYOUT_ID} style={{ background: 'linear-gradient(180deg, #F0F1F5 0%, #E8E9EF 50%, #F0F1F5 100%)' }}>
      <DashboardHeader user={user!} />
      
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
            {/* ===== PURPLE HERO BANNER - Only text + CTAs + floating icons ===== */}
            <div
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #7C3AED 100%)',
                boxShadow: '0 12px 40px -8px rgba(108, 99, 255, 0.3)',
                minHeight: '180px',
              }}
            >
              {/* Floating Icon Badges */}
              {[
                { Icon: Code, bg: '#F97316', right: '8%', top: '10%', size: 48, delay: 0 },
                { Icon: Database, bg: '#0EA5E9', right: '22%', top: '5%', size: 40, delay: 0.1 },
                { Icon: PieChart, bg: '#8B5CF6', right: '15%', top: '40%', size: 36, delay: 0.2 },
                { Icon: Palette, bg: '#EC4899', right: '5%', top: '50%', size: 44, delay: 0.3 },
                { Icon: Layers, bg: '#10B981', right: '25%', top: '65%', size: 40, delay: 0.15 },
                { Icon: BarChart3, bg: '#1E40AF', right: '12%', top: '75%', size: 36, delay: 0.25 },
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
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                >
                  Pronto para aprender?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-purple-200 text-sm sm:text-base mb-5 leading-relaxed"
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

            {/* ===== 4 STAT CARDS - White, outside hero ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

            {/* ===== CONTINUE LEARNING ===== */}
            {activeTrail && activeTrailProgress && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Continue Aprendendo</h2>
                  <span onClick={() => document.getElementById('suas-trilhas')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs sm:text-sm text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todas</span>
                </div>
                <div
                  className="bg-white rounded-2xl p-5 sm:p-7 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)', minHeight: '120px' }}
                  onClick={() => navigate(`/trail/${activeTrail.id}`)}
                >
                  {/* Colored icon area (acts as thumbnail) */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center flex-shrink-0"
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold mb-1"
                      style={{ background: '#6366F115', color: '#6366F1' }}
                    >
                      {TRAIL_CATEGORY_MAP[activeTrail.order_index] || 'Curso'}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{activeTrail.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Próximo módulo: Aula {activeTrailProgress.completedLessons + 1}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-xs">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#6366F1' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${activeTrailProgress.progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex-shrink-0 hover:-translate-y-0.5 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ===== CONQUISTAR E CRESCER (V7) ===== */}
            {v7Trails.length > 0 && (
            <motion.div
              id="suas-trilhas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-6 rounded-3xl p-5 sm:p-7 md:p-8"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 40%, #818CF8 100%)',
                boxShadow: '0 16px 48px -12px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Conquistar e Crescer</h2>
                {/* Pagination arrows - hidden on mobile, visible on sm+ */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setTrailPage(p => Math.max(0, p - 1))}
                    disabled={trailPage === 0}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${trailPage === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/15'}`}
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setTrailPage(p => Math.min(totalTrailPages - 1, p + 1))}
                    disabled={trailPage >= totalTrailPages - 1}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${trailPage >= totalTrailPages - 1 ? 'text-white/30 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/15'}`}
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  >
                    ›
                  </button>
                  <span className="text-xs text-white/60 font-medium ml-1">
                    {trailPage + 1}/{totalTrailPages}
                  </span>
                </div>
              </div>

              {/* Mobile: Premium Snap Carousel */}
              <div className="sm:hidden">
                <style>{`
                  .snap-carousel { scrollbar-width: none; -ms-overflow-style: none; }
                  .snap-carousel::-webkit-scrollbar { display: none; }
                  @media (prefers-reduced-motion: reduce) {
                    .snap-item { transition: none !important; }
                  }
                `}</style>
                <div
                  ref={snapScrollerRef}
                  className="snap-carousel flex gap-4 overflow-x-auto overflow-y-hidden pb-5"
                  style={{
                    scrollSnapType: 'x mandatory',
                    scrollPaddingLeft: 20,
                    scrollPaddingRight: 20,
                    padding: '0 20px 20px 20px',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehaviorX: 'contain',
                    touchAction: 'pan-x',
                  }}
                  aria-label="Carrossel de trilhas"
                >
                  {v7Trails.map((trail, idx) => {
                    const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);
                    const isActive = idx === snapActiveIndex;
                    return (
                      <div
                        key={trail.id}
                        ref={(el) => { snapItemRefs.current[idx] = el; }}
                        data-snap-index={idx}
                        className="snap-item relative flex-shrink-0"
                        style={{
                          scrollSnapAlign: 'center',
                          scrollSnapStop: 'always',
                          flex: '0 0 78%',
                          maxWidth: 340,
                          transform: isActive ? 'scale(1)' : 'scale(0.94)',
                          filter: isActive ? 'saturate(1)' : 'saturate(0.92)',
                          opacity: isActive ? 1 : 0.96,
                          transition: 'transform 220ms ease, filter 220ms ease, opacity 220ms ease',
                        }}
                      >
                        <TrailCard
                          trail={trail}
                          Icon={BookOpen}
                          gradient="from-indigo-500 to-violet-500"
                          progress={trailProgress?.progress || 0}
                          completedLessons={trailProgress?.completedLessons || 0}
                          totalLessons={trailProgress?.totalLessons || 0}
                          status={trailProgress?.status || "locked"}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  {v7Trails.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToSnapIndex(idx)}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: idx === snapActiveIndex ? 10 : 7,
                        height: idx === snapActiveIndex ? 10 : 7,
                        background: idx === snapActiveIndex
                          ? 'rgba(99,102,241,1)'
                          : 'rgba(148,163,184,0.45)',
                        transform: idx === snapActiveIndex ? 'scale(1.15)' : 'scale(1)',
                      }}
                      aria-label={`Ir para trilha ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop/Tablet: paginated grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={trailPage}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
              {visibleTrails.map((trail) => {
                    const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);

                    return (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        Icon={BookOpen}
                        gradient="from-indigo-500 to-violet-500"
                        progress={trailProgress?.progress || 0}
                        completedLessons={trailProgress?.completedLessons || 0}
                        totalLessons={trailProgress?.totalLessons || 0}
                        status={trailProgress?.status || "locked"}
                      />
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            )}

            {/* ===== SEU CAMINHO DE MAESTRIA (V8) ===== */}
            {v8Trails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-6 rounded-3xl p-5 sm:p-7 md:p-8"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)',
                boxShadow: '0 16px 48px -12px rgba(30, 27, 75, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Seu Caminho de Maestria</h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                  READ & LISTEN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {v8Trails.map((trail) => {
                  const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);
                  return (
                    <V8TrailCard
                      key={trail.id}
                      trailId={trail.id}
                      title={trail.title}
                      description={trail.description}
                      icon={trail.icon}
                      lessonCount={trailProgress?.totalLessons || 0}
                      completedCount={trailProgress?.completedLessons || 0}
                    />
                  );
                })}
              </div>
            </motion.div>
            )}

            {/* ===== FOR YOU - Feature Cards ===== */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Para Você</h2>
                <span onClick={() => document.getElementById('suas-trilhas')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs sm:text-sm text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todos</span>
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
                    {/* Glow orbs */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', top: '-10%', left: '10%' }} />
                      <div className="absolute w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', bottom: '5%', right: '15%' }} />
                    </div>
                    {/* Chat illustration */}
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
                    {/* Glow orbs */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)', top: '-15%', right: '10%' }} />
                      <div className="absolute w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)', bottom: '0%', left: '15%' }} />
                    </div>
                    {/* 21 with flame */}
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

            {/* Quick Actions */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                onClick={() => navigate('/leaderboard')}
                className="cursor-pointer bg-white rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-1 group"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div className="rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                     style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)' }}>
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ranking Global</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Compare-se com outros aprendizes</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                onClick={() => navigate('/achievements')}
                className="cursor-pointer bg-white rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-1 group"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div className="rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                     style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)' }}>
                  <Gem className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Suas Conquistas</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Desbloqueie badges e recompensas</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="hidden lg:block lg:row-span-full lg:col-start-2 lg:row-start-1">
            <DashboardSidebar
              streakDays={gamificationStats?.streakDays ?? 0}
              userName={user?.name?.split(' ')[0] || 'Aluno'}
              isLoading={gamificationLoading}
            />
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="lg:hidden mb-6">
          <DashboardSidebar
            streakDays={gamificationStats?.streakDays ?? 0}
            userName={user?.name?.split(' ')[0] || 'Aluno'}
            isLoading={gamificationLoading}
          />
        </div>

      </main>

      {/* Notification Prompt */}
      <NotificationPrompt />
      <BuildBadge isAdmin={isAdmin} />
    </div>
  );
};

export default Dashboard;