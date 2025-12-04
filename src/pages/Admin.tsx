import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Wrench, MessageSquare, Activity, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Admin Hub - Sistema de gestão dual
export default function Admin() {
  const navigate = useNavigate();

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
        </div>

      </div>
    </div>
  );
}
