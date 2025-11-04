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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
                style={{ width: `${progress}%` }}
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
            
            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson, status)}
                className={`
                  group relative bg-white/80 backdrop-blur-xl rounded-2xl border shadow-lg 
                  overflow-hidden transition-all duration-300
                  ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'}
                  ${isCompleted ? 'border-cyan-300/50' : 'border-slate-200/50'}
                `}
              >
                {/* Borda gradiente no hover */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
                )}
                
                <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                  
                  {/* Ícone de status - Gradiente */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-all
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' 
                      : isLocked
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500 text-white'
                    }
                  `}>
                    {isCompleted && <CheckCircle className="w-8 h-8" strokeWidth={3} />}
                    {!isCompleted && !isLocked && <PlayCircle className="w-7 h-7" />}
                    {isLocked && <Lock className="w-7 h-7" />}
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {/* Título */}
                    <h3 className={`text-lg font-semibold mb-1 transition-colors ${
                      isCompleted ? 'text-slate-900' : 'text-slate-900 group-hover:text-cyan-600'
                    }`}>
                      Aula {index + 1}: {lesson.title}
                    </h3>
                    
                    {/* Descrição */}
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {lesson.description}
                    </p>
                    
                    {/* Metadados */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.estimated_time || 10} min
                      </span>
                      {lesson.difficulty_level && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-1 bg-slate-100 rounded-full capitalize">
                            {lesson.difficulty_level}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Botão de ação */}
                  <button 
                    className={`
                      px-6 py-3 rounded-xl font-medium text-sm transition-all flex-shrink-0
                      ${isCompleted
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 hover:from-purple-200 hover:to-blue-200'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      }
                    `}
                    disabled={isLocked}
                  >
                    {isCompleted && 'Revisar'}
                    {!isCompleted && !isLocked && 'Iniciar'}
                    {isLocked && 'Bloqueada'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TrailDetail;
