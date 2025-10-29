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
import { FeedbackCard } from "@/components/lesson/FeedbackCard";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  BookOpen
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_text: string;
  audio_url: string | null;
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
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
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

      // Mark lesson as started
      await supabase.functions.invoke("user-progress", {
        body: {
          action: "start",
          user_id: session.user.id,
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

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(new Set([...completedExercises, exerciseId]));
    toast({
      title: "Exercício completo!",
      description: "Continue assim! 🎉",
    });
  };

  const handleCompleteLesson = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const { data, error } = await supabase.functions.invoke("user-progress", {
        body: {
          action: "complete",
          user_id: userId,
          lesson_id: id,
          time_spent: timeSpent,
        },
      });

      if (error) throw error;

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

  const allExercisesCompleted = exercises.length === completedExercises.size;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
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

          {/* Audio Player */}
          {lesson.audio_url && (
            <AudioPlayer audioUrl={lesson.audio_url} />
          )}

          <Separator />

          {/* Content Section */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Conteúdo da Aula</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {lesson.content_text}
              </div>
            </div>
          </Card>

          <Separator />

          {/* Exercises */}
          {exercises.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Exercícios</h2>
              {exercises.map((exercise, index) => (
                <div key={exercise.id}>
                  <MultipleChoiceExercise
                    question={`${index + 1}. ${exercise.question}`}
                    options={exercise.options}
                    correctAnswer={exercise.correct_answer}
                    explanation={exercise.explanation}
                    onComplete={() => handleExerciseComplete(exercise.id)}
                  />
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Playground */}
          <PlaygroundComponent
            lessonId={lesson.id}
            userId={userId}
            title="🎮 Playground: Pratique Agora"
            description="Coloque em prática o que aprendeu usando a IA!"
          />

          {/* Feedback Example */}
          <FeedbackCard
            feedbackText="Ótimo trabalho! Você está progredindo bem. Para melhorar ainda mais, tente experimentar com diferentes contextos e tons."
            suggestions={[
              "Seja mais específico no contexto",
              "Experimente diferentes tons de voz",
              "Adicione detalhes relevantes ao seu objetivo",
            ]}
          />

          <Separator />

          {/* Complete Lesson */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-success/10 to-primary/10 border-2 border-success/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">
                  {allExercisesCompleted
                    ? "Parabéns! Você completou todos os exercícios!"
                    : "Continue praticando"}
                </h3>
                <p className="text-muted-foreground">
                  {allExercisesCompleted
                    ? "Clique em 'Marcar como Concluída' para finalizar esta aula."
                    : `Complete ${exercises.length - completedExercises.size} exercício(s) restante(s)`}
                </p>
              </div>
              <Button
                onClick={handleCompleteLesson}
                size="lg"
                className="gap-2 h-12"
                disabled={!allExercisesCompleted}
              >
                <CheckCircle2 className="w-5 h-5" />
                Marcar como Concluída
              </Button>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar à Trilha
            </Button>
            <Button variant="outline">
              Próxima Aula
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Community Section */}
          <Card className="p-6 border-2 border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">💬 Discussão da Aula</h3>
                <p className="text-sm text-muted-foreground">
                  42 comentários • Compartilhe sua experiência
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Ver Discussão
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Lesson;