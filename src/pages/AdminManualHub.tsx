import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock, Zap, TestTube, RefreshCw, Bug, FlaskConical,
  Volume2, ArrowLeft, Wrench, Image, Wand2
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

        {/* NOVO: Criação Aula V3 com Upload Manual */}
        <Card className="border-2 border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-600" />
              Criação Aula V3
            </CardTitle>
            <CardDescription>
              Crie aulas V3 com upload manual de imagens - Sem geração via API (mais rápido e confiável)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/create-lesson-v3')}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Image className="w-4 h-4 mr-2" />
              Criar Aula V3
            </Button>
          </CardContent>
        </Card>

        {/* NOVO: Configurador V5 Experience Cards */}
        <Card className="border-2 border-cyan-500/20 bg-cyan-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-cyan-600" />
              Configurador V5 - Experience Cards
            </CardTitle>
            <CardDescription>
              Configure experience cards interativos para aulas V5 (IaBookExperienceCard, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/v5-card-config')}
              size="lg"
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Configurar V5 Cards
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Gerador de Áudio Manual
            </CardTitle>
            <CardDescription>
              Gere áudios com timestamps precisos para uma aula específica usando ElevenLabs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/audio-generator')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <Clock className="w-4 h-4 mr-2" />
              Abrir Gerador Manual
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Gerador de Áudio em Lote
            </CardTitle>
            <CardDescription>
              Sistema automatizado para gerar múltiplos áudios de uma vez, com revisão e aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/audio-batch')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <Zap className="w-4 h-4 mr-2" />
              Abrir Gerador em Lote
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Sincronizar Lições Existentes
            </CardTitle>
            <CardDescription>
              Sincroniza as 4 lições existentes do código TypeScript para o banco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/sync-lessons')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Abrir Sincronização
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-600" />
              Análise de Entonação TTS
            </CardTitle>
            <CardDescription>
              Sistema automático que detecta problemas de entonação antes de gerar áudio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/intonation-test')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Testar Análise de Entonação
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Testar Sincronização
            </CardTitle>
            <CardDescription>
              Teste a sincronização entre áudio e texto das aulas com interface interativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/sync-tester')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Abrir Testador de Sincronização
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Debug de Timestamps
            </CardTitle>
            <CardDescription>
              Visualize os timestamps salvos de cada seção e valide a sincronização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/debug-timestamps')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <Bug className="w-4 h-4 mr-2" />
              Abrir Debug de Timestamps
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Testador de Aulas
            </CardTitle>
            <CardDescription>
              Validação automatizada completa do fluxo: áudio → playground → exercícios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/lesson-tester')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Abrir Testador de Aulas
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              Sistema de Validação
            </CardTitle>
            <CardDescription>
              Dashboard completo com testes automatizados das 4 garantias do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/validation-system')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Abrir Sistema de Validação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
