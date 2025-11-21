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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando seu dashboard...</p>
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
    'Fundamentos de IA': 'from-blue-400 via-indigo-400 to-purple-500',
    'IA no Dia a Dia': 'from-cyan-400 via-teal-400 to-blue-500',
    'IA nos Negócios': 'from-purple-400 via-pink-400 to-rose-500',
    'Renda Extra com IA': 'from-emerald-400 via-teal-400 to-cyan-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500 
                      rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 shadow-2xl">
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                 }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl flex items-center justify-center border-4 border-white/50">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 uppercase tracking-wide">
                  Bem-vindo de volta!
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 text-balance">
                  Olá, {user?.name || 'Estudante'}! 👋
                </h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl font-normal">
                  Comece sua jornada de aprendizado em Inteligência Artificial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row - Logo abaixo do hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Sequência */}
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-lg">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{user?.streak_days || 0}</p>
                  <p className="text-xs text-slate-600">Dias de sequência</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pontos */}
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{user?.total_points || 0}</p>
                  <p className="text-xs text-slate-600">Pontos totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aulas */}
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-400 via-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{user?.total_lessons_completed || 0}</p>
                  <p className="text-xs text-slate-600">Aulas completas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trilhas Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 px-2 sm:px-0">Suas Trilhas</h2>
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

        {/* Quick Actions - Hidden on mobile, shown above stats */}
        <div className="hidden md:grid grid-cols-2 gap-4 mb-6">
          <Card 
            className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/leaderboard')}
          >
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <CardTitle className="text-lg font-bold mb-0.5">Ranking Global</CardTitle>
                  <p className="text-white/90 text-xs">Compare-se com outros</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/gamification')}
          >
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <CardTitle className="text-lg font-bold mb-0.5">Suas Conquistas</CardTitle>
                  <p className="text-white/90 text-xs">Desbloqueie badges</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Missões Diárias Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 px-2 sm:px-0">Missões Diárias</h2>
          <MissoesDiarias />
        </div>

      </main>

      {/* Notification Prompt */}
      <NotificationPrompt />
    </div>
  );
};

export default Dashboard;