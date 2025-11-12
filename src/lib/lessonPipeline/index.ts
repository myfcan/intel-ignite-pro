import { PipelineInput, PipelineResult, PipelineState } from './types';
import { step1Intake } from './step1-intake';
import { step2GenerateExercises } from './step2-exercises';
import { step3CleanText } from './step3-clean-text';
import { step4CreateDraft } from './step4-create-draft';
import { step6GenerateAudio } from './step6-generate-audio';
import { step7CalculateTimestamps } from './step7-calculate-timestamps';
import { step8Activate } from './step8-activate';

/**
 * ORQUESTRADOR PRINCIPAL DO PIPELINE
 * 
 * Executa as 8 etapas em sequência linear:
 * 1. Intake & Validação
 * 2. Geração de Exercícios
 * 3. Limpeza de Texto
 * 4. Criar Draft no Banco
 * 5. [Interface Admin - manual]
 * 6. Gerar Áudio
 * 7. Calcular Timestamps
 * 8. Ativar Lição
 */

export async function runLessonPipeline(
  input: PipelineInput,
  onProgress?: (state: PipelineState) => void
): Promise<PipelineResult> {
  const pipelineStartTime = Date.now();
  const logs: string[] = [];
  const totalSteps = 8;

  const updateProgress = (status: PipelineState['status'], currentStep: number, log?: string) => {
    if (log) {
      logs.push(log);
      console.log(log);
    }
    onProgress?.({
      status,
      currentStep,
      totalSteps,
      logs: [...logs],
    });
  };

  try {
    console.log('\n🎬 ======================================');
    console.log('🎬 INICIANDO PIPELINE DE CRIAÇÃO DE LIÇÃO');
    console.log('🎬 ======================================');
    console.log(`🎬 Timestamp: ${new Date().toISOString()}`);
    console.log(`🎬 Modelo: ${input.model.toUpperCase()}`);
    console.log(`🎬 Título: "${input.title}"`);
    console.log('🎬 ======================================\n');

    // STEP 1: Intake & Validação
    updateProgress('intake', 1, '📥 Iniciando validação inicial...');
    const step1Result = await step1Intake(input);
    updateProgress('intake', 1, '✅ Step 1 completo: Dados validados');

    // STEP 2: Geração de Exercícios
    updateProgress('exercises', 2, '🎯 Gerando exercícios estruturados...');
    const step2Result = await step2GenerateExercises(step1Result);
    updateProgress('exercises', 2, `✅ Step 2 completo: ${step2Result.exercisesConfig.length} exercícios gerados`);

    // STEP 3: Limpeza de Texto
    updateProgress('clean-text', 3, '🧹 Limpando texto para áudio...');
    const step3Result = await step3CleanText(step2Result);
    updateProgress('clean-text', 3, `✅ Step 3 completo: ${step3Result.audioText.length} caracteres limpos`);

    // STEP 4: Criar Draft
    updateProgress('draft', 4, '💾 Criando draft no banco...');
    const step4Result = await step4CreateDraft(step3Result);
    updateProgress('draft', 4, `✅ Step 4 completo: Draft criado (ID: ${step4Result.lessonId})`);

    const pipelineElapsedTime = Date.now() - pipelineStartTime;
    
    console.log('\n📋 ======================================');
    console.log('📋 DRAFT CRIADO - AGUARDANDO GERAÇÃO DE ÁUDIO');
    console.log('📋 ======================================');
    console.log(`📊 Tempo total do pipeline (Steps 1-4): ${pipelineElapsedTime}ms (${(pipelineElapsedTime / 1000).toFixed(2)}s)`);
    console.log(`📊 Lesson ID: ${step4Result.lessonId}`);
    console.log(`📊 Modelo: ${step4Result.model.toUpperCase()}`);
    console.log(`📊 Status: draft (aguardando áudio)`);
    console.log(`📊 Exercícios: ${step4Result.exercisesConfig.length}`);
    console.log(`📊 Texto limpo: ${step4Result.audioText.length} caracteres`);
    console.log('📋 ======================================');
    console.log('💡 Próximo passo: Ir ao Admin e clicar em "Gerar Áudio"');
    console.log('📋 ======================================\n');

    // PIPELINE FASE 1 COMPLETO (Steps 1-4)
    // Status: 'draft' - Aguardando geração de áudio (Fase 2)
    updateProgress('draft', 4, '⏸️ Fase 1 completa. Aguardando Fase 2: Gerar Áudio + Ativar');
    
    return {
      success: true,
      lessonId: step4Result.lessonId,
      status: 'draft', // Importante: NÃO é 'completed' ainda!
      logs,
    };

  } catch (error: any) {
    const pipelineElapsedTime = Date.now() - pipelineStartTime;
    const errorLog = `❌ Pipeline falhou: ${error.message}`;
    updateProgress('failed', 0, errorLog);
    
    console.error('\n💥 ======================================');
    console.error('💥 PIPELINE FALHOU');
    console.error('💥 ======================================');
    console.error(`💥 Tempo até falha: ${pipelineElapsedTime}ms`);
    console.error(`💥 Erro: ${error.message}`);
    console.error(`💥 Stack trace:`, error.stack);
    console.error('💥 ======================================\n');

    return {
      success: false,
      status: 'draft',
      error: error.message,
      logs,
    };
  }
}

