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
    v1: [
      {
        "model": "v1",
        "title": "✨ [V1] Aula Interativa com Playground",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 98,
        "estimatedTimeMinutes": 4,
        "sections": [
          {
            "index": 0,
            "markdown": "# 🎯 Sessão 1: Introdução\n\nBem-vindo! Vamos aprender sobre IA de forma interativa.",
            "speechBubble": "Olá! Prepare-se para uma aula dinâmica!"
          },
          {
            "index": 1,
            "markdown": "# 📊 Sessão 2: Conceitos Fundamentais\n\nA IA aprende com exemplos, assim como você!",
            "speechBubble": "Vou te mostrar como a IA realmente funciona."
          },
          {
            "index": 2,
            "markdown": "# 💡 Sessão 3: Aplicações Práticas\n\nIA está em todo lugar: Netflix, Spotify, GPS...",
            "speechBubble": "Você usa IA todos os dias sem perceber!"
          },
          {
            "index": 3,
            "markdown": "# 🎮 Sessão 4: Preparando para Prática\n\nAgora que você entendeu a teoria, vamos praticar!",
            "speechBubble": "Hora de colocar a mão na massa! Vamos ao playground...",
            "showPlaygroundCall": true,
            "playgroundConfig": {
              "instruction": "Teste seu Prompt com IA Real",
              "type": "real-playground",
              "triggerAfterSection": 3,
              "playgroundDelay": 0.5
            }
          },
          {
            "index": 4,
            "markdown": "# ✨ Sessão 5: Conclusão\n\nParabéns! Você aprendeu e praticou com IA.",
            "speechBubble": "Agora vamos consolidar o aprendizado com exercícios!"
          }
        ],
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "Qual é o diferencial do Modelo V1?",
            "options": [
              "Não tem interatividade",
              "Tem playground no meio da aula",
              "Usa apenas texto"
            ],
            "correctOptionIndex": 1,
            "feedback": "Correto! V1 tem playground ENTRE as sessões 4 e 5."
          },
          {
            "type": "true-false",
            "statement": "O Modelo V1 é projetado para maximizar engajamento com prática no meio da aula",
            "answer": true,
            "feedback": "Exato! V1 combina conteúdo guiado + atividade prática + exercícios finais."
          },
          {
            "type": "complete-sentence",
            "sentence": "No Modelo V1, o playground aparece entre a sessão 4 e 5.",
            "correctAnswer": "4 e 5",
            "feedback": "Perfeito! Esse é o momento ideal para aplicar o conhecimento."
          }
        ]
      }
    ],
    v2: [
      {
        "model": "v2",
        "title": "✨ [V2] Modelo Linear Simples",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 99,
        "estimatedTimeMinutes": 4,
        "sections": [
          {
            "index": 0,
            "markdown": "# 🤖 Sessão 1: O que é IA?\n\nInteligência Artificial é tecnologia que aprende padrões.",
            "speechBubble": "Vou te ensinar IA de forma direta e objetiva!"
          },
          {
            "index": 1,
            "markdown": "# 📊 Sessão 2: Como IA Aprende?\n\nA IA analisa milhares de exemplos para identificar padrões.",
            "speechBubble": "Quanto mais dados, melhor a IA aprende!"
          },
          {
            "index": 2,
            "markdown": "# 💼 Sessão 3: IA no Trabalho\n\nAutomação, análise de dados, assistentes virtuais...",
            "speechBubble": "IA está transformando todas as profissões."
          },
          {
            "index": 3,
            "markdown": "# 🎯 Sessão 4: IA no Cotidiano\n\nGPS, redes sociais, recomendações... IA está em todo lugar!",
            "speechBubble": "Você interage com IA várias vezes por dia."
          },
          {
            "index": 4,
            "markdown": "# ✅ Sessão 5: Recapitulação\n\nVimos conceitos, aplicações e exemplos práticos de IA.",
            "speechBubble": "Agora vamos testar seu conhecimento com exercícios!"
          }
        ],
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "O que é Inteligência Artificial?",
            "options": [
              "Um robô consciente",
              "Tecnologia que aprende padrões com dados",
              "Software com regras fixas"
            ],
            "correctOptionIndex": 1,
            "feedback": "Correto! IA aprende padrões analisando grandes volumes de dados."
          },
          {
            "type": "true-false",
            "statement": "O Modelo V2 NÃO tem playground durante a aula",
            "answer": true,
            "feedback": "Exato! V2 é linear, sem interrupções. O foco é consumo contínuo de conteúdo."
          },
          {
            "type": "multiple-choice",
            "question": "Onde você já usa IA no dia a dia?",
            "options": [
              "Apenas em laboratórios",
              "GPS, Netflix, Spotify, redes sociais",
              "Nunca usei IA"
            ],
            "correctOptionIndex": 1,
            "feedback": "Isso! IA está em muitas ferramentas que você usa diariamente."
          },
          {
            "type": "true-false",
            "statement": "Quanto mais exemplos a IA recebe, melhor ela aprende",
            "answer": true,
            "feedback": "Correto! Dados são o combustível do aprendizado da IA."
          },
          {
            "type": "complete-sentence",
            "sentence": "O Modelo V2 tem 5 exercícios finais com dificuldade progressiva.",
            "correctAnswer": "5 exercícios",
            "feedback": "Perfeito! V2 reforça o aprendizado com mais exercícios no final."
          }
        ]
      }
    ],
    v3: [
      {
        "model": "v3",
        "title": "✨ [V3] Apresentação Visual com Slides",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 97,
        "estimatedTimeMinutes": 4,
        "v3Data": {
          "audioText": "Bem-vindo à jornada visual sobre Inteligência Artificial. Você verá como a IA transforma nosso mundo através de slides ilustrados. Cada slide representa um aspecto diferente da IA em ação. Vamos explorar desde conceitos básicos até aplicações do dia a dia. Ao final, você terá uma visão completa e visual de como a IA funciona.",
          "slides": [
            {
              "id": "slide-1",
              "slideNumber": 1,
              "contentIdea": "Ilustração de um cérebro digital conectado com linhas de dados brilhantes"
            },
            {
              "id": "slide-2",
              "slideNumber": 2,
              "contentIdea": "Pessoa usando smartphone com ícones de IA flutuando (GPS, música, câmera)"
            },
            {
              "id": "slide-3",
              "slideNumber": 3,
              "contentIdea": "Dashboard de análise de dados com gráficos e insights gerados por IA"
            },
            {
              "id": "slide-4",
              "slideNumber": 4,
              "contentIdea": "Assistente virtual ajudando profissional em escritório moderno"
            },
            {
              "id": "slide-5",
              "slideNumber": 5,
              "contentIdea": "Rede neural visual mostrando padrões sendo aprendidos e reconhecidos"
            }
          ]
        },
        "finalPlayground": {
          "type": "real-playground",
          "title": "Aplique o que Aprendeu",
          "description": "Agora que você viu a apresentação, crie seu próprio prompt para IA!"
        },
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "Qual é o diferencial do Modelo V3?",
            "options": [
              "Apenas texto",
              "Slides visuais com narrativa contínua",
              "Sem áudio"
            ],
            "correctOptionIndex": 1,
            "feedback": "Correto! V3 é uma experiência cinematográfica com slides visuais."
          },
          {
            "type": "true-false",
            "statement": "No Modelo V3, o playground aparece NO FINAL da aula",
            "answer": true,
            "feedback": "Exato! V3 tem playground após os slides, não no meio."
          },
          {
            "type": "complete-sentence",
            "sentence": "O Modelo V3 usa áudio único com transições automáticas de slides.",
            "correctAnswer": "único",
            "feedback": "Perfeito! V3 tem 1 áudio contínuo, diferente de V2 que tem áudio por seção."
          }
        ]
      }
    ]
  };

  const loadTemplate = (templateKey: 'v1' | 'v2' | 'v3') => {
    setJsonInput(JSON.stringify(templates[templateKey], null, 2));
    setSelectedTemplate(templateKey);
    setValidationError('');
    const descriptions = {
      v1: 'Template V1: Aula Interativa com Playground no Meio (5 sessões + playground entre 4-5 + 3 exercícios)',
      v2: 'Template V2: Modelo Linear Simples (5 sessões + SEM playground + 5 exercícios)',
      v3: 'Template V3: Apresentação Visual com Slides (5 slides + playground final + 3 exercícios)'
    };
    toast({
      title: "✅ Template carregado",
      description: descriptions[templateKey],
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
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => loadTemplate('v1')}
                  variant={selectedTemplate === 'v1' ? 'default' : 'secondary'}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  🎮 V1 (Playground no Meio)
                </Button>
                <Button
                  onClick={() => loadTemplate('v2')}
                  variant={selectedTemplate === 'v2' ? 'default' : 'secondary'}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  📚 V2 (Linear Simples)
                </Button>
                <Button
                  onClick={() => loadTemplate('v3')}
                  variant={selectedTemplate === 'v3' ? 'default' : 'secondary'}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  🎨 V3 (Slides + Playground Final)
                </Button>
              </div>
              <Button
                onClick={handleValidate}
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                ✅ Validar JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {isSubmitting && (
          <>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 animate-pulse" />
                  Processando: {batchProgress.currentLesson}
                </CardTitle>
                <CardDescription>
                  Lição {batchProgress.current} de {batchProgress.total}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progresso geral */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                  </div>
                  <Progress value={(batchProgress.current / batchProgress.total) * 100} />
                </div>

                {/* Contadores */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Sucesso: {results.success}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span>Falhas: {results.failed}</span>
                  </div>
                </div>

                {/* Steps detalhados do pipeline */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Pipeline Steps:</h4>
                  {stepsProgress.map((step) => (
                    <div key={step.step} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      step.status === 'failed' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      {/* Ícone de status */}
                      <div className="flex-shrink-0">
                        {step.status === 'completed' && (
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {step.status === 'running' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                        {step.status === 'failed' && (
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {step.status === 'pending' && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm text-gray-500 font-semibold">{step.step}</span>
                          </div>
                        )}
                      </div>

                      {/* Informações do step */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{step.name}</span>
                          {step.duration && (
                            <span className="text-xs text-muted-foreground">
                              {(step.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        {step.message && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{step.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logs em tempo real (collapsible) */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="w-4 h-4" />
                    Ver logs detalhados ({realtimeLogs.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[200px] rounded-md border p-4 mt-2 bg-muted/50">
                      <div className="space-y-1 font-mono text-xs">
                        {realtimeLogs.length === 0 ? (
                          <p className="text-muted-foreground italic">Aguardando logs...</p>
                        ) : (
                          realtimeLogs.map((log, i) => (
                            <div key={i} className={`
                              ${log.level === 'error' ? 'text-red-600 font-semibold' : ''}
                              ${log.level === 'success' ? 'text-green-600' : ''}
                              ${log.level === 'warn' ? 'text-yellow-600' : ''}
                              ${log.level === 'info' ? 'text-blue-600' : ''}
                            `}>
                              <span className="text-muted-foreground">[{log.timestamp}]</span>{' '}
                              <span className="text-muted-foreground">[Step {log.step}]</span>{' '}
                              {log.message}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </>
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
