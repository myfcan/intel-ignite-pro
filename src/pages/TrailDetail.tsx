import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle, CheckCircle2, PlayCircle, Clock, Play, Trophy } from 'lucide-react';
import { LivWelcomeModal } from '@/components/LivWelcomeModal';
import { motion } from 'framer-motion';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: number;
  difficulty_level: string;
  is_active: boolean;
  lesson_type?: string;
}

interface Trail {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const TrailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showLivModal, setShowLivModal] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // ⚠️ CRITICAL FIX: Obter userId PRIMEIRO antes de qualquer outra coisa
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      console.log('[TrailDetail] Inicializando userId:', session.user.id);
      setUserId(session.user.id);
    };

    initializeUser();
  }, []);

  // Hook de admin - agora com userId já inicializado
  const { isAdmin, loading: adminLoading } = useIsAdmin(userId);

  // Log do status de admin para debug
  useEffect(() => {
    console.log('[TrailDetail] Status Admin:', { isAdmin, adminLoading, userId });
  }, [isAdmin, adminLoading, userId]);

  useEffect(() => {
    // Só buscar dados após userId estar disponível
    if (userId) {
      fetchTrailData();
    }
  }, [id, userId]);

  const fetchTrailData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch trail
      const { data: trailData, error: trailError } = await supabase
        .from('trails')
        .select('*')
        .eq('id', id)
        .single();

      if (trailError) throw trailError;
      setTrail(trailData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('trail_id', id)
        .eq('is_active', true)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', session.user.id)
        .in('status', ['completed']);

      if (progressData) {
        const completed = progressData.map(p => p.lesson_id);
        setCompletedLessons(completed);
      }
    } catch (error: any) {
      console.error('Error fetching trail:', error);
      toast({
        title: "Erro ao carregar trilha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (completedLessons.includes(lesson.id)) return 'completed';

    // ⚠️ CRITICAL FIX: Admins têm acesso a TODAS as aulas
    if (!adminLoading && isAdmin) {
      console.log(`[getLessonStatus] Admin detectado! Aula ${index + 1} desbloqueada`);
      return 'unlocked';
    }

    // Lógica normal para usuários comuns
    if (index === 0 || completedLessons.includes(lessons[index - 1]?.id)) return 'unlocked';

    console.log(`[getLessonStatus] Aula ${index + 1} bloqueada (isAdmin: ${isAdmin}, adminLoading: ${adminLoading})`);
    return 'locked';
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (status === 'locked') {
      toast({
        title: "Aula bloqueada",
        description: "Complete a aula anterior para desbloquear.",
        variant: "destructive",
      });
      return;
    }
    
    // Se a aula tem lesson_type, usa a nova rota interativa
    const hasInteractiveContent = lesson.lesson_type && lesson.lesson_type !== '';
    const route = hasInteractiveContent 
      ? `/lessons-interactive/${lesson.id}` 
      : `/lessons/${lesson.id}`;
    
    navigate(route);
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando trilha...</p>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Trilha não encontrada</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;

  return (
    <>
      {/* Liv Welcome Modal - Aparece apenas UMA vez */}
      {showLivModal && <LivWelcomeModal onClose={() => setShowLivModal(false)} />}
      
      <div className="min-h-screen bg-[#FAFBFC]">
      
      <div className="relative z-10">
        {/* Header - Card Dark Tech */}
        <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-all mb-4 sm:mb-6 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm sm:text-base text-gray-700">Voltar</span>
        </button>

        {/* Card de Header - Paleta Principal com Degradê */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border"
             style={{
               background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)',
               borderColor: 'rgba(255, 255, 255, 0.3)'
             }}>
          
          {/* Textura de Pontos */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0'
            }}
          />
          
          {/* Conteúdo */}
          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6">
              {/* Lado esquerdo: Ícone e Info */}
              <div className="flex-1 w-full">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Ícone grande */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 text-2xl sm:text-3xl md:text-4xl"
                       style={{
                         background: 'rgba(255, 255, 255, 0.2)',
                         border: '1px solid rgba(255, 255, 255, 0.3)'
                       }}>
                    {trail.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Título */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                      {trail.title}
                    </h1>
                    {/* Descrição */}
                    <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2">
                      {trail.description}
                    </p>
                  </div>
                </div>
                
                {/* Metadados */}
                <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {lessons.length} aulas
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {lessons.reduce((acc, l) => acc + (l.estimated_time || 0), 0)} minutos
                  </span>
                </div>
              </div>
              
              {/* Lado direito: Progresso */}
              <div className="w-full md:w-auto text-center md:text-right backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 border"
                   style={{
                     background: 'rgba(255, 255, 255, 0.15)',
                     borderColor: 'rgba(255, 255, 255, 0.3)'
                   }}>
                <div className="text-xs sm:text-sm text-white/80 mb-1">Seu progresso</div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-1">{Math.round(progress)}%</div>
                <div className="text-xs sm:text-sm text-white/80">{completedLessons.length}/{lessons.length} completas</div>
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="h-2 sm:h-3 rounded-full overflow-hidden"
                 style={{
                   background: 'rgba(255, 255, 255, 0.2)',
                   border: '1px solid rgba(255, 255, 255, 0.3)'
                 }}>
              <div 
                className="h-full shadow-lg transition-all duration-500" 
                style={{ 
                  width: `${Math.min(100, Math.round(progress))}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Lessons List */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Aulas</h2>
        
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson, index);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const progressPercentage = isCompleted ? 100 : (status === 'unlocked' ? 0 : 0);
            
            const statusText = isCompleted ? 'Concluído' : isLocked ? 'Não Iniciado' : 'Cursando';
            const statusColor = isCompleted ? 'text-emerald-600' : isLocked ? 'text-muted-foreground' : 'text-primary';
            
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                onClick={() => handleLessonClick(lesson, status)}
                className={`
                  group relative bg-white rounded-2xl border border-gray-200 shadow-sm 
                  overflow-hidden transition-all duration-300
                  ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary'}
                `}
              >
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail com Play Button */}
                    <div className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden ${
                      isCompleted ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-md' :
                      isLocked ? 'shadow-md' : ''
                    }`}
                    style={!isCompleted && !isLocked ? {
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 139, 250, 0.12) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                    } : isLocked ? {
                      background: '#F1F5F9',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    } : undefined}
                    >
                      {isCompleted ? (
                        <Trophy className="w-8 h-8 text-yellow-50 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse-glow" />
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 text-slate-400" />
                      ) : (
                        <PlayCircle className="w-8 h-8 text-primary" />
                      )}
                      
                      {/* Play overlay effect */}
                      {!isLocked && !isCompleted && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                             style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                          <Play className="w-6 h-6 text-primary" fill="hsl(var(--primary))" />
                        </div>
                      )}
                    </div>
                    
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Título e Descrição */}
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            Aula {index + 1}: {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Progresso com Percentual e Barra */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                              Progresso
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {progressPercentage}%
                            </span>
                          </div>
                          <div 
                            className="h-2 rounded-full overflow-hidden"
                            style={{
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.15)'
                            }}
                          >
                            <div 
                              className="h-full transition-all duration-500"
                              style={{ 
                                width: `${progressPercentage}%`,
                                background: isCompleted 
                                  ? 'linear-gradient(to right, #10B981, #14B8A6)' 
                                  : 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)',
                                boxShadow: progressPercentage > 0 ? '0 0 8px rgba(139, 92, 246, 0.3)' : 'none'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Status e Tempo */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-primary" />
                            )}
                            <span className={`text-xs font-medium ${
                              isCompleted ? 'text-emerald-600' : 
                              isLocked ? 'text-gray-400' : 
                              'text-primary'
                            }`}>
                              {statusText}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{lesson.estimated_time || 10} min</span>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      </div>
    </div>
    </>
  );
};

export default TrailDetail;
