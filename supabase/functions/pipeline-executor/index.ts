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

async function startPipeline(supabase: any, execution: any) {
  console.log(`[Pipeline] Iniciando pipeline: ${execution.id}`);
  
  // Atualizar status para running
  await supabase
    .from('pipeline_executions')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      logs: [...(execution.logs || []), `[${new Date().toISOString()}] Pipeline iniciado`]
    })
    .eq('id', execution.id);

  // TODO: Implementar lógica real do pipeline
  // Por enquanto, apenas simular sucesso
  console.log('[Pipeline] Simulando execução...');
  
  // Após alguns segundos, marcar como completo
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await supabase
    .from('pipeline_executions')
    .update({
      status: 'completed',
      current_step: execution.total_steps,
      completed_at: new Date().toISOString(),
      logs: [
        ...(execution.logs || []),
        `[${new Date().toISOString()}] Pipeline concluído com sucesso`
      ]
    })
    .eq('id', execution.id);
}

async function pausePipeline(supabase: any, executionId: string) {
  console.log(`[Pipeline] Pausando pipeline: ${executionId}`);
  
  await supabase
    .from('pipeline_executions')
    .update({ status: 'paused' })
    .eq('id', executionId);
}

async function resumePipeline(supabase: any, execution: any) {
  console.log(`[Pipeline] Retomando pipeline: ${execution.id}`);
  
  await supabase
    .from('pipeline_executions')
    .update({ status: 'running' })
    .eq('id', execution.id);

  // Continuar de onde parou
  await startPipeline(supabase, execution);
}

async function retryStep(supabase: any, execution: any) {
  console.log(`[Pipeline] Repetindo etapa ${execution.current_step} do pipeline: ${execution.id}`);
  
  await supabase
    .from('pipeline_executions')
    .update({
      status: 'running',
      logs: [
        ...(execution.logs || []),
        `[${new Date().toISOString()}] Repetindo etapa ${execution.current_step}`
      ]
    })
    .eq('id', execution.id);

  // Repetir a etapa atual
  await startPipeline(supabase, execution);
}
