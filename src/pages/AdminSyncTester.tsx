import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  audio_url: string | null;
}

export default function AdminSyncTester() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, audio_url')
        .in('lesson_type', ['guided', 'interactive'])
        .order('order_index');

      if (error) throw error;

      // Filtrar apenas lições com áudio
      const lessonsWithAudio = (data || []).filter(lesson => lesson.audio_url);
      setLessons(lessonsWithAudio);

      if (lessonsWithAudio.length === 0) {
        toast.error('Nenhuma lição com áudio encontrada');
      }
    } catch (error: any) {
      console.error('Erro ao buscar lições:', error);
      toast.error('Erro ao carregar lições');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSync = () => {
    if (!selectedLessonId) {
      toast.error('Selecione uma lição primeiro');
      return;
    }

    // Redirecionar para a página da lição interativa
    navigate(`/lessons-interactive/${selectedLessonId}`);
    toast.success('Abrindo lição para teste de sincronização');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Testar Sincronização</h1>
            <p className="text-muted-foreground">
              Selecione uma aula e teste a sincronização entre áudio e texto
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecionar Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              value={selectedLessonId} 
              onValueChange={setSelectedLessonId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading 
                    ? "Carregando aulas..." 
                    : "Selecione uma aula..."
                } />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLessonId && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Aula selecionada:</p>
                <p className="text-sm text-muted-foreground">
                  {lessons.find(l => l.id === selectedLessonId)?.title}
                </p>
              </div>
            )}

            <Button
              onClick={handleTestSync}
              disabled={!selectedLessonId}
              size="lg"
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Testar Sincronização
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>1.</strong> Selecione uma aula da lista acima
            </p>
            <p>
              <strong>2.</strong> Clique em "Testar Sincronização" para abrir a lição interativa
            </p>
            <p>
              <strong>3.</strong> Verifique se o áudio e o texto estão perfeitamente alinhados
            </p>
            <p>
              <strong>4.</strong> As transições entre seções devem acontecer nos momentos corretos
            </p>
            <p className="pt-2 border-t">
              💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver logs detalhados da sincronização
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
