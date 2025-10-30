import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLesson } from '@/hooks/useLesson';
import { FillBlanksLesson } from './FillBlanksLesson';
import { FillTextLesson } from './FillTextLesson';
import { DragDropLesson } from './DragDropLesson';
import { QuizPlaygroundLesson } from './QuizPlaygroundLesson';
import { FlashcardsLesson } from './FlashcardsLesson';
import { BeforeAfterLesson } from './BeforeAfterLesson';
import { supabase } from '@/integrations/supabase/client';

interface InteractiveLessonProps {
  lessonId: string;
}

export const InteractiveLesson = ({ lessonId }: InteractiveLessonProps) => {
  const { lesson, loading, submitting, submitAnswers, testInPlayground } = useLesson(lessonId);
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Aula não encontrada</p>
      </div>
    );
  }

  const handleSubmit = async (answers: any) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const result = await submitAnswers(answers, timeSpent);
    
    if (result?.passed && lesson) {
      // Buscar próxima aula da trilha
      const { data: nextLesson } = await supabase
        .from('lessons')
        .select('id, lesson_type')
        .eq('trail_id', lesson.trail_id)
        .eq('is_active', true)
        .gt('order_index', lesson.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextLesson) {
        // Navegar para próxima aula
        const route = nextLesson.lesson_type 
          ? `/lessons-interactive/${nextLesson.id}` 
          : `/lessons/${nextLesson.id}`;
        setTimeout(() => navigate(route), 1500);
      } else {
        // Última aula, voltar para trilha
        setTimeout(() => navigate(`/trails/${lesson.trail_id}`), 1500);
      }
    }
    
    return result;
  };

  const componentProps = {
    content: lesson.content as any,
    onSubmit: handleSubmit,
    testInPlayground,
    submitting,
    previousAnswers: lesson.user_answers,
    previousScore: lesson.user_score,
  };

  switch (lesson.lesson_type) {
    case 'fill-blanks':
      return <FillBlanksLesson {...componentProps} />;
    case 'fill-text':
      return <FillTextLesson {...componentProps} />;
    case 'drag-drop':
      return <DragDropLesson {...componentProps} />;
    case 'quiz-playground':
      return <QuizPlaygroundLesson {...componentProps} />;
    case 'flashcards':
      return <FlashcardsLesson {...componentProps} />;
    case 'before-after':
      return <BeforeAfterLesson {...componentProps} />;
    default:
      return (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Tipo de aula não suportado</p>
        </div>
      );
  }
};
