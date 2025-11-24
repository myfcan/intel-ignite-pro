import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PipelineExecution {
  id: string;
  lesson_title: string;
  status: string;
  current_step: number;
  total_steps: number;
  error_message: string | null;
}

/**
 * Hook para escutar notificações de pipeline em tempo real
 * Mostra toast quando pipelines terminam (sucesso ou falha)
 */
export function usePipelineNotifications() {
  const { toast } = useToast();
  const processedIds = useRef(new Set<string>());

  useEffect(() => {
    console.log('🔔 Iniciando listener de notificações do pipeline...');

    const channel = supabase
      .channel('pipeline-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pipeline_executions'
        },
        (payload) => {
          const execution = payload.new as PipelineExecution;
          
          // Evitar notificações duplicadas
          if (processedIds.current.has(execution.id)) {
            return;
          }

          console.log('📊 Pipeline atualizado:', {
            id: execution.id,
            title: execution.lesson_title,
            status: execution.status,
            step: `${execution.current_step}/${execution.total_steps}`
          });

          // Notificar apenas quando o pipeline terminar (sucesso ou falha)
          if (execution.status === 'completed') {
            processedIds.current.add(execution.id);
            
            toast({
              title: '✅ Pipeline concluído!',
              description: `"${execution.lesson_title}" foi criada com sucesso (${execution.total_steps}/${execution.total_steps} steps).`,
              duration: 6000,
              className: 'bg-green-50 border-green-200',
            });
          } else if (execution.status === 'failed') {
            processedIds.current.add(execution.id);
            
            toast({
              title: '❌ Pipeline falhou',
              description: `"${execution.lesson_title}": ${execution.error_message || 'Erro desconhecido'}`,
              duration: 8000,
              className: 'bg-red-50 border-red-200',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Status da subscrição realtime:', status);
      });

    // Limpar ao desmontar
    return () => {
      console.log('🔕 Desconectando listener de notificações do pipeline');
      supabase.removeChannel(channel);
      processedIds.current.clear();
    };
  }, [toast]);
}
