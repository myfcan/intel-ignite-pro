import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS, AchievementDefinition } from '@/lib/gamification';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { motion } from 'framer-motion';

interface UserAchievement {
  achievement_name: string;
  earned_at: string;
  points_earned: number;
}

export default function Achievements() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load user data
      const { data: userData } = await supabase
        .from('users')
        .select('total_points, streak_days')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUserPoints(userData.total_points || 0);
        setUserStreak(userData.streak_days || 0);
      }

      // Load earned achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_name, earned_at, points_earned')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (achievementsData) {
        setEarnedAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return earnedAchievements.some(a => a.achievement_name === achievementId);
  };

  const getAchievementDate = (achievementId: string) => {
    const achievement = earnedAchievements.find(a => a.achievement_name === achievementId);
    if (!achievement) return null;
    return new Date(achievement.earned_at).toLocaleDateString('pt-BR');
  };

  const groupedAchievements = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = [];
    }
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, AchievementDefinition[]>);

  const categoryNames = {
    lessons: 'Aulas',
    streak: 'Sequência',
    perfect: 'Perfeição',
    speed: 'Velocidade',
    special: 'Especiais',
  };

  const earnedCount = earnedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = Math.round((earnedCount / totalCount) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Conquistas</h1>
              <p className="text-sm text-slate-600">
                {earnedCount} de {totalCount} desbloqueadas ({completionPercent}%)
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-4">
            <PointsDisplay points={userPoints} streak={userStreak} showStreak={true} />
            
            {/* Overall Progress */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Progresso Geral</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Conquistas</span>
                  <span className="font-bold text-slate-900">
                    {earnedCount}/{totalCount}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {Object.entries(groupedAchievements).map(([type, achievements]) => (
              <section key={type}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {categoryNames[type as keyof typeof categoryNames] || type}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => {
                    const earned = isAchievementEarned(achievement.id);
                    const earnedDate = getAchievementDate(achievement.id);

                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: earned ? 1.05 : 1 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                          earned
                            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg'
                            : 'bg-white/50 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Icon */}
                        <div className="text-5xl mb-3 text-center">
                          {earned ? achievement.icon : '🔒'}
                        </div>

                        {/* Info */}
                        <h3 className="font-bold text-slate-900 text-center mb-1">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-slate-600 text-center mb-3">
                          {achievement.description}
                        </p>

                        {/* Points */}
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-600">
                            {achievement.points} pts
                          </span>
                        </div>

                        {/* Earned date */}
                        {earned && earnedDate && (
                          <div className="mt-3 pt-3 border-t border-amber-200 text-center">
                            <p className="text-xs text-amber-700">
                              Conquistado em {earnedDate}
                            </p>
                          </div>
                        )}

                        {/* Lock overlay */}
                        {!earned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded-2xl backdrop-blur-[1px]">
                            <Lock className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
