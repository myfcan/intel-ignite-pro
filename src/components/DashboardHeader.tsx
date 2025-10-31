import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Trophy, Target } from 'lucide-react';

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
    streak_days: number;
    total_points: number;
    total_lessons_completed: number;
    daily_interaction_limit: number;
    interactions_used_today: number;
  };
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const level = Math.floor(user.total_points / 100) + 1;
  const nextLevelPoints = level * 100;
  const progressToNextLevel = ((user.total_points % 100) / 100) * 100;
  const interactionsRemaining = user.daily_interaction_limit - user.interactions_used_today;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-pink-400 
                          rounded-xl flex items-center justify-center shadow-cyan-glow">
              <span className="text-white font-bold text-lg">IA</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Inteligência Ignite
            </span>
          </div>

          {/* Gamificação Central */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            
            {/* Streak */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 
                          px-3 lg:px-4 py-2 rounded-full border-2 border-orange-200 
                          hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-600 leading-none">Sequência</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{user.streak_days} dias</p>
              </div>
            </div>

            {/* Pontos */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 
                          px-3 lg:px-4 py-2 rounded-full border-2 border-cyan-200
                          hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-xs text-gray-600 leading-none">Pontos</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{user.total_points}</p>
              </div>
            </div>

            {/* Nível */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 
                          px-3 lg:px-4 py-2 rounded-full border-2 border-pink-200
                          hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-pink-500" />
              <div className="min-w-[100px]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 leading-none">Nível {level}</p>
                  <p className="text-xs text-gray-500 leading-none">{level + 1}</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 
                             transition-all duration-700 ease-out"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Limite de interações */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 
                            flex items-center justify-center text-white font-semibold shadow-cyan-glow">
                {interactionsRemaining}
              </div>
              <span className="text-gray-600 hidden sm:inline">/ {user.daily_interaction_limit}</span>
            </div>

            {/* Avatar + Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 
                               rounded-full pr-2 lg:pr-4 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 
                              flex items-center justify-center text-white font-semibold text-lg
                              shadow-pink-glow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Plano {user.plan}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl 
                            border border-gray-200 opacity-0 invisible group-hover:opacity-100 
                            group-hover:visible transition-all">
                <div className="p-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full text-left block px-4 py-3 text-sm text-gray-700 
                                                hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    👤 Meu Perfil
                  </button>
                  <button 
                    onClick={() => navigate('/achievements')}
                    className="w-full text-left block px-4 py-3 text-sm text-gray-700 
                                                     hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    🏆 Conquistas
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 
                                   hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
