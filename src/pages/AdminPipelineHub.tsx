import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, FileText, FolderOpen, Activity, ArrowLeft, Trash2, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPipelineHub() {
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
              <Rocket className="w-8 h-8 text-purple-600" />
              Pipeline Automático
            </h1>
            <p className="text-muted-foreground">
              Sistema em 8 etapas: Intake → Exercícios → Texto → Draft → Áudio → Timestamps → Ativação
            </p>
          </div>
        </div>

        {/* V7-VV Pipeline - Destaque */}
        <Card className="border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:border-purple-500 transition-colors cursor-pointer" onClick={() => navigate('/admin/pipeline/v7-create')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="w-6 h-6 text-purple-500" />
              🎬 Pipeline V7-VV (Novo!)
            </CardTitle>
            <CardDescription>
              Sistema cinematográfico com fases, narração sincronizada, efeitos visuais e exercícios integrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✨ Validação → Narração → Áudio → Âncoras → Conteúdo → Consolidação → Ativação</p>
              <p>🎯 Suporte a múltiplas fases com visual effects e anchor actions</p>
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Film className="w-4 h-4 mr-2" />
              Criar Lição V7-VV
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/admin/pipeline/create-single')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Criar Lição Única
              </CardTitle>
              <CardDescription>
                Formulário completo para criar uma lição com validação em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                <FileText className="w-4 h-4 mr-2" />
                Começar Criação
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/admin/pipeline/create-batch')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Criar Lições em Lote
              </CardTitle>
              <CardDescription>
                Upload de JSON/CSV ou inserção manual de múltiplas lições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                <FolderOpen className="w-4 h-4 mr-2" />
                Criar em Lote
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-destructive transition-colors cursor-pointer" onClick={() => navigate('/admin/pipeline/manage-lessons')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Gerenciar Lições
              </CardTitle>
              <CardDescription>
                Visualizar, filtrar e deletar lições existentes com segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Monitorar Execuções
            </CardTitle>
            <CardDescription>
              Acompanhe em tempo real o progresso de todas as execuções do pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>📊 Progresso detalhado por etapa</p>
              <p>📝 Logs em tempo real</p>
              <p>⏸️ Pausar e retomar execuções</p>
              <p>🔄 Repetir etapas que falharam</p>
            </div>
            <Button
              onClick={() => navigate('/admin/pipeline/monitor')}
              size="lg"
              className="w-full"
            >
              <Activity className="w-4 h-4 mr-2" />
              Abrir Monitor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
