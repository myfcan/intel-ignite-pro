import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLesson } from '@/hooks/useLesson';
import { FillBlanksLesson } from './FillBlanksLesson';
import { FillTextLesson } from './FillTextLesson';
import { DragDropLesson } from './DragDropLesson';
import { QuizPlaygroundLesson } from './QuizPlaygroundLesson';
import { FlashcardsLesson } from './FlashcardsLesson';
import { BeforeAfterLesson } from './BeforeAfterLesson';
import { GuidedLesson } from './GuidedLesson';
import { supabase } from '@/integrations/supabase/client';
import { MiniMaia } from '@/components/MiniMaia';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';

interface InteractiveLessonProps {
  lessonId: string;
}

export const InteractiveLesson = ({ lessonId }: InteractiveLessonProps) => {
  const { lesson, loading, submitting, submitAnswers, testInPlayground } = useLesson(lessonId);
  const [startTime] = useState(Date.now());
  const [showMaia, setShowMaia] = useState(false);
  const [isLastLesson, setIsLastLesson] = useState(false);
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

      const isLast = !nextLesson;
      
      if (!isLast) {
        // Tem próxima aula - aguarda um pouco e navega
        const route = nextLesson.lesson_type 
          ? `/lessons-interactive/${nextLesson.id}` 
          : `/lessons/${nextLesson.id}`;
        setTimeout(() => navigate(route), 2500);
      } else {
        // Última aula - mostra Maia e depois volta para trilha
        setIsLastLesson(true);
        setTimeout(() => setShowMaia(true), 1000);
      }
      
      return { ...result, isLastLesson: isLast };
    }
    
    return { ...result, isLastLesson: false };
  };

  const handleMaiaClose = () => {
    setShowMaia(false);
    if (lesson) {
      navigate(`/trails/${lesson.trail_id}`);
    }
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
    case 'guided':
      // Aulas guiadas com MAIA narradora
      const handleGuidedComplete = async () => {
        // Marca a aula como completa
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await submitAnswers({}, timeSpent);
        
        // Buscar próxima aula
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
          const route = nextLesson.lesson_type 
            ? `/lessons-interactive/${nextLesson.id}` 
            : `/lessons/${nextLesson.id}`;
          navigate(route);
        } else {
          navigate(`/trails/${lesson.trail_id}`);
        }
      };

      // Mapeamento de lesson IDs para dados das aulas guiadas
      // TODO: Criar um sistema mais escalável de mapeamento
      let guidedLessonData = null;
      let audioUrl = null;
      
      if (lesson.title.includes('O que é IA e por que você precisa dela')) {
        guidedLessonData = fundamentos01;
        // Áudio já gerado está no public
        audioUrl = '/audio/maia-fundamentos.mp3';
      }

      if (!guidedLessonData) {
        return (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Conteúdo da aula guiada não encontrado</p>
          </div>
        );
      }

      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <GuidedLesson 
            lessonData={guidedLessonData}
            onComplete={handleGuidedComplete}
            audioUrl={audioUrl}
          />
        </>
      );
    case 'fill-blanks':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <FillBlanksLesson {...componentProps} />
        </>
      );
    case 'fill-text':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <FillTextLesson {...componentProps} />
        </>
      );
    case 'drag-drop':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <DragDropLesson {...componentProps} />
        </>
      );
    case 'quiz-playground':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <QuizPlaygroundLesson {...componentProps} />
        </>
      );
    case 'flashcards':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <FlashcardsLesson {...componentProps} />
        </>
      );
    case 'before-after':
      return (
        <>
          {showMaia && isLastLesson && (
            <MiniMaia
              message="🎉 Parabéns! Você concluiu todas as aulas desta trilha! Continue assim e você vai dominar a IA!"
              variant="celebration"
              showConfetti={true}
              onClose={handleMaiaClose}
            />
          )}
          <BeforeAfterLesson {...componentProps} />
        </>
      );
    default:
      return (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Tipo de aula não suportado</p>
        </div>
      );
  }
};
