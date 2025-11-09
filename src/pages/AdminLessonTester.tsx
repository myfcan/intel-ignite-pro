import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, TestTube, RefreshCw, Bug, FlaskConical, Terminal, Accessibility, ArrowLeft, Play, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

  const handleRunE2E = () => {
    toast.info('🧪 Testes E2E com Playwright', {
      description: 'Para rodar os testes E2E, execute no terminal: npm run test:e2e',
      duration: 8000,
    });
  };

  const handleRunA11y = () => {
    toast.info('♿ Testes de Acessibilidade', {
      description: 'Para rodar os testes a11y, execute: npm run test:e2e -- accessibility.spec.ts',
      duration: 8000,
    });
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

            {/* E2E Tests Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Testes E2E com Playwright
                </label>
              </div>
              <Button
                onClick={handleRunE2E}
                variant="outline"
                className="w-full"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Ver Comandos E2E
              </Button>
              <p className="text-xs text-muted-foreground">
                Testes completos que simulam usuário real navegando pela aula
              </p>
            </div>

            {/* A11y Tests Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  Testes de Acessibilidade (WCAG 2.1 AA)
                </label>
              </div>
              <Button
                onClick={handleRunA11y}
                variant="outline"
                className="w-full"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Ver Comandos a11y
              </Button>
              <p className="text-xs text-muted-foreground">
                Valida conformidade com WCAG, navegação por teclado, leitores de tela
              </p>
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
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Checkpoints Validados (Testes Rápidos):
              </h4>
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

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Testes E2E com Playwright:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>Usuário Real:</strong> Simula navegação completa pela aula</li>
                <li><strong>Multi-browser:</strong> Testa em Chrome, Firefox, Safari</li>
                <li><strong>Performance:</strong> Mede latência de sincronização (&lt;150ms)</li>
                <li><strong>Cenários:</strong> Conexão lenta, seeks rápidos, erros de console</li>
                <li><strong>Visual:</strong> Screenshots e vídeos de falhas</li>
              </ul>
              
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <p className="text-foreground mb-1"># Setup inicial:</p>
                <p>npx playwright install</p>
                <p className="text-foreground mb-1 mt-2"># Rodar testes:</p>
                <p>npm run test:e2e</p>
                <p className="text-foreground mb-1 mt-2"># Modo visual:</p>
                <p>npm run test:e2e:ui</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Accessibility className="w-4 h-4" />
                Testes de Acessibilidade (a11y):
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>WCAG 2.1 AA:</strong> Conformidade completa</li>
                <li><strong>Navegação:</strong> Teclado, tab sequence, focus</li>
                <li><strong>Leitores:</strong> ARIA labels, roles, screen readers</li>
                <li><strong>Visual:</strong> Contraste, headings, landmarks</li>
                <li><strong>Relatórios:</strong> HTML detalhado com correções</li>
              </ul>
              
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <p className="text-foreground mb-1"># Rodar testes a11y:</p>
                <p>npm run test:e2e -- accessibility.spec.ts</p>
                <p className="text-foreground mb-1 mt-2"># Com relatório HTML:</p>
                <p>npm run test:e2e -- accessibility.spec.ts --reporter=html</p>
                <p className="text-foreground mb-1 mt-2"># Relatórios em:</p>
                <p>test-results/a11y-reports/</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-1">📂 Estrutura de Arquivos:</h4>
              <ul className="list-none space-y-1 text-muted-foreground ml-2 font-mono text-xs">
                <li>📄 playwright.config.ts</li>
                <li>📁 tests/e2e/</li>
                <li className="ml-4">├── 📄 lesson-flow.spec.ts</li>
                <li className="ml-4">├── 📁 helpers/</li>
                <li className="ml-8">└── 📄 lesson-helpers.ts</li>
                <li className="ml-4">└── 📁 fixtures/</li>
                <li className="ml-8">└── 📄 auth.ts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
