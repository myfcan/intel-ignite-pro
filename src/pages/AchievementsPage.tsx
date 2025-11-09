import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Trophy, Star, Flame, Zap, Target, Award, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { ACHIEVEMENTS, AchievementDefinition } from '@/lib/gamification';
import { motion } from 'framer-motion';

interface UserAchievement {
  achievement_name: string;
  earned_at: string;
  points_earned: number;
}

interface UserStats {
  total_points: number;
  streak_days: number;
  level: number;
  total_lessons_completed: number;
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_name, earned_at, points_earned')
        .eq('user_id', user.id);

      // Load user stats
      const { data: stats } = await supabase
        .from('users')
        .select('total_points, streak_days, total_lessons_completed')
        .eq('id', user.id)
        .single();

      setUserAchievements(achievements || []);
      if (stats) {
        // Calculate level from points
        const level = Math.floor((stats.total_points || 0) / 1000) + 1;
        setUserStats({
          ...stats,
          level,
          total_points: stats.total_points || 0,
          streak_days: stats.streak_days || 0,
          total_lessons_completed: stats.total_lessons_completed || 0,
        });
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_name === achievementId);
  };

  const getProgress = (achievement: AchievementDefinition): number => {
    if (!userStats) return 0;
    
    switch (achievement.type) {
      case 'lessons':
        return Math.min(100, (userStats.total_lessons_completed / achievement.requirement) * 100);
      case 'streak':
        return Math.min(100, (userStats.streak_days / achievement.requirement) * 100);
      default:
        return 0;
    }
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'lessons': return Trophy;
      case 'streak': return Flame;
      case 'perfect': return Target;
      case 'speed': return Zap;
      default: return Star;
    }
  };

  const achievementsByType = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.type]) acc[achievement.type] = [];
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, AchievementDefinition[]>);

  const unlockedCount = userAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;
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
                <Trophy className="w-6 h-6 text-amber-500" />
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
        {userStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PointsDisplay
                points={userStats.total_points}
                streak={userStats.streak_days}
                showStreak={true}
              />
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Nível</p>
                    <p className="text-3xl font-bold">{userStats.level}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Aulas Completas</p>
                    <p className="text-3xl font-bold">{userStats.total_lessons_completed}</p>
                  </div>
                </div>
              </Card>
            </div>
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
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-6 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="lessons">Aulas</TabsTrigger>
            <TabsTrigger value="streak">Sequência</TabsTrigger>
            <TabsTrigger value="perfect">Perfeição</TabsTrigger>
            <TabsTrigger value="speed">Velocidade</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.id);
                const progress = getProgress(achievement);
                const Icon = getIconComponent(achievement.type);

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
                          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg'
                          : 'bg-white/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            unlocked
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                              : 'bg-slate-200'
                          }`}
                        >
                          {unlocked ? (
                            <Icon className="w-6 h-6 text-white" />
                          ) : (
                            <Lock className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                            <span className="text-2xl">{achievement.icon}</span>
                          </div>
                          <p className="text-sm text-slate-600">{achievement.description}</p>
                          
                          {!unlocked && (
                            <div className="space-y-1">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-slate-500">
                                {Math.round(progress)}% completo
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-amber-600">
                              {achievement.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(achievementsByType).map(([type, achievements]) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const unlocked = isAchievementUnlocked(achievement.id);
                  const progress = getProgress(achievement);
                  const Icon = getIconComponent(achievement.type);

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
                            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg'
                            : 'bg-white/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              unlocked
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                                : 'bg-slate-200'
                            }`}
                          >
                            {unlocked ? (
                              <Icon className="w-6 h-6 text-white" />
                            ) : (
                              <Lock className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                              <span className="text-2xl">{achievement.icon}</span>
                            </div>
                            <p className="text-sm text-slate-600">{achievement.description}</p>
                            
                            {!unlocked && (
                              <div className="space-y-1">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-slate-500">
                                  {Math.round(progress)}% completo
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-amber-600">
                                {achievement.points} pts
                              </span>
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