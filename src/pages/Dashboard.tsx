import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, Smartphone, Briefcase, DollarSign, Award, Bot, Calendar, Code, PieChart, BarChart3, Layers, Palette, Database } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import TrailCard from "@/components/TrailCard";
import { MissoesDiarias } from "@/components/gamification/MissoesDiarias";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { motion } from "framer-motion";
import { GamificationHeader } from "@/components/gamification/GamificationHeader";
import { useUserGamification } from "@/hooks/useUserGamification";
import { AnimatedStatCard } from "@/components/gamification/AnimatedStatCard";
import { CourseProgressCard } from "@/components/dashboard/CourseProgressCard";
import { PointsCard } from "@/components/dashboard/PointsCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

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
  
  // Estados para controle do scroll horizontal
  const [activeTrailIndex, setActiveTrailIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        navigate('/auth');
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
      navigate('/auth');
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

  const TRAIL_ICONS = {
    '🎓': GraduationCap,
    '📱': Smartphone,
    '💼': Briefcase,
    '💰': DollarSign,
  };

  const TRAIL_GRADIENTS: { [key: string]: string } = {
    'Fundamentos de IA': 'from-primary to-secondary',
    'IA no Dia a Dia': 'from-primary to-secondary',
    'IA nos Negócios': 'from-primary to-secondary',
    'Renda Extra com IA': 'from-primary to-secondary',
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
    2: 'Dia a Dia',
    3: 'Negócios',
    4: 'Renda Extra',
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] relative">
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          
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
                  <span className="text-xs sm:text-sm text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todas</span>
                </div>
                <div
                  className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
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

            {/* ===== SUAS TRILHAS ===== */}
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Suas Trilhas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trails.map((trail, index) => {
                  const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);
                  const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
                  const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';
                  const previousTrail = trails[index - 1];
                  const previousProgress = trailsProgressWithStatus.find((tp) => tp.trailId === previousTrail?.id);
                  const isNext = trailProgress?.status === 'locked' && previousProgress?.status === 'completed';

                  return (
                    <TrailCard
                      key={trail.id}
                      trail={trail}
                      Icon={Icon}
                      progress={trailProgress?.progress || 0}
                      completedLessons={trailProgress?.completedLessons || 0}
                      totalLessons={trailProgress?.totalLessons || 0}
                      status={trailProgress?.status || 'locked'}
                      gradient={gradient}
                      isNext={isNext}
                    />
                  );
                })}
              </div>
            </div>

            {/* ===== FOR YOU - Feature Cards ===== */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Para Você</h2>
                <span className="text-xs sm:text-sm text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Playground */}
                <div
                  onClick={() => navigate('/ai-playground')}
                  className="cursor-pointer group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="h-32 sm:h-36 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}
                  >
                    <div className="flex flex-col gap-1.5 w-3/4 max-w-[200px]">
                      <div className="self-start bg-indigo-100 rounded-lg rounded-bl-sm px-3 py-1.5">
                        <span className="text-[10px] text-indigo-600">Crie um resumo...</span>
                      </div>
                      <div className="self-end bg-white rounded-lg rounded-br-sm px-3 py-1.5 shadow-sm">
                        <span className="text-[10px] text-gray-500">Aqui está o resumo...</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1.5" style={{ background: '#6366F115', color: '#6366F1' }}>
                      IA
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">AI Playground</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Experimente IA em tempo real</p>
                  </div>
                </div>

                {/* Curso Renda Extra */}
                <div
                  onClick={canAccessAdmin ? () => navigate('/curso-exclusivo') : undefined}
                  className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                    canAccessAdmin ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-not-allowed opacity-60'
                  }`}
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="h-32 sm:h-36 flex items-end justify-center pb-4"
                    style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' }}
                  >
                    <div className="flex items-end gap-1.5 h-16">
                      {[30, 45, 35, 55, 70, 60, 80].map((h, i) => (
                        <div
                          key={i}
                          className="w-4 rounded-t-md"
                          style={{
                            height: `${h}%`,
                            background: `rgba(139, 92, 246, ${0.3 + i * 0.09})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1.5" style={{ background: '#8B5CF615', color: '#8B5CF6' }}>
                      {canAccessAdmin ? 'PREMIUM' : 'BLOQUEADO'}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Curso Renda Extra</h3>
                    <p className="text-gray-400 text-xs mt-0.5">R$ 10 mil a R$ 50 mil/mês com IA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => navigate('/leaderboard')}
                className="cursor-pointer bg-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, #EC4899, #F472B6)', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)' }}>
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Ranking Global</h3>
                  <p className="text-gray-400 text-xs">Compare-se com outros aprendizes</p>
                </div>
              </div>
              <div
                onClick={() => navigate('/achievements')}
                className="cursor-pointer bg-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}>
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Suas Conquistas</h3>
                  <p className="text-gray-400 text-xs">Desbloqueie badges e recompensas</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== MISSÕES DIÁRIAS (inside main content column) ===== */}
          <div className="mb-6 sm:mb-8 lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Missões Diárias</h2>
            <MissoesDiarias />
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
    </div>
  );
};

export default Dashboard;