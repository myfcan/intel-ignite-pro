import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle, PlayCircle, Clock, Play, Trophy } from 'lucide-react';
import { MiniMaia } from '@/components/MiniMaia';
import { getMaiaMessage, type MaiaMessageType } from '@/data/maiaMessages';
import { motion } from 'framer-motion';

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
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  
  // Estados para controlar diferentes tipos de mensagens da MAIA
  const [showWelcomeMaia, setShowWelcomeMaia] = useState(false);
  const [showProgressMaia, setShowProgressMaia] = useState(false);
  const [showCompletionMaia, setShowCompletionMaia] = useState(false);

  useEffect(() => {
    fetchTrailData();
  }, [id]);

  const fetchTrailData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Guardar o userId para usar nas chaves do localStorage
      const currentUserId = session.user.id;
      setUserId(currentUserId);

      // Usar um nome padrão ou email do usuário
      const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'amigo';
      setUserName(name);

      // Verificar chaves do localStorage com userId
      const welcomeMaiaKey = `maia-welcome-${currentUserId}-${id}`;
      const progressMaiaKey = `maia-progress-${currentUserId}-${id}`;
      const completionMaiaKey = `maia-completion-${currentUserId}-${id}`;
      
      const hasShownWelcome = localStorage.getItem(welcomeMaiaKey);
      const hasShownProgress = localStorage.getItem(progressMaiaKey);
      const hasShownCompletion = localStorage.getItem(completionMaiaKey);
      
      // Mostrar MAIA welcome primeiro se nunca mostrou
      if (!hasShownWelcome) {
        setShowWelcomeMaia(true);
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
        
        // Calcular progresso e determinar se deve mostrar MAIA de progresso/celebração
        const totalLessons = lessonsData?.length || 0;
        if (totalLessons > 0) {
          const progressPercent = (completed.length / totalLessons) * 100;
          
          // Mostrar MAIA apenas se não foi mostrada antes
          if (progressPercent >= 100 && !hasShownCompletion) {
            setShowCompletionMaia(true);
          } else if (progressPercent >= 50 && progressPercent < 100 && !hasShownProgress) {
            setShowProgressMaia(true);
          }
        }
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
    if (index === 0 || completedLessons.includes(lessons[index - 1]?.id)) return 'unlocked';
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

  if (loading) {
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

  // Determinar qual MAIA mostrar (prioridade: Completion > Progress > Welcome)
  const trailId = trail?.title.toLowerCase().replace(/\s+/g, '') || '';
  
  let showMaia = false;
  let messageType: MaiaMessageType = 'welcome';
  let variant: 'default' | 'encouragement' | 'celebration' = 'default';
  let showConfetti = false;

  if (showCompletionMaia) {
    showMaia = true;
    messageType = 'completed';
    variant = 'celebration';
    showConfetti = true;
  } else if (showProgressMaia) {
    showMaia = true;
    messageType = 'progress';
    variant = 'encouragement';
  } else if (showWelcomeMaia) {
    showMaia = true;
    messageType = 'welcome';
    variant = 'default';
  }

  const message = getMaiaMessage(trailId, messageType);

  const handleMaiaClose = () => {
    if (showWelcomeMaia) {
      setShowWelcomeMaia(false);
      // Salvar no localStorage que a mensagem de boas-vindas já foi mostrada
      if (userId && id) {
        localStorage.setItem(`maia-welcome-${userId}-${id}`, 'true');
      }
    }
    if (showProgressMaia) {
      setShowProgressMaia(false);
      // Salvar no localStorage que a mensagem de progresso já foi mostrada
      if (userId && id) {
        localStorage.setItem(`maia-progress-${userId}-${id}`, 'true');
      }
    }
    if (showCompletionMaia) {
      setShowCompletionMaia(false);
      // Salvar no localStorage que a mensagem de conclusão já foi mostrada
      if (userId && id) {
        localStorage.setItem(`maia-completion-${userId}-${id}`, 'true');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {showMaia && (
        <MiniMaia
          message={message}
          variant={variant}
          showConfetti={showConfetti}
          onClose={handleMaiaClose}
        />
      )}
      {/* Header - Card com Gradiente */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl text-slate-700 hover:text-cyan-600 hover:border-cyan-300 transition-all mb-6 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Voltar</span>
        </button>

        {/* Card de Header com Gradiente */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Background com gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500" />
          
          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>
          
          {/* Conteúdo */}
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              {/* Lado esquerdo: Ícone e Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  {/* Ícone grande */}
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 text-4xl">
                    {trail.icon}
                  </div>
                  
                  <div className="flex-1">
                    {/* Título */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {trail.title}
                    </h1>
                    {/* Descrição */}
                    <p className="text-white/90 text-lg">
                      {trail.description}
                    </p>
                  </div>
                </div>
                
                {/* Metadados */}
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {lessons.length} aulas
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {lessons.reduce((acc, l) => acc + (l.estimated_time || 0), 0)} minutos
                  </span>
                </div>
              </div>
              
              {/* Lado direito: Progresso */}
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-sm text-white/80 mb-1">Seu progresso</div>
                <div className="text-5xl font-bold text-white mb-1">{Math.round(progress)}%</div>
                <div className="text-sm text-white/80">{completedLessons.length}/{lessons.length} completas</div>
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
              <div 
                className="h-full bg-white shadow-lg transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(progress))}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Lessons List */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Aulas</h2>
        
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
                  group relative bg-white/80 backdrop-blur-xl rounded-2xl border shadow-lg 
                  overflow-hidden transition-all duration-300
                  ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary'}
                `}
              >
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail com Play Button */}
                    <div className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shadow-md ${
                      isCompleted ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500' :
                      isLocked ? 'bg-slate-100' : 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500'
                    }`}>
                      {isCompleted ? (
                        <Trophy className="w-8 h-8 text-yellow-50 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse-glow" />
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 text-slate-400" />
                      ) : (
                        <PlayCircle className="w-8 h-8 text-white" />
                      )}
                      
                      {/* Play overlay effect */}
                      {!isLocked && !isCompleted && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" fill="white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Conteúdo da aula */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold mb-0.5 group-hover:text-primary transition-colors truncate">
                            Aula {index + 1}: {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          {progressPercentage}%
                        </span>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="mb-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                              'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Status e Tempo */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                        
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.estimated_time || 10} min</span>
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
  );
};

export default TrailDetail;
