import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  syncFundamentos02, 
  syncAllLessons,
  regenerateAudio 
} from '@/lib/syncLessonToDatabase';
import { syncFundamentos01 } from '@/lib/syncLessonV2';
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
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { fundamentos02 } from '@/data/lessons/fundamentos-02';

interface SyncStatus {
  lesson01: 'idle' | 'syncing' | 'success' | 'error';
  lesson02: 'idle' | 'syncing' | 'success' | 'error';
  all: 'idle' | 'syncing' | 'success' | 'error';
}

export default function AdminSyncLessons() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SyncStatus>({
    lesson01: 'idle',
    lesson02: 'idle',
    all: 'idle'
  });

  const handleSyncLesson01 = async () => {
    setStatus(prev => ({ ...prev, lesson01: 'syncing' }));
    const result = await syncFundamentos01();
    setStatus(prev => ({ 
      ...prev, 
      lesson01: result.success ? 'success' : 'error' 
    }));
  };

  const handleSyncLesson02 = async () => {
    setStatus(prev => ({ ...prev, lesson02: 'syncing' }));
    const result = await syncFundamentos02();
    setStatus(prev => ({ 
      ...prev, 
      lesson02: result.success ? 'success' : 'error' 
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

  const handleRegenerateAudio02 = async () => {
    setStatus(prev => ({ ...prev, lesson02: 'syncing' }));
    const success = await regenerateAudio('Como a IA Aprende com Você');
    setStatus(prev => ({ 
      ...prev, 
      lesson02: success ? 'success' : 'error' 
    }));
  };

  const getStatusIcon = (state: 'idle' | 'syncing' | 'success' | 'error') => {
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
        {/* Lesson 01 - V2 */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🆕 Fundamentos 01 (Modelo V2)</span>
              {getStatusIcon(status.lesson01)}
            </CardTitle>
            <CardDescription>
              O que é a IA e por que nós precisamos dela - Áudios separados + Timestamps reais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
              {status.lesson01 === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">✅ Sincronizada com 5 áudios separados</span>
                </>
              ) : status.lesson01 === 'error' ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Erro na sincronização</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Pronta para sincronizar</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Preview dos Exercícios
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Preview - Fundamentos 01</DialogTitle>
                    <DialogDescription>
                      Visualize como os exercícios vão aparecer para os alunos
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                    <ExercisePreview lesson={fundamentos01} />
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleSyncLesson01}
                disabled={status.lesson01 === 'syncing'}
                className="flex-1"
                size="lg"
              >
                {status.lesson01 === 'syncing' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando 5 áudios + Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Sincronizar Aula 01 (V2)
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                🆕 Modelo V2: 5 áudios separados (~48s cada)
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                • Timestamps reais acumulados (não fixos)<br/>
                • Sincronização precisa seção por seção<br/>
                • ~1 minuto para gerar todos os áudios
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🚀 Sincronizar Todas as Lições</span>
              {getStatusIcon(status.all)}
            </CardTitle>
            <CardDescription>
              Sincroniza todas as lições de uma vez (Fundamentos 02)
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

        {/* Lesson 02 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📚 Fundamentos 02</span>
              {getStatusIcon(status.lesson02)}
            </CardTitle>
            <CardDescription>
              Como a IA Aprende com Você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
              {status.lesson02 === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Sincronizada com timestamps</span>
                </>
              ) : status.lesson02 === 'error' ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Erro na sincronização</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Aguardando sincronização</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Preview - Fundamentos 02</DialogTitle>
                    <DialogDescription>
                      Visualize como os exercícios vão aparecer para os alunos
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                    <ExercisePreview lesson={fundamentos02} />
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleSyncLesson02}
                disabled={status.lesson02 === 'syncing'}
                className="flex-1"
                variant="secondary"
              >
                {status.lesson02 === 'syncing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar Lição + Timestamps
                  </>
                )}
              </Button>
            </div>
            
            <Button
              onClick={handleRegenerateAudio02}
              disabled={status.lesson02 === 'syncing'}
              className="w-full"
              variant="outline"
            >
              {status.lesson02 === 'syncing' ? (
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
