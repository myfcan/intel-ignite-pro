import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Wrench, MessageSquare, Activity, Trash2, ArrowLeft, Timer, Database, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Admin Hub - Sistema de gestão dual
export default function Admin() {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateAula06Cards = async () => {
    setIsUpdating(true);
    try {
      const AULA_06_ID = 'e8a82f35-2818-42ff-b71b-565fca199f59';

      const experienceCards = [
        { type: 'core-triangle', sectionIndex: 2, anchorText: 'tema, público e promessa', props: { title: 'Tríade Central', subtitle: 'Três decisões fundamentais' } },
        { type: 'module-map', sectionIndex: 2, anchorText: 'mapa de módulos', props: { title: 'Mapa de Módulos', subtitle: 'Cada módulo resolve uma etapa' } },
        { type: 'objective-focus', sectionIndex: 2, anchorText: 'objetivos de cada parte', props: { title: 'Objetivos de Aprendizagem', subtitle: 'O que a pessoa precisa conseguir' } },
        { type: 'video-course-view', sectionIndex: 3, anchorText: 'curso em vídeo passo a passo', props: { title: 'Curso em Vídeo', subtitle: 'Módulos com demonstrações práticas' } },
        { type: 'ebook-view', sectionIndex: 3, anchorText: 'eBook para leitura independente', props: { title: 'Versão eBook', subtitle: 'Capítulos com textos e checklists' } },
        { type: 'multi-format', sectionIndex: 3, anchorText: 'mesma base, formatos diferentes', props: { title: 'Múltiplos Formatos', subtitle: 'Um conhecimento, vários produtos' } },
        { type: 'tool-groups', sectionIndex: 4, anchorText: 'três grupos de ferramentas', props: { title: '3 Grupos de I.A.', subtitle: 'Texto, Visual e Vídeo' } },
        { type: 'text-tools', sectionIndex: 4, anchorText: 'modelos de linguagem para estrutura e texto', props: { title: 'Ferramentas de Texto', subtitle: 'ChatGPT, Claude, Gemini' } },
        { type: 'visual-tools', sectionIndex: 4, anchorText: 'I.A. para capas e materiais visuais', props: { title: 'Ferramentas Visuais', subtitle: 'DALL-E, Midjourney, Gemini' } },
        { type: 'coauthor-role', sectionIndex: 5, anchorText: 'coautora, não dona', props: { title: 'I.A. como Coautora', subtitle: 'Parceira, não dona do trabalho' } },
        { type: 'editor-in-chief', sectionIndex: 5, anchorText: 'você decide o que entra e o que fica de fora', props: { title: 'Você no Comando', subtitle: 'O filtro final é seu' } },
        { type: 'long-term-asset', sectionIndex: 5, anchorText: 'ativo de longo prazo', props: { title: 'Ativo de Longo Prazo', subtitle: 'Conteúdo que trabalha por anos' } }
      ];

      // Buscar aula atual
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', AULA_06_ID)
        .single();

      if (fetchError || !lesson) {
        throw new Error(`Erro ao buscar aula: ${fetchError?.message}`);
      }

      // Atualizar com experienceCards
      const updatedContent = { ...(lesson.content as object), experienceCards };
      
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ content: updatedContent })
        .eq('id', AULA_06_ID);

      if (updateError) {
        throw new Error(`Erro ao atualizar: ${updateError.message}`);
      }

      toast.success('Aula 06 atualizada com 12 experienceCards!');
      console.log('✅ ExperienceCards inseridos:', experienceCards.length);
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsUpdating(false);
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

          <Card className="border-2 border-green-500/20 bg-green-500/5 hover:border-green-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6 text-green-600" />
                Fix Aula 06 Cards
              </CardTitle>
              <CardDescription>
                Inserir experienceCards no banco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mb-4">
                <p>📝 12 experienceCards pré-definidos</p>
                <p>🎬 core-triangle, module-map, etc.</p>
                <p>✅ Atualiza content.experienceCards</p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleUpdateAula06Cards}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Atualizar Aula 06
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
