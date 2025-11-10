import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ValidationDashboard } from '@/components/admin/ValidationDashboard';
import { 
  runHealthCheck, 
  formatHealthCheckReport,
  exportReportAsJSON,
  exportReportAsMarkdown,
  testTypeScriptValidation,
  testSyncBlocking,
  testDefensiveValidation,
  testVersionSystem,
  type HealthCheckReport,
  type GuaranteeReport
} from '@/lib/validationSystem';
import { 
  PlayCircle, 
  Download, 
  FileJson, 
  FileText, 
  CheckCircle2,
  Code2,
  ShieldCheck,
  Shield,
  GitBranch,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminValidationSystem() {
  const navigate = useNavigate();
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState<GuaranteeReport | null>(null);

  const runFullHealthCheck = async () => {
    setIsRunning(true);
    toast.info('🧪 Executando Health Check completo...');
    
    try {
      const result = await runHealthCheck();
      setReport(result);
      
      if (result.overall_status === 'PASSED') {
        toast.success('✅ Todos os testes aprovados!');
      } else if (result.overall_status === 'WARNING') {
        toast.warning('⚠️ Alguns testes falharam');
      } else {
        toast.error('❌ Falhas críticas detectadas');
      }

      // Log no console
      console.log(formatHealthCheckReport(result));
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error('Erro no health check:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testName: string) => {
    toast.info(`🧪 Executando: ${testName}...`);
    setIsRunning(true);
    
    try {
      let result: GuaranteeReport;
      
      switch (testName) {
        case 'typescript':
          result = testTypeScriptValidation();
          break;
        case 'sync':
          result = testSyncBlocking();
          break;
        case 'defensive':
          result = testDefensiveValidation();
          break;
        case 'version':
          result = testVersionSystem();
          break;
        default:
          throw new Error('Teste desconhecido');
      }
      
      setSelectedGuarantee(result);
      
      if (result.status === 'PASSED') {
        toast.success(`✅ ${result.guarantee}: aprovado`);
      } else {
        toast.error(`❌ ${result.guarantee}: falhou`);
      }

      console.log('Resultado do teste:', result);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = (format: 'json' | 'markdown' | 'console') => {
    if (!report) {
      toast.error('Execute o Health Check primeiro');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = exportReportAsJSON(report);
        filename = `health-check-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = exportReportAsMarkdown(report);
        filename = `health-check-${Date.now()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'console':
        content = formatHealthCheckReport(report);
        filename = `health-check-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Relatório exportado: ${filename}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">🧪 Sistema de Validação</h1>
            <p className="text-muted-foreground">
              Dashboard completo de testes e validações do sistema
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Controles Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Executar Testes</CardTitle>
            <CardDescription>
              Execute o health check completo ou testes individuais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={runFullHealthCheck}
                disabled={isRunning}
                className="flex-1"
                size="lg"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isRunning ? 'Executando...' : 'Health Check Completo'}
              </Button>
              
              {report && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => downloadReport('json')}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadReport('markdown')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadReport('console')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Dashboard vs Testes Individuais */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="individual">🔬 Testes Individuais</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <ValidationDashboard report={report} isLoading={isRunning} />
          </TabsContent>

          {/* Testes Individuais Tab */}
          <TabsContent value="individual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Garantia 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Code2 className="w-5 h-5" />
                    TypeScript Validation
                  </CardTitle>
                  <CardDescription>
                    Detecta erros em desenvolvimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runIndividualTest('typescript')}
                    disabled={isRunning}
                    className="w-full"
                    variant="outline"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Executar Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Garantia 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="w-5 h-5" />
                    Sync Blocking
                  </CardTitle>
                  <CardDescription>
                    Bloqueia sincronização incorreta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runIndividualTest('sync')}
                    disabled={isRunning}
                    className="w-full"
                    variant="outline"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Executar Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Garantia 3 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="w-5 h-5" />
                    Defensive Validation
                  </CardTitle>
                  <CardDescription>
                    Previne crashes em produção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runIndividualTest('defensive')}
                    disabled={isRunning}
                    className="w-full"
                    variant="outline"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Executar Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Garantia 4 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="w-5 h-5" />
                    Version System
                  </CardTitle>
                  <CardDescription>
                    Alerta sobre versões desatualizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runIndividualTest('version')}
                    disabled={isRunning}
                    className="w-full"
                    variant="outline"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Executar Teste
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Resultado Individual */}
            {selectedGuarantee && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Resultado: {selectedGuarantee.guarantee}
                  </CardTitle>
                  <CardDescription>
                    {selectedGuarantee.tests_passed}/{selectedGuarantee.tests_run} testes aprovados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedGuarantee.details.map((test, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        <span className="text-lg">
                          {test.passed ? '✅' : '❌'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{test.name}</p>
                          {test.details && (
                            <p className="text-sm text-muted-foreground">{test.details}</p>
                          )}
                          {test.error && (
                            <p className="text-sm text-red-600">Erro: {test.error}</p>
                          )}
                          {test.duration !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              Tempo: {test.duration.toFixed(2)}ms
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
