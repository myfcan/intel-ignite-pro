import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoAiliv from '@/assets/logo-ailiv.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, User, Trophy, LogOut, ArrowLeft } from 'lucide-react';

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
  const location = useLocation();
  const interactionsRemaining = user.daily_interaction_limit - user.interactions_used_today;
  
  const showBackButton = ['/guides', '/ai-directory', '/prompt-library', '/ai-playground'].includes(location.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-[72px] lg:h-20">
          
          {/* Logo e Botão Voltar */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 
                         bg-white/60 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100
                         border border-slate-200/80 hover:border-slate-300/50
                         rounded-xl transition-all duration-300 
                         hover:shadow-lg hover:shadow-slate-500/20 hover:-translate-y-0.5
                         active:translate-y-0"
              >
                <ArrowLeft className="h-4 w-4 group-hover:text-slate-900 transition-colors" />
                <span className="hidden sm:inline group-hover:text-slate-900 transition-colors">Dashboard</span>
              </button>
            )}
            <div className="flex items-center relative z-10 cursor-pointer group py-2" onClick={() => navigate('/dashboard')}>
              <img 
                src={logoAiliv} 
                alt="Ailiv" 
                className="h-[56px] md:h-[64px] lg:h-[72px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Navegação Horizontal */}
          <nav className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate('/guides')}
              className="group relative px-5 py-2.5 text-sm font-semibold text-slate-700 
                       bg-white/60 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50
                       border border-slate-200/80 hover:border-cyan-300/50
                       rounded-xl transition-all duration-300 
                       hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5
                       active:translate-y-0"
            >
              <span className="relative z-10 group-hover:text-cyan-600 transition-colors">
                Guides
              </span>
            </button>
            <button
              onClick={() => navigate('/ai-directory')}
              className="group relative px-5 py-2.5 text-sm font-semibold text-slate-700 
                       bg-white/60 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                       border border-slate-200/80 hover:border-blue-300/50
                       rounded-xl transition-all duration-300 
                       hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5
                       active:translate-y-0"
            >
              <span className="relative z-10 group-hover:text-blue-600 transition-colors">
                AI Directory
              </span>
            </button>
            <button
              onClick={() => navigate('/prompt-library')}
              className="group relative px-5 py-2.5 text-sm font-semibold text-slate-700 
                       bg-white/60 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50
                       border border-slate-200/80 hover:border-purple-300/50
                       rounded-xl transition-all duration-300 
                       hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5
                       active:translate-y-0"
            >
              <span className="relative z-10 group-hover:text-purple-600 transition-colors">
                Prompt Library
              </span>
            </button>
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 hover:bg-slate-50 rounded-md transition-colors">
                <Menu className="h-6 w-6 text-slate-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <nav className="flex flex-col gap-2 mt-8">
                <button
                  onClick={() => navigate('/guides')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <span className="text-xl">📚</span> Guides
                </button>
                <button
                  onClick={() => navigate('/ai-directory')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <span className="text-xl">🤖</span> AI Directory
                </button>
                <button
                  onClick={() => navigate('/prompt-library')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <span className="text-xl">💬</span> Prompt Library
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <span className="text-xl">🏠</span> Dashboard
                </button>
                
                <Separator className="my-4" />
                
                <button
                  onClick={() => navigate('/profile')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <User className="h-5 w-5" /> Perfil
                </button>
                <button
                  onClick={() => navigate('/achievements')}
                  className="text-base font-medium text-slate-700 hover:text-cyan-600 hover:bg-slate-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <Trophy className="h-5 w-5" /> Conquistas
                </button>
                <button
                  onClick={handleLogout}
                  className="text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 
                           transition-all px-4 py-3 rounded-lg text-left flex items-center gap-3"
                >
                  <LogOut className="h-5 w-5" /> Sair
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Limite de interações */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500
                            flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/25">
                {interactionsRemaining}
              </div>
              <span className="text-slate-600 hidden sm:inline">/ {user.daily_interaction_limit}</span>
            </div>

            {/* Avatar + Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 lg:gap-3 hover:bg-slate-50 
                               rounded-full pr-2 lg:pr-4 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500
                              flex items-center justify-center text-white font-semibold text-lg
                              shadow-lg shadow-cyan-500/25">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">Plano {user.plan}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl 
                            border border-slate-200/50 opacity-0 invisible group-hover:opacity-100 
                            group-hover:visible transition-all">
                <div className="p-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full text-left block px-4 py-3 text-sm text-slate-700 
                                                hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    👤 Meu Perfil
                  </button>
                  <button 
                    onClick={() => navigate('/achievements')}
                    className="w-full text-left block px-4 py-3 text-sm text-slate-700 
                                                     hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    🏆 Conquistas
                  </button>
                  <div className="border-t border-slate-200 my-2"></div>
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
