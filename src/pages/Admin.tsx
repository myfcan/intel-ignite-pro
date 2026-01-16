import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Wrench, MessageSquare, Activity, Trash2, ArrowLeft, Timer, Palette, FileJson, Copy, CheckCircle, BookOpen, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

// JSON Modelo INPUT para Pipeline V7-vv (formato com scenes, não phases)
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// Admin Hub - Sistema de gestão dual
export default function Admin() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(V7Aula1InputModelo, null, 2));
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar JSON');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Escolha o modo de gestão das lições
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/pipeline')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Rocket className="w-8 h-8 text-purple-600" />
                Pipeline Automático
              </CardTitle>
              <CardDescription className="text-base">
                Sistema em 8 etapas lineares para criar lições do zero
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>✅ Validação automática em cada etapa</p>
                <p>✅ Suporte para modelos V1 e V2</p>
                <p>✅ Monitor em tempo real</p>
                <p>✅ Criação individual ou em lote</p>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/pipeline');
                }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Acessar Pipeline
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/manual')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Wrench className="w-8 h-8" />
                Gestão Manual
              </CardTitle>
              <CardDescription className="text-base">
                Ferramentas manuais para gerenciar lições existentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>🔧 Geração manual de áudio</p>
                <p>🔧 Sincronização de lições existentes</p>
                <p>🔧 Debug e validação</p>
                <p>🔧 Testes e análises</p>
              </div>
              <Button
                size="lg"
                className="w-full"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/manual');
                }}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Acessar Ferramentas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* V7-vv Pipeline - FIXO E SEMPRE VISÍVEL */}
        <Card className="border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 hover:border-pink-500/50 transition-all cursor-pointer" onClick={() => navigate('/admin/v7-vv')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="w-8 h-8 text-pink-500" />
              Pipeline V7-vv
              <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded-full ml-2">PRINCIPAL</span>
            </CardTitle>
            <CardDescription className="text-base">
              Sistema definitivo de criação de aulas cinematográficas com scenes e anchorActions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>✅ Scenes com narração e visuais sincronizados</p>
              <p>✅ AnchorActions para interatividade precisa</p>
              <p>✅ Áudio ElevenLabs com word timestamps</p>
              <p>✅ Quiz, Playground e CTA integrados</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/v7-vv');
                }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Criar Aula V7-vv
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-500/50 hover:bg-pink-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/v7/pipeline-test');
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Testar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de acesso rápido */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Monitoramento
              </CardTitle>
              <CardDescription>
                Acompanhe execuções do pipeline em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>📊 Progresso detalhado por etapa</p>
                <p>📝 Logs em tempo real</p>
                <p>🔄 Repetir etapas que falharam</p>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/pipeline/monitor')}
              >
                Abrir Monitor
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 bg-destructive/5 hover:border-destructive/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-destructive" />
                Gerenciar Lições
              </CardTitle>
              <CardDescription>
                Visualizar, filtrar e deletar lições existentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>📋 Lista completa de lições</p>
                <p>🔍 Filtros por trilha e status</p>
                <p>🗑️ Exclusão segura com confirmação</p>
              </div>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => navigate('/admin/pipeline/manage-lessons')}
              >
                Gerenciar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                Playground Sessions
              </CardTitle>
            <CardDescription>
                Gestão de tokens LLM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>📊 Total de sessões e tokens usados</p>
                <p>📊 Usuários únicos e taxa de feedback</p>
                <p>📊 Histórico completo de interações</p>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/playground-sessions')}
              >
                Ver Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-amber-600" />
                Teste Sincronização
              </CardTitle>
              <CardDescription>
                Validação de timing dos Card Effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>⏱️ Timer visual com segundos</p>
                <p>🎬 Cards rodando sincronizados</p>
                <p>📝 Texto + anchorText destacado</p>
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => navigate('/admin/test-card-sync')}
              >
                Testar Sincronização
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-6 h-6 text-pink-600" />
                Design Chat Demo
              </CardTitle>
              <CardDescription>
                Escolha o visual do chat de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>🎨 3 estilos: Minimal, Glass, Gradient</p>
                <p>👁️ Preview interativo lado a lado</p>
                <p>✅ Clique para selecionar e aplicar</p>
              </div>
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={() => navigate('/chat-design-demo')}
              >
                Ver Designs
              </Button>
            </CardContent>
          </Card>

          {/* Card JSON Modelo Padrão V7-vv */}
          <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-colors md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileJson className="w-6 h-6 text-emerald-600" />
                JSON Modelo Padrão Aula 1 - V7-vv
              </CardTitle>
              <CardDescription>
                Espelho exato da Aula 1 funcionando - Use como referência para criar novas aulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>✅ 11 cenas completas (dramatic, narrative, interaction, playground, revelation, cta, gamification)</p>
                <p>✅ anchorText.pauseAt APENAS em cenas interativas (quiz, playground, cta)</p>
                <p>✅ Método PERFEITO com letter-reveal</p>
                <p>✅ Quiz 4 opções com feedback narrado</p>
                <p>✅ Playground amador vs profissional</p>
                <p>✅ CTA com 2 botões corretos (Continuar/Voltar)</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
                  onClick={copyJsonToClipboard}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar JSON Modelo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-w-[140px] border-emerald-500/50 hover:bg-emerald-500/10"
                  onClick={() => navigate('/admin/v7/docs')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Documentação
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                  onClick={() => navigate('/admin/v7/create')}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Ir para Pipeline V7
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3D Demos */}
          <Card className="border-2 border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 transition-colors md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Box className="w-6 h-6 text-cyan-600" />
                Demonstrações 3D Avançadas
                <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-full ml-2">NOVO</span>
              </CardTitle>
              <CardDescription>
                Post-Processing, InstancedMesh e Modelos 3D para aulas cinematográficas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>✨ Bloom, Depth of Field, Vignette, Chromatic Aberration</p>
                <p>👥 InstancedMesh para multidões (2000+ objetos)</p>
                <p>🖥️ Modelos 3D: monitores, smartphones, personagens</p>
              </div>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => navigate('/admin/3d-demos')}
              >
                <Box className="w-4 h-4 mr-2" />
                Ver Demonstrações 3D
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
