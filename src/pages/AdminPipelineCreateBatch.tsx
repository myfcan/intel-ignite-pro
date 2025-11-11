import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineInput } from '@/lib/lessonPipeline/types';

export default function AdminPipelineCreateBatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setValidationError('JSON deve ser um array de lições');
        return null;
      }
      // Validação básica
      for (const lesson of parsed) {
        if (!lesson.model || !lesson.title || !lesson.sections) {
          setValidationError('Cada lição deve ter: model, title, sections');
          return null;
        }
      }
      setValidationError('');
      return parsed as PipelineInput[];
    } catch (error) {
      setValidationError('JSON inválido: ' + (error as Error).message);
      return null;
    }
  };

  const handleSubmit = async () => {
    const lessons = validateJSON(jsonInput);
    if (!lessons) return;

    setIsSubmitting(true);
    try {
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
        title: `${lessons.length} lições criadas!`,
        description: "Redirecionando para o monitor..."
      });

      // Redirecionar para o monitor geral
      navigate('/admin/pipeline/monitor');
    } catch (error) {
      console.error('Erro ao criar lições em lote:', error);
      toast({
        title: "Erro ao criar lições",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleJSON = JSON.stringify([
    {
      model: "v2",
      title: "Exemplo de Lição 1",
      trackId: "uuid-da-trilha",
      trackName: "Fundamentos",
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
          data: {}
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
            />
            {validationError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {validationError}
              </div>
            )}
            <Button
              onClick={() => validateJSON(jsonInput)}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Validar JSON
            </Button>
          </CardContent>
        </Card>

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
            disabled={isSubmitting || !jsonInput || !!validationError}
            className="flex-1"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Criando...' : 'Criar Todas as Lições'}
          </Button>
        </div>
      </div>
    </div>
  );
}
