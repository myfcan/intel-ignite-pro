import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LessonContent {
  [key: string]: any;
}

export interface Lesson {
  id: string;
  trail_id: string;
  title: string;
  description: string;
  lesson_type: 'fill-blanks' | 'drag-drop' | 'quiz-playground' | 'before-after' | 'flashcards';
  content: LessonContent;
  passing_score: number;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  user_status?: string;
  user_score?: number;
  user_answers?: any;
  attempts?: number;
}

export const useLesson = (lessonId: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Faça login para continuar",
          variant: "destructive",
        });
        return;
      }

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('status, score, answers, attempts')
        .eq('lesson_id', lessonId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      setLesson({
        ...lessonData,
        lesson_type: lessonData.lesson_type as any,
        content: lessonData.content as LessonContent,
        user_status: progressData?.status || 'not_started',
        user_score: progressData?.score || 0,
        user_answers: progressData?.answers,
        attempts: progressData?.attempts || 0,
      });
    } catch (error: any) {
      console.error('Failed to fetch lesson:', error);
      toast({
        title: "Erro ao carregar aula",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async (answers: any, timeSpent: number) => {
    if (!lesson) return null;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Calculate score based on lesson type
      const score = calculateScore(lesson.lesson_type, lesson.content, answers);
      const passed = score >= lesson.passing_score;

      // Upsert progress
      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          lesson_id: lesson.id,
          answers: answers,
          score: score,
          time_spent_seconds: timeSpent,
          status: passed ? 'completed' : 'in_progress',
          completed_at: passed ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (upsertError) throw upsertError;

      // Check for perfect score achievement
      if (score === 100) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: session.user.id,
            achievement_type: 'perfect_score',
            achievement_name: 'Perfeito!',
            lesson_id: lesson.id,
            points_earned: 20,
          });
      }

      await fetchLesson(); // Refresh lesson data

      return {
        score,
        passed,
        feedback: generateFeedback(score),
      };
    } catch (error: any) {
      console.error('Failed to submit answers:', error);
      toast({
        title: "Erro ao enviar respostas",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const testInPlayground = async (prompt: string) => {
    if (!lesson) return null;

    try {
      const { data, error } = await supabase.functions.invoke('lesson-playground', {
        body: { lessonId: lesson.id, prompt },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Playground error:', error);
      toast({
        title: "Erro no playground",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return { lesson, loading, submitting, submitAnswers, testInPlayground, refetch: fetchLesson };
};

// Helper functions
function calculateScore(lessonType: string, content: any, answers: any): number {
  switch (lessonType) {
    case 'fill-blanks': {
      if (!content.sentences || !Array.isArray(content.sentences)) return 0;
      const correct = content.sentences.filter((s: any, i: number) => {
        const userAnswer = answers[i];
        const correctAnswer = s.correct;
        return JSON.stringify(userAnswer?.sort?.()) === JSON.stringify(correctAnswer?.sort?.());
      }).length;
      return Math.round((correct / content.sentences.length) * 100);
    }
    case 'drag-drop': {
      return JSON.stringify(content.correctOrder) === JSON.stringify(answers) ? 100 : 50;
    }
    case 'quiz-playground': {
      return answers.quizCorrect ? 100 : 0;
    }
    case 'flashcards': {
      if (!content.cards || !Array.isArray(content.cards)) return 0;
      const totalCards = content.cards.length;
      const knownCards = answers.filter((a: string) => a === 'yes').length;
      return Math.round((knownCards / totalCards) * 100);
    }
    case 'before-after': {
      // Score based on AI feedback quality
      return answers.improved ? 80 : 50;
    }
    default:
      return 0;
  }
}

function generateFeedback(score: number): string {
  if (score === 100) return "🎉 Perfeito! Você dominou este conteúdo!";
  if (score >= 80) return "💪 Muito bem! Continue assim!";
  if (score >= 60) return "👍 Bom trabalho! Revise os pontos que errou.";
  return "📚 Que tal revisar o conteúdo e tentar novamente?";
}
