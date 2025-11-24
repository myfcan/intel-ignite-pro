import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { runLessonPipeline, PipelineInput } from '@/lib/lessonPipeline';
import { usePipelineNotifications } from '@/hooks/usePipelineNotifications';

interface PipelineExecution {
  id: string;
  lesson_title: string;
  model: string;
  status: 'pending' | 'running' | 'draft' | 'completed' | 'failed' | 'paused';
  current_step: number;
  total_steps: number;
  logs: any[];
  error_message?: string;
  lesson_id?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export default function AdminPipelineMonitor() {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 🔔 Ativar notificações em tempo real de conclusão/falha
  usePipelineNotifications();
  
  const [executions, setExecutions] = useState<PipelineExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<PipelineExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningPhase2, setIsRunningPhase2] = useState(false);

  useEffect(() => {
    loadExecutions();
    
    // Realtime subscription
    const channel = supabase
      .channel('pipeline-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_executions'
        },
        () => {
          loadExecutions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (executionId && executions.length > 0) {
      const execution = executions.find(e => e.id === executionId);
      if (execution) setSelectedExecution(execution);
    }
  }, [executionId, executions]);

  const loadExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('pipeline_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutions((data || []) as unknown as PipelineExecution[]);
    } catch (error) {
      console.error('Erro ao carregar execuções:', error);
      toast({
        title: "Erro ao carregar execuções",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPipeline = async (executionId: string) => {
    setIsRunningPhase2(true);
    
    try {
      // Buscar input_data da execução
      const { data: execution, error } = await supabase
        .from('pipeline_executions')
        .select('input_data')
        .eq('id', executionId)
        .single();

      if (error) throw error;
      if (!execution?.input_data) {
        throw new Error('Input data não encontrado');
      }

      toast({
        title: "🚀 Iniciando Pipeline",
        description: "Executando todas as 8 fases automaticamente...",
      });

      // Executar o pipeline
      const result = await runLessonPipeline(
        execution.input_data as unknown as PipelineInput, 
        executionId
      );

      // Verificar se teve sucesso
      if (result.success) {
        toast({
          title: "✅ Pipeline Concluído",
          description: "Lição criada com sucesso!",
        });
      } else {
        toast({
          title: "❌ Pipeline Falhou",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }

      // Recarregar execuções para ver o status atualizado
      await loadExecutions();
    } catch (error) {
      console.error('Erro crítico ao iniciar pipeline:', error);
      toast({
        title: "❌ Erro Crítico",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsRunningPhase2(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'draft': return 'bg-purple-500'; // Fase 1 completa
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4 animate-spin" />;
      case 'draft': return <Pause className="w-4 h-4" />; // Pausado após Fase 1
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
        <div className="max-w-6xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pipeline')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Monitor de Execuções</h1>
            <p className="text-muted-foreground">Acompanhe o progresso em tempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Execuções */}
          <Card>
            <CardHeader>
              <CardTitle>Execuções Recentes</CardTitle>
              <CardDescription>{executions.length} execuções encontradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {executions.map(execution => (
                <Card
                  key={execution.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedExecution?.id === execution.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{execution.lesson_title}</span>
                      <Badge className={getStatusColor(execution.status)}>
                        {getStatusIcon(execution.status)}
                        <span className="ml-1">{execution.status}</span>
                      </Badge>
                    </div>
                    <Progress
                      value={(execution.current_step / execution.total_steps) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Etapa {execution.current_step}/{execution.total_steps}</span>
                      <span>{execution.model.toUpperCase()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {executions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma execução encontrada</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/admin/pipeline/create-single')}
                  >
                    Criar Primeira Lição
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes da Execução Selecionada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Execução</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExecution ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedExecution.lesson_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Modelo: {selectedExecution.model.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Progresso</span>
                      <span className="text-sm font-medium">
                        {selectedExecution.current_step}/{selectedExecution.total_steps}
                      </span>
                    </div>
                    <Progress
                      value={(selectedExecution.current_step / selectedExecution.total_steps) * 100}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Status</h4>
                    <Badge className={getStatusColor(selectedExecution.status)}>
                      {getStatusIcon(selectedExecution.status)}
                      <span className="ml-2">{selectedExecution.status}</span>
                    </Badge>
                  </div>

                  {selectedExecution.status === 'pending' && (
                    <>
                      <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-md text-sm">
                        ⏳ <strong>Aguardando:</strong> Esta execução foi criada mas ainda não foi iniciada.
                      </div>
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={isRunningPhase2}
                        onClick={() => handleStartPipeline(selectedExecution.id)}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunningPhase2 ? "Executando..." : "▶️ Iniciar Pipeline"}
                      </Button>
                    </>
                  )}

                  {selectedExecution.status === 'running' && (
                    <>
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-md text-sm">
                        ⏳ <strong>Executando:</strong> Pipeline em andamento (Step {selectedExecution.current_step}/{selectedExecution.total_steps})
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('pipeline_executions')
                              .update({
                                status: 'failed',
                                error_message: 'Cancelado manualmente pelo administrador',
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', selectedExecution.id);

                            if (error) throw error;

                            toast({
                              title: "🛑 Pipeline Cancelado",
                              description: "A execução foi cancelada.",
                            });

                            await loadExecutions();
                          } catch (error) {
                            toast({
                              title: "❌ Erro ao Cancelar",
                              description: error instanceof Error ? error.message : "Erro desconhecido",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        🛑 Cancelar Execução
                      </Button>
                    </>
                  )}

                  {selectedExecution.status === 'draft' && (
                    <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 p-3 rounded-md text-sm">
                      ✅ <strong>Fase 1 Completa (4/8):</strong> Draft criado com sucesso! 
                      Próximo passo: Gerar áudio e ativar (Fase 2: steps 6-8).
                      {selectedExecution.lesson_id && (
                        <p className="mt-1 text-xs opacity-80">ID da lição: {selectedExecution.lesson_id}</p>
                      )}
                    </div>
                  )}

                  {selectedExecution.error_message && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      <strong>Erro:</strong> {selectedExecution.error_message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Logs</h4>
                    <div className="bg-muted p-3 rounded-md max-h-[300px] overflow-y-auto text-xs font-mono">
                      {selectedExecution.logs && selectedExecution.logs.length > 0 ? (
                        selectedExecution.logs.map((log, index) => (
                          <div key={index} className="py-1">
                            {typeof log === 'string' ? log : `[Step ${log.step}] ${log.level.toUpperCase()}: ${log.message}`}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Nenhum log disponível</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedExecution.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={isRunningPhase2 || !selectedExecution.lesson_id}
                        onClick={async () => {
                          if (!selectedExecution.lesson_id) {
                            toast({
                              title: "Erro",
                              description: "ID da lição não encontrado",
                              variant: "destructive"
                            });
                            return;
                          }

                          setIsRunningPhase2(true);
                          
                          try {
                            toast({
                              title: "🚀 Pipeline Automático",
                              description: "O pipeline agora roda automaticamente em todas as 8 fases!",
                            });

                            // O pipeline agora é totalmente automático
                            // Não há mais "Fase 2" manual - tudo é executado de uma vez
                            await loadExecutions();
                          } catch (error: any) {
                            console.error('Erro ao carregar execuções:', error);
                            toast({
                              title: "❌ Erro",
                              description: error.message,
                              variant: "destructive"
                            });
                          } finally {
                            setIsRunningPhase2(false);
                          }
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunningPhase2 ? 'Processando...' : 'Continuar - Fase 2 (6-8)'}
                      </Button>
                    )}
                    {selectedExecution.status === 'failed' && (
                      <Button size="sm" variant="outline" disabled>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Tentar Novamente (em breve)
                      </Button>
                    )}
                    {selectedExecution.status === 'pending' && (
                      <Button size="sm" variant="outline" disabled>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar (em breve)
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione uma execução para ver os detalhes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
