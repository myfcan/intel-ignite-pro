import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';
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
