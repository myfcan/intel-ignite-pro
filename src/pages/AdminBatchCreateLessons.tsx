import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LESSONS_ARRAY, LessonKey, ALL_LESSONS } from '@/data/lessons';
import { createLessonsInBatch } from '@/lib/createLessonWithAudio';
import { fundamentos01AudioText } from '@/data/lessons/fundamentos-01';
import { fundamentos02AudioText } from '@/data/lessons/fundamentos-02';
import { fundamentos03AudioText } from '@/data/lessons/fundamentos-03';

type BatchStatus = 'idle' | 'running' | 'completed' | 'error';
type LessonStatus = 'pending' | 'processing' | 'success' | 'error';

interface LessonProgress {
  key: LessonKey;
  status: LessonStatus;
  error?: string;
  result?: any;
}

export default function AdminBatchCreateLessons() {
  const navigate = useNavigate();
  const [selectedLessons, setSelectedLessons] = useState<Set<LessonKey>>(new Set());
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('idle');
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [autoGenerateAudio, setAutoGenerateAudio] = useState(true);

  // Mapeia as lições para seus audioTexts
  const audioTextMap: Record<LessonKey, string> = {
    'fundamentos-01': fundamentos01AudioText,
    'fundamentos-02': fundamentos02AudioText,
    'fundamentos-03': fundamentos03AudioText,
  };

  const toggleLesson = (key: LessonKey) => {
    const newSelected = new Set(selectedLessons);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedLessons(newSelected);
  };

  const selectAll = () => {
    setSelectedLessons(new Set(LESSONS_ARRAY.map(l => l.key)));
  };

  const deselectAll = () => {
    setSelectedLessons(new Set());
  };

  const handleBatchCreate = async () => {
    if (selectedLessons.size === 0) return;

    setBatchStatus('running');
    const lessonsToCreate = Array.from(selectedLessons).map(key => {
      const lesson = ALL_LESSONS[key];
      return {
        title: lesson.title,
        description: `Aula ${key.split('-')[1]} da trilha ${lesson.trackName}`,
        trail_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // ID da trilha Fundamentos
        order_index: parseInt(key.split('-')[1]),
        lesson_type: 'guided' as const,
        lessonData: lesson,
        audioText: audioTextMap[key],
        autoGenerateAudio,
      };
    });

    // Inicializa o progresso
    setProgress(lessonsToCreate.map(l => ({
      key: l.lessonData.id as LessonKey,
      status: 'pending'
    })));

    try {
      const results = await createLessonsInBatch(lessonsToCreate);
      
      // Atualiza o progresso com os resultados
      setProgress(results.map((result, index) => ({
        key: lessonsToCreate[index].lessonData.id as LessonKey,
        status: result.success ? 'success' : 'error',
        error: result.error,
        result: result
      })));

      setBatchStatus('completed');
    } catch (error) {
      console.error('Erro no batch:', error);
      setBatchStatus('error');
    }
  };

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const completedCount = progress.filter(p => p.status === 'success').length;
  const errorCount = progress.filter(p => p.status === 'error').length;
  const progressPercentage = progress.length > 0 
    ? (completedCount / progress.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Criação em Lote de Lições</h1>
            <p className="text-muted-foreground">
              Selecione múltiplas lições e crie todas de uma vez usando o processador centralizado
            </p>
          </div>
        </div>

        {/* Seleção de Lições */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Selecione as Lições</CardTitle>
                <CardDescription>
                  {selectedLessons.size} de {LESSONS_ARRAY.length} lições selecionadas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {LESSONS_ARRAY.map((lesson) => (
              <div
                key={lesson.key}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedLessons.has(lesson.key)}
                    onCheckedChange={() => toggleLesson(lesson.key)}
                    disabled={batchStatus === 'running'}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lesson.emoji}</span>
                      <span className="font-semibold">{lesson.title}</span>
                      <Badge variant="outline">{lesson.model}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                </div>
                {progress.find(p => p.key === lesson.key) && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(progress.find(p => p.key === lesson.key)!.status)}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Opções de Criação */}
        <Card>
          <CardHeader>
            <CardTitle>Opções de Criação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-audio"
                checked={autoGenerateAudio}
                onCheckedChange={(checked) => setAutoGenerateAudio(checked as boolean)}
                disabled={batchStatus === 'running'}
              />
              <label
                htmlFor="auto-audio"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Gerar áudio automaticamente após criar cada lição
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Progresso */}
        {batchStatus !== 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Criação</CardTitle>
              <CardDescription>
                {completedCount} concluídas, {errorCount} erros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="space-y-2">
                {progress.map((item) => {
                  const lesson = LESSONS_ARRAY.find(l => l.key === item.key);
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <span className="font-medium">{lesson?.title}</span>
                      </div>
                      {item.error && (
                        <span className="text-sm text-destructive">{item.error}</span>
                      )}
                      {item.status === 'success' && item.result && (
                        <Badge variant="outline" className="text-green-600">
                          {item.result.audioGenerated ? 'Com áudio' : 'Sem áudio'}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            disabled={batchStatus === 'running'}
          >
            Voltar
          </Button>
          <Button
            onClick={handleBatchCreate}
            disabled={selectedLessons.size === 0 || batchStatus === 'running'}
            size="lg"
          >
            {batchStatus === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Criar {selectedLessons.size} {selectedLessons.size === 1 ? 'Lição' : 'Lições'}
              </>
            )}
          </Button>
        </div>

        {batchStatus === 'completed' && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Criação Concluída!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {completedCount} lições criadas com sucesso. 
                {errorCount > 0 && ` ${errorCount} lição(ões) com erro.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
