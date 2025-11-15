import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLessonDebug() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState<any>(null);

  const fetchLessonData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setLessonData(data);
      console.log('📊 Dados completos da lição:', data);
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar dados',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderJson = (obj: any, title: string) => {
    if (!obj) return <p className="text-sm text-red-500">❌ Não encontrado</p>;

    return (
      <div className="space-y-2">
        <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-auto max-h-96 border">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
    );
  };

  const checkExercises = () => {
    if (!lessonData?.exercises) return { status: '❌', count: 0, message: 'Nenhum exercício encontrado no banco' };
    if (!Array.isArray(lessonData.exercises)) return { status: '⚠️', count: 0, message: 'exercises não é um array' };
    if (lessonData.exercises.length === 0) return { status: '⚠️', count: 0, message: 'Array vazio' };
    return { status: '✅', count: lessonData.exercises.length, message: `${lessonData.exercises.length} exercícios encontrados` };
  };

  const checkPlayground = () => {
    if (!lessonData?.content?.sections) return { status: '❌', message: 'Sem seções no content' };

    const playgroundSection = lessonData.content.sections.find((s: any) =>
      s.showPlaygroundCall === true && s.playgroundConfig
    );

    if (!playgroundSection) return { status: '❌', message: 'Nenhuma seção com playground configurado' };

    const sectionIndex = lessonData.content.sections.indexOf(playgroundSection);
    return {
      status: '✅',
      message: `Playground configurado na seção ${sectionIndex + 1}`,
      config: playgroundSection.playgroundConfig
    };
  };

  const exerciseCheck = lessonData ? checkExercises() : null;
  const playgroundCheck = lessonData ? checkPlayground() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/pipeline/manage-lessons')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Diagnóstico de Lição</h1>
            <p className="text-sm text-slate-600">ID: {id}</p>
          </div>
          <Button onClick={fetchLessonData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Carregando...' : 'Recarregar'}
          </Button>
        </div>

        {/* Cards de Status */}
        {lessonData && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p><strong>Título:</strong> {lessonData.title}</p>
                  <p><strong>Tipo:</strong> {lessonData.lesson_type}</p>
                  <p><strong>Ativo:</strong> {lessonData.is_active ? '✅ Sim' : '❌ Não'}</p>
                  <p><strong>Audio URL:</strong> {lessonData.audio_url ? '✅ Presente' : '❌ Ausente'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Exercícios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-lg font-bold">{exerciseCheck?.status}</p>
                  <p><strong>Total:</strong> {exerciseCheck?.count}</p>
                  <p className="text-xs text-slate-600">{exerciseCheck?.message}</p>
                  <p><strong>Versão:</strong> {lessonData.exercises_version || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Playground</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-lg font-bold">{playgroundCheck?.status}</p>
                  <p className="text-xs text-slate-600">{playgroundCheck?.message}</p>
                  {playgroundCheck?.config && (
                    <p className="text-xs"><strong>Tipo:</strong> {playgroundCheck.config.type}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dados Detalhados */}
        {lessonData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Content (JSON)</CardTitle>
                <CardDescription>
                  Estrutura do conteúdo salvo no banco
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderJson(lessonData.content, 'Content')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exercises (JSON)</CardTitle>
                <CardDescription>
                  Exercícios salvos na coluna separada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderJson(lessonData.exercises, 'Exercises')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Word Timestamps</CardTitle>
                <CardDescription>
                  Timestamps de palavras para sincronização
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lessonData.word_timestamps ? (
                  <p className="text-sm">✅ {lessonData.word_timestamps.length} timestamps</p>
                ) : (
                  <p className="text-sm text-red-500">❌ Não encontrado</p>
                )}
                {lessonData.word_timestamps && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                      Ver JSON completo
                    </summary>
                    {renderJson(lessonData.word_timestamps, 'Word Timestamps')}
                  </details>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadados</CardTitle>
                <CardDescription>
                  Informações adicionais da lição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Trail ID:</strong> {lessonData.trail_id}</p>
                <p><strong>Order Index:</strong> {lessonData.order_index}</p>
                <p><strong>Estimated Time:</strong> {lessonData.estimated_time}min</p>
                <p><strong>Difficulty:</strong> {lessonData.difficulty_level}</p>
                <p><strong>Created At:</strong> {new Date(lessonData.created_at).toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estado Inicial */}
        {!lessonData && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600 mb-4">Clique em "Carregar" para ver os dados da lição</p>
              <Button onClick={fetchLessonData}>
                Carregar Dados
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
