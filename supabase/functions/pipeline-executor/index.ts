import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { executionId, action } = await req.json();

    if (!executionId) {
      throw new Error('executionId é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar a execução
    const { data: execution, error: fetchError } = await supabase
      .from('pipeline_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (fetchError) throw fetchError;
    if (!execution) throw new Error('Execução não encontrada');

    console.log(`[Pipeline Executor] Action: ${action}, Execution: ${executionId}`);

    switch (action) {
      case 'start':
        await startPipeline(supabase, execution);
        break;
      case 'pause':
        await pausePipeline(supabase, executionId);
        break;
      case 'resume':
        await resumePipeline(supabase, execution);
        break;
      case 'retry_step':
        await retryStep(supabase, execution);
        break;
      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no pipeline executor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * ============================================================================
 * IMPORTANTE: Execução do Pipeline
 * ============================================================================
 *
 * Esta Edge Function é um ORQUESTRADOR que controla o estado da execução.
 * A lógica REAL do pipeline (Steps 1-8) está em src/lib/lessonPipeline/
 * e é executada no FRONTEND por razões de arquitetura:
 *
 * 1. Supabase Edge Functions têm timeout de 60s
 * 2. Pipeline completo pode levar 2-5 minutos (ElevenLabs é lento)
 * 3. Frontend pode mostrar progresso em tempo real
 *
 * FLUXO ATUAL:
 * - Frontend chama runLessonPipeline() diretamente (src/lib/lessonPipeline/index.ts)
 * - Esta Edge Function apenas gerencia ESTADO (start/pause/resume/retry)
 * - Não executa os steps diretamente
 *
 * MIGRAÇÃO FUTURA:
 * Para executar no backend, seria necessário:
 * 1. Reescrever todos os steps para Deno/TypeScript compatível com Edge Functions
 * 2. Usar Supabase Queue ou similar para processos longos
 * 3. Implementar sistema de retry e recuperação de falhas
 * ============================================================================
 */

async function startPipeline(supabase: any, execution: any) {
  console.log(`[Pipeline] Iniciando pipeline: ${execution.id}`);

  // Atualizar status para running
  await supabase
    .from('pipeline_executions')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      logs: [...(execution.logs || []), `[${new Date().toISOString()}] Pipeline iniciado via Edge Function`]
    })
    .eq('id', execution.id);

  // ============================================================================
  // NOTA: Esta é uma implementação de CONTROLE DE ESTADO
  // A execução real do pipeline acontece no frontend via runLessonPipeline()
  // Esta função apenas atualiza o status no banco de dados
  // ============================================================================

  console.log('[Pipeline] Pipeline delegado para execução no frontend');
  console.log('[Pipeline] Esta Edge Function controla apenas o estado (start/pause/resume)');

  // Adicionar log explicativo
  await supabase
    .from('pipeline_executions')
    .update({
      logs: [
        ...(execution.logs || []),
        `[${new Date().toISOString()}] Pipeline em execução no frontend`,
        `[${new Date().toISOString()}] Aguardando conclusão dos 8 steps...`
      ]
    })
    .eq('id', execution.id);
}

async function pausePipeline(supabase: any, executionId: string) {
  console.log(`[Pipeline] Pausando pipeline: ${executionId}`);

  await supabase
    .from('pipeline_executions')
    .update({
      status: 'paused',
      logs: [
        `[${new Date().toISOString()}] Pipeline pausado pelo usuário`
      ]
    })
    .eq('id', executionId);
}

async function resumePipeline(supabase: any, execution: any) {
  console.log(`[Pipeline] Retomando pipeline: ${execution.id}`);

  await supabase
    .from('pipeline_executions')
    .update({
      status: 'running',
      logs: [
        ...(execution.logs || []),
        `[${new Date().toISOString()}] Pipeline retomado`
      ]
    })
    .eq('id', execution.id);
}

async function retryStep(supabase: any, execution: any) {
  console.log(`[Pipeline] Repetindo etapa ${execution.current_step} do pipeline: ${execution.id}`);

  await supabase
    .from('pipeline_executions')
    .update({
      status: 'running',
      logs: [
        ...(execution.logs || []),
        `[${new Date().toISOString()}] Repetindo step ${execution.current_step}`
      ]
    })
    .eq('id', execution.id);
}
