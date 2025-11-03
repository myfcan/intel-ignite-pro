import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Music } from 'lucide-react';
import { AudioPlayer } from '@/components/lesson/AudioPlayer';

export default function Admin() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  
  useEffect(() => {
    fetchLessons();
  }, []);
  
  const fetchLessons = async () => {
    const { data: trail } = await supabase
      .from('trails')
      .select('id')
      .eq('title', 'Fundamentos de IA')
      .single();
    
    if (trail) {
      const { data } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('trail_id', trail.id)
        .order('order_index');
      
      if (data) {
        setLessons(data);
      }
    }
  };

  const handleGenerateAudios = async () => {
    setGenerating(true);
    setResults(null);

    try {
      const body = selectedLesson === 'all' ? {} : { lesson_id: selectedLesson };
      
      const { data, error } = await supabase.functions.invoke('generate-lesson-audio', {
        body
      });

      if (error) throw error;

      setResults(data);
      
      const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
      
      toast({
        title: "Áudios gerados!",
        description: `${successCount} de ${data.total_lessons} áudios foram gerados com sucesso.`,
      });
    } catch (error) {
      console.error('Error generating audios:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar áudios",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie e configure o sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Geração de Áudios das Aulas
            </CardTitle>
            <CardDescription>
              Gere áudios para uma aula específica ou todas as aulas da Trilha 1
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione a aula:</label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma aula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🎯 Todas as aulas</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      Aula {lesson.order_index}: {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleGenerateAudios}
              disabled={generating}
              size="lg"
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando áudios...
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  {selectedLesson === 'all' ? 'Gerar Todos os Áudios' : 'Gerar Áudio Selecionado'}
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Resumo</h3>
                  <p className="text-sm">
                    Trilha: <span className="font-medium">{results.trail}</span>
                  </p>
                  <p className="text-sm">
                    Total de aulas: <span className="font-medium">{results.total_lessons}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Resultados:</h3>
                  {results.results?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : result.status === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{result.lesson_title}</p>
                            {result.error && (
                              <p className="text-xs text-red-600 mt-1">
                                Erro: {result.error}
                              </p>
                            )}
                            {result.reason && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Motivo: {result.reason === 'no_text' ? 'Sem texto para narrar' : result.reason}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              result.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : result.status === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {result.status === 'success'
                              ? 'Sucesso'
                              : result.status === 'error'
                              ? 'Erro'
                              : 'Ignorado'}
                          </span>
                        </div>
                        
                        {result.audio_url && (
                          <div className="pt-2 border-t border-green-200">
                            <AudioPlayer audioUrl={result.audio_url} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
