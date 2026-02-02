import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Bug, 
  Timer, 
  Palette, 
  Box, 
  MessageSquare,
  Play,
  FlaskConical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDebugs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-orange-500" />
              Debugs & Demos
            </h1>
            <p className="text-muted-foreground mt-1">
              Ferramentas de diagnóstico, testes e demonstrações visuais
            </p>
          </div>
        </div>

        {/* Debug Engine V7 - Destaque */}
        <Card className="border-2 border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bug className="w-7 h-7 text-orange-500" />
              Debug Engine V7
              <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">PRINCIPAL</span>
            </CardTitle>
            <CardDescription>
              Diagnóstico profundo de aulas V7 com análise de 60+ validações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>🔍 Health Score (0-100)</p>
              <p>⚠️ 60+ validações</p>
              <p>📊 Root cause analysis</p>
              <p>✅ Actions corretivas</p>
            </div>
            <Button
              size="lg"
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate('/admin/v7/diagnostic')}
            >
              <Bug className="w-5 h-5 mr-2" />
              Abrir Debug Engine
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Teste V7 Cinematic */}
          <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-500" />
                Teste V7 Cinematic
              </CardTitle>
              <CardDescription>
                Teste e debug de aulas V7 com visualização de fases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>▶️ Preview de aulas existentes</p>
                <p>🔄 Visualização de fases</p>
                <p>📊 Sincronização de áudio</p>
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/v7-test')}
              >
                <Play className="w-4 h-4 mr-2" />
                Testar Aulas V7
              </Button>
            </CardContent>
          </Card>

          {/* Teste Sincronização */}
          <Card className="border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                Teste Sincronização
              </CardTitle>
              <CardDescription>
                Validação de timing dos Card Effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>⏱️ Timer visual com segundos</p>
                <p>🎬 Cards rodando sincronizados</p>
                <p>📝 Texto + anchorText destacado</p>
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => navigate('/admin/test-card-sync')}
              >
                <Timer className="w-4 h-4 mr-2" />
                Testar Sincronização
              </Button>
            </CardContent>
          </Card>

          {/* Design Chat Demo */}
          <Card className="border-2 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-500" />
                Design Chat Demo
              </CardTitle>
              <CardDescription>
                Escolha o visual do chat de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>🎨 3 estilos: Minimal, Glass, Gradient</p>
                <p>👁️ Preview interativo lado a lado</p>
                <p>✅ Clique para selecionar e aplicar</p>
              </div>
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={() => navigate('/chat-design-demo')}
              >
                <Palette className="w-4 h-4 mr-2" />
                Ver Designs
              </Button>
            </CardContent>
          </Card>

          {/* Demos 3D */}
          <Card className="border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-500" />
                Demos 3D
                <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">NOVO</span>
              </CardTitle>
              <CardDescription>
                Post-Processing, InstancedMesh e Modelos 3D
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>✨ Bloom, Depth of Field, Vignette</p>
                <p>👥 InstancedMesh para multidões</p>
                <p>🖥️ Modelos 3D cinematográficos</p>
              </div>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => navigate('/admin/3d-demos')}
              >
                <Box className="w-4 h-4 mr-2" />
                Ver Demos 3D
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Playground Sessions */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Playground Sessions
            </CardTitle>
            <CardDescription>
              Gestão de tokens LLM e histórico de interações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>📊 Total de sessões e tokens usados</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/playground-sessions')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
