import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Rocket, AlertCircle, Check, Loader2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { PipelineInput } from '@/lib/lessonPipeline/types';
import { runLessonPipeline } from '@/lib/lessonPipeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { LogEntry } from '@/lib/lessonPipeline/logger';

interface StepProgress {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  timestamp?: string;
  duration?: number;
}

export default function AdminPipelineCreateBatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentExecutionId, setCurrentExecutionId] = useState('');
  const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([]);
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentLesson: ''
  });
  const [stepsProgress, setStepsProgress] = useState<StepProgress[]>([
    { step: 1, name: 'Validação de Entrada', status: 'pending', message: '' },
    { step: 2, name: 'Limpeza de Texto', status: 'pending', message: '' },
    { step: 3, name: 'Geração de Áudio', status: 'pending', message: '' },
    { step: 4, name: 'Cálculo de Timestamps', status: 'pending', message: '' },
    { step: 5, name: 'Geração de Exercícios', status: 'pending', message: '' },
    { step: 6, name: 'Validação Completa', status: 'pending', message: '' },
    { step: 7, name: 'Salvar no Banco', status: 'pending', message: '' },
    { step: 8, name: 'Ativação', status: 'pending', message: '' }
  ]);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: Array<{ title: string; error: string }>;
  }>({ success: 0, failed: 0, errors: [] });

  // Polling para atualizar progresso em tempo real
  useEffect(() => {
    if (!isSubmitting || !currentExecutionId) return;

    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('pipeline_executions')
        .select('step_progress, logs, current_step, status')
        .eq('id', currentExecutionId)
        .single();

      if (data) {
        if (data.logs && Array.isArray(data.logs)) {
          setRealtimeLogs(data.logs as unknown as LogEntry[]);
        }

        if (data.step_progress) {
          setStepsProgress(prevSteps =>
            prevSteps.map(step => {
              const progress = data.step_progress[step.step];
              if (progress) {
                return {
                  ...step,
                  status: progress.status || step.status,
                  message: progress.message || step.message,
                  timestamp: progress.timestamp,
                  duration: progress.duration
                };
              }
              return step;
            })
          );
        }

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
        }
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isSubmitting, currentExecutionId]);

  const getExerciseTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'multiple-choice': 'Múltipla Escolha',
      'true-false': 'Verdadeiro ou Falso',
      'complete-sentence': 'Completar Sentença',
      'fill-in-blanks': 'Preencher Lacunas'
    };
    return titles[type] || 'Exercício';
  };

  const getExerciseInstruction = (type: string): string => {
    const instructions: Record<string, string> = {
      'multiple-choice': 'Selecione a alternativa correta:',
      'true-false': 'Marque se a afirmação é verdadeira ou falsa:',
      'complete-sentence': 'Complete a sentença com a palavra correta:',
      'fill-in-blanks': 'Preencher os espaços em branco:'
    };
    return instructions[type] || 'Responda o exercício:';
  };

  const transformSimplifiedExercise = (exercise: any, index: number) => {
    const timestamp = Date.now();
    const baseExercise = {
      id: `exercise-${timestamp}-${index}`,
      title: getExerciseTitle(exercise.type),
      instruction: getExerciseInstruction(exercise.type)
    };

    switch (exercise.type) {
      case 'multiple-choice':
        return {
          ...baseExercise,
          type: 'multiple-choice',
          data: {
            question: exercise.question,
            options: exercise.options,
            correctAnswer: exercise.correctOptionIndex ?? exercise.correctAnswer,
            explanation: exercise.feedback || exercise.explanation || 'Correto!'
          }
        };
      
      case 'true-false':
        return {
          ...baseExercise,
          type: 'true-false',
          data: {
            statements: [{
              id: `stmt-${index}`,
              text: exercise.statement || exercise.question,
              correct: exercise.answer ?? exercise.correctAnswer,
              explanation: exercise.feedback || exercise.explanation || 'Correto!'
            }],
            feedback: {
              perfect: 'Perfeito! Você acertou!',
              good: 'Bom trabalho!',
              needsReview: 'Revise o conteúdo da lição.'
            }
          }
        };
      
      case 'complete-sentence':
      case 'fill-in-blanks':
        const correctAnswerValue = exercise.correctAnswer || exercise.answer || '';
        const sentenceText = exercise.sentence 
          ? exercise.sentence.replace(correctAnswerValue, '_______')
          : exercise.text || '';
        
        return {
          ...baseExercise,
          type: 'fill-in-blanks',
          data: {
            sentences: [{
              id: `sentence-${index}`,
              text: sentenceText,
              correctAnswers: Array.isArray(correctAnswerValue) 
                ? correctAnswerValue 
                : [correctAnswerValue],
              hint: exercise.hint || 'Pense no que você aprendeu',
              explanation: exercise.feedback || exercise.explanation || 'Excelente!'
            }],
            feedback: {
              allCorrect: 'Excelente!',
              someCorrect: 'Bom, mas revise algumas respostas.',
              needsReview: 'Revise o conteúdo da lição.'
            }
          }
        };
      
      default:
        return exercise;
    }
  };

  const convertToLessonSection = (section: any): any => {
    return {
      id: `section-${section.index}`,
      visualContent: section.markdown,
      speechBubbleText: section.speechBubble,
    };
  };

  const validateJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setValidationError('JSON deve ser um array de lições');
        return null;
      }

      const convertedLessons: PipelineInput[] = [];
      
      for (let i = 0; i < parsed.length; i++) {
        const lesson = parsed[i];
        const missingFields = [];

        if (!lesson.model) missingFields.push('model');
        if (!lesson.title) missingFields.push('title');
        if (!lesson.trackId) missingFields.push('trackId');
        if (!lesson.trackName) missingFields.push('trackName');
        if (lesson.orderIndex === undefined) missingFields.push('orderIndex');
        if (!lesson.sections || lesson.sections.length === 0) missingFields.push('sections');
        if (!lesson.exercises) missingFields.push('exercises');

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (lesson.trackId && !uuidRegex.test(lesson.trackId)) {
          setValidationError(`Lição ${i + 1}: trackId inválido (deve ser UUID)`);
          return null;
        }

        if (missingFields.length > 0) {
          setValidationError(`Lição ${i + 1}: Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
          return null;
        }

        // Transformar exercícios para o formato completo
        const transformedExercises = lesson.exercises.map((ex: any, idx: number) => 
          transformSimplifiedExercise(ex, idx)
        );

        const convertedLesson: PipelineInput = {
          model: lesson.model.toLowerCase() as 'v1' | 'v2' | 'v3',
          title: lesson.title,
          trackId: lesson.trackId,
          trackName: lesson.trackName,
          orderIndex: lesson.orderIndex,
          estimatedTimeMinutes: lesson.estimatedTimeMinutes,
          sections: lesson.sections.map(convertToLessonSection),
          exercises: transformedExercises
        };

        if (lesson.playgroundMidLesson && convertedLesson.sections) {
          const lastSection = convertedLesson.sections[convertedLesson.sections.length - 1];
          lastSection.playgroundConfig = {
            type: 'interactive-simulation',
            config: lesson.playgroundMidLesson
          };
        }

        convertedLessons.push(convertedLesson);
      }

      setValidationError('');
      return convertedLessons;
    } catch (error) {
      setValidationError('JSON inválido: ' + (error as Error).message);
      return null;
    }
  };

  const handleValidate = () => {
    const lessons = validateJSON(jsonInput);
    if (lessons) {
      toast({
        title: 'JSON Válido',
        description: `${lessons.length} lição(ões) pronta(s) para criar`,
      });
    }
  };

  const startPipeline = async (executionId: string, input: PipelineInput) => {
    try {
      const result = await runLessonPipeline(input, executionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido no pipeline');
      }

      return { success: true, lessonId: result.lessonId };
    } catch (error: any) {
      console.error('Erro no pipeline:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async () => {
    const lessons = validateJSON(jsonInput);
    if (!lessons) return;

    setIsSubmitting(true);
    setIsCreating(true);
    setBatchProgress({ current: 0, total: lessons.length, currentLesson: '' });
    setResults({ success: 0, failed: 0, errors: [] });

    setStepsProgress([
      { step: 1, name: 'Validação de Entrada', status: 'pending', message: '' },
      { step: 2, name: 'Limpeza de Texto', status: 'pending', message: '' },
      { step: 3, name: 'Geração de Áudio', status: 'pending', message: '' },
      { step: 4, name: 'Cálculo de Timestamps', status: 'pending', message: '' },
      { step: 5, name: 'Geração de Exercícios', status: 'pending', message: '' },
      { step: 6, name: 'Validação Completa', status: 'pending', message: '' },
      { step: 7, name: 'Salvar no Banco', status: 'pending', message: '' },
      { step: 8, name: 'Ativação', status: 'pending', message: '' }
    ]);

    try {
      const executionsToCreate = lessons.map(lesson => ({
        status: 'pending',
        lesson_title: lesson.title,
        model: lesson.model,
        track_id: lesson.trackId,
        track_name: lesson.trackName,
        order_index: lesson.orderIndex,
        input_data: lesson as unknown as Json,
        current_step: 0,
        total_steps: 8,
        logs: [],
        step_progress: {}
      }));

      const { data: insertedExecutions, error: insertError } = await supabase
        .from('pipeline_executions')
        .insert(executionsToCreate)
        .select();

      if (insertError) throw insertError;

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const execution = insertedExecutions[i];
        
        setBatchProgress({
          current: i + 1,
          total: lessons.length,
          currentLesson: lesson.title
        });

        setCurrentExecutionId(execution.id);

        const result = await startPipeline(execution.id, lesson);

        if (result.success) {
          setResults(prev => ({ ...prev, success: prev.success + 1 }));
        } else {
          setResults(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, { title: lesson.title, error: result.error || 'Erro desconhecido' }]
          }));
        }
      }

      toast({
        title: 'Lote Concluído',
        description: `${results.success} sucesso(s), ${results.failed} falha(s)`,
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsCreating(false);
      setCurrentExecutionId('');
    }
  };

  const templates = {
    basic: [
      {
        "model": "v2",
        "title": "✨ [TESTE] Introdução à IA - Validação Pipeline",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 99,
        "estimatedTimeMinutes": 10,
        "sections": [
          {
            "index": 0,
            "markdown": "# 🤖 O que é IA?\n\nInteligência Artificial é tecnologia que aprende padrões com exemplos.",
            "speechBubble": "Olá! Vou te ensinar o que é IA de forma simples."
          },
          {
            "index": 1,
            "markdown": "# 📊 Como funciona?\n\nA IA analisa milhares de exemplos para aprender.",
            "speechBubble": "Pense como você aprende: vendo exemplos e praticando!"
          }
        ],
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "O que é Inteligência Artificial?",
            "options": [
              "Um robô consciente",
              "Tecnologia que aprende padrões",
              "Software com regras fixas"
            ],
            "correctOptionIndex": 1,
            "feedback": "Correto! IA aprende padrões com dados."
          },
          {
            "type": "true-false",
            "statement": "Você já usa IA no GPS e redes sociais",
            "answer": true,
            "feedback": "Sim! IA está em muitas ferramentas do dia a dia."
          },
          {
            "type": "complete-sentence",
            "sentence": "A IA aprende analisando muitos exemplos.",
            "correctAnswer": "exemplos",
            "feedback": "Perfeito! Quanto mais exemplos, melhor a IA aprende."
          }
        ]
      }
    ]
  };

  const loadTemplate = (templateKey: 'basic') => {
    setJsonInput(JSON.stringify(templates[templateKey], null, 2));
    setSelectedTemplate(templateKey);
    setValidationError('');
    toast({
      title: "✅ Template carregado",
      description: "Template de teste V2 pronto para validação",
    });
  };

  const exampleJSON = JSON.stringify([
    {
      model: "v2",
      title: "Exemplo de Lição 1",
      trackId: "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
      trackName: "Fundamentos de IA",
      orderIndex: 1,
      sections: [
        {
          id: "section-1",
          visualContent: "# Introdução\\n\\nConteúdo da seção...",
          speechBubbleText: "Olá! Vamos começar..."
        }
      ],
      exercises: [
        {
          type: "multiple-choice",
          question: "Qual é a resposta correta?",
          options: ["Opção A", "Opção B", "Opção C"],
          correctAnswer: 1,
          explanation: "Feedback da resposta"
        }
      ],
      estimatedTimeMinutes: 15
    }
  ], null, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pipeline')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Lições em Lote</h1>
            <p className="text-muted-foreground">Upload de JSON com múltiplas lições</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inserir JSON</CardTitle>
            <CardDescription>
              Cole ou carregue um JSON com array de lições. Todas serão processadas sequencialmente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Cole seu JSON aqui..."
              rows={15}
              className="font-mono text-sm"
              disabled={isSubmitting}
            />
            {validationError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => loadTemplate('basic')}
                variant="secondary"
                className="flex-1"
                disabled={isSubmitting}
              >
                📝 Template Básico (V2)
              </Button>
              <Button
                onClick={() => validateJSON(jsonInput)}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                ✅ Validar JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {isSubmitting && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Processando Lições em Lote</CardTitle>
              <CardDescription>
                Aguarde enquanto as lições são criadas sequencialmente...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate max-w-[70%]">{batchProgress.currentLesson}</span>
                  <span className="text-muted-foreground">{batchProgress.current}/{batchProgress.total}</span>
                </div>
                <Progress value={(batchProgress.current / batchProgress.total) * 100} />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Sucesso: {results.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Falhas: {results.failed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.errors.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Erros Encontrados
              </CardTitle>
              <CardDescription>
                {results.errors.length} lição(ões) falharam durante o processamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.errors.map((err, idx) => (
                <div key={idx} className="text-sm bg-destructive/10 p-3 rounded-md">
                  <div className="font-semibold mb-1">{err.title}</div>
                  <div className="text-muted-foreground">{err.error}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Exemplo de Estrutura</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
              {exampleJSON}
            </pre>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/pipeline')} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || isSubmitting || !jsonInput || !!validationError}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Criar Todas as Lições
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
