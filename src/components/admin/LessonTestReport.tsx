import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult } from '@/hooks/useAutomatedLessonTest';
import { TestCheckpoint } from './TestCheckpoint';

interface LessonTestReportProps {
  testResult: TestResult;
}

export const LessonTestReport = ({ testResult }: LessonTestReportProps) => {
  const passedCount = testResult.checkpoints.filter(cp => cp.status === 'passed').length;
  const failedCount = testResult.checkpoints.filter(cp => cp.status === 'failed').length;
  const totalCount = testResult.checkpoints.length;
  const progressPercent = (passedCount / totalCount) * 100;

  const getStatusBadge = () => {
    switch (testResult.status) {
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          🔄 Executando...
        </Badge>;
      case 'passed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          ✅ Passou
        </Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          ❌ Falhou
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">
          ⏸️ Aguardando
        </Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Resultado do Teste</CardTitle>
          {getStatusBadge()}
        </div>
        
        {testResult.status !== 'idle' && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progresso: {passedCount}/{totalCount} checkpoints
              </span>
              {testResult.totalDuration && (
                <span className="text-muted-foreground font-mono">
                  {(testResult.totalDuration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {testResult.status === 'passed' && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              🎉 Todos os checkpoints passaram com sucesso!
            </p>
          </div>
        )}

        {testResult.status === 'failed' && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              ⚠️ {failedCount} checkpoint(s) falharam
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {testResult.checkpoints.map((checkpoint) => (
            <TestCheckpoint key={checkpoint.id} checkpoint={checkpoint} />
          ))}
        </div>

        {testResult.status === 'passed' && testResult.totalDuration && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium mb-2">📊 Estatísticas</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Duração total:</span>
                <span className="ml-2 font-mono">{(testResult.totalDuration / 1000).toFixed(2)}s</span>
              </div>
              <div>
                <span className="text-muted-foreground">Checkpoints:</span>
                <span className="ml-2 font-mono">{passedCount}/{totalCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de sucesso:</span>
                <span className="ml-2 font-mono">{((passedCount / totalCount) * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tempo médio/check:</span>
                <span className="ml-2 font-mono">
                  {(testResult.totalDuration / totalCount).toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
