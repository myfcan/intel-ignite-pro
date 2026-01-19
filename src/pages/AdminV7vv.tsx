/**
 * AdminV7vv - Página de administração para o Pipeline V7-vv
 *
 * Permite:
 * - Criar aulas V7-vv a partir de roteiros JSON
 * - Visualizar o resultado do processamento
 * - Testar a reprodução da aula
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileBarChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ✅ Importar o JSON modelo CORRETO (com scenes, não phases)
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// Roteiro de exemplo SIMPLES (para testes rápidos)
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

interface PipelineResult {
  success: boolean;
  lessonId?: string;
  error?: string;
  validationErrors?: Array<{ scene: string; field: string; message: string }>;
  stats?: {
    phaseCount: number;
    sceneCount: number;
    anchorCount: number;
    totalDuration: number;
    hasAudio: boolean;
    wordTimestampsCount: number;
    missingAnchors?: string[];
  };
}

export default function AdminV7vv() {
  const navigate = useNavigate();
  const [scriptJson, setScriptJson] = useState(EXAMPLE_SCRIPT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  // Processar roteiro
  const handleProcess = async () => {
    if (!validateJson(scriptJson)) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const script = JSON.parse(scriptJson);
      console.log('[AdminV7vv] Processing script:', script.title);

      const { data, error } = await supabase.functions.invoke('v7-vv', {
        body: script
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('[AdminV7vv] Pipeline result:', data);
      setResult(data as PipelineResult);

    } catch (err: any) {
      console.error('[AdminV7vv] Error:', err);
      setResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Carregar exemplo simples
  const loadExample = () => {
    setScriptJson(EXAMPLE_SCRIPT);
    setJsonError(null);
    toast.info('Exemplo simples carregado');
  };

  // ✅ Carregar JSON modelo COMPLETO da Aula 1 (formato correto com scenes)
  const loadFullModel = () => {
    setScriptJson(JSON.stringify(V7Aula1InputModelo, null, 2));
    setJsonError(null);
    toast.success('JSON modelo COMPLETO da Aula 1 carregado! (10 cenas)');
  };

  // Preview da aula
  const handlePreview = () => {
    if (result?.lessonId) {
      navigate(`/v7-lesson/${result.lessonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
                Gerador de Aulas Cinematográficas - Versão Definitiva
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/v7/debug-reports')}
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug Reports
            </Button>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              v7-vv
            </Badge>
          </div>
        </div>

        {/* Características */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className="font-mono text-sm h-[500px] bg-gray-900 border-gray-600 text-gray-100"
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
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || !!jsonError}
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
                      Processar com V7-vv
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  onClick={loadFullModel}
                  className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Carregar Aula 1 Completa
                </Button>
                <Button
                  variant="outline"
                  onClick={loadExample}
                  className="border-gray-600"
                >
                  Exemplo Simples
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Resultado
              </CardTitle>
              <CardDescription>
                Resultado do processamento do Pipeline V7-vv
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !isProcessing && (
                <div className="h-[500px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Clique em "Processar" para gerar a aula</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-cyan-400" />
                    <p className="text-cyan-400">Processando roteiro...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Gerando áudio, calculando timings, criando scenes...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
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
                    <Tabs defaultValue="stats" className="w-full">
                      <TabsList className="bg-gray-700">
                        <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                        <TabsTrigger value="anchors">Anchors</TabsTrigger>
                      </TabsList>

                      <TabsContent value="stats" className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-700/50 rounded p-3">
                            <p className="text-sm text-gray-400">Phases</p>
                            <p className="text-2xl font-bold text-cyan-400">
                              {result.stats.phaseCount}
                            </p>
                          </div>
                          <div className="bg-gray-700/50 rounded p-3">
                            <p className="text-sm text-gray-400">Scenes</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {result.stats.sceneCount}
                            </p>
                          </div>
                          <div className="bg-gray-700/50 rounded p-3">
                            <p className="text-sm text-gray-400">Anchors</p>
                            <p className="text-2xl font-bold text-yellow-400">
                              {result.stats.anchorCount}
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
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <span>{result.stats.wordTimestampsCount} words</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="anchors" className="mt-4">
                        {result.stats.missingAnchors && result.stats.missingAnchors.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-yellow-400 text-sm">
                              ⚠️ Anchors não encontrados no áudio:
                            </p>
                            {result.stats.missingAnchors.map((anchor, i) => (
                              <div key={i} className="bg-yellow-900/20 border border-yellow-800 rounded p-2 text-sm">
                                {anchor}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-green-400">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                            <p>Todos os anchors foram encontrados!</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
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
              )}
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
                  <li>• <code className="text-yellow-400">gamification</code> - Recompensas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">AnchorText (Obrigatório)</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• <code className="text-yellow-400">pauseAt</code> - Pausa para interação</li>
                  <li>• Deve ser uma palavra/frase exata da narração</li>
                  <li>• Pipeline valida se existe no áudio</li>
                  <li>• Sem fallbacks - erro se não encontrar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Visual Effects</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• <code className="text-yellow-400">mood</code> - dramatic, calm, danger, success</li>
                  <li>• <code className="text-yellow-400">particles</code> - confetti, sparks, ember</li>
                  <li>• <code className="text-yellow-400">glow</code> - Efeito de brilho</li>
                  <li>• <code className="text-yellow-400">shake</code> - Tremor de câmera</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
