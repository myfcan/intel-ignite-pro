import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, Smartphone, Briefcase, DollarSign, Award } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import TrailCard from "@/components/TrailCard";
import { TrailBand } from "@/components/TrailBand";
import { MissoesDiarias } from "@/components/gamification/MissoesDiarias";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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

  useEffect(() => {
    checkAuth();
  }, []);

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
      const progressData: TrailProgress[] = [];
      
      for (const trail of trailsData || []) {
        const lessonIds = lessonsByTrail.get(trail.id) || [];
        const totalLessons = lessonIds.length;
        
        // Count how many of this trail's lessons are completed
        const completedLessons = lessonIds.filter(id => completedLessonIds.has(id)).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Determine status
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Access Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Acessar Painel Admin
          </button>
        </div>

        {/* Hero Section - NOVO DESIGN */}
        <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white mb-6 sm:mb-8 overflow-hidden shadow-2xl"
             style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)'}}>
          {/* Textura overlay premium */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}
          />
          <div className="relative z-10">
            <p className="text-white/80 text-xs sm:text-sm uppercase tracking-wider mb-2">BEM-VINDO DE VOLTA!</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Olá, {user?.name}! 👋</h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg">
              Comece sua jornada de aprendizado em Inteligência Artificial
            </p>
          </div>
        </div>

        {/* Stats Cards - NOVO DESIGN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Sequência */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'}}>
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.streak_days || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Dias de sequência
                </p>
              </div>
            </div>
          </div>

          {/* Pontos */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-primary/30 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'}}>
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.total_points || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pontos totais
                </p>
              </div>
            </div>
          </div>

          {/* Aulas */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-accent/30 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'}}>
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.total_lessons_completed || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Aulas completas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trilhas Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 px-2 sm:px-0">Suas Trilhas</h2>
          <div className="space-y-4 sm:space-y-5">
            {trails.map((trail) => {
              const trailProgress = trailsProgress.find((tp) => tp.trailId === trail.id);
              const Icon = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
              const gradient = TRAIL_GRADIENTS[trail.title] || 'from-blue-400 to-purple-500';

              return (
                <TrailBand
                  key={trail.id}
                  trail={trail}
                  Icon={Icon}
                  progress={trailProgress?.progress || 0}
                  completedLessons={trailProgress?.completedLessons || 0}
                  totalLessons={trailProgress?.totalLessons || 0}
                  status={trailProgress?.status || 'locked'}
                  gradient={gradient}
                />
              );
            })}
          </div>
        </div>

        {/* Feature Cards - NOVO DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* AI Playground */}
          <div onClick={() => navigate('/ai-playground')}
               className="cursor-pointer relative group">
            {/* Borda gradiente no hover */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
            
            {/* Card content */}
            <div className="relative bg-white rounded-2xl p-4 sm:p-6 border-2 border-indigo-100">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">AI Playground</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                Experimente modelos de IA em tempo real. Teste prompts e veja os resultados instantaneamente.
              </p>
              <button className="text-indigo-500 font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                Começar agora 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Curso Renda Extra - LOCKED para não-admins */}
          <div 
            onClick={isAdmin ? () => navigate('/curso-exclusivo') : undefined}
            className={`relative rounded-2xl p-4 sm:p-6 text-white shadow-xl transition-all ${
              isAdmin 
                ? 'cursor-pointer hover:shadow-2xl' 
                : 'cursor-not-allowed opacity-60'
            }`}
            style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
            {/* Badge Premium ou Admin */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold">
                {isAdmin ? '👑 Acesso Admin' : '🔒 Premium'}
              </span>
            </div>
            
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold mb-2">Curso Renda Extra</h3>
            <p className="text-white/90 text-sm sm:text-base mb-3 sm:mb-4">
              Aprenda estratégias comprovadas para gerar de R$ 10 mil a R$ 50 mil por mês usando Inteligência Artificial.
            </p>
            <button className={`bg-white/20 backdrop-blur px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
              isAdmin ? 'hover:bg-white/30' : 'cursor-not-allowed'
            }`}>
              {isAdmin ? 'Ver curso →' : 'Em breve →'}
            </button>
          </div>
        </div>

        {/* Quick Actions - NOVO DESIGN */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div onClick={() => navigate('/leaderboard')}
                 className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border-l-4 border-pink-500 hover:shadow-lg hover:shadow-pink-500/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ranking Global</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Compare-se com outros aprendizes
              </p>
            </div>

            <div onClick={() => navigate('/achievements')}
                 className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Suas Conquistas</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Desbloqueie badges e recompensas
              </p>
            </div>
          </div>
        </div>

        {/* Missões Diárias Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 px-2 sm:px-0">Missões Diárias</h2>
          <MissoesDiarias />
        </div>

      </main>

      {/* Notification Prompt */}
      <NotificationPrompt />
    </div>
  );
};

export default Dashboard;