/**
 * AdminV7Pipeline - Interface Consolidada para Pipeline V7-vv
 * 
 * Combina funcionalidades de AdminV7vv e AdminV7PipelineTest:
 * - Editor JSON com validação em tempo real
 * - Botão Dry-Run para validação profunda sem processamento
 * - Botão Processar para execução completa
 * - Logs e resultados em tempo real
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  FileJson,
  Sparkles,
  Film,
  Volume2,
  Clock,
  Layers,
  Target,
  ArrowLeft,
  Copy,
  Bug,
  AlertTriangle,
  Zap,
  Search,
  FileCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Importar JSON modelo
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// Roteiro de exemplo SIMPLES
const EXAMPLE_SCRIPT = `{
  "title": "Minha Primeira Aula V7-vv",
  "subtitle": "Aprenda a usar IA de verdade",
  "difficulty": "beginner",
  "category": "Fundamentos de IA",
  "tags": ["IA", "prompts"],
  "learningObjectives": ["Entender prompts eficazes"],
  "generate_audio": true,
  "scenes": [
    {
      "id": "cena-1",
      "title": "Abertura",
      "type": "dramatic",
      "narration": "Bem-vindo à sua jornada de aprendizado com inteligência artificial.",
      "visual": {
        "type": "letterbox",
        "content": {
          "hookQuestion": "Pronto para transformar sua forma de trabalhar?",
          "mainText": "Bem-vindo"
        }
      }
    },
    {
      "id": "cena-2",
      "title": "Pergunta",
      "type": "interaction",
      "narration": "Agora me diga, você já usou IA antes? Escolha sua resposta.",
      "anchorText": {
        "pauseAt": "Escolha sua resposta"
      },
      "visual": {
        "type": "quiz",
        "content": {
          "title": "Sua experiência"
        }
      },
      "interaction": {
        "type": "quiz",
        "question": "Você já usou IA antes?",
        "options": [
          { "id": "a", "text": "Sim, uso diariamente", "isCorrect": true },
          { "id": "b", "text": "Já experimentei algumas vezes", "isCorrect": true },
          { "id": "c", "text": "Nunca usei", "isCorrect": true }
        ]
      }
    }
  ]
}`;

interface DryRunIssue {
  sceneId: string;
  sceneTitle: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface DryRunAutoFix {
  sceneId: string;
  field: string;
  action: string;
  value?: string;
}

interface DryRunResult {
  canProcess: boolean;
  validationScore: number;
  issues: DryRunIssue[];
  autoFixes: DryRunAutoFix[];
  sceneAnalysis: Array<{
    sceneId: string;
    sceneTitle: string;
    type: string;
    wordCount: number;
    estimatedDuration: number;
    hasInteraction: boolean;
    hasPauseAt: boolean;
    warnings: string[];
  }>;
  recommendation: string;
  estimatedDuration: number;
  totalWords: number;
}

interface PipelineResult {
  success: boolean;
  lessonId?: string;
  error?: string;
  validationErrors?: Array<{ scene: string; field: string; message: string }>;
  stats?: {
    phaseCount: number;
    sceneCount?: number;
    anchorCount?: number;
    totalDuration: number;
    hasAudio: boolean;
    wordTimestampsCount?: number;
    mainAudioDuration?: number;
    feedbackAudioCount?: number;
  };
  debug?: {
    summary: {
      healthScore: number;
      severity: string;
    };
    allIssues: Array<{ message: string }>;
  };
}

export default function AdminV7Pipeline() {
  const navigate = useNavigate();
  const [scriptJson, setScriptJson] = useState(EXAMPLE_SCRIPT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'result' | 'dryrun'>('result');

  // Validar JSON em tempo real
  const validateJson = useCallback((json: string) => {
    try {
      JSON.parse(json);
      setJsonError(null);
      return true;
    } catch (e: any) {
      setJsonError(`Erro de sintaxe JSON: ${e.message}`);
      return false;
    }
  }, []);

  // Executar Dry-Run (validação profunda sem processamento)
  const handleDryRun = async () => {
    if (!validateJson(scriptJson)) return;

    setIsDryRunning(true);
    setDryRunResult(null);
    setActiveTab('dryrun');

    try {
      const script = JSON.parse(scriptJson);
      console.log('[AdminV7Pipeline] Running dry-run validation:', script.title);

      const { data, error } = await supabase.functions.invoke('v7-vv', {
        body: { ...script, dry_run: true }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('[AdminV7Pipeline] Dry-run result:', data);
      setDryRunResult(data as DryRunResult);

      if (data.canProcess) {
        toast.success(`✅ Validação aprovada! Score: ${data.validationScore}/100`);
      } else {
        toast.warning(`⚠️ JSON precisa de ajustes. Score: ${data.validationScore}/100`);
      }

    } catch (err: any) {
      console.error('[AdminV7Pipeline] Dry-run error:', err);
      toast.error(`Erro no dry-run: ${err.message}`);
    } finally {
      setIsDryRunning(false);
    }
  };

  // Processar roteiro (execução completa)
  const handleProcess = async () => {
    if (!validateJson(scriptJson)) return;

    setIsProcessing(true);
    setResult(null);
    setActiveTab('result');

    try {
      const script = JSON.parse(scriptJson);
      console.log('[AdminV7Pipeline] Processing script:', script.title);

      const { data, error } = await supabase.functions.invoke('v7-vv', {
        body: script
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('[AdminV7Pipeline] Pipeline result:', data);
      setResult(data as PipelineResult);

      if (data.success) {
        toast.success(`✅ Aula criada! ID: ${data.lessonId}`);
      } else {
        toast.error(`❌ Pipeline falhou: ${data.error}`);
      }

    } catch (err: any) {
      console.error('[AdminV7Pipeline] Error:', err);
      setResult({
        success: false,
        error: err.message
      });
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Carregar exemplo simples
  const loadExample = () => {
    setScriptJson(EXAMPLE_SCRIPT);
    setJsonError(null);
    setResult(null);
    setDryRunResult(null);
    toast.info('Exemplo simples carregado');
  };

  // Carregar JSON modelo COMPLETO
  const loadFullModel = () => {
    setScriptJson(JSON.stringify(V7Aula1InputModelo, null, 2));
    setJsonError(null);
    setResult(null);
    setDryRunResult(null);
    toast.success('JSON modelo COMPLETO carregado!');
  };

  // Preview da aula
  const handlePreview = () => {
    if (result?.lessonId) {
      navigate(`/v7-lesson/${result.lessonId}`);
    }
  };

  // Obter cor do score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Obter cor da severidade
  const getSeverityColor = (severity: string) => {
    if (severity === 'error') return 'bg-red-500/20 border-red-500/50 text-red-400';
    if (severity === 'warning') return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/manual')}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Film className="w-8 h-8 text-cyan-400" />
                Pipeline V7-vv
              </h1>
              <p className="text-gray-400 mt-1">
                Gerador de Aulas Cinematográficas com Dry-Run
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/v7/diagnostic')}
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
            >
              <Bug className="w-4 h-4 mr-2" />
              Diagnostic
            </Button>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              v7-vv + dry-run
            </Badge>
          </div>
        </div>

        {/* Características */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Dry-Run</p>
                <p className="font-semibold">Validação Real</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400">AnchorText</p>
                <p className="font-semibold">Obrigatório</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Visuals</p>
                <p className="font-semibold">Múltiplos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Áudio</p>
                <p className="font-semibold">ElevenLabs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Fallbacks</p>
                <p className="font-semibold">Zero</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor de JSON */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Roteiro JSON
              </CardTitle>
              <CardDescription>
                Cole ou edite o roteiro da aula no formato V7-vv
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={scriptJson}
                onChange={(e) => {
                  setScriptJson(e.target.value);
                  validateJson(e.target.value);
                }}
                className="font-mono text-sm h-[450px] bg-gray-900 border-gray-600 text-gray-100"
                placeholder="Cole seu roteiro JSON aqui..."
              />

              {jsonError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Erro no JSON</AlertTitle>
                  <AlertDescription>{jsonError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {/* Botão Dry-Run */}
                <Button
                  onClick={handleDryRun}
                  disabled={isDryRunning || isProcessing || !!jsonError}
                  variant="outline"
                  className="flex-1 min-w-[140px] border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  {isDryRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Validar (Dry-Run)
                    </>
                  )}
                </Button>

                {/* Botão Processar */}
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || isDryRunning || !!jsonError}
                  className="flex-1 min-w-[140px] bg-cyan-600 hover:bg-cyan-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Processar Pipeline
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  onClick={loadFullModel}
                  className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Carregar Aula 1
                </Button>
                <Button
                  variant="outline"
                  onClick={loadExample}
                  className="border-gray-600"
                  size="sm"
                >
                  Exemplo Simples
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado / Dry-Run */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Resultado
              </CardTitle>
              <CardDescription>
                Resultado da validação ou processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="bg-gray-700 mb-4">
                  <TabsTrigger value="dryrun" className="data-[state=active]:bg-purple-600">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Dry-Run
                  </TabsTrigger>
                  <TabsTrigger value="result" className="data-[state=active]:bg-cyan-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Pipeline
                  </TabsTrigger>
                </TabsList>

                {/* Tab Dry-Run */}
                <TabsContent value="dryrun">
                  {!dryRunResult && !isDryRunning && (
                    <div className="h-[400px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Clique em "Validar (Dry-Run)" para analisar o JSON</p>
                        <p className="text-sm mt-2 text-gray-600">
                          Validação profunda sem gerar áudio ou salvar no banco
                        </p>
                      </div>
                    </div>
                  )}

                  {isDryRunning && (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
                        <p className="text-purple-400">Analisando JSON...</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Validando estrutura, tipos e simulando timings
                        </p>
                      </div>
                    </div>
                  )}

                  {dryRunResult && (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 pr-4">
                        {/* Score e Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {dryRunResult.canProcess ? (
                              <CheckCircle className="w-8 h-8 text-green-400" />
                            ) : (
                              <XCircle className="w-8 h-8 text-red-400" />
                            )}
                            <div>
                              <p className="font-semibold">
                                {dryRunResult.canProcess ? 'Aprovado para Processar' : 'Ajustes Necessários'}
                              </p>
                              <p className="text-sm text-gray-400">
                                {dryRunResult.recommendation}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${getScoreColor(dryRunResult.validationScore)}`}>
                              {dryRunResult.validationScore}
                            </p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>

                        <Progress 
                          value={dryRunResult.validationScore} 
                          className="h-2"
                        />

                        {/* Estatísticas */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-700/50 rounded p-3 text-center">
                            <p className="text-xl font-bold text-cyan-400">
                              {dryRunResult.sceneAnalysis?.length || 0}
                            </p>
                            <p className="text-xs text-gray-400">Cenas</p>
                          </div>
                          <div className="bg-gray-700/50 rounded p-3 text-center">
                            <p className="text-xl font-bold text-purple-400">
                              {dryRunResult.totalWords || 0}
                            </p>
                            <p className="text-xs text-gray-400">Palavras</p>
                          </div>
                          <div className="bg-gray-700/50 rounded p-3 text-center">
                            <p className="text-xl font-bold text-green-400">
                              ~{Math.round((dryRunResult.estimatedDuration || 0) / 60)}min
                            </p>
                            <p className="text-xs text-gray-400">Duração</p>
                          </div>
                        </div>

                        {/* Issues */}
                        {dryRunResult.issues && dryRunResult.issues.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Issues ({dryRunResult.issues.length})
                            </p>
                            {dryRunResult.issues.map((issue, i) => (
                              <div 
                                key={i} 
                                className={`border rounded p-3 text-sm ${getSeverityColor(issue.severity)}`}
                              >
                                <div className="flex items-start gap-2">
                                  {issue.severity === 'error' && <XCircle className="w-4 h-4 mt-0.5" />}
                                  {issue.severity === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5" />}
                                  {issue.severity === 'info' && <Zap className="w-4 h-4 mt-0.5" />}
                                  <div>
                                    <p className="font-mono text-xs opacity-70">
                                      [{issue.sceneId}] {issue.field}
                                    </p>
                                    <p>{issue.message}</p>
                                    {issue.suggestion && (
                                      <p className="text-xs mt-1 opacity-70">
                                        💡 {issue.suggestion}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Auto-Fixes */}
                        {dryRunResult.autoFixes && dryRunResult.autoFixes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              Auto-Gerado pelo Pipeline ({dryRunResult.autoFixes.length})
                            </p>
                            {dryRunResult.autoFixes.map((fix, i) => (
                              <div 
                                key={i} 
                                className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-sm text-yellow-400"
                              >
                                <span className="font-mono text-xs opacity-70">[{fix.sceneId}]</span>{' '}
                                {fix.action}
                                {fix.value && <span className="opacity-70">: {fix.value}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* Tab Pipeline Result */}
                <TabsContent value="result">
                  {!result && !isProcessing && (
                    <div className="h-[400px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Clique em "Processar Pipeline" para gerar a aula</p>
                        <p className="text-sm mt-2 text-gray-600">
                          Recomendamos validar com Dry-Run antes de processar
                        </p>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-cyan-400" />
                        <p className="text-cyan-400">Processando roteiro...</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Gerando áudio, calculando timings, criando phases...
                        </p>
                      </div>
                    </div>
                  )}

                  {result && (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 pr-4">
                        {/* Status */}
                        <Alert variant={result.success ? "default" : "destructive"}>
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <AlertTitle>
                            {result.success ? 'Aula criada com sucesso!' : 'Erro no processamento'}
                          </AlertTitle>
                          <AlertDescription>
                            {result.success
                              ? `ID: ${result.lessonId}`
                              : result.error
                            }
                          </AlertDescription>
                        </Alert>

                        {/* Erros de validação */}
                        {result.validationErrors && result.validationErrors.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-red-400">Erros de Validação:</h4>
                            {result.validationErrors.map((err, i) => (
                              <div key={i} className="bg-red-900/20 border border-red-800 rounded p-3 text-sm">
                                <p className="font-mono text-red-300">
                                  [{err.scene}] {err.field}
                                </p>
                                <p className="text-gray-300 mt-1">{err.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Estatísticas */}
                        {result.stats && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-700/50 rounded p-3">
                                <p className="text-sm text-gray-400">Phases</p>
                                <p className="text-2xl font-bold text-cyan-400">
                                  {result.stats.phaseCount}
                                </p>
                              </div>
                              <div className="bg-gray-700/50 rounded p-3">
                                <p className="text-sm text-gray-400">Duração</p>
                                <p className="text-2xl font-bold text-green-400">
                                  {Math.round(result.stats.totalDuration)}s
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Volume2 className={`w-4 h-4 ${result.stats.hasAudio ? 'text-green-400' : 'text-gray-500'}`} />
                                <span>{result.stats.hasAudio ? 'Com áudio' : 'Sem áudio'}</span>
                              </div>
                              {result.stats.wordTimestampsCount && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-cyan-400" />
                                  <span>{result.stats.wordTimestampsCount} words</span>
                                </div>
                              )}
                            </div>

                            {/* Debug Info */}
                            {result.debug && (
                              <div className="bg-gray-700/30 rounded p-3">
                                <p className="text-sm text-gray-400 mb-2">Debug Report</p>
                                <div className="flex items-center gap-4">
                                  <Badge variant={result.debug.summary.severity === 'healthy' ? 'default' : 'destructive'}>
                                    Health: {result.debug.summary.healthScore}/100
                                  </Badge>
                                  <span className="text-sm text-gray-400">
                                    {result.debug.allIssues?.length || 0} issues
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botão de Preview */}
                        {result.success && result.lessonId && (
                          <Button
                            onClick={handlePreview}
                            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Assistir Aula
                          </Button>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Documentação */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle>Estrutura do Roteiro V7-vv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Tipos de Cena</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• <code className="text-yellow-400">dramatic</code> - Abertura impactante</li>
                  <li>• <code className="text-yellow-400">narrative</code> - Explicação com visuais</li>
                  <li>• <code className="text-yellow-400">comparison</code> - Comparação lado a lado</li>
                  <li>• <code className="text-yellow-400">interaction</code> - Quiz (requer anchorText)</li>
                  <li>• <code className="text-yellow-400">playground</code> - Prática (requer anchorText)</li>
                  <li>• <code className="text-yellow-400">revelation</code> - Revelação dramática</li>
                  <li>• <code className="text-yellow-400">cta</code> - Call to action</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Dry-Run Mode</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Validação <strong>REAL</strong> do JSON</li>
                  <li>• Simulação de timing (~150 wpm)</li>
                  <li>• Verificação de anchorText na narração</li>
                  <li>• Score de 0-100 baseado em issues</li>
                  <li>• Lista de auto-fixes que o pipeline fará</li>
                  <li>• <strong>Não gera áudio nem salva no banco</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Fluxo Recomendado</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>1️⃣ Cole ou edite o JSON</li>
                  <li>2️⃣ Clique em <strong>Validar (Dry-Run)</strong></li>
                  <li>3️⃣ Corrija issues se necessário</li>
                  <li>4️⃣ Clique em <strong>Processar Pipeline</strong></li>
                  <li>5️⃣ Aguarde geração de áudio</li>
                  <li>6️⃣ Assista a aula criada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
