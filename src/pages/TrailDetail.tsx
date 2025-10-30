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

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: number;
  difficulty_level: string;
  is_active: boolean;
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
  const [showMaia, setShowMaia] = useState(true);

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
        setCompletedLessons(progressData.map(p => p.lesson_id));
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
    navigate(`/lessons/${lesson.id}`);
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

  // Determinar mensagem e variante da MAIA
  const trailId = trail?.title.toLowerCase().replace(/\s+/g, '') || '';
  let messageType: MaiaMessageType = 'welcome';
  let variant: 'default' | 'encouragement' | 'celebration' = 'default';
  let showConfetti = false;

  if (progress >= 100) {
    messageType = 'completed';
    variant = 'celebration';
    showConfetti = true;
  } else if (progress >= 50) {
    messageType = 'progress';
    variant = 'encouragement';
  }

  const message = getMaiaMessage(trailId, messageType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showMaia && (
        <MiniMaia
          message={message}
          variant={variant}
          showConfetti={showConfetti}
          onClose={() => setShowMaia(false)}
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
