import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { fundamentos02 } from '@/data/lessons/fundamentos-02';
import { ExercisePreview } from '@/components/admin/ExercisePreview';
import { supabase } from '@/integrations/supabase/client';

// Mapa de aulas disponíveis
const AVAILABLE_LESSONS = {
  'fundamentos-01': fundamentos01,
  'fundamentos-02': fundamentos02,
};

export default function AdminLessonTester() {
  const navigate = useNavigate();
  const [selectedLessonKey, setSelectedLessonKey] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'reviewing' | 'publishing'>('idle');
  const [needsReview, setNeedsReview] = useState(false);

  const selectedLesson = selectedLessonKey 
    ? AVAILABLE_LESSONS[selectedLessonKey as keyof typeof AVAILABLE_LESSONS]
    : null;

  const handlePublish = async () => {
    if (!selectedLesson || needsReview) return;
    
    setStatus('publishing');
    
    try {
      // Buscar trilha
      const { data: trail, error: trailError } = await supabase
        .from('trails')
        .select('id')
        .eq('title', 'Fundamentos de IA')
        .maybeSingle();

      if (trailError || !trail) {
        throw new Error('Trilha "Fundamentos de IA" não encontrada');
      }

      // Verificar se a aula já existe
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('title', selectedLesson.title)
        .maybeSingle();

      const lessonData = {
        title: selectedLesson.title,
        description: `Aula ${selectedLesson.trackName}`,
        trail_id: trail.id,
        order_index: selectedLessonKey === 'fundamentos-01' ? 1 : 2,
        lesson_type: 'guided' as const,
        passing_score: 70,
        estimated_time: selectedLesson.duration,
        difficulty_level: 'beginner' as const,
        content: {
          contentVersion: selectedLesson.contentVersion,
          sections: selectedLesson.sections,
          exercisesConfig: selectedLesson.exercisesConfig
        } as any
      };

      if (existingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', existingLesson.id);

        if (error) throw error;
        toast.success('✅ Aula atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);

        if (error) throw error;
        toast.success('✅ Aula publicada com sucesso!');
      }
    } catch (error: any) {
      toast.error('Erro ao publicar aula', {
        description: error.message
      });
    } finally {
      setStatus('idle');
    }
  };

  const handleMarkForReview = () => {
    setNeedsReview(true);
    toast.warning('⚠️ Aula marcada para revisão', {
      description: 'Não será possível publicar até nova revisão.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📝 Testador Manual de Aulas</h1>
            <p className="text-muted-foreground">
              Preview e validação de exercícios antes da publicação
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Selecionar Aula
            </CardTitle>
            <CardDescription>
              Escolha uma aula para visualizar os exercícios e publicar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aula</label>
              <Select
                value={selectedLessonKey}
                onValueChange={(value) => {
                  setSelectedLessonKey(value);
                  setNeedsReview(false);
                }}
                disabled={status === 'publishing'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma aula para testar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundamentos-01">
                    Fundamentos 01 - O que é a IA
                  </SelectItem>
                  <SelectItem value="fundamentos-02">
                    Fundamentos 02 - Como a IA Aprende
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info da aula selecionada */}
            {selectedLesson && (
              <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedLesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Trilha: {selectedLesson.trackName}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Versão</p>
                    <p className="font-bold">v{selectedLesson.contentVersion}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>⏱️ {selectedLesson.duration}s</span>
                  <span>📚 {selectedLesson.sections.length} seções</span>
                  <span>✏️ {selectedLesson.exercisesConfig.length} exercícios</span>
                </div>
              </div>
            )}

            {/* Status de revisão */}
            {needsReview && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Aula marcada para revisão</p>
                  <p className="text-xs text-muted-foreground">
                    Não pode ser publicada até nova instrução
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview dos Exercícios */}
        {selectedLesson && (
          <Card>
            <CardHeader>
              <CardTitle>Preview dos Exercícios</CardTitle>
              <CardDescription>
                Visualize como os exercícios serão exibidos aos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExercisePreview lesson={selectedLesson} />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedLesson && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button
                  onClick={handlePublish}
                  disabled={needsReview || status === 'publishing'}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {status === 'publishing' ? 'Publicando...' : 'Publicar Aula'}
                </Button>
                
                <Button
                  onClick={handleMarkForReview}
                  variant="outline"
                  disabled={needsReview || status === 'publishing'}
                  size="lg"
                  className="flex-1"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Marcar para Revisão
                </Button>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">ℹ️ Como usar:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Publicar:</strong> Sincroniza a aula com o banco de dados funcional</li>
                  <li><strong>Revisar:</strong> Marca a aula como "precisa revisão" e bloqueia publicação</li>
                  <li>Revise os exercícios no preview antes de publicar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
