// src/components/admin/V7PipelineMonitor.tsx
// Pipeline progress monitor for V7 lesson creation

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export interface PipelineLog {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface V7PipelineMonitorProps {
  isRunning: boolean;
  steps: PipelineStep[];
  logs: PipelineLog[];
  progress: number;
  error?: string | null;
}

export function V7PipelineMonitor({ 
  isRunning, 
  steps, 
  logs, 
  progress, 
  error 
}: V7PipelineMonitorProps) {
  if (!isRunning && steps.length === 0 && logs.length === 0) {
    return null;
  }

  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLogIcon = (level: PipelineLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500 shrink-0" />;
      default:
        return <Circle className="w-3 h-3 text-cyan-500 shrink-0" />;
    }
  };

  return (
    <div className="mt-4 space-y-4 border border-border/50 rounded-lg p-4 bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
          ) : error ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : progress === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          Monitor do Pipeline V7
        </h4>
        <Badge 
          variant={error ? 'destructive' : progress === 100 ? 'default' : 'secondary'}
          className={cn(
            progress === 100 && !error && 'bg-green-600'
          )}
        >
          {error ? 'Erro' : progress === 100 ? 'Concluído' : `${progress}%`}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={progress} 
        className={cn(
          "h-2",
          error && "[&>div]:bg-red-500",
          !error && progress === 100 && "[&>div]:bg-green-500"
        )}
      />

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Etapas</p>
          <div className="grid gap-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  step.status === 'running' && "bg-cyan-500/10 border border-cyan-500/30",
                  step.status === 'completed' && "bg-green-500/10 border border-green-500/20",
                  step.status === 'error' && "bg-red-500/10 border border-red-500/30",
                  step.status === 'pending' && "bg-muted/50"
                )}
              >
                {getStepIcon(step.status)}
                <span className={cn(
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {step.name}
                </span>
                {step.message && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {step.message}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Logs</p>
          <ScrollArea className="h-32 rounded-md border border-border/50 bg-background/50">
            <div className="p-2 space-y-1 font-mono text-xs">
              {logs.map((log, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-start gap-2 py-1",
                    log.level === 'error' && "text-red-500",
                    log.level === 'warning' && "text-amber-500",
                    log.level === 'success' && "text-green-500"
                  )}
                >
                  {getLogIcon(log.level)}
                  <span className="text-muted-foreground shrink-0">
                    {log.timestamp.toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div className="text-sm text-red-500">
              <p className="font-medium">Erro no Pipeline</p>
              <p className="text-xs mt-1 text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default steps for V7 Pipeline
export const DEFAULT_V7_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'validate', name: 'Validando JSON', status: 'pending' },
  { id: 'process-acts', name: 'Processando Atos Cinematográficos', status: 'pending' },
  { id: 'extract-narration', name: 'Extraindo Narrações (audio.narration)', status: 'pending' },
  { id: 'generate-audio', name: 'Gerando Áudio (ElevenLabs)', status: 'pending' },
  { id: 'build-content', name: 'Construindo Conteúdo Final', status: 'pending' },
  { id: 'save-database', name: 'Salvando no Banco de Dados', status: 'pending' },
];
