import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { MiniMaia } from '@/components/MiniMaia';
import { getMaiaMessage, type MaiaMessageType } from '@/data/maiaMessages';
import { TrailIntro } from '@/components/TrailIntro';

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
  const [showAudioIntro, setShowAudioIntro] = useState(false);

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
      const audioIntroKey = `audio-intro-${currentUserId}-${id}`;
      const welcomeMaiaKey = `maia-welcome-${currentUserId}-${id}`;
      const progressMaiaKey = `maia-progress-${currentUserId}-${id}`;
      const completionMaiaKey = `maia-completion-${currentUserId}-${id}`;
      
      const hasShownAudio = localStorage.getItem(audioIntroKey);
      const hasShownWelcome = localStorage.getItem(welcomeMaiaKey);
      const hasShownProgress = localStorage.getItem(progressMaiaKey);
      const hasShownCompletion = localStorage.getItem(completionMaiaKey);
      
      // Mostrar MAIA welcome primeiro se nunca mostrou
      if (!hasShownWelcome) {
        setShowWelcomeMaia(true);
      } else if (!hasShownAudio) {
        // Se já mostrou MAIA, mas não mostrou áudio, mostra áudio
        setShowAudioIntro(true);
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
  // IMPORTANTE: Não mostrar MAIA se o áudio intro ainda está aberto
  const trailId = trail?.title.toLowerCase().replace(/\s+/g, '') || '';
  
  let showMaia = false;
  let messageType: MaiaMessageType = 'welcome';
  let variant: 'default' | 'encouragement' | 'celebration' = 'default';
  let showConfetti = false;

  // Só mostrar MAIA se o áudio intro já foi fechado
  if (!showAudioIntro) {
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
  }

  const message = getMaiaMessage(trailId, messageType);

  const handleMaiaClose = () => {
    if (showWelcomeMaia) {
      setShowWelcomeMaia(false);
      // Salvar no localStorage que a mensagem de boas-vindas já foi mostrada
      if (userId && id) {
        localStorage.setItem(`maia-welcome-${userId}-${id}`, 'true');
        // Após fechar MAIA welcome, mostrar áudio intro se ainda não mostrou
        const audioIntroKey = `audio-intro-${userId}-${id}`;
        const hasShownAudio = localStorage.getItem(audioIntroKey);
        if (!hasShownAudio) {
          setShowAudioIntro(true);
        }
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

  const handleAudioIntroClose = () => {
    setShowAudioIntro(false);
    // Salvar no localStorage que a introdução de áudio já foi mostrada para esta trilha
    if (userId && id) {
      localStorage.setItem(`audio-intro-${userId}-${id}`, 'true');
    }
  };

  // Mapear ID da trilha para o formato esperado pelo TrailIntro
  const getTrailSlug = () => {
    if (!trail) return '';
    const title = trail.title.toLowerCase();
    if (title.includes('fundamento')) return 'fundamentos';
    if (title.includes('dia a dia')) return 'diaadia';
    if (title.includes('negócio')) return 'negocios';
    if (title.includes('renda')) return 'rendaextra';
    if (title.includes('conteúdo')) return 'conteudo';
    if (title.includes('automa')) return 'automacoes';
    if (title.includes('criativ')) return 'criativa';
    if (title.includes('ética')) return 'etica';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showAudioIntro && trail && (
        <TrailIntro
          trailId={getTrailSlug()}
          trailName={trail.title}
          userName={userName}
          onClose={handleAudioIntroClose}
        />
      )}
      {showMaia && (
        <MiniMaia
          message={message}
          variant={variant}
          showConfetti={showConfetti}
          onClose={handleMaiaClose}
        />
      )}
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {trail.icon} {trail.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {trail.description}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>{lessons.length} aulas</span>
                <span>•</span>
                <span>{lessons.reduce((acc, l) => acc + (l.estimated_time || 0), 0)} minutos</span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-600 mb-2">Seu progresso</p>
              <p className="text-4xl font-bold text-cyan-600">{Math.round(progress)}%</p>
              <p className="text-sm text-gray-500 mt-1">{completedLessons.length}/{lessons.length} completas</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </header>

      {/* Lessons List */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Aulas</h2>
        
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson, index);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            
            return (
              <Card 
                key={lesson.id}
                className={`
                  transition-all duration-300 cursor-pointer
                  ${isLocked ? 'opacity-60' : 'hover:shadow-lg hover:border-cyan-400'}
                  ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}
                `}
                onClick={() => handleLessonClick(lesson, status)}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-500' : ''}
                      ${!isCompleted && !isLocked ? 'bg-gradient-to-br from-cyan-400 to-cyan-500' : ''}
                      ${isLocked ? 'bg-gray-200' : ''}
                    `}>
                      {isCompleted && <CheckCircle className="w-6 h-6 text-white" />}
                      {!isCompleted && !isLocked && <PlayCircle className="w-6 h-6 text-white" />}
                      {isLocked && <Lock className="w-6 h-6 text-gray-400" />}
                    </div>

                    <div className="flex-1">
                      <CardTitle className={`text-xl mb-1 ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                        Aula {index + 1}: {lesson.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {lesson.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {lesson.estimated_time || 10} min
                        </span>
                        {lesson.difficulty_level && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{lesson.difficulty_level}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={isCompleted ? "outline" : "default"}
                    className={`
                      ${isLocked ? 'cursor-not-allowed' : ''}
                      ${!isCompleted && !isLocked ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' : ''}
                    `}
                    disabled={isLocked}
                  >
                    {isCompleted && 'Revisar'}
                    {!isCompleted && !isLocked && 'Começar'}
                    {isLocked && 'Bloqueada'}
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TrailDetail;
