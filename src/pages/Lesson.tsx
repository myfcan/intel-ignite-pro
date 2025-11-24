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
import { ExerciseResults } from "@/components/lesson/ExerciseResults";
import { updateMissionProgress } from "@/lib/updateMissionProgress";
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

  const handleContinueToPlayground = () => {
    setShowPlayground(true);
    // Scroll suave para o playground
    setTimeout(() => {
      document.getElementById('playground-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
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

      toast({
        title: "Aula concluída! 🎉",
        description: `Você ganhou ${data.points_earned} pontos!`,
      });

      if (data.new_achievements?.length > 0) {
        toast({
          title: "Nova conquista!",
          description: data.new_achievements[0].achievement_name,
        });
      }

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

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
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }}
      />
      
      {/* Purple Gradient at Bottom */}
      <div 
        className="fixed inset-x-0 bottom-0 h-64 opacity-20"
        style={{
          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.4) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 30px rgba(139, 92, 246, 0.1)'
              }}>
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
            <div className="flex items-center gap-4 text-sm text-gray-400">
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

          {/* Tela de Resultado */}
          {showResults && (
            <>
              <Separator />
              <ExerciseResults
                totalQuestions={exercises.length}
                correctAnswers={correctAnswers}
                onTryAgain={handleTryAgain}
                onContinue={handleContinueToPlayground}
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
    </div>
  );
};

export default Lesson;