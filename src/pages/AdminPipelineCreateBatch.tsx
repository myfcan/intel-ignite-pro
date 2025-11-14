import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Rocket, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineInput } from '@/lib/lessonPipeline/types';
import { runLessonPipeline } from '@/lib/lessonPipeline';

export default function AdminPipelineCreateBatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentLesson: ''
  });
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: Array<{ title: string; error: string }>;
  }>({ success: 0, failed: 0, errors: [] });

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

      // Validação e conversão de cada lição
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

        // Validar UUID do trackId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (lesson.trackId && !uuidRegex.test(lesson.trackId)) {
          setValidationError(`Lição ${i + 1}: trackId inválido (deve ser UUID)`);
          return null;
        }

        if (missingFields.length > 0) {
          setValidationError(`Lição ${i + 1}: Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
          return null;
        }

        // Converter estrutura simplificada para PipelineInput
        const convertedLesson: PipelineInput = {
          model: lesson.model.toLowerCase() as 'v1' | 'v2' | 'v3',
          title: lesson.title,
          trackId: lesson.trackId,
          trackName: lesson.trackName,
          orderIndex: lesson.orderIndex,
          estimatedTimeMinutes: lesson.estimatedTimeMinutes,
          sections: lesson.sections.map(convertToLessonSection),
          exercises: lesson.exercises
        };

        // Se houver playgroundMidLesson, adicionar na última seção
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

  const startPipeline = async (executionId: string, input: PipelineInput) => {
    try {
      const result = await runLessonPipeline(input, executionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Pipeline falhou');
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (isCreating) return; // Previne cliques duplos
    
    const lessons = validateJSON(jsonInput);
    if (!lessons) return;

    // Verificar duplicações antes de criar
    const titulos = lessons.map(l => l.title);
    const { data: existing } = await supabase
      .from('pipeline_executions')
      .select('lesson_title')
      .in('status', ['pending', 'running'])
      .in('lesson_title', titulos);

    if (existing && existing.length > 0) {
      toast({
        title: "Execuções em andamento",
        description: `Já existem ${existing.length} aula(s) sendo processadas. Aguarde a conclusão.`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true); // Desabilita botão
    setIsSubmitting(true);
    const batchResults = { success: 0, failed: 0, errors: [] as Array<{ title: string; error: string }> };
    
    setBatchProgress({ current: 0, total: lessons.length, currentLesson: '' });
    setResults({ success: 0, failed: 0, errors: [] });

    try {
      // Inserir todas as execuções
      const executions = lessons.map(lesson => ({
        lesson_title: lesson.title,
        model: lesson.model,
        status: 'pending' as const,
        input_data: lesson as unknown as any,
        track_id: lesson.trackId,
        track_name: lesson.trackName,
        order_index: lesson.orderIndex,
      }));

      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert(executions)
        .select();

      if (error) throw error;

      toast({
        title: "Iniciando processamento em lote",
        description: `${lessons.length} lições serão processadas sequencialmente`
      });

      // Executar pipelines sequencialmente
      for (let i = 0; i < data.length; i++) {
        const execution = data[i];
        const lesson = lessons[i];

        setBatchProgress({
          current: i + 1,
          total: data.length,
          currentLesson: lesson.title
        });

        toast({
          title: `Processando lição ${i + 1}/${data.length}`,
          description: lesson.title
        });

        try {
          await startPipeline(execution.id, lesson);
          batchResults.success++;
        } catch (err) {
          batchResults.failed++;
          batchResults.errors.push({
            title: lesson.title,
            error: err instanceof Error ? err.message : 'Erro desconhecido'
          });
        }

        setResults({ ...batchResults });

        // Delay entre lições para não sobrecarregar
        if (i < data.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Toast final com resumo
      toast({
        title: `✅ Processamento Completo!`,
        description: `${batchResults.success} sucesso | ${batchResults.failed} falhas`,
        variant: batchResults.failed > 0 ? "destructive" : "default"
      });

      // Aguardar 3 segundos antes de redirecionar para ver o resumo
      setTimeout(() => {
        navigate('/admin/pipeline/monitor');
      }, 3000);
    } catch (error) {
      console.error('Erro no batch:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsCreating(false);
    }
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
            <Button
              onClick={() => validateJSON(jsonInput)}
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
            >
              <Upload className="w-4 h-4 mr-2" />
              Validar JSON
            </Button>
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
