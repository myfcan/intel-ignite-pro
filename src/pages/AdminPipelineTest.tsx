import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { runLessonPipeline, PipelineState } from '@/lib/lessonPipeline';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function AdminPipelineTest() {
  const [model, setModel] = useState<'v1' | 'v2'>('v1');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<PipelineState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleTestPipeline = async () => {
    setIsRunning(true);
    setLogs([]);
    setProgress(null);

    // Dados de exemplo para teste
    const testInput = {
      model,
      title: `Teste Pipeline ${model.toUpperCase()} - ${new Date().toLocaleTimeString()}`,
      trackId: '11111111-1111-1111-1111-111111111101', // ID do trail Fundamentos
      trackName: 'Fundamentos',
      orderIndex: 999,
      sections: [
        {
          id: 'intro',
          title: 'Introdução',
          visualContent: '## 📱 Bem-vindo ao teste\n\nEsta é uma lição de teste criada pelo **pipeline automatizado**.',
          speechBubbleText: 'Olá! Vamos testar o pipeline juntos.',
        },
        {
          id: 'secao-2',
          title: 'Conceitos',
          visualContent: 'Aqui vamos aprender sobre o *funcionamento* do pipeline.\n\nÉ muito simples e eficiente!',
          speechBubbleText: 'Veja como funciona...',
        },
        {
          id: 'conclusao',
          title: 'Conclusão',
          visualContent: '🎉 Parabéns! Você completou o teste.\n\nO pipeline funcionou **perfeitamente**!',
          speechBubbleText: 'Muito bem!',
        },
      ],
      exercises: [
        {
          type: 'multiple-choice' as const,
          question: 'Qual a principal vantagem do pipeline?',
          data: {
            question: 'Qual a principal vantagem do pipeline?',
            options: ['Velocidade', 'Organização', 'Validação', 'Todas as anteriores'],
            correctAnswer: 3,
            explanation: 'O pipeline oferece todas essas vantagens!',
          },
        },
        {
          type: 'true-false' as const,
          question: 'O pipeline cria lições automaticamente',
          data: {
            statement: 'O pipeline cria lições automaticamente',
            correctAnswer: true,
            explanation: 'Sim! O pipeline automatiza todo o processo.',
          },
        },
      ],
    };

    try {
      const result = await runLessonPipeline(testInput, (state) => {
        setProgress(state);
        setLogs(state.logs);
      });

      if (result.success) {
        toast.success(`✅ Pipeline completo! Lesson ID: ${result.lessonId}`);
      } else {
        toast.error(`❌ Pipeline falhou: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`❌ Erro: ${error.message}`);
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const progressPercentage = progress ? (progress.currentStep / progress.totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">🔬 Admin - Pipeline Test</h1>
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>🔬 Teste do Pipeline de Criação de Lições</CardTitle>
            <CardDescription>
              Execute o pipeline completo com dados de exemplo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Modelo */}
            <div className="space-y-2">
              <Label>Modelo da Lição</Label>
              <Select value={model} onValueChange={(value) => setModel(value as 'v1' | 'v2')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">Modelo V1 (1 áudio único)</SelectItem>
                  <SelectItem value="v2">Modelo V2 (áudio por seção)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão de Execução */}
            <Button 
              onClick={handleTestPipeline} 
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? '⏳ Executando Pipeline...' : '🚀 Executar Pipeline de Teste'}
            </Button>

            {/* Progress Bar */}
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    Step {progress.currentStep}/{progress.totalSteps}
                  </span>
                  <span className="text-muted-foreground">
                    {progress.status}
                  </span>
                </div>
                <Progress value={progressPercentage} />
              </div>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <div className="space-y-2">
                <Label>Logs do Pipeline</Label>
                <Textarea
                  value={logs.join('\n')}
                  readOnly
                  className="font-mono text-xs h-64"
                />
              </div>
            )}

            {/* Informações */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-sm">ℹ️ Como funciona</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Step 1-4:</strong> Validação → Exercícios → Limpeza → Draft</p>
                <p><strong>Step 5:</strong> [Manual] Ir ao Admin e clicar "Gerar Áudio"</p>
                <p><strong>Step 6-8:</strong> Áudio → Timestamps → Ativação</p>
                <p className="text-muted-foreground mt-4">
                  Este teste executa as etapas 1-4 automaticamente. Para completar o pipeline,
                  você precisará ir à página de sincronização e gerar o áudio manualmente.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
