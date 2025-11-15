import { useState, useEffect } from 'react';
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
import { fundamentos02 } from '@/data/lessons/fundamentos-02';
import { fundamentos03 } from '@/data/lessons/fundamentos-03';
import { fundamentos04 } from '@/data/lessons/fundamentos-04';
import { WordTimestamp } from '@/types/guidedLesson';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveLessonProps {
  lessonId: string;
}

export const InteractiveLesson = ({ lessonId }: InteractiveLessonProps) => {
  const { lesson, loading, submitting, submitAnswers, testInPlayground } = useLesson(lessonId);
  const [startTime] = useState(Date.now());
  const [showMaia, setShowMaia] = useState(false);
  const [isLastLesson, setIsLastLesson] = useState(false);
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);
  const [nextLessonData, setNextLessonData] = useState<{ id: string; lesson_type: string } | null>(null);
  const navigate = useNavigate();

  // Buscar word_timestamps e próxima aula do banco para aulas guiadas
  useEffect(() => {
    const fetchLessonData = async () => {
      if (lesson?.lesson_type === 'guided') {
        // Buscar timestamps
        const { data } = await supabase
          .from('lessons')
          .select('word_timestamps')
          .eq('id', lessonId)
          .single();
        
        if (data?.word_timestamps) {
          setWordTimestamps(data.word_timestamps as unknown as WordTimestamp[]);
        }

        // Buscar próxima lição
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
          setNextLessonData({ id: nextLesson.id, lesson_type: nextLesson.lesson_type });
        } else {
          setNextLessonData(null);
        }
      }
    };
    
    fetchLessonData();
  }, [lessonId, lesson?.lesson_type, lesson?.trail_id, lesson?.order_index]);

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
      const handleGuidedComplete = async (data?: { audioProgress?: number; allExercisesCompleted?: boolean }) => {
        // Marca a aula como completa
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await submitAnswers({ 
          audioProgress: data?.audioProgress || 0,
          allExercisesCompleted: data?.allExercisesCompleted || false 
        }, timeSpent);
        
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

      // Cache busting - usar content mais recente
      let guidedLessonData = null;
      
      const dbContent = lesson.content && typeof lesson.content === 'object' && 'sections' in lesson.content 
        ? lesson.content as any 
        : null;
      
      let localContent = null;
      if (lesson.title.includes('que é a IA')) {
        localContent = fundamentos01;
      } else if (lesson.title.includes('com Você')) {
        localContent = fundamentos02;
      } else if (lesson.title.includes('Cérebro Digital')) {
        localContent = fundamentos03;
      } else if (lesson.title.includes('Seu Bolso')) {
        localContent = fundamentos04;
      }
      
      const dbVersion = dbContent?.contentVersion || 0;
      const localVersion = localContent?.contentVersion || 0;
      
      if (localVersion > dbVersion && localContent) {
        console.log('Using local content version', localVersion);
        guidedLessonData = localContent;
      } else if (dbContent) {
        console.log('Using database version', dbVersion);
        guidedLessonData = dbContent;
      } else if (localContent) {
        console.log('Fallback to local data', localVersion);
        guidedLessonData = localContent;
      }

      // ✅ MERGE exercises from database into content.exercisesConfig
      // SEMPRE usar exercises do banco se existirem (prioridade sobre conteúdo local)
      console.log('🔍 [DEBUG MERGE] Antes do merge:', {
        hasGuidedData: !!guidedLessonData,
        lessonExercises: lesson.exercises,
        isArray: Array.isArray(lesson.exercises),
        length: lesson.exercises?.length,
        currentExercisesConfig: guidedLessonData?.exercisesConfig
      });

      console.log('🔍 [DEBUG] lesson.exercises RAW:', lesson.exercises);
      console.log('🔍 [DEBUG] typeof lesson.exercises:', typeof lesson.exercises);
      console.log('🔍 [DEBUG] Condições:', {
        hasLessonExercises: !!lesson.exercises,
        isArray: Array.isArray(lesson.exercises),
        hasLength: lesson.exercises?.length > 0,
        guidedLessonDataExists: !!guidedLessonData
      });

      if (guidedLessonData) {
        if (lesson.exercises && Array.isArray(lesson.exercises) && lesson.exercises.length > 0) {
          guidedLessonData = {
            ...guidedLessonData,
            exercisesConfig: lesson.exercises
          };
          console.log('✅ Merged exercises from database:', lesson.exercises.length, 'exercises');
          console.log('🔍 First exercise:', lesson.exercises[0]);
          console.log('🔍 [DEBUG MERGE] Depois do merge:', {
            exercisesConfigLength: guidedLessonData.exercisesConfig?.length,
            exercisesConfig: guidedLessonData.exercisesConfig
          });
        } else {
          console.error('❌ MERGE FALHOU! Motivos possíveis:', {
            noExercises: !lesson.exercises,
            notArray: !Array.isArray(lesson.exercises),
            emptyArray: lesson.exercises?.length === 0,
            exercisesValue: lesson.exercises
          });
        }
      } else {
        console.error('❌ guidedLessonData não existe!');
      }

      // FIX CRITICO: Buscar audioUrl do content se coluna estiver null
      let audioUrl = lesson.audio_url || 
                     (guidedLessonData?.sections?.[0]?.audio_url) || 
                     null;
      
      console.log('Audio URL resolved:', {
        fromDB: lesson.audio_url,
        fromContent: guidedLessonData?.sections?.[0]?.audio_url,
        final: audioUrl
      });

      if (!guidedLessonData) {
        return (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Conteúdo da aula guiada não encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">Título da aula: {lesson.title}</p>
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
            wordTimestamps={wordTimestamps.length > 0 ? wordTimestamps : undefined}
            nextLessonId={nextLessonData?.id}
            nextLessonType={nextLessonData?.lesson_type}
            trailId={lesson.trail_id}
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <FillBlanksLesson {...componentProps} />
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <FillTextLesson {...componentProps} />
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <DragDropLesson {...componentProps} />
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <QuizPlaygroundLesson {...componentProps} />
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <FlashcardsLesson {...componentProps} />
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/trails/${lesson.trail_id}`)}
                  className="flex-shrink-0"
                  aria-label="Voltar para trilha"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lesson?.title}</h1>
                </div>
              </div>
            </header>
            <div className="container mx-auto px-4 py-6">
              <BeforeAfterLesson {...componentProps} />
            </div>
          </div>
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
