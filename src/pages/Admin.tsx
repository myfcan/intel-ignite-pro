import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, TestTube, RefreshCw, Bug, FlaskConical, Layers, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie a geração de áudios do sistema
          </p>
        </div>

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
              Sincronizar Lições
            </CardTitle>
            <CardDescription>
              Sincroniza lições do código TypeScript para o banco e gera áudios automaticamente
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

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              🎓 Criação em Lote (Modelo V2)
            </CardTitle>
            <CardDescription>
              Sistema automatizado completo: validação + áudios + sincronização para múltiplas aulas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/batch-lessons')}
              size="lg"
              className="w-full"
              variant="default"
            >
              <Layers className="w-4 h-4 mr-2" />
              Abrir Criação em Lote
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-600" />
              🎙️ Análise de Entonação TTS
            </CardTitle>
            <CardDescription>
              Sistema automático que detecta problemas de entonação antes de gerar áudio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Detecta palavras em CAIXA ALTA, múltiplas exclamações, ênfase excessiva e mais.
              Integrado na sincronização em lote!
            </div>
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
              🧪 Sistema de Validação
            </CardTitle>
            <CardDescription>
              Dashboard completo com testes automatizados das 4 garantias do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              ✅ TypeScript detecta erros • ✅ Bloqueia sync incorreto • ✅ Validação defensiva • ✅ Alerta de versão
            </div>
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

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