/**
 * Continua o pipeline após geração de áudio (Steps 6-8)
 * Usado pelo Admin UI após clicar em "Gerar Áudio"
 */
export async function continuePipelineWithAudio(
  lessonId: string,
  onProgress?: (state: PipelineState) => void
): Promise<PipelineResult> {
  const logs: string[] = [];
  const totalSteps = 8;

  const updateProgress = (status: PipelineState['status'], currentStep: number, log?: string) => {
    if (log) {
      logs.push(log);
      console.log(log);
    }
    onProgress?.({
      status,
      currentStep,
      totalSteps,
      logs: [...logs],
      lessonId,
    });
  };

  try {
    console.log('\n🎙️ ======================================');
    console.log('🎙️ CONTINUANDO PIPELINE: FASE 2 (STEPS 6-8)');
    console.log('🎙️ ======================================\n');

    // Buscar dados do draft
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      throw new Error('Lição não encontrada');
    }

    // Buscar dados da execução
    const { data: execution } = await supabase
      .from('pipeline_executions')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (!execution) {
      throw new Error('Execução do pipeline não encontrada');
    }

    const inputData = execution.input_data as any;
    const outputData = execution.output_data as any;

    // Reconstruir Step4Output a partir dos dados salvos
    const step4Output = {
      ...inputData,
      lessonId: lesson.id,
      ...outputData,
    };

    console.log(`📊 Lição encontrada: "${lesson.title}" (Modelo: ${step4Output.model})`);
    
    // STEP 6: Gerar Áudio
    updateProgress('generating-audio', 6, '🎙️ Step 6: Gerando áudio...');
    const step6Result = await step6GenerateAudio(step4Output);
    updateProgress('generating-audio', 6, '✅ Step 6 completo: Áudio gerado com sucesso');

    // STEP 7: Calcular Timestamps
    updateProgress('calculating-timestamps', 7, '⏱️ Step 7: Calculando timestamps...');
    const step7Result = await step7CalculateTimestamps(step6Result);
    updateProgress('calculating-timestamps', 7, `✅ Step 7 completo: Timestamps calculados (${step7Result.totalDuration.toFixed(1)}s)`);

    // STEP 8: Ativar Lição
    updateProgress('activating', 8, '🚀 Step 8: Ativando lição...');
    const step8Result = await step8Activate(step7Result);
    updateProgress('completed', 8, '✅ Step 8 completo: Lição ativada e publicada!');

    console.log('\n🎉 ======================================');
    console.log('🎉 PIPELINE COMPLETO - FASE 2 FINALIZADA!');
    console.log('🎉 ======================================');
    console.log(`📊 Lição ID: ${lessonId}`);
    console.log(`📊 Status: ATIVA`);
    console.log(`📊 Duração total: ${step7Result.totalDuration.toFixed(1)}s`);
    console.log('🎉 ======================================\n');

    return {
      success: true,
      lessonId,
      status: 'active', // Pipeline completo, lição está ativa
      logs,
    };

  } catch (error: any) {
    const errorLog = `❌ Pipeline falhou: ${error.message}`;
    updateProgress('failed', 0, errorLog);
    
    return {
      success: false,
      lessonId,
      status: 'draft',
      error: error.message,
      logs,
    };
  }
}

export * from './types';
