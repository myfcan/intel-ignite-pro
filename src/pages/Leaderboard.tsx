import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Trophy, Medal, Crown, Flame, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  total_points: number;
  streak_days: number;
  total_lessons_completed: number;
}

type PeriodFilter = 'all-time' | 'month' | 'week';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('all-time');

  useEffect(() => {
    loadLeaderboard();
    setupRealtimeSubscription();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Query base
      let query = supabase
        .from('users')
        .select('id, name, email, total_points, streak_days, total_lessons_completed')
        .order('total_points', { ascending: false })
        .limit(100);

      // Filtros por período (simulação - seria melhor ter uma tabela de histórico)
      // Por enquanto, apenas ordenando por pontos totais
      
      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          console.log('🔄 Leaderboard atualizado em tempo real');
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getUserPosition = (userId: string): number => {
    return users.findIndex(u => u.id === userId) + 1;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-slate-600">#{position}</span>;
    }
  };

  const getRankColor = (position: number): string => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-amber-500 shadow-xl shadow-yellow-500/50';
      case 2:
        return 'from-slate-300 to-slate-400 shadow-lg shadow-slate-400/50';
      case 3:
        return 'from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50';
      default:
        return 'from-slate-100 to-slate-200';
    }
  };

  const currentUserPosition = currentUserId ? getUserPosition(currentUserId) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Carregando ranking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                Ranking Global
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {users.length} competidores
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* User's Current Position */}
        {currentUserId && currentUserPosition > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Sua Posição Atual</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">#{currentUserPosition}</span>
                    <div className="text-left">
                      <p className="text-lg font-semibold">
                        {users[currentUserPosition - 1]?.total_points.toLocaleString()} pts
                      </p>
                      <p className="text-sm opacity-90">
                        {users[currentUserPosition - 1]?.total_lessons_completed} aulas completas
                      </p>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {users.slice(0, 3).map((user, index) => {
            const position = index + 1;
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${position === 1 ? 'order-2 col-span-3 md:col-span-1' : position === 2 ? 'order-1' : 'order-3'}`}
              >
                <Card className={`p-6 bg-gradient-to-br ${getRankColor(position)} text-white border-0 ${position === 1 ? 'transform scale-105' : ''}`}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      {getRankIcon(position)}
                      {position === 1 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                    
                    <Avatar className={`w-16 h-16 ${position === 1 ? 'w-20 h-20' : ''} border-4 border-white`}>
                      <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-bold text-lg">
                        {isCurrentUser ? 'Você' : user.name.split(' ')[0]}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {user.total_points.toLocaleString()}
                      </p>
                      <p className="text-sm opacity-90">pontos</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Flame className="w-4 h-4" />
                      <span>{user.streak_days} dias</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all-time">Todos os Tempos</TabsTrigger>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            <Card className="divide-y divide-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden">
              {users.slice(3).map((user, index) => {
                const position = index + 4;
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <span className="text-lg font-bold text-slate-600">#{position}</span>
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {isCurrentUser ? `${user.name} (Você)` : user.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {user.total_lessons_completed} aulas completas
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-4 h-4" />
                          <span className="font-medium">{user.streak_days}</span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">
                            {user.total_points.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-600">pontos</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}