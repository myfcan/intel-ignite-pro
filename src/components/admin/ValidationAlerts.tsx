/**
 * Componente de alertas de validação
 * Exibe notificações não resolvidas do sistema de validação
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { getUnresolvedAlerts, resolveAlert, type ValidationAlert } from '@/lib/validationAlerts';
import { useToast } from '@/hooks/use-toast';

export function ValidationAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlerts = async () => {
    setLoading(true);
    const data = await getUnresolvedAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      toast({
        title: '✅ Alerta resolvido',
        description: 'O alerta foi marcado como resolvido com sucesso'
      });
      loadAlerts();
    } catch (error) {
      toast({
        title: '❌ Erro',
        description: 'Não foi possível resolver o alerta',
        variant: 'destructive'
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 border-destructive';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-500';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Carregando alertas...</p>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-500">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Nenhum alerta pendente
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              Todos os testes de validação estão passando! 🎉
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Alertas Pendentes ({alerts.length})
        </h3>
        <Button variant="outline" size="sm" onClick={loadAlerts}>
          Atualizar
        </Button>
      </div>

      {alerts.map((alert) => (
        <Card 
          key={alert.id} 
          className={`p-4 border-2 ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{alert.message}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Garantia: <span className="font-medium">{alert.guarantee_name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Teste: <span className="font-medium">{alert.test_name}</span>
                  </p>
                </div>
                
                <Badge variant={
                  alert.severity === 'critical' ? 'destructive' :
                  alert.severity === 'warning' ? 'default' : 
                  'secondary'
                }>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>

              {alert.details?.testDetails && (
                <div className="text-xs bg-background/50 p-2 rounded border">
                  <code>{alert.details.testDetails}</code>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString('pt-BR')}
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolve(alert.id)}
                >
                  Marcar como Resolvido
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
