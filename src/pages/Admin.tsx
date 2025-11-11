import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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

        <div className="flex justify-center pt-4">
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
