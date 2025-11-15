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
  lesson_type: 'fill-blanks' | 'fill-text' | 'drag-drop' | 'quiz-playground' | 'before-after' | 'flashcards' | 'guided';
  content: LessonContent;
  passing_score: number;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  audio_url?: string | null;
  user_status?: string;
  user_score?: number;
  user_answers?: any;
  attempts?: number;
  exercises?: any[];  // 🆕 Exercícios salvos no banco
  exercises_version?: number;  // 🆕 Versão dos exercícios
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

      console.log('🎯 [SUBMIT] Enviando respostas para aula:', lesson.title);
      console.log('🎯 [SUBMIT] Lesson ID:', lesson.id);
      console.log('🎯 [SUBMIT] Tempo gasto:', timeSpent, 'segundos');

      // Calculate score based on lesson type
      const score = calculateScore(lesson.lesson_type, lesson.content, answers);
      const passed = score >= lesson.passing_score;

      console.log('🎯 [SUBMIT] Score calculado:', score, '/', lesson.passing_score);
      console.log('🎯 [SUBMIT] Passou?', passed);

      // Call user-progress edge function to handle completion and points
      if (passed) {
        console.log('✅ [SUBMIT] Chamando edge function user-progress...');
        const { data: progressResult, error: progressError } = await supabase.functions.invoke('user-progress', {
          body: {
            action: 'complete',
            lesson_id: lesson.id,
            time_spent: timeSpent,
          },
        });

        if (progressError) {
          console.error('❌ [SUBMIT] Erro ao chamar edge function:', progressError);
        } else {
          console.log('✅ [SUBMIT] Edge function executada com sucesso!');
          console.log('🎁 [SUBMIT] Pontos ganhos:', progressResult?.points_earned);
        }
      }

      // Buscar progresso atual para preservar audio_progress_percentage
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('audio_progress_percentage')
        .eq('user_id', session.user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();
      
      const audioProgress = answers.audioProgress || 0;
      const maxAudioProgress = Math.max(audioProgress, currentProgress?.audio_progress_percentage || 0);
      
      // Upsert progress
      console.log('💾 [SUBMIT] Salvando progresso no banco...');
      console.log('🎵 [SUBMIT] Audio progress:', audioProgress, '→ max:', maxAudioProgress);
      
      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          lesson_id: lesson.id,
          answers: answers,
          score: score,
          audio_progress_percentage: maxAudioProgress,
          time_spent_seconds: timeSpent,
          status: passed ? 'completed' : 'in_progress',
          completed_at: passed ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (upsertError) {
        console.error('❌ [SUBMIT] Erro ao salvar no banco:', upsertError);
        throw upsertError;
      }

      console.log('✅ [SUBMIT] Progresso salvo com sucesso! Status:', passed ? 'completed' : 'in_progress');

      return {
        score,
        passed,
        feedback: generateFeedback(score),
      };
    } catch (error: any) {
      console.error('❌ [SUBMIT] Erro geral:', error);
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
    case 'guided': {
      // 🎯 Nova lógica: 100% só se assistiu 100% do áudio E completou todos exercícios (se existirem)
      const audioProgress = answers.audioProgress || 0;
      const hasExercises = content.exercisesConfig || content.finalPlaygroundConfig;
      
      if (hasExercises) {
        // Tem exercícios: precisa 100% áudio + todos exercícios completados
        const allExercisesCompleted = answers.allExercisesCompleted || false;
        console.log('📊 [SCORE-GUIDED] Audio:', audioProgress, '% | Exercises done:', allExercisesCompleted);
        return (audioProgress >= 100 && allExercisesCompleted) ? 100 : audioProgress;
      } else {
        // Sem exercícios: precisa apenas 100% do áudio
        console.log('📊 [SCORE-GUIDED] Audio only:', audioProgress, '%');
        return audioProgress;
      }
    }
    case 'fill-blanks': {
      if (!content.sentences || !Array.isArray(content.sentences)) return 0;
      const correct = content.sentences.filter((s: any, i: number) => {
        const userAnswer = answers[i];
        const correctAnswer = s.correct;
        return JSON.stringify(userAnswer?.sort?.()) === JSON.stringify(correctAnswer?.sort?.());
      }).length;
      return Math.round((correct / content.sentences.length) * 100);
    }
    case 'fill-text': {
      if (!content.exercises || !Array.isArray(content.exercises)) return 0;
      let totalBlanks = 0;
      let correctBlanks = 0;
      
      content.exercises.forEach((exercise: any, exerciseIdx: number) => {
        const userAnswers = answers[exerciseIdx] || [];
        exercise.blanks.forEach((blank: any, blankIdx: number) => {
          totalBlanks++;
          const userAnswer = (userAnswers[blankIdx] || '').toLowerCase().trim();
          const hasKeyword = blank.keywords.some((keyword: string) => 
            userAnswer.includes(keyword.toLowerCase())
          );
          if (hasKeyword) correctBlanks++;
        });
      });
      
      return totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * 100) : 0;
    }
    case 'drag-drop': {
      return JSON.stringify(content.correctOrder) === JSON.stringify(answers) ? 100 : 50;
    }
    case 'quiz-playground': {
      return answers.quizCorrect ? 100 : 0;
    }
    case 'flashcards': {
      // Flashcards são informativos, sempre retornam 100% ao concluir
      return 100;
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
