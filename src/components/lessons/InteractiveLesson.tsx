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
import { GuidedLessonV4 } from './GuidedLessonV4';
import { supabase } from '@/integrations/supabase/client';
import { MiniMaia } from '@/components/MiniMaia';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { fundamentos02 } from '@/data/lessons/fundamentos-02';
import { fundamentos03 } from '@/data/lessons/fundamentos-03';
import { fundamentos04 } from '@/data/lessons/fundamentos-04';
import { WordTimestamp, ExerciseConfig } from '@/types/guidedLesson';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ============================================================================
 * NORMALIZAÇÃO DE EXERCÍCIOS
 * ============================================================================
 * Garante que todos os exercícios vindos do banco tenham a estrutura correta
 * de acordo com ExerciseConfig interface.
 *
 * Adiciona campos obrigatórios se estiverem ausentes:
 * - id: gerado automaticamente se não existir
 * - type: validado contra tipos permitidos
 * - title: fornece fallback se vazio
 * - instruction: fornece fallback se vazio
 * - data: garante que existe (objeto vazio se não houver)
 * ============================================================================
 */
function normalizeExercises(rawExercises: any[]): ExerciseConfig[] {
  if (!Array.isArray(rawExercises)) {
    console.warn('⚠️ normalizeExercises: rawExercises não é array', rawExercises);
    return [];
  }

  return rawExercises.map((exercise, index) => {
    console.log(`🔍 Normalizando exercício ${index}:`, exercise);

    // Garantir que tem um ID
    const id = exercise.id || `exercise-${index}`;

    // Validar tipo
    const validTypes = ['drag-drop', 'complete-sentence', 'scenario-selection', 'fill-in-blanks', 'true-false', 'platform-match', 'data-collection', 'multiple-choice'];
    const type = validTypes.includes(exercise.type) ? exercise.type : 'fill-in-blanks';

    if (!validTypes.includes(exercise.type)) {
      console.warn(`⚠️ Exercício ${id}: tipo inválido "${exercise.type}", usando fallback "fill-in-blanks"`);
    }

    // Garantir campos obrigatórios
    const normalized: ExerciseConfig = {
      id,
      type,
      title: exercise.title || `Exercício ${index + 1}`,
      instruction: exercise.instruction || 'Complete este exercício',
      data: exercise.data || {},
      passingScore: exercise.passingScore || 70,
      maxAttempts: exercise.maxAttempts
    };

    // 🔧 MIGRAÇÃO AUTOMÁTICA: Mover hints para o lugar correto se estiverem no lugar errado
    // Se hints estiver no nível raiz do exercício, migrar para data.sentences[].hints
    if (exercise.hints && Array.isArray(exercise.hints) && (type === 'complete-sentence' || type === 'fill-in-blanks')) {
      console.log(`🔄 Migrando hints do nível raiz para data.sentences[].hints no exercício ${id}`);

      // Garantir que data.sentences existe
      if (!normalized.data.sentences) {
        normalized.data.sentences = [];
      }

      // Migrar hints para cada sentence que não tenha hints
      if (Array.isArray(normalized.data.sentences)) {
        normalized.data.sentences = normalized.data.sentences.map((sentence: any) => {
          if (!sentence.hints) {
            return { ...sentence, hints: exercise.hints };
          }
          return sentence;
        });

        console.log(`✅ Hints migrados com sucesso para ${normalized.data.sentences.length} sentence(s)`);
      }
    }

    console.log(`✅ Exercício ${id} normalizado:`, normalized);

    return normalized;
  });
}

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

      if (isLast) {
        // Última aula - mostra Maia de celebração
        setIsLastLesson(true);
        setTimeout(() => setShowMaia(true), 1000);
      }

      // NÃO redirecionar automaticamente - deixar usuário clicar nos botões
      // Os botões estão nos componentes ExerciseResults/ConclusionScreen
      return { ...result, isLastLesson: isLast };
    }
    
    return { ...result, isLastLesson: false };
  };

  const handleMaiaClose = async () => {
    setShowMaia(false);
    
    // Salvar flag de que a Maia de completion já foi mostrada para não reaparecer
    if (lesson && isLastLesson) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userId = session.user.id;
        localStorage.setItem(`maia-completion-${userId}-${lesson.trail_id}`, 'true');
      }
    }
    
    // Não redirecionar automaticamente - deixar o usuário usar os botões do ConclusionScreen
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

      // Função para APENAS marcar aula como completa (sem navegar)
      const markLessonComplete = async () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await submitAnswers({
          audioProgress: 100,
          allExercisesCompleted: true
        }, timeSpent);
      };

      // Função LEGADO para compatibilidade (não deve ser chamada do ConclusionScreen)
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

      // ✅ CRIAR OBJETO COMPLETO para GuidedLesson com TODOS os campos necessários
      if (guidedLessonData) {
        // ============================================================================
        // NORMALIZAR EXERCÍCIOS (ADICIONADO 2025-11-15)
        // ============================================================================
        // Usa normalizeExercises() para garantir estrutura correta
        // Prioridade: exercises do DB → exercisesConfig do content local
        // ============================================================================
        let normalizedExercises: ExerciseConfig[] | undefined = undefined;

        if (lesson.exercises && Array.isArray(lesson.exercises) && lesson.exercises.length > 0) {
          console.log('📝 Normalizando exercícios do banco de dados...');
          normalizedExercises = normalizeExercises(lesson.exercises);
        } else if (guidedLessonData.exercisesConfig) {
          console.log('📝 Usando exercícios do content (já devem estar normalizados)');
          normalizedExercises = guidedLessonData.exercisesConfig;
        }

        console.log('✅ Exercícios normalizados:', {
          fromDB: lesson.exercises?.length || 0,
          fromContent: guidedLessonData.exercisesConfig?.length || 0,
          normalized: normalizedExercises?.length || 0,
          structure: normalizedExercises?.[0]
        });

        // 🔍 DEBUG: Verificar estrutura do playgroundConfig no content
        console.log('🔍 [INTERACTIVE→GUIDED] Estrutura do content:', {
          hasSections: !!guidedLessonData.sections,
          numSections: guidedLessonData.sections?.length || 0,
          firstSectionPlayground: guidedLessonData.sections?.[0]?.playgroundConfig ? {
            type: guidedLessonData.sections[0].playgroundConfig.type,
            hasRealConfig: !!guidedLessonData.sections[0].playgroundConfig.realConfig,
            realConfigStructure: guidedLessonData.sections[0].playgroundConfig.realConfig ? 
              Object.keys(guidedLessonData.sections[0].playgroundConfig.realConfig) : [],
            fullPlaygroundConfig: JSON.stringify(guidedLessonData.sections[0].playgroundConfig, null, 2)
          } : null
        });

        guidedLessonData = {
          id: lesson.id,
          title: lesson.title,
          trackId: lesson.trail_id,
          trackName: '', // Não temos esse dado aqui, mas não é usado
          duration: lesson.estimated_time ? lesson.estimated_time * 60 : 0,
          sections: guidedLessonData.sections || [],
          // Usar normalizedExercises se existir e tiver items, senão fallback para content
          exercisesConfig: normalizedExercises && normalizedExercises.length > 0
            ? normalizedExercises
            : guidedLessonData.exercisesConfig,
          finalPlaygroundConfig: guidedLessonData.finalPlaygroundConfig,
          contentVersion: guidedLessonData.contentVersion
        };

        console.log('✅ Objeto GuidedLessonData completo criado:', {
          hasId: !!guidedLessonData.id,
          hasTitle: !!guidedLessonData.title,
          hasSections: guidedLessonData.sections?.length,
          hasExercises: !!guidedLessonData.exercisesConfig,
          exercisesCount: guidedLessonData.exercisesConfig?.length
        });
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

      // 🐛 DEBUG: Log do modelo da lição para diagnóstico
      console.log('🔍 [INTERACTIVE] Renderizando lição guiada:', {
        lessonId: lesson.id,
        title: lesson.title,
        model: lesson.model,
        willUseV4Component: lesson.model === 'v4',
        hasExercises: !!guidedLessonData?.exercisesConfig,
        exercisesCount: guidedLessonData?.exercisesConfig?.length || 0
      });

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
          {lesson.model === 'v4' ? (
            <GuidedLessonV4
              lessonData={guidedLessonData}
              onComplete={handleGuidedComplete}
              onMarkComplete={markLessonComplete}
              audioUrl={audioUrl}
              wordTimestamps={wordTimestamps.length > 0 ? wordTimestamps : undefined}
              nextLessonId={nextLessonData?.id}
              nextLessonType={nextLessonData?.lesson_type}
              trailId={lesson.trail_id}
            />
          ) : (
            <GuidedLesson
              lessonData={guidedLessonData}
              onComplete={handleGuidedComplete}
              onMarkComplete={markLessonComplete}
              audioUrl={audioUrl}
              wordTimestamps={wordTimestamps.length > 0 ? wordTimestamps : undefined}
              nextLessonId={nextLessonData?.id}
              nextLessonType={nextLessonData?.lesson_type}
              trailId={lesson.trail_id}
            />
          )}
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
