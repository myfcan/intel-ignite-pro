import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Trophy, Star, Zap, Coins, Award, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserGamification } from '@/hooks/useUserGamification';
import { motion } from 'framer-motion';

interface GamificationEvent {
  event_type: string;
  xp_delta: number;
  coins_delta: number;
  created_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: { type: string; value: number };
  reward: { xp: number; coins: number };
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    name: 'Primeira Conquista',
    description: 'Complete sua primeira aula',
    icon: '🎯',
    category: 'lessons',
    requirement: { type: 'lesson_completed', value: 1 },
    reward: { xp: 40, coins: 10 }
  },
  {
    id: 'five_lessons',
    name: 'Em Progresso',
    description: 'Complete 5 aulas',
    icon: '📚',
    category: 'lessons',
    requirement: { type: 'lesson_completed', value: 5 },
    reward: { xp: 100, coins: 25 }
  },
  {
    id: 'ten_lessons',
    name: 'Dedicado',
    description: 'Complete 10 aulas',
    icon: '🎓',
    category: 'lessons',
    requirement: { type: 'lesson_completed', value: 10 },
    reward: { xp: 200, coins: 50 }
  },
  {
    id: 'power_100',
    name: 'Poder Crescente',
    description: 'Alcance 100 de Power Score',
    icon: '⚡',
    category: 'power',
    requirement: { type: 'power_score', value: 100 },
    reward: { xp: 50, coins: 15 }
  },
  {
    id: 'power_500',
    name: 'Força Interior',
    description: 'Alcance 500 de Power Score',
    icon: '💪',
    category: 'power',
    requirement: { type: 'power_score', value: 500 },
    reward: { xp: 150, coins: 40 }
  },
  {
    id: 'patent_1',
    name: 'Operador Básico',
    description: 'Alcance a patente de Operador Básico de I.A.',
    icon: '🥉',
    category: 'patent',
    requirement: { type: 'patent_level', value: 1 },
    reward: { xp: 100, coins: 30 }
  },
  {
    id: 'patent_2',
    name: 'Executor',
    description: 'Alcance a patente de Executor de Sistemas',
    icon: '🥈',
    category: 'patent',
    requirement: { type: 'patent_level', value: 2 },
    reward: { xp: 200, coins: 60 }
  },
  {
    id: 'patent_3',
    name: 'Estrategista',
    description: 'Alcance a patente de Estrategista em I.A.',
    icon: '🥇',
    category: 'patent',
    requirement: { type: 'patent_level', value: 3 },
    reward: { xp: 400, coins: 100 }
  }
];

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const { stats } = useUserGamification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar eventos de gamificação
      const { data: eventsData } = await supabase
        .from('user_gamification_events')
        .select('event_type, xp_delta, coins_delta, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsData) {
        setEvents(eventsData);
        const lessonEvents = eventsData.filter(e => e.event_type === 'lesson_completed');
        setLessonsCompleted(lessonEvents.length);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementUnlocked = (achievement: Achievement): boolean => {
    if (!stats) return false;

    switch (achievement.requirement.type) {
      case 'lesson_completed':
        return lessonsCompleted >= achievement.requirement.value;
      case 'power_score':
        return stats.powerScore >= achievement.requirement.value;
      case 'patent_level':
        return stats.patentLevel >= achievement.requirement.value;
      default:
        return false;
    }
  };

  const getProgress = (achievement: Achievement): number => {
    if (!stats) return 0;

    let current = 0;
    switch (achievement.requirement.type) {
      case 'lesson_completed':
        current = lessonsCompleted;
        break;
      case 'power_score':
        current = stats.powerScore;
        break;
      case 'patent_level':
        current = stats.patentLevel;
        break;
    }

    return Math.min(100, (current / achievement.requirement.value) * 100);
  };

  const achievementsByCategory = MOCK_ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const unlockedCount = MOCK_ACHIEVEMENTS.filter(isAchievementUnlocked).length;
  const totalAchievements = MOCK_ACHIEVEMENTS.length;
  const completionPercentage = (unlockedCount / totalAchievements) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Carregando conquistas...</div>
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
                <Trophy className="w-6 h-6 text-pink-500" />
                Suas Conquistas
              </h1>
              <p className="text-sm text-slate-600">
                {unlockedCount} de {totalAchievements} conquistadas ({Math.round(completionPercentage)}%)
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Card */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-sky-500 to-blue-500 text-white border-0">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Power Score</p>
                  <p className="text-3xl font-bold">{stats.powerScore}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Créditos</p>
                  <p className="text-3xl font-bold">{stats.coins}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Patente</p>
                  <p className="text-base font-bold">{stats.patentName}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Aulas Completas</p>
                  <p className="text-3xl font-bold">{lessonsCompleted}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Overall Progress */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Progresso Geral</h3>
              <span className="text-2xl font-bold text-purple-600">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-slate-600">
              Continue progredindo para desbloquear mais conquistas!
            </p>
          </div>
        </Card>

        {/* Achievements by Category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="lessons">Aulas</TabsTrigger>
            <TabsTrigger value="power">Power</TabsTrigger>
            <TabsTrigger value="patent">Patentes</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_ACHIEVEMENTS.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement);
                const progress = getProgress(achievement);

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`p-6 transition-all duration-300 ${
                        unlocked
                          ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg'
                          : 'bg-white/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">
                          {unlocked ? achievement.icon : '🔒'}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                          <p className="text-sm text-slate-600">{achievement.description}</p>
                          
                          {!unlocked && (
                            <div className="space-y-1">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-slate-500">
                                {Math.round(progress)}% completo
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-sky-500" />
                              <span className="font-medium text-sky-600">
                                +{achievement.reward.xp}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-amber-600">
                                +{achievement.reward.coins}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(achievementsByCategory).map(([category, achievements]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const unlocked = isAchievementUnlocked(achievement);
                  const progress = getProgress(achievement);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`p-6 transition-all duration-300 ${
                          unlocked
                            ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg'
                            : 'bg-white/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-5xl">
                            {unlocked ? achievement.icon : '🔒'}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                            <p className="text-sm text-slate-600">{achievement.description}</p>
                            
                            {!unlocked && (
                              <div className="space-y-1">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-slate-500">
                                  {Math.round(progress)}% completo
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-sky-500" />
                                <span className="font-medium text-sky-600">
                                  +{achievement.reward.xp}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-amber-500" />
                                <span className="font-medium text-amber-600">
                                  +{achievement.reward.coins}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}