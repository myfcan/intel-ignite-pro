import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Flame, Trophy, BookOpen, Zap, Lock } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const interactionsRemaining = user ? user.daily_interaction_limit - user.interactions_used_today : 0;
  const interactionsPercentage = user ? (interactionsRemaining / user.daily_interaction_limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                IA
              </div>
              <div>
                <h1 className="text-xl font-bold">Olá, {user?.name}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sequência</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user?.streak_days || 0} dias</div>
              <p className="text-xs text-muted-foreground mt-1">Continue assim! 🔥</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
              <Trophy className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Continue aprendendo!</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aulas Completas</CardTitle>
              <BookOpen className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user?.total_lessons_completed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Muito bem!</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Interactions Card */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Interações com IA Hoje
                </CardTitle>
                <CardDescription>
                  Plano: <Badge variant="secondary">{user?.plan}</Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{interactionsRemaining}</div>
                <div className="text-sm text-muted-foreground">restantes</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={interactionsPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {user?.interactions_used_today}/{user?.daily_interaction_limit} interações usadas
            </p>
          </CardContent>
        </Card>

        {/* Trails Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Trilhas de Aprendizado</h2>
          <p className="text-muted-foreground">Escolha uma trilha para começar sua jornada</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trails.map((trail) => (
            <Card 
              key={trail.id} 
              className="hover:shadow-medium transition-smooth cursor-pointer group"
              onClick={() => toast({
                title: "Em breve!",
                description: `A trilha "${trail.title}" estará disponível em breve.`,
              })}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-3xl mb-4">
                    {trail.icon}
                  </div>
                  {trail.order_index > 1 && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-smooth">
                  {trail.title}
                </CardTitle>
                <CardDescription>{trail.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={trail.order_index > 1}
                >
                  {trail.order_index > 1 ? 'Em breve' : 'Começar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;