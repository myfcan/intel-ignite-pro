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
    <div className="min-h-screen bg-[#FAFBFC] animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                <span className="truncate">Ranking Global</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                {users.length} competidores
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* User's Current Position - PADRÃO DASHBOARD */}
        {currentUserId && currentUserPosition > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden border transition-all"
                 style={{
                   background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)',
                   border: '1px solid rgba(131, 123, 255, 0.3)',
                   boxShadow: `
                     0 4px 20px rgba(131, 123, 255, 0.2),
                     0 0 40px rgba(131, 123, 255, 0.1)
                   `
                 }}>
              {/* Textura de Pontos */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-70"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0'
                }}
              />
              
              <div className="relative z-10 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-purple-200 uppercase tracking-wider font-semibold mb-1">Sua Posição Atual</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">#{currentUserPosition}</span>
                    <div className="text-left min-w-0">
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                        {users[currentUserPosition - 1]?.total_points.toLocaleString()} pts
                      </p>
                      <p className="text-xs sm:text-sm text-purple-100 truncate">
                        {users[currentUserPosition - 1]?.total_lessons_completed} aulas completas
                      </p>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/50 flex-shrink-0" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium - PADRÃO DASHBOARD */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {users.slice(0, 3).map((user, index) => {
            const position = index + 1;
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${position === 1 ? 'xs:order-2' : position === 2 ? 'xs:order-1' : 'xs:order-3'}`}
              >
                <div className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden border transition-all ${position === 1 ? 'xs:transform xs:scale-105' : ''}`}
                     style={{
                       background: position === 1 
                         ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                         : position === 2
                         ? 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)'
                         : 'linear-gradient(135deg, #FDBA74 0%, #FB923C 100%)',
                       border: position === 1 
                         ? '1px solid rgba(251, 191, 36, 0.3)'
                         : position === 2
                         ? '1px solid rgba(148, 163, 184, 0.3)'
                         : '1px solid rgba(251, 146, 60, 0.3)',
                       boxShadow: position === 1 
                         ? '0 8px 30px rgba(251, 191, 36, 0.3)'
                         : position === 2
                         ? '0 6px 20px rgba(148, 163, 184, 0.3)'
                         : '0 6px 20px rgba(251, 146, 60, 0.3)',
                     }}>
                  {/* Textura de Pontos */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 1.5px, transparent 1.5px)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0'
                    }}
                  />
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <div className="relative">
                      {getRankIcon(position)}
                      {position === 1 && (
                        <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                    
                    <Avatar className={`${position === 1 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-14 h-14 sm:w-16 sm:h-16'} border-4 border-white flex-shrink-0`}>
                      <AvatarFallback className="bg-white/20 text-white font-bold text-base sm:text-xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 w-full">
                      <p className="font-bold text-sm sm:text-base md:text-lg text-white truncate px-2">
                        {isCurrentUser ? 'Você' : user.name.split(' ')[0]}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 text-white">
                        {user.total_points.toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-white/90">pontos</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{user.streak_days} dias</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="all-time" className="text-xs sm:text-sm">Todos os Tempos</TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm">Este Mês</TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm">Esta Semana</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            <div className="rounded-xl sm:rounded-2xl divide-y divide-gray-200 overflow-hidden border transition-all"
                 style={{
                   background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                   backgroundImage: `
                     linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                     radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                   `,
                   backgroundSize: 'cover, 16px 16px',
                   backgroundPosition: 'center, 0 0',
                   borderColor: 'rgba(139, 92, 246, 0.2)',
                 }}>
              {users.slice(3).map((user, index) => {
                const position = index + 4;
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`p-3 sm:p-4 hover:bg-white/60 transition-all ${
                      isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 sm:w-12 text-center flex-shrink-0">
                        <span className="text-sm sm:text-lg font-bold text-slate-600">#{position}</span>
                      </div>

                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm sm:text-base">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {isCurrentUser ? `${user.name} (Você)` : user.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {user.total_lessons_completed} aulas completas
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium text-xs sm:text-sm">{user.streak_days}</span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-base sm:text-xl font-bold text-gray-900">
                            {user.total_points.toLocaleString()}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600">pontos</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}