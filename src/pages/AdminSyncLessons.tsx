import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  syncFundamentos01, 
  syncFundamentos02, 
  syncAllLessons,
  regenerateAudio 
} from '@/lib/syncLessonToDatabase';

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

  const handleRegenerateAudio01 = async () => {
    setStatus(prev => ({ ...prev, lesson01: 'syncing' }));
    const success = await regenerateAudio('O que é a IA e por que nós precisamos dela');
    setStatus(prev => ({ 
      ...prev, 
      lesson01: success ? 'success' : 'error' 
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
        {/* Sync All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🚀 Sincronizar Todas as Lições</span>
              {getStatusIcon(status.all)}
            </CardTitle>
            <CardDescription>
              Sincroniza todas as lições de uma vez (Fundamentos 01 e 02)
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

        {/* Lesson 01 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📚 Fundamentos 01</span>
              {getStatusIcon(status.lesson01)}
            </CardTitle>
            <CardDescription>
              O que é a IA e por que nós precisamos dela
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleSyncLesson01}
              disabled={status.lesson01 === 'syncing'}
              className="w-full"
              variant="secondary"
            >
              {status.lesson01 === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Lição
                </>
              )}
            </Button>
            
            <Button
              onClick={handleRegenerateAudio01}
              disabled={status.lesson01 === 'syncing'}
              className="w-full"
              variant="outline"
            >
              {status.lesson01 === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                '🎙️ Regenerar Apenas Áudio'
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
            <Button
              onClick={handleSyncLesson02}
              disabled={status.lesson02 === 'syncing'}
              className="w-full"
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
                  Sincronizar Lição
                </>
              )}
            </Button>
            
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
                '🎙️ Regenerar Apenas Áudio'
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
            <p><strong>Sincronizar Lição:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Verifica se a lição existe no banco</li>
              <li>Se existir: atualiza o conteúdo</li>
              <li>Se não existir: cria a lição</li>
              <li>Se não tiver áudio: gera automaticamente</li>
            </ul>
            
            <p className="mt-4"><strong>Regenerar Apenas Áudio:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Deleta o áudio anterior</li>
              <li>Gera novo áudio com timestamps</li>
              <li>Faz upload no storage</li>
              <li>Atualiza URL no banco</li>
            </ul>
            
            <p className="mt-4 text-xs text-blue-600 dark:text-blue-300">
              ⏱️ Cada lição leva ~10-20 segundos para gerar o áudio
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
