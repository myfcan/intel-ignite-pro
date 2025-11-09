import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { fundamentos02 } from '@/data/lessons/fundamentos-02';
import { supabase } from '@/integrations/supabase/client';
import { GuidedLessonData } from '@/types/guidedLesson';

// Componentes reais de exercício
import { FillInBlanksExercise } from '@/components/lessons/FillInBlanksExercise';
import { TrueFalseExercise } from '@/components/lessons/TrueFalseExercise';
import { ScenarioSelectionExercise } from '@/components/lessons/ScenarioSelectionExercise';
import { DataCollectionExercise } from '@/components/lessons/DataCollectionExercise';
import { Badge } from '@/components/ui/badge';

// Mapa de aulas disponíveis
const AVAILABLE_LESSONS = {
  'fundamentos-01': fundamentos01,
  'fundamentos-02': fundamentos02,
};

type ExerciseStatus = 'pending' | 'approved' | 'needs-review';

interface ExerciseState {
  status: ExerciseStatus;
  completed: boolean;
}

export default function AdminLessonTester() {
  const navigate = useNavigate();
  const [selectedLessonKey, setSelectedLessonKey] = useState<string>('');
  const [exerciseStates, setExerciseStates] = useState<Record<string, ExerciseState>>({});
  const [publishing, setPublishing] = useState(false);

  const selectedLesson = selectedLessonKey 
    ? AVAILABLE_LESSONS[selectedLessonKey as keyof typeof AVAILABLE_LESSONS]
    : null;

  const handleExerciseComplete = (exerciseId: string) => {
    setExerciseStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: true
      }
    }));
  };

  const handleApprove = (exerciseId: string) => {
    setExerciseStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        status: 'approved'
      }
    }));
    toast.success('✅ Exercício aprovado!');
  };

  const handleMarkForReview = (exerciseId: string) => {
    setExerciseStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        status: 'needs-review'
      }
    }));
    toast.warning('⚠️ Exercício marcado para revisão');
  };

  const handlePublishAll = async () => {
    if (!selectedLesson) return;

    // Verificar se todos os exercícios foram aprovados
    const allApproved = selectedLesson.exercisesConfig.every(ex => 
      exerciseStates[ex.id]?.status === 'approved'
    );

    if (!allApproved) {
      toast.error('❌ Todos os exercícios devem ser aprovados antes de publicar', {
        description: 'Teste e aprove cada exercício individualmente.'
      });
      return;
    }

    setPublishing(true);
    
    try {
      // Buscar trilha
      const { data: trail, error: trailError } = await supabase
        .from('trails')
        .select('id')
        .eq('title', 'Fundamentos de IA')
        .maybeSingle();

      if (trailError || !trail) {
        throw new Error('Trilha "Fundamentos de IA" não encontrada');
      }

      // Verificar se a aula já existe
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('title', selectedLesson.title)
        .maybeSingle();

      const lessonData = {
        title: selectedLesson.title,
        description: `Aula ${selectedLesson.trackName}`,
        trail_id: trail.id,
        order_index: selectedLessonKey === 'fundamentos-01' ? 1 : 2,
        lesson_type: 'guided' as const,
        passing_score: 70,
        estimated_time: selectedLesson.duration,
        difficulty_level: 'beginner' as const,
        content: {
          contentVersion: selectedLesson.contentVersion,
          sections: selectedLesson.sections,
          exercisesConfig: selectedLesson.exercisesConfig
        } as any
      };

      if (existingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', existingLesson.id);

        if (error) throw error;
        toast.success('✅ Aula atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);

        if (error) throw error;
        toast.success('✅ Aula publicada com sucesso!');
      }

      // Reset states após publicação
      setExerciseStates({});
      
    } catch (error: any) {
      toast.error('Erro ao publicar aula', {
        description: error.message
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleLessonChange = (value: string) => {
    setSelectedLessonKey(value);
    setExerciseStates({}); // Reset estados ao trocar de aula
  };

  const getStatusBadge = (status?: ExerciseStatus) => {
    if (!status || status === 'pending') {
      return <Badge variant="outline">Pendente</Badge>;
    }
    if (status === 'approved') {
      return <Badge className="bg-green-600">Aprovado</Badge>;
    }
    return <Badge className="bg-yellow-600">Precisa Revisão</Badge>;
  };

  const allApproved = selectedLesson 
    ? selectedLesson.exercisesConfig.every(ex => exerciseStates[ex.id]?.status === 'approved')
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">🎮 Testador Interativo de Exercícios</h1>
            <p className="text-muted-foreground">
              Teste cada exercício na prática e aprove individualmente
            </p>
          </div>
        </div>

        {/* Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Selecionar Aula
            </CardTitle>
            <CardDescription>
              Escolha uma aula para testar os exercícios interativamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedLessonKey}
              onValueChange={handleLessonChange}
              disabled={publishing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma aula para testar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundamentos-01">
                  Fundamentos 01 - O que é a IA
                </SelectItem>
                <SelectItem value="fundamentos-02">
                  Fundamentos 02 - Como a IA Aprende
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedLesson && (
              <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedLesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLesson.trackName}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Versão</p>
                    <p className="font-bold">v{selectedLesson.contentVersion}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>✏️ {selectedLesson.exercisesConfig.length} exercícios</span>
                  <span>
                    ✅ {selectedLesson.exercisesConfig.filter(ex => 
                      exerciseStates[ex.id]?.status === 'approved'
                    ).length} aprovados
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercícios Interativos */}
        {selectedLesson && (
          <div className="space-y-8">
            {selectedLesson.exercisesConfig.map((exercise, index) => {
              const state = exerciseStates[exercise.id];
              const isCompleted = state?.completed;
              const status = state?.status || 'pending';

              return (
                <Card key={exercise.id} className="border-2">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        Exercício {index + 1} de {selectedLesson.exercisesConfig.length}
                      </Badge>
                      {getStatusBadge(status)}
                    </div>
                    <CardTitle className="text-xl">{exercise.title}</CardTitle>
                    <CardDescription className="text-base">
                      {exercise.instruction}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-6 space-y-6">
                    {/* Renderizar componente real do exercício */}
                    {exercise.type === 'fill-in-blanks' && exercise.data && (
                      <FillInBlanksExercise
                        title={exercise.title}
                        instruction={exercise.instruction}
                        sentences={exercise.data.sentences || []}
                        feedback={exercise.data.feedback || {
                          allCorrect: 'Perfeito!',
                          someCorrect: 'Muito bem!',
                          needsReview: 'Continue tentando!'
                        }}
                        onComplete={() => handleExerciseComplete(exercise.id)}
                      />
                    )}

                    {exercise.type === 'true-false' && exercise.data && (
                      <TrueFalseExercise
                        title={exercise.title}
                        instruction={exercise.instruction}
                        statements={exercise.data.statements || []}
                        feedback={exercise.data.feedback || {
                          perfect: 'Perfeito!',
                          good: 'Muito bem!',
                          needsReview: 'Continue tentando!'
                        }}
                        onComplete={() => handleExerciseComplete(exercise.id)}
                      />
                    )}

                    {exercise.type === 'scenario-selection' && exercise.data && (
                      <ScenarioSelectionExercise
                        title={exercise.title}
                        instruction={exercise.instruction}
                        scenarios={exercise.data.scenarios}
                        data={exercise.data}
                        onComplete={() => handleExerciseComplete(exercise.id)}
                      />
                    )}

                    {exercise.type === 'data-collection' && exercise.data && (
                      <DataCollectionExercise
                        title={exercise.title}
                        instruction={exercise.instruction}
                        scenarios={exercise.data.scenarios || []}
                        onComplete={() => handleExerciseComplete(exercise.id)}
                      />
                    )}

                    {/* Botões de Aprovação */}
                    <div className="pt-4 border-t">
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(exercise.id)}
                          disabled={status === 'approved' || publishing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {status === 'approved' ? 'Aprovado' : 'Publicar Exercício'}
                        </Button>
                        
                        <Button
                          onClick={() => handleMarkForReview(exercise.id)}
                          disabled={status === 'needs-review' || publishing}
                          variant="destructive"
                          size="lg"
                          className="flex-1"
                        >
                          <AlertCircle className="w-5 h-5 mr-2" />
                          {status === 'needs-review' ? 'Marcado para Revisão' : 'Revisar'}
                        </Button>
                      </div>

                      {status === 'needs-review' && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 text-center">
                          ⚠️ Este exercício precisa de revisão antes da publicação
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Botão de Publicar Tudo */}
        {selectedLesson && (
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Publicar Aula Completa</h3>
                    <p className="text-sm text-muted-foreground">
                      Todos os exercícios devem ser aprovados
                    </p>
                  </div>
                  {allApproved && (
                    <Badge className="bg-green-600 text-lg px-3 py-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Pronto para publicar
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={handlePublishAll}
                  disabled={!allApproved || publishing}
                  className="w-full"
                  size="lg"
                >
                  {publishing ? 'Publicando...' : 'Publicar Aula no Banco de Dados'}
                </Button>

                {!allApproved && (
                  <p className="text-sm text-muted-foreground text-center">
                    Aprove todos os exercícios individualmente antes de publicar a aula
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
