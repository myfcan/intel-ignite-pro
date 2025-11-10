import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { GuaranteeReport, HealthCheckReport } from '@/lib/validationSystem';

interface ValidationDashboardProps {
  report: HealthCheckReport | null;
  isLoading: boolean;
}

export function ValidationDashboard({ report, isLoading }: ValidationDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">
            Execute o Health Check para ver os resultados
          </p>
        </CardContent>
      </Card>
    );
  }

  const guarantees = Object.entries(report.guarantees);

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card className={getCardBorderClass(report.overall_status)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(report.overall_status)}
            Status Geral do Sistema
          </CardTitle>
          <CardDescription>
            {report.total_passed}/{report.total_tests} testes aprovados em {report.total_duration.toFixed(0)}ms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant={getBadgeVariant(report.overall_status)} className="text-lg px-4 py-2">
              {report.overall_status}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {((report.total_passed / report.total_tests) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Taxa de aprovação
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard de Garantias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guarantees.map(([key, guarantee]) => (
          <GuaranteeCard key={key} guarantee={guarantee} />
        ))}
      </div>

      {/* Recomendações */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GuaranteeCard({ guarantee }: { guarantee: GuaranteeReport }) {
  const percentage = (guarantee.tests_passed / guarantee.tests_run) * 100;

  return (
    <Card className={getCardBorderClass(guarantee.status)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {getStatusIcon(guarantee.status)}
            {guarantee.guarantee}
          </span>
          <Badge variant={getBadgeVariant(guarantee.status)}>
            {guarantee.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {guarantee.tests_passed}/{guarantee.tests_run} testes aprovados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Barra de progresso */}
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressBarClass(guarantee.status)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Lista de testes */}
          <div className="space-y-1 text-sm">
            {guarantee.details.slice(0, 3).map((test, index) => (
              <div key={index} className="flex items-start gap-2">
                {test.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {test.name}
                </span>
              </div>
            ))}
            {guarantee.details.length > 3 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{guarantee.details.length - 3} mais testes
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'PASSED':
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case 'WARNING':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'FAILED':
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-muted-foreground" />;
  }
}

function getBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PASSED':
      return 'default';
    case 'WARNING':
      return 'secondary';
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getCardBorderClass(status: string): string {
  switch (status) {
    case 'PASSED':
      return 'border-green-500/20 bg-green-500/5';
    case 'WARNING':
      return 'border-yellow-500/20 bg-yellow-500/5';
    case 'FAILED':
      return 'border-red-500/20 bg-red-500/5';
    default:
      return '';
  }
}

function getProgressBarClass(status: string): string {
  switch (status) {
    case 'PASSED':
      return 'bg-green-600';
    case 'WARNING':
      return 'bg-yellow-600';
    case 'FAILED':
      return 'bg-red-600';
    default:
      return 'bg-muted-foreground';
  }
}
