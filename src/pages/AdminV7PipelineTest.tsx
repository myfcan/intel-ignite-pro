/**
 * Admin V7 Pipeline Test - Página para testar o Pipeline V7-vv
 * 
 * Features:
 * - Editor JSON com syntax highlighting
 * - Validação em tempo real
 * - Logs de execução em tempo real
 * - Template de exemplo
 * - Preview do resultado
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Code, 
  FileJson,
  Loader2,
  ArrowLeft,
  Copy,
  Download,
  Eye,
  RefreshCw,
  Zap,
  Clock,
  Hash,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { runV7Pipeline } from '@/lib/lessonPipeline/v7';
import { V7ScriptInput, validateV7ScriptInput, estimateDuration, countNarrationWords } from '@/types/V7ScriptInput';

// Template de exemplo
const EXAMPLE_TEMPLATE: V7ScriptInput = {
  title: "Aula Teste V7 Pipeline",
  subtitle: "Criada automaticamente via Pipeline",
  difficulty: "beginner",
  category: "fundamentos",
  tags: ["teste", "pipeline", "v7"],
  learningObjectives: [
    "Testar o pipeline V7",
    "Verificar geração de áudio",
    "Validar sincronização"
  ],
  generate_audio: true,
  fail_on_audio_error: false,
  scenes: [
    {
      id: "intro",
      title: "Introdução",
      type: "dramatic",
      narration: "Bem-vindo à primeira aula criada pelo Pipeline V7. Este é um teste completo do sistema.",
      visual: {
        type: "number-reveal",
        content: {
          hookQuestion: "Você está pronto?",
          number: "V7",
          subtitle: "Pipeline Cinematográfico",
          mood: "success",
          countUp: false
        },
        effects: {
          mood: "success",
          particles: "confetti",
          glow: true
        }
      }
    },
    {
      id: "conceito",
      title: "Conceito Principal",
      type: "narrative",
      narration: "O Pipeline V7 automatiza todo o processo de criação de aulas cinematográficas. Desde a validação do conteúdo até a geração de áudio sincronizado.",
      visual: {
        type: "text-reveal",
        content: {
          title: "Pipeline V7",
          items: [
            { icon: "✅", text: "Validação automática" },
            { icon: "🎙️", text: "Áudio sincronizado" },
            { icon: "⚡", text: "Anchor actions" }
          ]
        }
      }
    },
    {
      id: "quiz",
      title: "Quiz Teste",
      type: "interaction",
      narration: "Agora vamos testar o sistema de quiz. Escolha a opção correta.",
      anchorText: {
        pauseAt: "correta"
      },
      visual: {
        type: "quiz",
        content: {
          question: "Qual é o nome do pipeline?",
          mood: "neutral"
        }
      },
      interaction: {
        type: "quiz",
        options: [
          { id: "a", text: "Pipeline V5", emoji: "❌" },
          { id: "b", text: "Pipeline V7", emoji: "✅", feedback: { title: "Correto!", subtitle: "V7 é a versão cinematográfica", mood: "success" } },
          { id: "c", text: "Pipeline V6", emoji: "❌" }
        ]
      }
    },
    {
      id: "final",
      title: "Conclusão",
      type: "cta",
      narration: "Parabéns! Você concluiu a aula de teste do Pipeline V7. Clique para continuar.",
      anchorText: {
        pauseAt: "continuar"
      },
      visual: {
        type: "cta",
        content: {
          title: "Teste Concluído!",
          message: "O Pipeline V7 está funcionando perfeitamente."
        },
        effects: {
          particles: "confetti"
        }
      },
      interaction: {
        type: "cta-button",
        buttonText: "Finalizar Teste",
        action: "complete"
      }
    }
  ]
};

interface LogEntry {
  timestamp: string;
  step: number;
  stepName: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

interface PipelineStatus {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lessonId?: string;
  error?: string;
}

export default function AdminV7PipelineTest() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_TEMPLATE, null, 2));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    isRunning: false,
    currentStep: 0,
    totalSteps: 7,
    status: 'idle'
  });
  const [executionId, setExecutionId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Polling para logs em tempo real
  useEffect(() => {
    if (!executionId || pipelineStatus.status !== 'running') return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('pipeline_executions')
        .select('logs, status, current_step, error_message, lesson_id')
        .eq('id', executionId)
        .single();

      if (data) {
        const dbLogs = (data.logs as unknown as LogEntry[]) || [];
        setLogs(dbLogs);
        
        setPipelineStatus(prev => ({
          ...prev,
          currentStep: data.current_step || prev.currentStep,
          status: data.status as PipelineStatus['status'],
          lessonId: data.lesson_id || undefined,
          error: data.error_message || undefined,
          isRunning: data.status === 'running'
        }));

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [executionId, pipelineStatus.status]);

  // Validar JSON em tempo real
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput) as V7ScriptInput;
      setParseError(null);
      
      const errors = validateV7ScriptInput(parsed);
      setValidationErrors(errors.map(e => `[${e.scene}] ${e.field}: ${e.message}`));
    } catch (err: unknown) {
      const error = err as Error;
      setParseError(error.message);
      setValidationErrors([]);
    }
  }, [jsonInput]);

  const handleRunPipeline = async () => {
    try {
      const input = JSON.parse(jsonInput) as V7ScriptInput;
      
      // Validar antes de executar
      const errors = validateV7ScriptInput(input);
      if (errors.length > 0) {
        toast.error('JSON contém erros de validação');
        return;
      }

      // Criar execução no banco
      const newExecutionId = `v7-test-${Date.now()}`;
      
      const insertPayload = {
        id: newExecutionId,
        status: 'pending',
        model: 'v7-vv',
        lesson_title: input.title,
        input_data: JSON.parse(JSON.stringify(input)),
        total_steps: 7,
        current_step: 0,
        logs: JSON.parse('[]')
      };
      
      const { error: insertError } = await supabase.from('pipeline_executions').insert([insertPayload]);

      if (insertError) {
        toast.error('Erro ao criar execução: ' + insertError.message);
        return;
      }

      setExecutionId(newExecutionId);
      setLogs([]);
      setPipelineStatus({
        isRunning: true,
        currentStep: 0,
        totalSteps: 7,
        status: 'running'
      });

      toast.info('Pipeline V7 iniciado...');

      // Executar pipeline
      const result = await runV7Pipeline(input, {
        executionId: newExecutionId,
        generateAudio: input.generate_audio ?? true,
        failOnAudioError: input.fail_on_audio_error ?? false
      });

      if (result.success) {
        toast.success('Pipeline V7 concluído com sucesso!');
        setPipelineStatus({
          isRunning: false,
          currentStep: 7,
          totalSteps: 7,
          status: 'completed',
          lessonId: result.lessonId
        });
      } else {
        toast.error('Pipeline V7 falhou: ' + result.error);
        setPipelineStatus({
          isRunning: false,
          currentStep: 0,
          totalSteps: 7,
          status: 'failed',
          error: result.error
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Erro: ' + error.message);
      setPipelineStatus({
        isRunning: false,
        currentStep: 0,
        totalSteps: 7,
        status: 'failed',
        error: error.message
      });
    }
  };

  const handleCopyTemplate = () => {
    setJsonInput(JSON.stringify(EXAMPLE_TEMPLATE, null, 2));
    toast.success('Template carregado!');
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `v7-pipeline-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepName = (step: number): string => {
    const names: Record<number, string> = {
      1: 'Validação',
      2: 'Build Narração',
      3: 'Gerar Áudio',
      4: 'Calcular Anchors',
      5: 'Build Content',
      6: 'Consolidar',
      7: 'Ativar'
    };
    return names[step] || `Step ${step}`;
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'border-l-green-500 bg-green-500/5';
      case 'error': return 'border-l-red-500 bg-red-500/5';
      case 'warn': return 'border-l-yellow-500 bg-yellow-500/5';
      default: return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  // Estatísticas do JSON
  const getJsonStats = () => {
    try {
      const parsed = JSON.parse(jsonInput) as V7ScriptInput;
      return {
        scenes: parsed.scenes?.length || 0,
        words: countNarrationWords(parsed),
        duration: estimateDuration(parsed),
        valid: validationErrors.length === 0 && !parseError
      };
    } catch {
      return { scenes: 0, words: 0, duration: 0, valid: false };
    }
  };

  const stats = getJsonStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FileJson className="w-6 h-6 text-primary" />
                  Pipeline V7 Test
                </h1>
                <p className="text-sm text-muted-foreground">
                  Testar criação de aulas cinematográficas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={pipelineStatus.status}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {pipelineStatus.status === 'running' && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Step {pipelineStatus.currentStep}/7
                    </Badge>
                  )}
                  {pipelineStatus.status === 'completed' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                  {pipelineStatus.status === 'failed' && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Falhou
                    </Badge>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Run Button */}
              <Button
                onClick={handleRunPipeline}
                disabled={pipelineStatus.isRunning || !stats.valid}
                className="gap-2"
              >
                {pipelineStatus.isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Executar Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: JSON Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    V7ScriptInput JSON
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyTemplate}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(jsonInput)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span>{stats.scenes} cenas</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Code className="w-4 h-4" />
                    <span>{stats.words} palavras</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>~{Math.round(stats.duration / 60)}min</span>
                  </div>
                  {stats.valid ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Válido
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inválido
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-[500px] font-mono text-sm bg-muted/50 rounded-lg p-4 border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* Validation Errors */}
            <AnimatePresence>
              {(parseError || validationErrors.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-500 flex items-center gap-2 text-base">
                        <AlertTriangle className="w-4 h-4" />
                        {parseError ? 'Erro de Sintaxe' : 'Erros de Validação'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {parseError && (
                          <li className="text-red-400">{parseError}</li>
                        )}
                        {validationErrors.map((err, i) => (
                          <li key={i} className="text-red-400">{err}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Logs & Results */}
          <div className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Logs de Execução
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {logs.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
                        <Download className="w-4 h-4 mr-1" />
                        Exportar
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Steps */}
                {pipelineStatus.status !== 'idle' && (
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          step < pipelineStatus.currentStep
                            ? 'bg-green-500'
                            : step === pipelineStatus.currentStep
                            ? pipelineStatus.isRunning
                              ? 'bg-blue-500 animate-pulse'
                              : pipelineStatus.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                            : 'bg-muted'
                        }`}
                        title={getStepName(step)}
                      />
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileJson className="w-12 h-12 mb-3 opacity-30" />
                      <p>Nenhum log ainda</p>
                      <p className="text-sm">Execute o pipeline para ver os logs</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`border-l-4 pl-3 py-2 rounded-r ${getLogClass(log.level)}`}
                        >
                          <div className="flex items-start gap-2">
                            {getLogIcon(log.level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  Step {log.step}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {log.stepName}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{log.message}</p>
                              {log.details && (
                                <pre className="text-xs mt-1 text-muted-foreground bg-muted/50 rounded p-2 overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Result Card */}
            <AnimatePresence>
              {pipelineStatus.status === 'completed' && pipelineStatus.lessonId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-green-500 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Aula Criada com Sucesso!
                      </CardTitle>
                      <CardDescription>
                        ID: {pipelineStatus.lessonId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                      <Button 
                        onClick={() => navigate(`/v7/${pipelineStatus.lessonId}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar Aula
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/admin/v7/preview/${pipelineStatus.lessonId}`)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Admin Preview
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {pipelineStatus.status === 'failed' && pipelineStatus.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader>
                      <CardTitle className="text-red-500 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Pipeline Falhou
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-400">{pipelineStatus.error}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
