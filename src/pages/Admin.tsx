import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Rocket, 
  Wrench, 
  Activity, 
  Trash2, 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  BookOpen, 
  Box, 
  Bug,
  Timer,
  Palette,
  FileJson,
  MessageSquare,
  Play,
  FlaskConical,
  FolderOpen,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// JSON Modelo INPUT para Pipeline V7-vv (formato com scenes, não phases)
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// Admin Hub - Sistema de gestão organizado
export default function Admin() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      setIsAdminRole((roles || []).some(r => r.role === 'admin'));
    };
    checkRole();
  }, []);

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
      <div className="max-w-5xl mx-auto space-y-8">
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
            Central de gestão de aulas e ferramentas
          </p>
        </div>

        {/* ========== SEÇÃO PRINCIPAL - PIPELINE V7-VV ========== */}
        <Card className="border-2 border-pink-500/50 bg-gradient-to-r from-pink-500/10 to-purple-500/10 shadow-lg shadow-pink-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="w-8 h-8 text-pink-500" />
              Pipeline V7-vv
              <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded-full">PRINCIPAL</span>
            </CardTitle>
            <CardDescription className="text-base">
              Sistema principal de criação de aulas cinematográficas com scenes, anchorActions e ElevenLabs TTS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <p>✅ Scenes sincronizadas</p>
              <p>✅ AnchorActions</p>
              <p>✅ ElevenLabs TTS</p>
              <p>✅ Quiz + Playground</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[180px] bg-pink-600 hover:bg-pink-700"
                onClick={() => navigate('/admin/v7-vv')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Criar Aula V7-vv
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[140px] border-pink-500/50 hover:bg-pink-500/10"
                onClick={() => navigate('/admin/v7/pipeline')}
              >
                <Activity className="w-5 h-5 mr-2" />
                Testar Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ========== GESTÃO DE USUÁRIOS (somente admin) ========== */}
        {isAdminRole && (
        <Card className="border-2 border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 shadow-lg shadow-blue-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Box className="w-6 h-6 text-blue-500" />
              Gestão de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie permissões: Admin, Supervisor ou Usuário comum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/admin/users')}
            >
              <Box className="w-5 h-5 mr-2" />
              Abrir Gestão de Usuários
            </Button>
          </CardContent>
        </Card>
        )}

        {/* ========== CARDS DE NAVEGAÇÃO PRINCIPAIS ========== */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* GESTÃO MANUAL */}
          <Card className="border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/manual')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                Gestão Manual
              </CardTitle>
              <CardDescription>
                Ferramentas manuais para gerenciar lições
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>🔧 Criação de aulas V3, V5, V7</p>
                <p>🔧 Geração manual de áudio</p>
                <p>🔧 Sincronização de lições</p>
                <p>🔧 Gerenciar/deletar lições</p>
              </div>
              <Button
                className="w-full"
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

          {/* DEBUGS & DEMOS */}
          <Card className="border-2 border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/debugs')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-orange-500" />
                Debugs & Demos
              </CardTitle>
              <CardDescription>
                Testes, diagnósticos e demonstrações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>🔍 Debug Engine V7</p>
                <p>⏱️ Teste de sincronização</p>
                <p>🎨 Design Chat Demo</p>
                <p>🧊 Demos 3D</p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/debugs');
                }}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Ver Debugs & Demos
              </Button>
            </CardContent>
          </Card>

          {/* GUIA DE MODELOS */}
          <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/modelos')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-emerald-500" />
                Guia de Modelos
              </CardTitle>
              <CardDescription>
                Templates JSON e documentação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>📄 JSON Modelo Aula 1</p>
                <p>📚 Documentação V7-vv</p>
                <p>📋 Templates de cenas</p>
                <p>📖 Guias de uso</p>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/modelos');
                }}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Ver Modelos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ========== ACESSO RÁPIDO ========== */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Acesso Rápido</h2>
          <div className="grid gap-3 md:grid-cols-6">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 border-green-500/50 hover:bg-green-500/10"
              onClick={() => navigate('/admin/v7/play/837cc44a-fb80-4949-8fff-dbb8ba66bd1a?debug=1')}
            >
              <Play className="w-5 h-5 text-green-500" />
              <span className="text-xs">V7 Play</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => navigate('/admin/v7/diagnostic')}
            >
              <Bug className="w-5 h-5 text-orange-500" />
              <span className="text-xs">Debug Engine</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 border-cyan-500/50 hover:bg-cyan-500/10"
              onClick={() => navigate('/admin/c10-report')}
            >
              <ClipboardCheck className="w-5 h-5 text-cyan-500" />
              <span className="text-xs">Relatório C10</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => navigate('/admin/pipeline/manage-lessons')}
            >
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="text-xs">Gerenciar Lições</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => navigate('/admin/pipeline/monitor')}
            >
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-xs">Monitor Pipeline</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={copyJsonToClipboard}
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-emerald-500" />
              )}
              <span className="text-xs">{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </Button>
          </div>
        </div>

        {/* ========== PIPELINE AUTOMÁTICO (LEGADO) ========== */}
        <Card className="border border-border/50 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
              <Rocket className="w-5 h-5" />
              Pipeline Automático
              <span className="text-xs bg-muted px-2 py-0.5 rounded">V1/V2</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Sistema legado em 8 etapas para modelos V1 e V2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/pipeline')}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Acessar Pipeline Legado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
