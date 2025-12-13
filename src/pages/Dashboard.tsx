import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, Smartphone, Briefcase, DollarSign, Award, Bot } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import TrailCard from "@/components/TrailCard";
import { TrailBand } from "@/components/TrailBand";
import { MissoesDiarias } from "@/components/gamification/MissoesDiarias";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { motion } from "framer-motion";
import { GamificationHeader } from "@/components/gamification/GamificationHeader";
import { useUserGamification } from "@/hooks/useUserGamification";
import { AnimatedStatCard } from "@/components/gamification/AnimatedStatCard";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [trailsProgress, setTrailsProgress] = useState<TrailProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);
  const { stats: gamificationStats, isLoading: gamificationLoading, refresh: refreshGamification } = useUserGamification();
  
  // Estados para controle do scroll horizontal
  const [activeTrailIndex, setActiveTrailIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Refresh gamification quando user for setado (garante dados atualizados)
  useEffect(() => {
    if (user?.id) {
      refreshGamification();
    }
  }, [user?.id]);

  // Recalcular progresso das trilhas quando isAdmin mudar (após loading)
  useEffect(() => {
    if (!adminLoading && user?.id && trails.length > 0 && trailsProgress.length > 0) {
      recalculateTrailsProgress();
    }
  }, [isAdmin, adminLoading, trails.length, trailsProgress.length]);

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

  // Função para recalcular apenas o status das trilhas (sem buscar dados novamente)
  const recalculateTrailsProgress = () => {
    if (trails.length === 0 || trailsProgress.length === 0) return;

    const updatedProgress = trailsProgress.map((tp, index) => {
      const trail = trails.find(t => t.id === tp.trailId);
      if (!trail) return tp;

      let status: 'active' | 'completed' | 'locked';
      if (tp.progress === 100) {
        status = 'completed';
      } else if (isAdmin) {
        // Admins têm acesso a todas as trilhas
        status = 'active';
      } else if (trail.order_index === 1) {
        // A primeira trilha sempre está desbloqueada
        status = 'active';
      } else {
        // Trilhas seguintes só desbloqueiam quando a anterior estiver completa
        const previousTrailProgress = trailsProgress[index - 1];
        status = previousTrailProgress?.progress === 100 ? 'active' : 'locked';
      }

      return { ...tp, status };
    });

    setTrailsProgress(updatedProgress);
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

  if (loading) {
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

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
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
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Acessar Painel Admin
          </button>
        </div>

        {/* Hero Section - PALETA PRINCIPAL COM DEGRADÊ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 overflow-hidden transition-all duration-300 mx-2 xs:mx-0"
          style={{
            background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)',
            border: '1px solid rgba(131, 123, 255, 0.3)',
            boxShadow: `
              0 4px 20px rgba(131, 123, 255, 0.2),
              0 0 40px rgba(131, 123, 255, 0.1)
            `
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '1px solid rgba(131, 123, 255, 0.6)';
            e.currentTarget.style.boxShadow = `
              0 8px 30px rgba(131, 123, 255, 0.3),
              0 0 60px rgba(131, 123, 255, 0.15)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid rgba(131, 123, 255, 0.3)';
            e.currentTarget.style.boxShadow = `
              0 4px 20px rgba(131, 123, 255, 0.2),
              0 0 40px rgba(131, 123, 255, 0.1)
            `;
          }}
        >
          {/* Textura de Pontos */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0'
            }}
          />
          
          <div className="relative z-10">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-purple-200 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2 font-semibold"
            >
              BEM-VINDO DE VOLTA
            </motion.p>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words"
              >
                Olá, {user?.name}
              </motion.h1>
              
              <motion.span
                className="text-xl xs:text-2xl sm:text-3xl md:text-4xl flex-shrink-0"
                animate={{ 
                  rotate: [0, 15, -15, 15, -15, 0],
                }}
                transition={{
                  delay: 1,
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
              >
                👋
              </motion.span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-purple-100 text-xs xs:text-sm sm:text-base md:text-lg leading-snug"
            >
              Comece sua jornada de aprendizado em Inteligência Artificial
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Cards - DESIGN SOFISTICADO COM SPARKLES */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 px-2 xs:px-0">
          <AnimatedStatCard
            value={gamificationStats?.streakDays ?? 0}
            label="Dias de sequência"
            icon={Flame}
            gradientFrom="#ec4899"
            gradientTo="#e11d48"
            delay={0.2}
            isLoading={gamificationLoading || !gamificationStats}
          />
          <AnimatedStatCard
            value={gamificationStats?.powerScore ?? 0}
            label="Power Score"
            icon={Trophy}
            gradientFrom="#6366f1"
            gradientTo="#9333ea"
            delay={0.35}
            isLoading={gamificationLoading || !gamificationStats}
          />
          <AnimatedStatCard
            value={gamificationStats?.lessonsCompleted ?? 0}
            label="Aulas completas"
            icon={BookOpen}
            gradientFrom="#10b981"
            gradientTo="#0891b2"
            delay={0.5}
            isLoading={gamificationLoading || !gamificationStats}
          />
        </div>

        {/* Trilhas Section - SCROLL HORIZONTAL NO MOBILE */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2 xs:px-1 sm:px-0">Suas Trilhas</h2>
          
          {/* Mobile: Scroll Horizontal com Snap e Indicadores */}
          <div className="md:hidden relative px-4">
            {/* Container com scroll */}
            <div 
              ref={scrollRef}
              className="overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-4 px-4"
              onScroll={(e) => {
                const element = e.currentTarget;
                const scrollLeft = element.scrollLeft;
                const cardWidth = element.scrollWidth / trails.length;
                const newIndex = Math.round(scrollLeft / cardWidth);
                setActiveTrailIndex(newIndex);
              }}
            >
              <div className="flex gap-4 pb-2">
                {trails.map((trail, index) => {
                  const trailProgress = trailsProgress.find((tp) => tp.trailId === trail.id);
                  const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
                  const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';
                  
                  const previousTrail = trails[index - 1];
                  const previousProgress = trailsProgress.find((tp) => tp.trailId === previousTrail?.id);
                  const isNext = trailProgress?.status === 'locked' && previousProgress?.status === 'completed';
                  
                  const estimatedTime = trailProgress?.totalLessons ? trailProgress.totalLessons * 8 : 45;

                  return (
                    <div key={trail.id} className="snap-center flex-shrink-0 w-[calc(100vw-48px)] max-w-[380px]">
                      <TrailCard
                        trail={trail}
                        Icon={Icon}
                        progress={trailProgress?.progress || 0}
                        completedLessons={trailProgress?.completedLessons || 0}
                        totalLessons={trailProgress?.totalLessons || 0}
                        status={trailProgress?.status || 'locked'}
                        gradient={gradient}
                        estimatedTime={estimatedTime}
                        isNext={isNext}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Indicadores (dots) - atualizam dinamicamente */}
            <div className="flex justify-center gap-1.5 mt-4">
              {trails.map((trail, index) => (
                <button
                  key={trail.id}
                  onClick={() => {
                    if (scrollRef.current) {
                      const cardWidth = scrollRef.current.scrollWidth / trails.length;
                      scrollRef.current.scrollTo({
                        left: cardWidth * index,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: index === activeTrailIndex ? '20px' : '6px',
                    backgroundColor: index === activeTrailIndex ? '#837BFF' : '#E0E0E0'
                  }}
                  aria-label={`Ir para ${trail.title}`}
                />
              ))}
            </div>
            
            {/* Hint inicial - aparece apenas na primeira vez */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 0, x: 20 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="bg-primary/90 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 backdrop-blur-sm">
                Arraste →
              </div>
            </motion.div>
          </div>

          {/* Desktop: Grid Normal */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
            {trails.map((trail, index) => {
              const trailProgress = trailsProgress.find((tp) => tp.trailId === trail.id);
              const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
              const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';
              
              const previousTrail = trails[index - 1];
              const previousProgress = trailsProgress.find((tp) => tp.trailId === previousTrail?.id);
              const isNext = trailProgress?.status === 'locked' && previousProgress?.status === 'completed';
              
              const estimatedTime = trailProgress?.totalLessons ? trailProgress.totalLessons * 8 : 45;

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
                  estimatedTime={estimatedTime}
                  isNext={isNext}
                />
              );
            })}
          </div>
        </div>

        {/* Feature Cards - NOVO DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-2 xs:px-0">
          {/* AI Playground */}
          <div onClick={() => navigate('/ai-playground')}
               className="cursor-pointer relative group overflow-hidden">
            {/* Borda gradiente no hover */}
            <div className="absolute -inset-0.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-40 transition duration-300 blur-sm"></div>
            
            {/* Card content */}
            <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                   backgroundImage: `
                     linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                     radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                   `,
                   backgroundSize: 'cover, 16px 16px',
                   backgroundPosition: 'center, 0 0',
                   borderColor: 'rgba(99, 102, 241, 0.3)',
                 }}>
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 mb-3 sm:mb-4 flex-shrink-0" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 break-words">AI Playground</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2">
                Experimente modelos de IA em tempo real. Teste prompts e veja os resultados instantaneamente.
              </p>
              <button className="text-indigo-500 font-semibold flex items-center gap-2 hover:gap-3 transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                Começar agora 
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Curso Renda Extra - DARK TECH DESIGN */}
          <div 
            onClick={isAdmin ? () => navigate('/curso-exclusivo') : undefined}
            className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-xl transition-all ${
              isAdmin 
                ? 'cursor-pointer hover:-translate-y-1' 
                : 'cursor-not-allowed opacity-60'
            }`}
            style={{
              background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: `
                0 0 40px rgba(139, 92, 246, 0.15),
                0 0 80px rgba(139, 92, 246, 0.08),
                inset 0 0 60px rgba(139, 92, 246, 0.05)
              `
            }}
          >
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Purple Gradient Overlay at Bottom */}
            <div 
              className="absolute inset-x-0 bottom-0 h-24 opacity-50 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(139, 92, 246, 0.5) 0%, transparent 100%)'
              }}
            />
            
            {/* Badge Premium ou Admin */}
            <div className="absolute top-4 right-4 z-10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-2"
                 style={{
                   background: 'rgba(139, 92, 246, 0.2)',
                   border: '1px solid rgba(139, 92, 246, 0.4)'
                 }}>
              <span className="text-xs sm:text-sm font-bold text-purple-300 whitespace-nowrap">
                {isAdmin ? '👑 Acesso Admin' : '🔒 Premium'}
              </span>
            </div>
            
            <div className="relative z-10">
              <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 text-purple-400 flex-shrink-0" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-100 break-words">Curso Renda Extra</h3>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2">
                Aprenda estratégias comprovadas para gerar de R$ 10 mil a R$ 50 mil por mês usando Inteligência Artificial.
              </p>
              <button 
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all whitespace-nowrap ${
                  isAdmin ? 'hover:bg-purple-500/30' : 'cursor-not-allowed'
                }`}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#A78BFA'
                }}
              >
                {isAdmin ? 'Ver curso →' : 'Em breve →'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - NOVO DESIGN */}
        <div className="mb-6 sm:mb-8 px-2 xs:px-0">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 px-2 xs:px-1 sm:px-0">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div onClick={() => navigate('/leaderboard')}
                 className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-l-4 border-pink-500 hover:shadow-lg hover:shadow-pink-500/30 transition-all cursor-pointer border overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                   backgroundImage: `
                     linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                     radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                   `,
                   backgroundSize: 'cover, 16px 16px',
                   backgroundPosition: 'center, 0 0',
                   borderColor: 'rgba(236, 72, 153, 0.3)',
                 }}>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 flex-shrink-0" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base break-words">Ranking Global</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-1">
                Compare-se com outros aprendizes
              </p>
            </div>

            <div onClick={() => navigate('/achievements')}
                 className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                   boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)'
                 }}>
              <div className="relative z-10 flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                <h3 className="font-bold text-white text-sm sm:text-base break-words">Suas Conquistas</h3>
              </div>
              <p className="relative z-10 text-white/90 text-xs sm:text-sm line-clamp-1">
                Desbloqueie badges e recompensas
              </p>
            </div>
          </div>
        </div>

        {/* Missões Diárias Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2 xs:px-1 sm:px-0">Missões Diárias</h2>
          <MissoesDiarias />
        </div>

      </main>

      {/* Notification Prompt */}
      <NotificationPrompt />
    </div>
  );
};

export default Dashboard;