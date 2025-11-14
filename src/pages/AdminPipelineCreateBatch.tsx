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
  const [defaultTrail, setDefaultTrail] = useState<{ id: string; title: string } | null>(null);
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

  // Buscar trail padrão automaticamente
  useEffect(() => {
    const fetchDefaultTrail = async () => {
      const { data: trail, error } = await supabase
        .from('trails')
        .select('id, title')
        .eq('title', 'Fundamentos de IA')
        .eq('is_active', true)
        .single();
      
      if (trail && !error) {
        setDefaultTrail(trail);
        console.log('✅ Trail padrão carregada:', trail);
      } else {
        console.error('❌ Erro ao buscar trail padrão:', error);
        toast({
          title: 'Aviso',
          description: 'Não foi possível carregar a trail padrão "Fundamentos de IA"',
          variant: 'destructive'
        });
      }
    };
    fetchDefaultTrail();
  }, [toast]);

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
            correctAnswer: exercise.correctOptionIndex !== undefined 
              ? exercise.options[exercise.correctOptionIndex]
              : exercise.correctAnswer,
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

      // Verificar se a trail padrão foi carregada
      if (!defaultTrail) {
        setValidationError('Trail padrão não foi carregada. Aguarde um momento e tente novamente.');
        return null;
      }

      const convertedLessons: PipelineInput[] = [];
      
      for (let i = 0; i < parsed.length; i++) {
        const lesson = parsed[i];
        const missingFields = [];

        // ✅ Campo "model" agora é OPCIONAL (será preenchido pelo botão selecionado)
        if (!lesson.title) missingFields.push('title');
        if (lesson.orderIndex === undefined) missingFields.push('orderIndex');
        if (!lesson.sections || lesson.sections.length === 0) missingFields.push('sections');
        if (!lesson.exercises) missingFields.push('exercises');

        if (missingFields.length > 0) {
          setValidationError(`Lição ${i + 1}: Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
          return null;
        }

        // Transformar exercícios para o formato completo
        const transformedExercises = lesson.exercises.map((ex: any, idx: number) => 
          transformSimplifiedExercise(ex, idx)
        );

        // ✅ Validar que há modelo selecionado
        if (!lesson.model && !selectedTemplate) {
          setValidationError('❌ Selecione um modelo (V1, V2 ou V3) clicando nos botões acima antes de validar');
          return null;
        }

        // ✅ Sobrescrever trackId e trackName com a trail padrão
        const convertedLesson: PipelineInput = {
          model: (lesson.model || selectedTemplate).toLowerCase() as 'v1' | 'v2' | 'v3', // ✅ Usa botão se não tiver no JSON
          title: lesson.title,
          trackId: defaultTrail.id,  // Auto-determinado
          trackName: defaultTrail.title,  // Auto-determinado
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
    // ✅ Validar modelo selecionado antes de criar
    if (!selectedTemplate) {
      toast({
        title: 'Modelo não selecionado',
        description: 'Clique em V1, V2 ou V3 antes de criar as lições',
        variant: 'destructive'
      });
      return;
    }

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
    v2: [
      {
        "model": "v2",
        "title": "✨ [TESTE V2] Introdução à IA",
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
    ],
    v1: [
      {
        "model": "v1",
        "title": "✨ [TESTE V1] Prompts Eficazes",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 98,
        "estimatedTimeMinutes": 12,
        "sections": [
          {
            "index": 0,
            "markdown": "# 💬 O que é um Prompt?\n\nPrompt é como você conversa com a IA para obter respostas precisas.",
            "speechBubble": "Vou te ensinar a criar comandos poderosos para a IA!"
          },
          {
            "index": 1,
            "markdown": "# ✨ Técnicas de Prompts\n\nSeja específico, forneça contexto e defina o formato desejado.",
            "speechBubble": "Quanto mais claro seu pedido, melhor será a resposta da IA."
          }
        ],
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "O que é um prompt?",
            "options": [
              "Um código de programação",
              "Um comando que orienta a IA",
              "Um banco de dados"
            ],
            "correctOptionIndex": 1,
            "feedback": "Exato! Prompt é a forma de conversar com a IA."
          },
          {
            "type": "true-false",
            "statement": "Prompts específicos geram respostas mais precisas",
            "answer": true,
            "feedback": "Correto! Quanto mais detalhes, melhor a resposta."
          }
        ]
      }
    ],
    v3: [
      {
        "model": "v3",
        "title": "✨ [TESTE V3] IA no Cotidiano",
        "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
        "trackName": "Fundamentos de IA",
        "orderIndex": 97,
        "estimatedTimeMinutes": 8,
        "sections": [
          {
            "index": 0,
            "markdown": "# 📱 IA no Seu Dia a Dia\n\nDesde o GPS até assistentes de voz, a IA está presente em muitas ferramentas que você já usa.",
            "speechBubble": "Você usa IA mais do que imagina! Vou te mostrar onde."
          }
        ],
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "Qual ferramenta usa IA?",
            "options": [
              "Calculadora básica",
              "Assistente de voz",
              "Relógio analógico"
            ],
            "correctOptionIndex": 1,
            "feedback": "Isso! Assistentes como Siri e Alexa usam IA para entender sua voz."
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
      v1: 'Template V1 (Áudio Único com Timestamps)',
      v2: 'Template V2 (Múltiplos Áudios por Seção)',
      v3: 'Template V3 (Slides com Imagens)'
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
              <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Selecione o modelo</strong> que será aplicado a TODAS as lições do batch
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Não precisa especificar "model" no JSON - o botão selecionado será aplicado automaticamente
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => loadTemplate('v1')}
                  variant={selectedTemplate === 'v1' ? 'default' : 'outline'}
                  className={`flex-1 ${selectedTemplate === 'v1' ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  disabled={isSubmitting}
                >
                  🎵 V1 (Áudio Único)
                </Button>
                <Button
                  onClick={() => loadTemplate('v2')}
                  variant={selectedTemplate === 'v2' ? 'default' : 'outline'}
                  className={`flex-1 ${selectedTemplate === 'v2' ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  disabled={isSubmitting}
                >
                  🎙️ V2 (Multi-Áudio)
                </Button>
                <Button
                  onClick={() => loadTemplate('v3')}
                  variant={selectedTemplate === 'v3' ? 'default' : 'outline'}
                  className={`flex-1 ${selectedTemplate === 'v3' ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  disabled={isSubmitting}
                >
                  🎨 V3 (Slides)
                </Button>
              </div>
              {selectedTemplate && (
                <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium text-center">
                    ✓ Modelo {selectedTemplate.toUpperCase()} selecionado
                  </p>
                </div>
              )}
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
