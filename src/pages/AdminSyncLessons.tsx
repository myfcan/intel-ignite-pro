import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  syncFundamentos01,
  syncFundamentos02, 
  syncFundamentos03,
  syncAllLessons,
  regenerateAudio 
} from '@/lib/syncLessonToDatabase';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExercisePreview } from '@/components/admin/ExercisePreview';

// ✨ Sistema de auto-descoberta de aulas
import { LESSONS_ARRAY } from '@/data/lessons';

// ✨ Status dinâmico baseado nas aulas descobertas
type SyncStatusState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncStatus {
  [key: string]: SyncStatusState;
}

// Mapeia as funções de sync por chave de aula
const SYNC_FUNCTIONS: Record<string, () => Promise<any>> = {
  'fundamentos-01': syncFundamentos01,
  'fundamentos-02': syncFundamentos02,
  'fundamentos-03': syncFundamentos03,
};

// Mapeia títulos das lições para regeneração de áudio
const LESSON_TITLES: Record<string, string> = {
  'fundamentos-01': 'O que é a IA e por que nós precisamos dela',
  'fundamentos-02': 'Como a IA Aprende com Você',
  'fundamentos-03': 'Como a IA Aprende: O Cérebro Digital por Trás das Máquinas Inteligentes',
};

export default function AdminSyncLessons() {
  const navigate = useNavigate();
  
  // ✨ Status inicial dinâmico baseado nas aulas descobertas
  const initialStatus: SyncStatus = {
    all: 'idle',
    ...Object.fromEntries(LESSONS_ARRAY.map(l => [l.key, 'idle']))
  };
  
  const [status, setStatus] = useState<SyncStatus>(initialStatus);

  // ✨ Handlers dinâmicos
  const handleSyncLesson = async (lessonKey: string) => {
    const syncFn = SYNC_FUNCTIONS[lessonKey];
    if (!syncFn) return;
    
    setStatus(prev => ({ ...prev, [lessonKey]: 'syncing' }));
    const result = await syncFn();
    setStatus(prev => ({ 
      ...prev, 
      [lessonKey]: result.success ? 'success' : 'error' 
    }));
  };

  const handleRegenerateAudio = async (lessonKey: string) => {
    const title = LESSON_TITLES[lessonKey];
    if (!title) return;
    
    setStatus(prev => ({ ...prev, [lessonKey]: 'syncing' }));
    const success = await regenerateAudio(title);
    setStatus(prev => ({ 
      ...prev, 
      [lessonKey]: success ? 'success' : 'error' 
    }));
  };

  const handleSyncAll = async () => {
    setStatus(prev => ({ ...prev, all: 'syncing' }));
    const result = await syncAllLessons();
    setStatus(prev => ({ 
      ...prev, 
      all: result.successful === result.total ? 'success' : 'error' 
    }));
  };

  const getStatusIcon = (state: SyncStatusState) => {
    switch (state) {
      case 'syncing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (lessonKey: string, state: SyncStatusState) => {
    if (state === 'success') {
      const metadata = LESSONS_ARRAY.find(l => l.key === lessonKey);
      const audioInfo = metadata?.model === 'V2' ? '5 áudios separados' : 'áudio único';
      return `✅ Sincronizada com ${audioInfo}`;
    }
    if (state === 'error') return 'Erro na sincronização';
    return 'Pronta para sincronizar';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">🔄 Sincronizar Lições</h1>
          <p className="text-muted-foreground mt-1">
            Sincroniza lições do código TypeScript para o banco de dados e gera áudios automaticamente
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ✨ Renderização dinâmica de todas as aulas */}
        {LESSONS_ARRAY.map((metadata) => {
          const lessonStatus = status[metadata.key] || 'idle';
          const isV2 = metadata.model === 'V2';
          const hasRegenerateAudio = LESSON_TITLES[metadata.key];

          return (
            <Card 
              key={metadata.key} 
              className={isV2 ? "border-2 border-primary" : ""}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {metadata.emoji} {metadata.trackName} {metadata.orderIndex.toString().padStart(2, '0')}
                    {isV2 && ' (Modelo V2)'}
                  </span>
                  {getStatusIcon(lessonStatus)}
                </CardTitle>
                <CardDescription>{metadata.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
                  {lessonStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        {getStatusText(metadata.key, lessonStatus)}
                      </span>
                    </>
                  ) : lessonStatus === 'error' ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Erro na sincronização</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-orange-600'}`} />
                      <span className={`text-sm ${isV2 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {isV2 ? 'Pronta para sincronizar' : 'Aguardando sincronização'}
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size={isV2 ? "lg" : "default"}
                        className="flex-1"
                      >
                        <Eye className={`mr-2 ${isV2 ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        Preview{isV2 && ' dos Exercícios'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Preview - {metadata.trackName} {metadata.orderIndex.toString().padStart(2, '0')}</DialogTitle>
                        <DialogDescription>
                          Visualize como os exercícios vão aparecer para os alunos
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                        <ExercisePreview lesson={metadata.lesson} />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => handleSyncLesson(metadata.key)}
                    disabled={lessonStatus === 'syncing'}
                    className="flex-1"
                    size={isV2 ? "lg" : "default"}
                    variant={isV2 ? "default" : "secondary"}
                  >
                    {lessonStatus === 'syncing' ? (
                      <>
                        <Loader2 className={`mr-2 ${isV2 ? 'h-5 w-5' : 'h-4 w-4'} animate-spin`} />
                        {isV2 ? `Gerando ${metadata.lesson.sections.length} áudios + Sincronizando...` : 'Sincronizando...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`mr-2 ${isV2 ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        Sincronizar {isV2 && `Aula ${metadata.orderIndex.toString().padStart(2, '0')} (V2)`}
                        {!isV2 && ' Lição + Timestamps'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Regenerate Audio Button (only for lessons with audio) */}
                {hasRegenerateAudio && (
                  <Button
                    onClick={() => handleRegenerateAudio(metadata.key)}
                    disabled={lessonStatus === 'syncing'}
                    className="w-full"
                    variant="outline"
                  >
                    {lessonStatus === 'syncing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Regenerar Áudio + Timestamps
                      </>
                    )}
                  </Button>
                )}

                {/* Model Info (V2 only) */}
                {isV2 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                      🆕 Modelo V2: {metadata.lesson.sections.length} áudios separados (~48s cada)
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      • Timestamps reais acumulados (não fixos)<br/>
                      • Sincronização precisa seção por seção<br/>
                      • ~1 minuto para gerar todos os áudios
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Sync All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🚀 Sincronizar Todas as Lições</span>
              {getStatusIcon(status.all)}
            </CardTitle>
            <CardDescription>
              Sincroniza todas as 3 lições de uma vez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncAll}
              disabled={status.all === 'syncing'}
              className="w-full"
              size="lg"
            >
              {status.all === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Sincronizar Todas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">ℹ️ Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <p><strong>Sincronizar Lição + Timestamps:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Verifica se a lição existe no banco</li>
              <li>Se existir: atualiza o conteúdo</li>
              <li>Se não existir: cria a lição</li>
              <li>✨ <strong>Gera áudio automaticamente se não existir</strong></li>
              <li>✨ <strong>Gera timestamps automaticamente se estiverem faltando</strong></li>
            </ul>
            
            <p className="mt-4"><strong>Regenerar Áudio + Timestamps:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Deleta o áudio anterior</li>
              <li>Gera novo áudio com timestamps sincronizados</li>
              <li>Atualiza todos os markers de seção</li>
              <li>Faz upload no storage</li>
              <li>Atualiza URL no banco</li>
            </ul>
            
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded border border-green-300 dark:border-green-700">
              <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
                ✅ Sistema agora detecta automaticamente timestamps faltando!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Ao sincronizar, se a lição não tiver timestamps, eles são gerados automaticamente junto com o áudio.
              </p>
            </div>
            
            <p className="mt-4 text-xs text-blue-600 dark:text-blue-300">
              ⏱️ Cada lição leva ~10-20 segundos para gerar áudio + timestamps
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
