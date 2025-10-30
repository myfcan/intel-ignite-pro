import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, BookOpen, GraduationCap, Smartphone, Briefcase, DollarSign } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import TrailCard from "@/components/TrailCard";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTrails();
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
        .single();

      if (error) throw error;
      setUser(userData);
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

  const fetchTrails = async () => {
    try {
      const { data, error } = await supabase
        .from('trails')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setTrails(data || []);
    } catch (error: any) {
      console.error('Error fetching trails:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
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
    'Fundamentos de IA': 'from-blue-500 to-indigo-600',
    'IA no Dia a Dia': 'from-cyan-500 to-blue-500',
    'IA nos Negócios': 'from-purple-500 to-pink-500',
    'Renda Extra com IA': 'from-green-500 to-emerald-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader user={user!} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-400 to-pink-400 
                      rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                 }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-cyan-100 text-sm font-semibold mb-2 uppercase tracking-wide">
                  Bem-vindo de volta!
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Continue sua jornada de aprendizado
                </h2>
                <p className="text-cyan-50 text-lg max-w-2xl">
                  Escolha uma trilha abaixo para começar a aprender sobre Inteligência Artificial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Sequência */}
          <Card className="border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-400
                              flex items-center justify-center shadow-soft">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{user?.streak_days || 0}</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Dias de sequência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Continue assim! 🔥</p>
            </CardContent>
          </Card>

          {/* Pontos */}
          <Card className="border-2 border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400
                              flex items-center justify-center shadow-soft">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{user?.total_points || 0}</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Pontos totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Continue aprendendo!</p>
            </CardContent>
          </Card>

          {/* Aulas */}
          <Card className="border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400
                              flex items-center justify-center shadow-soft">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{user?.total_lessons_completed || 0}</span>
              </div>
              <CardTitle className="text-base font-medium text-gray-600">Aulas completas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Muito bem!</p>
            </CardContent>
          </Card>
        </div>

        {/* Trilhas */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Suas Trilhas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trails.map((trail, index) => {
              const IconComponent = TRAIL_ICONS[trail.icon as keyof typeof TRAIL_ICONS] || GraduationCap;
              const gradient = TRAIL_GRADIENTS[trail.title] || 'from-gray-500 to-gray-600';
              const status = index === 0 ? 'active' : index === 1 ? 'locked' : 'locked';
              
              return (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  Icon={IconComponent}
                  progress={index === 0 ? 20 : 0}
                  completedLessons={index === 0 ? 1 : 0}
                  totalLessons={5}
                  status={status}
                  gradient={gradient}
                />
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;