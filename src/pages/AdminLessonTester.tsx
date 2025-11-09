import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Square, RotateCcw, TestTube } from 'lucide-react';
import { useAutomatedLessonTest } from '@/hooks/useAutomatedLessonTest';
import { LessonTestReport } from '@/components/admin/LessonTestReport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminLessonTester() {
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  
  const { testResult, runTest, stopTest, resetTest } = useAutomatedLessonTest(selectedLessonId);

  // IDs das aulas (em produção, buscar do banco)
  const lessons = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Aula 01 - Fundamentos de IA' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Aula 02 - O que é IA Generativa' },
  ];

  const handleStartTest = async () => {
    if (!selectedLessonId) return;
    await runTest();
  };

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
          <div>
            <h1 className="text-3xl font-bold">🧪 Testador de Aulas</h1>
            <p className="text-muted-foreground">
              Validação automatizada de fluxo completo
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Painel de Controle
            </CardTitle>
            <CardDescription>
              Selecione uma aula e execute o teste automatizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Aula</label>
              <Select
                value={selectedLessonId}
                onValueChange={setSelectedLessonId}
                disabled={testResult.status === 'running'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma aula..." />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleStartTest}
                disabled={!selectedLessonId || testResult.status === 'running'}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Teste
              </Button>

              {testResult.status === 'running' && (
                <Button
                  onClick={stopTest}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              )}

              {(testResult.status === 'passed' || testResult.status === 'failed') && (
                <Button
                  onClick={resetTest}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <p className="font-medium mb-1">ℹ️ Como funciona:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Valida timestamps no banco de dados</li>
                <li>Testa carregamento e acessibilidade do áudio</li>
                <li>Verifica configuração de playgrounds e exercícios</li>
                <li>Simula fluxo completo da aula</li>
                <li>Gera relatório detalhado com tempos de execução</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Report */}
        {testResult.status !== 'idle' && (
          <LessonTestReport testResult={testResult} />
        )}

        {/* Documentation */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">📚 Documentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">Checkpoints Validados:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>Timestamps:</strong> Verifica se todas seções têm timestamps válidos (≥0)</li>
                <li><strong>Áudio:</strong> Testa se audio_url existe e carrega corretamente</li>
                <li><strong>Sincronização:</strong> Valida estrutura para sync áudio-texto</li>
                <li><strong>Playground:</strong> Verifica configuração de playground mid-lesson</li>
                <li><strong>Transição:</strong> Valida fluxo de fases (audio → playground → exercises)</li>
                <li><strong>Exercícios:</strong> Confirma que exercícios estão configurados</li>
                <li><strong>Conclusão:</strong> Valida estrutura para finalização da aula</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-1">Próximos Passos (Futuro):</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Testes E2E com navegador real (Playwright)</li>
                <li>Validação de latência de sincronização (&lt;100ms)</li>
                <li>Análise de telemetria dos diagnostic_logs</li>
                <li>Testes de cenários de erro (áudio falha, sem internet)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
