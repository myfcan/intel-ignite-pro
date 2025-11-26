import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "@/components/lesson/AudioPlayer";
import { MultipleChoiceExercise } from "@/components/lesson/MultipleChoiceExercise";
import { PlaygroundComponent } from "@/components/lesson/PlaygroundComponent";
import { ExerciseSummaryCard } from "@/components/lesson/ExerciseSummaryCard";
import { updateMissionProgress } from "@/lib/updateMissionProgress";
import { registerGamificationEvent, GamificationResult } from "@/services/gamification";
import { LessonResultCard } from "@/components/gamification/LessonResultCard";
import { useUserGamification } from "@/hooks/useUserGamification";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any;
  lesson_type?: string;
  passing_score?: number;
  estimated_time: number;
  difficulty_level: string;
  trail_id?: string;
  order_index: number;
}

interface Exercise {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [startTime] = useState(Date.now());
  const [showResultCard, setShowResultCard] = useState(false);
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);
  const { refresh: refreshGamification } = useUserGamification();

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("lesson_id", id)
        .order("order_index");

      if (exercisesError) throw exercisesError;
      
      // Transform exercises data to match Exercise interface
      const transformedExercises = (exercisesData || []).map(exercise => ({
        ...exercise,
        options: Array.isArray(exercise.options) 
          ? exercise.options 
          : typeof exercise.options === 'string'
            ? JSON.parse(exercise.options)
            : []
      }));
      
      setExercises(transformedExercises);

      // Mark lesson as started (session already verified above)
      await supabase.functions.invoke("user-progress", {
        body: {
          action: "start",
          lesson_id: id,
        },
      });

    } catch (error: any) {
      console.error("Error fetching lesson:", error);
      toast({
        title: "Erro ao carregar aula",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // 📊 Atualizar missão de exercícios
      await updateMissionProgress('exercicios', 1);
    }

    // Avança para próximo exercício
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Terminou todos os exercícios
      setShowResults(true);
    }
  };

  const handleTryAgain = () => {
    setCurrentExerciseIndex(0);
    setCorrectAnswers(0);
    setShowResults(false);
    setShowPlayground(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Novo fluxo: Exercícios → Gamificação → Playground
  const handleContinueFromExercises = async () => {
    // 🎮 GAMIFICAÇÃO: Registrar evento e mostrar card de resultado
    const result = await registerGamificationEvent('lesson_completed', id);
    if (result) {
      setGamificationResult(result);
      setShowResultCard(true);
      refreshGamification(); // Atualiza o header
    }
  };

  const handleContinueFromGamification = async () => {
    setShowResultCard(false);
    
    // Buscar próxima aula da trilha
    if (lesson?.trail_id) {
      try {
        const { data: nextLesson, error } = await supabase
          .from('lessons')
          .select('id, order_index')
          .eq('trail_id', lesson.trail_id)
          .gt('order_index', lesson.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();
        
        if (!error && nextLesson) {
          navigate(`/lessons-interactive/${nextLesson.id}`);
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar próxima aula:', error);
      }
    }
    
    // Se não houver próxima aula, vai para o dashboard
    navigate('/dashboard');
  };
  
  const handleBackToTrail = () => {
    setShowResultCard(false);
    if (lesson?.trail_id) {
      navigate(`/trail/${lesson.trail_id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleCompleteLesson = async () => {
    try {
      // Verify authentication
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Erro de autenticação",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const { data, error } = await supabase.functions.invoke("user-progress", {
        body: {
          action: "complete",
          lesson_id: id,
          time_spent: timeSpent,
        },
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        throw error;
      }

      // 📊 Atualizar missão de aulas completadas
      await updateMissionProgress('aulas', 1);

      // 🎮 Nota: A gamificação já foi registrada quando o usuário avançou dos exercícios
      // Aqui apenas mostramos um toast de confirmação
      toast({
        title: "Aula concluída! 🎉",
        description: "Parabéns por finalizar a aula!",
      });

      if (data.new_achievements?.length > 0) {
        toast({
          title: "Nova conquista!",
          description: data.new_achievements[0].achievement_name,
        });
      }

    } catch (error: any) {
      console.error("Error completing lesson:", error);
      toast({
        title: "Erro ao concluir aula",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Aula não encontrada</h2>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const percentage = exercises.length > 0 ? Math.round((correctAnswers / exercises.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimated_time} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span className="capitalize">{lesson.difficulty_level}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-lg text-muted-foreground">{lesson.description}</p>
            )}
          </div>

          <Separator />

          {/* Content Section */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Conteúdo da Aula</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content, null, 2)}
              </div>
            </div>
          </Card>

          <Separator />

          {/* Exercises - Uma pergunta por vez */}
          {exercises.length > 0 && !showResults && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Exercícios</h2>
                <div className="text-sm text-muted-foreground">
                  Questão {currentExerciseIndex + 1} de {exercises.length}
                </div>
              </div>
              
              {currentExercise && (
                <MultipleChoiceExercise
                  key={currentExercise.id}
                  question={`${currentExerciseIndex + 1}. ${currentExercise.question}`}
                  options={currentExercise.options}
                  correctAnswer={currentExercise.correct_answer}
                  explanation={currentExercise.explanation}
                  onComplete={handleExerciseComplete}
                />
              )}
            </div>
          )}

          {/* Tela de Resultado Resumido */}
          {showResults && (
            <>
              <Separator />
              <ExerciseSummaryCard
                totalQuestions={exercises.length}
                correctAnswers={correctAnswers}
                onContinue={handleContinueFromExercises}
              />
            </>
          )}

          {/* Playground - só aparece depois do resultado */}
          {showPlayground && (
            <>
              <Separator />
              <div id="playground-section">
                <PlaygroundComponent
                  lessonId={lesson.id}
                  userId={userId}
                  title="🎮 Playground: Pratique com Maia"
                  description="Coloque em prática o que aprendeu conversando com a Maia!"
                />
              </div>

              <Separator />

              {/* Complete Lesson */}
              <Card className="p-6 md:p-8 bg-gradient-to-br from-success/10 to-primary/10 border-2 border-success/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">
                      Parabéns! Você completou a aula! 🎉
                    </h3>
                    <p className="text-muted-foreground">
                      Clique em "Marcar como Concluída" para finalizar e ganhar pontos.
                    </p>
                  </div>
                  <Button
                    onClick={handleCompleteLesson}
                    size="lg"
                    className="gap-2 h-12"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Marcar como Concluída
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Navigation */}
          {showPlayground && (
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar ao Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* 🎮 CARD DE RESULTADO DA GAMIFICAÇÃO */}
      {showResultCard && gamificationResult && (
        <LessonResultCard
          xpDelta={gamificationResult.xp_delta}
          coinsDelta={gamificationResult.coins_delta}
          newPowerScore={gamificationResult.new_power_score}
          newCoins={gamificationResult.new_coins}
          patentName={gamificationResult.patent_name}
          isNewPatent={gamificationResult.is_new_patent}
          nextPatentThreshold={getNextPatentThreshold(gamificationResult.new_patent_level)}
          onContinue={handleContinueFromGamification}
          onBackToTrail={handleBackToTrail}
        />
      )}
    </div>
  );
};

// Helper para calcular próxima patente
function getNextPatentThreshold(currentLevel: number): number | undefined {
  const thresholds = [200, 600, 1200];
  return thresholds[currentLevel];
}

export default Lesson;