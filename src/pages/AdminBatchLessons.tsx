import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle, Volume2 } from 'lucide-react';
import { batchSyncLessons, createBatchLesson } from '@/lib/batchSyncLessons';
import { LESSONS_ARRAY, LESSON_AUDIO_TEXTS, LessonKey } from '@/data/lessons';
import { supabase } from '@/integrations/supabase/client';

export default function AdminBatchLessons() {
  const navigate = useNavigate();
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [orderIndexes, setOrderIndexes] = useState<Record<string, number>>({});
  const [nextAvailableIndex, setNextAvailableIndex] = useState<number>(1);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{
    title: string;
    success: boolean;
    message: string;
    intonationAnalysis?: any;
  }>>([]);

  // Configuração das aulas disponíveis (auto-descoberta)
  const availableLessons = LESSONS_ARRAY.map(meta => ({
    id: meta.key,
    title: meta.title,
    lessonData: meta.lesson,
    sectionsCount: meta.lesson.sections.length,
    exercisesCount: meta.lesson.exercisesConfig?.length || 0,
    trackName: meta.trackName,
    emoji: meta.emoji
  }));

  // Buscar próximo order_index disponível ao carregar
  useEffect(() => {
    fetchNextAvailableIndex();
  }, []);

  const fetchNextAvailableIndex = async () => {
    setIsLoadingIndexes(true);
    try {
      // Buscar a trilha "Fundamentos de IA"
      const { data: trail } = await supabase
        .from('trails')
        .select('id')
        .eq('title', 'Fundamentos de IA')
        .single();

      if (trail) {
        // Buscar maior order_index da trilha
        const { data: lessons } = await supabase
          .from('lessons')
          .select('order_index')
          .eq('trail_id', trail.id)
          .order('order_index', { ascending: false })
          .limit(1);

        const maxIndex = lessons?.[0]?.order_index || 0;
        setNextAvailableIndex(maxIndex + 1);
        
        // Inicializar order_indexes com valores sequenciais
        const initialIndexes: Record<string, number> = {};
        availableLessons.forEach((lesson, idx) => {
          initialIndexes[lesson.id] = maxIndex + 1 + idx;
        });
        setOrderIndexes(initialIndexes);
      }
    } catch (error) {
      console.error('Erro ao buscar índices:', error);
      toast.error('Erro ao buscar índices disponíveis');
    } finally {
      setIsLoadingIndexes(false);
    }
  };

  const handleToggle = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleOrderIndexChange = (lessonId: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setOrderIndexes(prev => ({
        ...prev,
        [lessonId]: numValue
      }));
    }
  };

  const validateOrderIndexes = (): boolean => {
    const selectedIndexes = selectedLessons.map(id => orderIndexes[id]);
    const uniqueIndexes = new Set(selectedIndexes);
    
    if (uniqueIndexes.size !== selectedIndexes.length) {
      toast.error('⚠️ Existem order_index duplicados nas aulas selecionadas!');
      return false;
    }
    
    return true;
  };

  const handleSelectAll = () => {
    setSelectedLessons(availableLessons.map(l => l.id));
  };

  const handleClearSelection = () => {
    setSelectedLessons([]);
  };

  const handleBatchSync = async () => {
    const selected = availableLessons.filter(l => 
      selectedLessons.includes(l.id)
    );
    
    if (selected.length === 0) {
      toast.error('Selecione ao menos uma aula');
      return;
    }

    // Validar order_indexes
    if (!validateOrderIndexes()) {
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setResults([]);

    toast.info(`🚀 Iniciando sincronização de ${selected.length} aula(s)...`, {
      duration: 3000
    });

    try {
      // Preparar batch com as lições selecionadas
      const batchLessons = selected.map((lesson) => {
        // ✅ Usar audioText PRÉ-PROCESSADO (já limpo com cleanAudioText)
        const audioText = LESSON_AUDIO_TEXTS[lesson.id as LessonKey] || 
          lesson.lessonData.sections
            .map(section => section.visualContent || section.content || '')
            .join('\n\n');

        return createBatchLesson(
          lesson.lessonData,
          audioText,
          {
            trailTitle: lesson.trackName,
            folderName: lesson.id.replace('fundamentos-', 'aula-'),
            orderIndex: orderIndexes[lesson.id] // Usar o order_index configurado
          }
        );
      });

      // Executar batch
      const result = await batchSyncLessons(batchLessons, 2000);

      setResults(result.results);

      if (result.failed === 0) {
        toast.success(`✅ ${result.successful}/${result.total} aula(s) sincronizada(s) com sucesso!`, {
          duration: 5000
        });
      } else {
        toast.warning(`⚠️ ${result.successful}/${result.total} sucesso, ${result.failed} falha(s)`, {
          duration: 5000
        });
      }

    } catch (error: any) {
      console.error('Erro no batch:', error);
      toast.error(`Erro ao processar batch: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentIndex(0);
    }
  };

  const selectedCount = selectedLessons.length;
  const totalCount = availableLessons.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🎓 Criação em Lote (Modelo V2)</h1>
              <p className="text-sm text-muted-foreground">
                Sistema automatizado de sincronização de aulas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Card de Seleção */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Selecione as Aulas ({selectedCount}/{totalCount})
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isProcessing || isLoadingIndexes}
              >
                Selecionar Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={isProcessing}
              >
                Limpar
              </Button>
            </div>
          </div>

          {isLoadingIndexes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando índices disponíveis...</span>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-600 mb-1">
                    Próximo índice disponível: {nextAvailableIndex}
                  </div>
                  <div className="text-muted-foreground">
                    Os order_index são calculados automaticamente, mas você pode editá-los manualmente.
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {availableLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={lesson.id}
                      checked={selectedLessons.includes(lesson.id)}
                      onCheckedChange={() => handleToggle(lesson.id)}
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor={lesson.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        {lesson.emoji} {lesson.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lesson.sectionsCount} seções • {lesson.exercisesCount} exercícios
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">order_index:</span>
                      <Input
                        type="number"
                        min="1"
                        value={orderIndexes[lesson.id] || ''}
                        onChange={(e) => handleOrderIndexChange(lesson.id, e.target.value)}
                        disabled={isProcessing}
                        className="w-20 h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Button
            onClick={handleBatchSync}
            disabled={isProcessing || selectedCount === 0}
            size="lg"
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                🚀 Sincronizar {selectedCount} Aula(s)
              </>
            )}
          </Button>
        </Card>

        {/* Progress */}
        {isProcessing && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Progresso</h3>
            <Progress value={(currentIndex / selectedCount) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Processando aula {currentIndex} de {selectedCount}...
            </p>
          </Card>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Resultados</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>

                  {/* Análise de Entonação TTS */}
                  {result.intonationAnalysis && result.intonationAnalysis.hasIssues && (
                    <div className={`ml-8 p-4 rounded-lg border-l-4 ${
                      result.intonationAnalysis.score < 50 
                        ? 'bg-red-500/10 border-red-500' 
                        : result.intonationAnalysis.score < 80 
                        ? 'bg-yellow-500/10 border-yellow-500' 
                        : 'bg-blue-500/10 border-blue-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          Análise de Entonação TTS - Score: {result.intonationAnalysis.score}/100
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        {/* Problemas Críticos */}
                        {result.intonationAnalysis.issues.filter((i: any) => i.severity === 'high').length > 0 && (
                          <div>
                            <div className="font-medium text-red-600 mb-1">🔴 CRÍTICO (podem causar "gritos"):</div>
                            {result.intonationAnalysis.issues
                              .filter((i: any) => i.severity === 'high')
                              .map((issue: any, idx: number) => (
                                <div key={idx} className="ml-4 mb-2">
                                  <div className="text-muted-foreground">
                                    • {issue.message} [{issue.location}]
                                  </div>
                                  <div className="text-xs text-blue-600 ml-4">
                                    💡 {issue.suggestion}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Problemas Médios */}
                        {result.intonationAnalysis.issues.filter((i: any) => i.severity === 'medium').length > 0 && (
                          <div>
                            <div className="font-medium text-yellow-600 mb-1">🟡 MÉDIO (entonação exagerada):</div>
                            {result.intonationAnalysis.issues
                              .filter((i: any) => i.severity === 'medium')
                              .map((issue: any, idx: number) => (
                                <div key={idx} className="ml-4 mb-2">
                                  <div className="text-muted-foreground">
                                    • {issue.message} [{issue.location}]
                                  </div>
                                  <div className="text-xs text-blue-600 ml-4">
                                    💡 {issue.suggestion}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Problemas Baixos */}
                        {result.intonationAnalysis.issues.filter((i: any) => i.severity === 'low').length > 0 && (
                          <div>
                            <div className="font-medium text-blue-600 mb-1">🟢 BAIXO (melhorias recomendadas):</div>
                            {result.intonationAnalysis.issues
                              .filter((i: any) => i.severity === 'low')
                              .slice(0, 3) // Limitar a 3 para não poluir
                              .map((issue: any, idx: number) => (
                                <div key={idx} className="ml-4 mb-2">
                                  <div className="text-muted-foreground">
                                    • {issue.message} [{issue.location}]
                                  </div>
                                  <div className="text-xs text-blue-600 ml-4">
                                    💡 {issue.suggestion}
                                  </div>
                                </div>
                              ))}
                            {result.intonationAnalysis.issues.filter((i: any) => i.severity === 'low').length > 3 && (
                              <div className="ml-4 text-xs text-muted-foreground">
                                ... e mais {result.intonationAnalysis.issues.filter((i: any) => i.severity === 'low').length - 3} problema(s) de baixa severidade
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sem problemas de entonação */}
                  {result.intonationAnalysis && !result.intonationAnalysis.hasIssues && (
                    <div className="ml-8 p-3 rounded-lg bg-green-500/10 border-l-4 border-green-500">
                      <div className="flex items-center gap-2 text-sm">
                        <Volume2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          ✅ Nenhum problema de entonação detectado! Texto pronto para TTS.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informações */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ℹ️ Como Funciona</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Valida dados automaticamente (remove emojis/markdown do áudio)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Gera áudios separados por seção via API ElevenLabs</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Calcula timestamps acumulados automaticamente</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Faz upload para Storage com URLs públicas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Salva no banco de dados com todos os dados corretos</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">⏱️</span>
              <span>Delay de 2s entre aulas (evitar rate limit)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">📊</span>
              <span>Relatório completo ao final com sucesso/falhas</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
