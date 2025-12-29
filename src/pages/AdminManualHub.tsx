import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock, Zap, TestTube, Bug, FlaskConical,
  Volume2, ArrowLeft, Wrench, Image, Wand2, FolderPlus, Settings, Film, Play, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminManualHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="w-8 h-8" />
              Gestão Manual
            </h1>
            <p className="text-muted-foreground">
              Ferramentas manuais para gerenciar áudios, sincronização e testes
            </p>
          </div>
        </div>

        {/* Card: Criação de Aulas */}
        <Card className="border-2 border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FolderPlus className="w-6 h-6 text-purple-600" />
              Criação de Aulas
            </CardTitle>
            <CardDescription>
              Ferramentas para criar novas aulas V3, V5 e V7
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Criação Aula V3 */}
            <Card className="border border-purple-500/30 hover:border-purple-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image className="w-5 h-5 text-purple-600" />
                  Criação Aula V3
                </CardTitle>
                <CardDescription className="text-sm">
                  Crie aulas V3 com upload manual de imagens - Sem geração via API (mais rápido e confiável)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/create-lesson-v3')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Criar Aula V3
                </Button>
              </CardContent>
            </Card>

            {/* Configurador V5 */}
            <Card className="border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="w-5 h-5 text-cyan-600" />
                  Configurador V5 - Experience Cards
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure experience cards interativos para aulas V5 (IaBookExperienceCard, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/v5-card-config')}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  size="sm"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Configurar V5 Cards
                </Button>
              </CardContent>
            </Card>

            {/* Criação Aula V7 Cinematic */}
            <Card className="border border-amber-500/30 hover:border-amber-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Film className="w-5 h-5 text-amber-600" />
                  Criação Aula V7 Cinematic
                </CardTitle>
                <CardDescription className="text-sm">
                  Crie aulas cinematográficas imersivas com 7 fases e sincronização de áudio
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/v7/create')}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Criar Aula V7
                </Button>
              </CardContent>
            </Card>

            {/* V7-vv Pipeline (NOVO) */}
            <Card className="border border-pink-500/30 hover:border-pink-500/50 transition-colors bg-pink-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  V7-vv Pipeline
                  <span className="text-xs bg-pink-600 text-white px-1.5 py-0.5 rounded">NOVO</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Pipeline automatizado com scenes, narração e anchorActions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/v7-vv')}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar V7-vv
                </Button>
              </CardContent>
            </Card>

            {/* Teste V7 Cinematic */}
            <Card className="border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Play className="w-5 h-5 text-emerald-600" />
                  Teste V7 Cinematic
                </CardTitle>
                <CardDescription className="text-sm">
                  Teste e debug de aulas V7 com visualização de fases e sincronização
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/v7-test')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Testar V7
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Card: Ferramentas */}
        <Card className="border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6" />
              Ferramentas
            </CardTitle>
            <CardDescription>
              Áudio, sincronização, debug e validação
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Gerador de Áudio Manual */}
            <Card className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5" />
                  Gerador de Áudio Manual
                </CardTitle>
                <CardDescription className="text-sm">
                  Gere áudios com timestamps precisos usando ElevenLabs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/audio-generator')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Abrir Gerador
                </Button>
              </CardContent>
            </Card>

            {/* Gerador de Áudio em Lote */}
            <Card className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-5 h-5" />
                  Gerador de Áudio em Lote
                </CardTitle>
                <CardDescription className="text-sm">
                  Gere múltiplos áudios de uma vez com revisão
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/audio-batch')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Abrir Lote
                </Button>
              </CardContent>
            </Card>

            {/* Análise de Entonação */}
            <Card className="border border-green-500/30 hover:border-green-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  Análise de Entonação TTS
                </CardTitle>
                <CardDescription className="text-sm">
                  Detecta problemas de entonação antes de gerar áudio
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/intonation-test')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Testar Entonação
                </Button>
              </CardContent>
            </Card>

            {/* Testar Sincronização */}
            <Card className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TestTube className="w-5 h-5" />
                  Testar Sincronização
                </CardTitle>
                <CardDescription className="text-sm">
                  Teste sincronização áudio/texto com interface interativa
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/sync-tester')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Sync
                </Button>
              </CardContent>
            </Card>

            {/* Debug de Timestamps */}
            <Card className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bug className="w-5 h-5" />
                  Debug de Timestamps
                </CardTitle>
                <CardDescription className="text-sm">
                  Visualize timestamps salvos e valide sincronização
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/debug-timestamps')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Debug
                </Button>
              </CardContent>
            </Card>

            {/* Testador de Aulas */}
            <Card className="border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="w-5 h-5" />
                  Testador de Aulas
                </CardTitle>
                <CardDescription className="text-sm">
                  Validação completa: áudio → playground → exercícios
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin/lesson-tester')}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Testar Aulas
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
