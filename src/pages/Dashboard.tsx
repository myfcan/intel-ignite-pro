import { useEffect, useState, useRef, useMemo } from "react";
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
import { DashboardBackground3D } from "@/components/backgrounds";

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

  return (
    <div className="min-h-screen bg-[#FAFBFC] relative">
      {/* 3D Background */}
      <DashboardBackground3D />
      
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
        
        {/* Admin Access Button - só visível para admin/supervisor */}
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

        {/* Hero Section - PALETA PRINCIPAL COM DEGRADÊ */}
        <motion.div 
          initial={{ opacity: 0, y: 20, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          whileHover={{ 
            scale: 1.02, 
            rotateX: -2,
            rotateY: 2,
            transition: { duration: 0.3 }
          }}
          className="relative rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 overflow-hidden mx-2 xs:mx-0"
          style={{
            background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 50%, #9333ea 100%)',
            border: '1px solid rgba(167, 139, 250, 0.4)',
            boxShadow: `
              0 25px 50px -12px rgba(131, 123, 255, 0.4),
              0 0 60px rgba(147, 51, 234, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {/* Animated Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/30"
                style={{
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Glowing Orbs for 3D depth */}
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.div 
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, transparent 70%)',
              filter: 'blur(15px)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          {/* Textura de Pontos - Enhanced */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0',
              opacity: 0.8
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
                  const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);
                  const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
                  const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';
                  
                  const previousTrail = trails[index - 1];
                  const previousProgress = trailsProgressWithStatus.find((tp) => tp.trailId === previousTrail?.id);
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
              const trailProgress = trailsProgressWithStatus.find((tp) => tp.trailId === trail.id);
              const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
              const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';
              
              const previousTrail = trails[index - 1];
              const previousProgress = trailsProgressWithStatus.find((tp) => tp.trailId === previousTrail?.id);
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

        {/* Feature Cards - MODERN DARK STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-2 xs:px-0">
          {/* AI Playground */}
          <div 
            onClick={() => navigate('/ai-playground')}
            className="cursor-pointer group relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 50%, #1E1B2E 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {/* Decorative illustration area */}
            <div className="relative h-36 sm:h-44 overflow-hidden flex items-center justify-center">
              {/* Abstract chat UI mockup */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              }} />
              <div className="relative flex flex-col gap-2 w-3/4 max-w-[260px]">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="self-start bg-indigo-500/20 border border-indigo-500/30 rounded-xl rounded-bl-sm px-3 py-2"
                >
                  <span className="text-[10px] sm:text-xs text-indigo-300">Crie um resumo do artigo...</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="self-end bg-white/10 border border-white/10 rounded-xl rounded-br-sm px-3 py-2"
                >
                  <span className="text-[10px] sm:text-xs text-gray-400">Aqui está o resumo...</span>
                </motion.div>
              </div>
            </div>
            
            {/* Card info */}
            <div className="p-4 sm:p-5 pt-2 sm:pt-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}>
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">AI Playground</h3>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Experimente modelos de IA em tempo real com resultados instantâneos
              </p>
            </div>
            
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl" style={{
              boxShadow: 'inset 0 0 30px rgba(99, 102, 241, 0.1), 0 8px 30px rgba(99, 102, 241, 0.15)',
            }} />
          </div>

          {/* Curso Renda Extra */}
          <div 
            onClick={canAccessAdmin ? () => navigate('/curso-exclusivo') : undefined}
            className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
              canAccessAdmin ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-60'
            }`}
            style={{
              background: 'linear-gradient(145deg, #1E1B2E 0%, #2A1F3D 50%, #1E1B2E 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {/* Decorative illustration area */}
            <div className="relative h-36 sm:h-44 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 70% 40%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
              }} />
              {/* Abstract money/growth mockup */}
              <div className="relative flex items-end gap-2 h-20">
                {[40, 55, 45, 65, 80, 70, 90].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5, type: 'spring' }}
                    className="w-4 sm:w-5 rounded-t-md"
                    style={{
                      background: `linear-gradient(to top, rgba(139, 92, 246, ${0.3 + i * 0.08}), rgba(139, 92, 246, ${0.6 + i * 0.05}))`,
                    }}
                  />
                ))}
              </div>
              
              {/* Badge */}
              <div className="absolute top-3 right-3 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5"
                   style={{
                     background: 'rgba(139, 92, 246, 0.15)',
                     border: '1px solid rgba(139, 92, 246, 0.3)',
                   }}>
                <span className="text-[10px] sm:text-xs font-semibold text-purple-300">
                  {canAccessAdmin ? '👑 Admin' : '🔒 Premium'}
                </span>
              </div>
            </div>
            
            {/* Card info */}
            <div className="p-4 sm:p-5 pt-2 sm:pt-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                }}>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Curso Renda Extra</h3>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Estratégias para gerar de R$ 10 mil a R$ 50 mil/mês com IA
              </p>
            </div>
            
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl" style={{
              boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1), 0 8px 30px rgba(139, 92, 246, 0.15)',
            }} />
          </div>
        </div>

        {/* Quick Actions - MODERN STYLE */}
        <div className="mb-6 sm:mb-8 px-2 xs:px-0">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 px-2 xs:px-1 sm:px-0">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Ranking */}
            <div 
              onClick={() => navigate('/leaderboard')}
              className="cursor-pointer group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #1E1B2E 0%, #2D2640 100%)',
                border: '1px solid rgba(236, 72, 153, 0.15)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            >
              <div className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                }}>
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base">Ranking Global</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">Compare-se com outros aprendizes</p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                boxShadow: 'inset 0 0 20px rgba(236, 72, 153, 0.08)',
              }} />
            </div>

            {/* Conquistas */}
            <div 
              onClick={() => navigate('/achievements')}
              className="cursor-pointer group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                boxShadow: '0 4px 20px rgba(147, 51, 234, 0.25)',
              }}
            >
              <div className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base">Suas Conquistas</h3>
                  <p className="text-white/80 text-xs sm:text-sm truncate">Desbloqueie badges e recompensas</p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)',
              }} />
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