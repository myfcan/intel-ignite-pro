import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Lock, Sparkles, Zap, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useUserGamification } from '@/hooks/useUserGamification';

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
  requirement: { type: string; value: number };
  reward: { xp: number; coins: number };
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    name: 'Primeira Conquista',
    description: 'Complete sua primeira aula',
    icon: '🎯',
    requirement: { type: 'lesson_completed', value: 1 },
    reward: { xp: 40, coins: 10 }
  },
  {
    id: 'five_lessons',
    name: 'Em Progresso',
    description: 'Complete 5 aulas',
    icon: '📚',
    requirement: { type: 'lesson_completed', value: 5 },
    reward: { xp: 100, coins: 25 }
  },
  {
    id: 'ten_lessons',
    name: 'Dedicado',
    description: 'Complete 10 aulas',
    icon: '🎓',
    requirement: { type: 'lesson_completed', value: 10 },
    reward: { xp: 200, coins: 50 }
  },
  {
    id: 'power_100',
    name: 'Poder Crescente',
    description: 'Alcance 100 de Power Score',
    icon: '⚡',
    requirement: { type: 'power_score', value: 100 },
    reward: { xp: 50, coins: 15 }
  },
  {
    id: 'power_500',
    name: 'Força Interior',
    description: 'Alcance 500 de Power Score',
    icon: '💪',
    requirement: { type: 'power_score', value: 500 },
    reward: { xp: 150, coins: 40 }
  },
  {
    id: 'patent_1',
    name: 'Operador Básico',
    description: 'Alcance a patente de Operador Básico de I.A.',
    icon: '🥉',
    requirement: { type: 'patent_level', value: 1 },
    reward: { xp: 100, coins: 30 }
  },
  {
    id: 'patent_2',
    name: 'Executor',
    description: 'Alcance a patente de Executor de Sistemas',
    icon: '🥈',
    requirement: { type: 'patent_level', value: 2 },
    reward: { xp: 200, coins: 60 }
  },
  {
    id: 'patent_3',
    name: 'Estrategista',
    description: 'Alcance a patente de Estrategista em I.A.',
    icon: '🥇',
    requirement: { type: 'patent_level', value: 3 },
    reward: { xp: 400, coins: 100 }
  }
];

export default function Achievements() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const { stats } = useUserGamification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Buscar eventos de gamificação
      const { data: eventsData } = await supabase
        .from('user_gamification_events')
        .select('event_type, xp_delta, coins_delta, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsData) {
        setEvents(eventsData);
        // Contar aulas completadas
        const lessonEvents = eventsData.filter(e => e.event_type === 'lesson_completed');
        setLessonsCompleted(lessonEvents.length);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievement: Achievement): boolean => {
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

  const earnedCount = MOCK_ACHIEVEMENTS.filter(isAchievementEarned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
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
    <div className="min-h-screen bg-gray-50">
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
            {stats && (
              <div className="rounded-2xl p-6 border-2 shadow-lg bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-sky-500" />
                    <div>
                      <p className="text-sm text-slate-600">Power Score</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.powerScore}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-600">Créditos</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.coins}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-slate-600">Patente</p>
                      <p className="text-lg font-bold text-slate-900">{stats.patentName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Overall Progress */}
            <div className="rounded-2xl p-4 border shadow-lg transition-all"
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
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-pink-500" />
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
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Todas as Conquistas
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_ACHIEVEMENTS.map((achievement) => {
                  const earned = isAchievementEarned(achievement);
                  const progress = getProgress(achievement);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: earned ? 1.05 : 1 }}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        earned
                          ? 'border-pink-300 shadow-lg'
                          : 'border-slate-200 opacity-60'
                      }`}
                      style={earned ? {
                        background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
                      } : {
                        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                        backgroundImage: `
                          linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                          radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: 'cover, 16px 16px',
                        backgroundPosition: 'center, 0 0',
                      }}
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

                      {/* Progresso */}
                      {!earned && (
                        <div className="mb-3">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-center text-slate-500 mt-1">
                            {Math.round(progress)}% completo
                          </p>
                        </div>
                      )}

                      {/* Recompensa */}
                      <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-sky-500" />
                          <span className="text-sky-600">+{achievement.reward.xp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-600">+{achievement.reward.coins}</span>
                        </div>
                      </div>

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
          </main>
        </div>
      </div>
    </div>
  );
}
